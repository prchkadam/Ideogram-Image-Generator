import React, { useState } from 'react';
import { Download, Copy, Maximize2, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

interface ImageCanvasProps {
  image: string | null;
  isLoading: boolean;
  prompt: string;
  width: number;
  height: number;
  seed?: number | null;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  image,
  isLoading,
  prompt,
  width,
  height,
  seed,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `ideogram4-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyBase64 = () => {
    if (!image) return;
    navigator.clipboard.writeText(image);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col h-full min-h-[420px] justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-400" />
          <span>Generated Artwork</span>
        </h3>
        {image && !isLoading && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBase64}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 transition"
              title="Copy Base64 String"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Base64'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-lg border border-slate-700/60 transition"
              title="Full Preview"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg shadow-lg shadow-purple-600/30 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Container Area */}
      <div className="relative flex-1 flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden group min-h-[340px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin flex items-center justify-center"></div>
              <Sparkles className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-200">Ideogram 4 Diffusion in Progress</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Executing flow-matching diffusion on NVIDIA L4 GPU with local Qwen3-VL prompt enhancement...
              </p>
            </div>
          </div>
        ) : image ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={image}
              alt={prompt || 'Generated AI Art'}
              className="max-h-[500px] w-auto object-contain rounded-lg shadow-2xl transition duration-300 group-hover:scale-[1.01]"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
              <Sparkles className="w-8 h-8 opacity-40" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-400">No Image Generated Yet</h4>
              <p className="text-xs text-slate-600 max-w-xs mt-1">
                Enter a text prompt above and click "Generate Image" to create artwork using Ideogram 4.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {image && !isLoading && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <span>Dimensions: <strong className="text-slate-200 font-mono">{width}x{height}</strong></span>
            {seed && <span>Seed: <strong className="text-slate-200 font-mono">{seed}</strong></span>}
          </div>
          <span className="text-emerald-400 font-mono text-[11px]">Format: Base64 PNG</span>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && image && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img src={image} alt={prompt} className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl" />
            <p className="text-xs text-slate-300 mt-3 text-center max-w-xl bg-slate-900/80 px-4 py-2 rounded-lg border border-white/10">
              {prompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
