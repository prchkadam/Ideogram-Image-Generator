# Ideogram 4.0 AI Image Generator

A full-stack, open-weight AI Image Generation Application powered by **Ideogram 4.0 NF4** on a **Modal GPU Backend** paired with a **React + TypeScript + Vite Frontend**.

---

## 🚀 Deployed URLs & Live Links

- **Live Modal Backend API Endpoint**: `https://divyakadam207--ideogram-v4-generator-ideogramservice-fas-bae4d7.modal.run`
- **Interactive Swagger API Docs**: `https://divyakadam207--ideogram-v4-generator-ideogramservice-fas-bae4d7.modal.run/docs`
- **GitHub Repository**: [https://github.com/prchkadam/Ideogram-Image-Generator](https://github.com/prchkadam/Ideogram-Image-Generator)

---

## 🛠️ How to Run Both Parts Locally

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and `npm`
- Modal Account (`modal setup`)
- Hugging Face Account Token (`HF_TOKEN`)

### 2. Running the Backend (Modal)

```bash
# 1. Install Modal CLI & dependencies
pip install modal

# 2. Authenticate with Modal
modal setup

# 3. Create Hugging Face Secret in Modal
modal secret create huggingface-secret HF_TOKEN=hf_your_huggingface_token

# 4. Run local test invocation
modal run backend/app.py

# 5. Deploy live HTTP endpoint to Modal
modal deploy backend/app.py
```

### 3. Running the Frontend (React + Vite)

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start local Vite dev server
npm run dev
```

Open `http://localhost:5173` in your web browser.

---

## 🎯 Model Checkpoint & GPU Justification

### Chosen Checkpoint: `ideogram-ai/ideogram-4-nf4-diffusers`
- **Prompt Enhancer Head**: `diffusers/qwen3-vl-8b-instruct-lm-head`
- **Why**: The NF4 (NormalFloat4) quantized checkpoint compresses the 9.3B parameter Ideogram 4 model from ~20GB down to ~12GB VRAM while preserving full visual fidelity and text rendering accuracy. Local prompt upsampling via Qwen3-VL-8B runs directly on-device without external paid LLM API calls.

### Chosen GPU Tier: **NVIDIA L4 GPU** (24GB VRAM)
- **Why**: The L4 GPU provides 24GB VRAM and Ada Lovelace Tensor Cores, accommodating the ~12GB NF4 weights and prompt enhancer head comfortably with headroom for KV-caching.
- **Cost Efficiency**: At **~$0.80/hour**, the L4 GPU is ~4.5x more cost-effective than an A100 (~$3.67/hour), delivering fast flow-matching inference while remaining budget-friendly.

---

## 💡 Credit Usage & Cost Management Decisions

- **Total Modal Credits Used**: **~$1.32** out of the starter credits.
- **Cost Optimization Decisions**:
  1. **Persistent Volume Caching**: Created a Modal Volume `ideogram-model-cache` mounted at `/models` (`HF_HOME=/models`). Model weights are downloaded once and cached permanently, eliminating bandwidth costs and cold-start re-download time.
  2. **Inference Mode & Precision**: Wrapped generation in `torch.inference_mode()` with `bfloat16` precision to minimize VRAM allocation and accelerate tensor operations.
  3. **Fast Test Defaults**: Set default testing resolution to 512x512 pixels to minimize tensor spatial dimensions by 4x during iterative debugging.

---

## 🧩 Blockers Encountered & Resolutions

1. **Blocker: PyTorch CUDA Thread Context Mismatch in FastAPI Sync Routes**
   - *Symptom*: Calling `self._generate_image_impl()` inside a synchronous FastAPI route (`def generate_api`) caused PyTorch CUDA errors because FastAPI offloaded sync functions to background worker threads.
   - *Resolution*: Converted the FastAPI route to `async def generate_api`, ensuring route execution stays on the main process event loop where CUDA context was initialized.

2. **Blocker: `guidance_schedule` Vector Length Mismatch (`ValueError`)**
   - *Symptom*: Passing custom `num_inference_steps` raised `ValueError: guidance_schedule must have length num_inference_steps (8), got 48`.
   - *Resolution*: Omitted `num_inference_steps` from pipeline execution kwargs, allowing `Ideogram4Pipeline` to natively use its precomputed 48-step flow-matching schedule (`V4_QUALITY_48`).

3. **Blocker: Browser CORS Preflight Rejection (`Failed to fetch`)**
   - *Symptom*: Cross-origin `fetch()` calls from `localhost:5173` to Modal were blocked by missing CORS headers.
   - *Resolution*: Wrapped the Modal entrypoint using `@modal.asgi_app()` and attached FastAPI `CORSMiddleware` with `allow_origins=["*"]`.

---

## 📁 Project Structure

```text
.
├── backend/
│   └── app.py            # Modal GPU Service, HF Token Auth, Volume Cache & FastAPI Endpoint
├── frontend/
│   ├── src/
│   │   ├── App.tsx       # React Single-Page Application (Prompt Input, Loading & Image View)
│   │   ├── config/api.ts # API Configuration & Deployed Modal URL
│   │   └── index.css    # Tailwind CSS Styling & Single Dark Theme
│   ├── index.html        # Main HTML Document Title & Metadata
│   └── package.json      # Frontend Dependencies & Scripts
├── .gitignore            # Git Exclusions (__pycache__, .venv, node_modules)
└── README.md             # Project Documentation & System Setup
```
