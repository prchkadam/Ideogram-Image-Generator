import type { PresetRatio } from '../types';

// Deployed Modal API endpoint URL
export const MODAL_API_URL = "https://divyakadam207--ideogram-v4-generator-ideogramservice-fas-bae4d7.modal.run";

export const PRESET_RATIOS: PresetRatio[] = [
  { label: 'Square (1:1)', ratio: '1:1', width: 1024, height: 1024 },
  { label: 'Landscape (16:9)', ratio: '16:9', width: 1280, height: 720 },
  { label: 'Portrait (9:16)', ratio: '9:16', width: 720, height: 1280 },
  { label: 'Standard (4:3)', ratio: '4:3', width: 1024, height: 768 },
  { label: 'Tall (3:4)', ratio: '3:4', width: 768, height: 1024 },
];

export const SAMPLE_PROMPTS = [
  "A futuristic cyberpunk city under a glowing neon purple and cyan sunset, ultra realistic 8k resolution, graphic design aesthetic",
  "A serene Japanese zen garden in autumn with golden leaves falling on a tranquil pond, photorealistic cinematography",
  "A minimalist typography poster that reads 'CREATIVITY IN MOTION' with bold geometric shapes and vibrant color palette",
  "An isometric 3D illustration of a tiny cozy coffee shop inside a glowing lightbulb",
  "A majestic snow leopard standing atop a crystal-covered mountain peak under the Northern Lights",
];
