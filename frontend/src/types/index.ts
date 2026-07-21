export interface GenerateRequestPayload {
  prompt: string;
  height: number;
  width: number;
  num_inference_steps?: number | null;
  guidance_scale?: number | null;
  seed?: number | null;
  prompt_upsampling: boolean;
}

export interface GenerateResponsePayload {
  status: 'success' | 'error';
  prompt: string;
  image: string; // Base64 data URI (data:image/png;base64,...)
  detail?: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  image: string;
  timestamp: number;
  height: number;
  width: number;
  seed?: number | null;
  prompt_upsampling: boolean;
}

export interface PresetRatio {
  label: string;
  ratio: string;
  width: number;
  height: number;
  icon?: string;
}
