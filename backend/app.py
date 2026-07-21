"""
Backend implementation for Ideogram 4 NF4 text-to-image generation service on Modal.

Features:
- Python 3.11 with latest Hugging Face Diffusers main branch.
- Ideogram 4 NF4 model quantization for memory-efficient execution on NVIDIA L4 GPU.
- Local prompt upsampling via Ideogram4PromptEnhancerHead (Qwen3-VL-8B LM head) without hosted APIs.
- Persistent caching via Modal Volume mounted at /models (HF_HOME=/models).
- Uses Hugging Face token from Modal Secret 'huggingface-secret'.
- Class-based Modal setup (@app.cls, @modal.enter, @modal.method, @modal.asgi_app).
- Strict dimension validation (256-2048, multiples of 16), logging module, and HTTP 400/500 error handling.
- Full FastAPI CORSMiddleware integration for seamless browser fetch() requests.
"""

import base64
from io import BytesIO
import logging
import os
import sys
import modal

# Ensure UTF-8 output encoding for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Safe import for pydantic on local client machine
try:
    from pydantic import BaseModel, Field, field_validator
except ImportError:
    class BaseModel: pass
    def Field(*args, **kwargs): return kwargs.get("default", None)
    def field_validator(*args, **kwargs): return lambda f: f

# Configure standard Python logging for production visibility
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ideogram-service")

# ------------------------------------------------------------------------------
# 1. MODAL APP INITIALIZATION
# ------------------------------------------------------------------------------
app = modal.App("ideogram-v4-generator")

# ------------------------------------------------------------------------------
# 2. CONTAINER IMAGE DEFINITION
# ------------------------------------------------------------------------------
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .env({
        "HF_HOME": "/models",
        "PYTHONUNBUFFERED": "1",
        "PYTHONIOENCODING": "utf-8",
    })
    .pip_install(
        "torch>=2.1.0",
        "torchvision",
        "transformers>=4.40.0",
        "accelerate>=0.30.0",
        "bitsandbytes>=0.43.0",
        "safetensors",
        "sentencepiece",
        "outlines>=0.0.34",
        "pillow",
        "pydantic>=2.0.0",
        "fastapi",
        "git+https://github.com/huggingface/diffusers.git",
    )
)

# ------------------------------------------------------------------------------
# 3. MODAL PERSISTENT VOLUME & CONTAINER IMPORTS
# ------------------------------------------------------------------------------
volume = modal.Volume.from_name(
    "ideogram-model-cache",
    create_if_missing=True,
)

# Modern Modal pattern: 'with image.imports():' safely imports heavy ML packages inside container
with image.imports():
    import torch
    from diffusers import Ideogram4Pipeline, Ideogram4PromptEnhancerHead
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware


# ------------------------------------------------------------------------------
# 4. REQUEST SCHEMAS & INPUT VALIDATION (Pydantic)
# ------------------------------------------------------------------------------
class GenerateRequest(BaseModel):
    """Input payload schema for the image generation endpoint."""
    prompt: str = Field(..., description="Text prompt describing the image to generate.")
    height: int = Field(default=1024, description="Target image height in pixels (256-2048, multiple of 16).")
    width: int = Field(default=1024, description="Target image width in pixels (256-2048, multiple of 16).")
    num_inference_steps: int | None = Field(default=None, ge=1, le=100, description="Number of diffusion steps. Omit for model defaults.")
    guidance_scale: float | None = Field(default=None, ge=1.0, le=20.0, description="Classifier-free guidance scale. Omit to use pipeline defaults.")
    seed: int | None = Field(default=None, description="Optional random seed for reproducibility.")
    prompt_upsampling: bool = Field(default=True, description="Enable local prompt expansion via Ideogram4PromptEnhancerHead.")

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Prompt cannot be empty or whitespace only.")
        return v.strip()

    @field_validator("height", "width")
    @classmethod
    def validate_dimensions(cls, v: int) -> int:
        if not (256 <= v <= 2048):
            raise ValueError(f"Dimension {v} is out of bounds. Must be between 256 and 2048 pixels.")
        if v % 16 != 0:
            raise ValueError(f"Dimension {v} must be a multiple of 16.")
        return v


# ------------------------------------------------------------------------------
# 5. MODAL CLASS FOR MODEL SERVICE (@app.cls)
# ------------------------------------------------------------------------------
@app.cls(
    image=image,
    gpu="L4",
    secrets=[modal.Secret.from_name("huggingface-secret")],
    volumes={"/models": volume},
    timeout=900,
    scaledown_window=300,
)
class IdeogramService:
    # --------------------------------------------------------------------------
    # CONTAINER SETUP LIFECYCLE HOOK (@modal.enter)
    # --------------------------------------------------------------------------
    @modal.enter()
    def setup(self):
        hf_token = os.environ.get("HF_TOKEN")

        logger.info("[Modal Setup] Loading Ideogram 4 prompt enhancer head...")
        prompt_enhancer_head = Ideogram4PromptEnhancerHead.from_pretrained(
            "diffusers/qwen3-vl-8b-instruct-lm-head",
            torch_dtype=torch.bfloat16,
            cache_dir="/models",
            token=hf_token,
        )

        logger.info("[Modal Setup] Loading Ideogram 4 NF4 diffusers pipeline...")
        self.pipe = Ideogram4Pipeline.from_pretrained(
            "ideogram-ai/ideogram-4-nf4-diffusers",
            prompt_enhancer_head=prompt_enhancer_head,
            torch_dtype=torch.bfloat16,
            cache_dir="/models",
            token=hf_token,
        ).to("cuda")

        logger.info("[Modal Setup] Ideogram 4 pipeline loaded successfully onto CUDA!")

    # --------------------------------------------------------------------------
    # CORE INFERENCE IMPLEMENTATION (Private Helper)
    # --------------------------------------------------------------------------
    def _generate_image_impl(
        self,
        prompt: str,
        height: int = 1024,
        width: int = 1024,
        num_inference_steps: int | None = None,
        guidance_scale: float | None = None,
        seed: int | None = None,
        prompt_upsampling: bool = True,
    ) -> str:
        """Core in-container Python execution logic for image generation."""
        generator = None
        if seed is not None:
            generator = torch.Generator("cuda").manual_seed(seed)

        logger.info(
            f"[Generating] Image for prompt: '{prompt[:60]}...' "
            f"(dim={width}x{height}, steps={num_inference_steps}, guidance={guidance_scale}, upsampling={prompt_upsampling})"
        )

        kwargs = {
            "prompt": prompt,
            "prompt_upsampling": prompt_upsampling,
            "height": height,
            "width": width,
            "generator": generator,
        }
        # Only pass optional arguments if explicitly provided, matching official pipeline defaults
        if num_inference_steps is not None:
            kwargs["num_inference_steps"] = num_inference_steps
        if guidance_scale is not None:
            kwargs["guidance_scale"] = guidance_scale

        with torch.inference_mode():
            output = self.pipe(**kwargs)

        image = output.images[0]
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)

        img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{img_str}"

    # --------------------------------------------------------------------------
    # INTERNAL INFERENCE METHOD (@modal.method)
    # --------------------------------------------------------------------------
    @modal.method()
    def generate_image(
        self,
        prompt: str,
        height: int = 1024,
        width: int = 1024,
        num_inference_steps: int | None = None,
        guidance_scale: float | None = None,
        seed: int | None = None,
        prompt_upsampling: bool = True,
    ) -> str:
        """Remote RPC method for internal Modal callers."""
        try:
            return self._generate_image_impl(
                prompt=prompt,
                height=height,
                width=width,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                seed=seed,
                prompt_upsampling=prompt_upsampling,
            )
        except Exception as e:
            logger.error(f"[Error] Generation failed in generate_image method: {e}", exc_info=True)
            raise RuntimeError(f"Ideogram 4 image generation failed: {str(e)}") from e

    # --------------------------------------------------------------------------
    # FASTAPI ASGI APP WITH CORS MIDDLEWARE (@modal.asgi_app)
    # --------------------------------------------------------------------------
    @modal.asgi_app()
    def fastapi_app(self):
        """Web application entry point with automatic CORS middleware."""
        web_app = FastAPI(title="Ideogram 4 Image Generator API")
        
        # Attach CORSMiddleware to allow browser fetch() requests from any origin
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @web_app.post("/")
        def generate_api(req: GenerateRequest):
            try:
                base64_image = self._generate_image_impl(
                    prompt=req.prompt,
                    height=req.height,
                    width=req.width,
                    num_inference_steps=req.num_inference_steps,
                    guidance_scale=req.guidance_scale,
                    seed=req.seed,
                    prompt_upsampling=req.prompt_upsampling,
                )
                return {
                    "status": "success",
                    "prompt": req.prompt,
                    "image": base64_image,
                }
            except ValueError as ve:
                logger.warning(f"[Warning] Validation error (400 Bad Request): {ve}")
                raise HTTPException(status_code=400, detail=str(ve))
            except Exception as e:
                logger.error(f"[Error] Server error (500 Internal Error): {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

        return web_app


# ------------------------------------------------------------------------------
# 6. LOCAL CLI ENTRYPOINT (@app.local_entrypoint)
# ------------------------------------------------------------------------------
@app.local_entrypoint()
def main(prompt: str = "A futuristic city under a neon sunset, high resolution"):
    logger.info(f"[Local Test] Running local test invocation with prompt: {prompt}")
    service = IdeogramService()
    image_base64 = service.generate_image.remote(prompt=prompt)
    logger.info(f"[Success] Image generated successfully! Base64 output length: {len(image_base64)} chars")