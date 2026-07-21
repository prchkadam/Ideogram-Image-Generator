import React from 'react';
import { Wand2, RefreshCw, X, Sparkles, Sliders } from 'lucide-react';
import { SAMPLE_PROMPTS } from '../config/api';

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  promptUpsampling: boolean;
  setPromptUpsampling: (value: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
  showAdvanced: boolean;
  setShowAdvanced: (value: boolean) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  promptUpsampling,
  setPromptUpsampling,
  onGenerate,
  isLoading,
  showAdvanced,
  setShowAdvanced,
}) => {
  const handleRandomPrompt = () => {
    const random = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(random);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-xl space-y-4">
      {/* Label and Actions */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-400" />
          <span>Prompt Description</span>
        </label>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomPrompt}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-300 transition px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50"
            title="Insert a sample prompt"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Surprise Me</span>
          </button>
          
          {prompt && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="text-slate-400 hover:text-rose-400 transition p-1 rounded-lg hover:bg-slate-800"
              title="Clear prompt"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your vision in detail... e.g. A photo of a ginger cat wearing a tiny wizard hat reading a spellbook, photorealistic"
          rows={4}
          className="w-full glass-input rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onGenerate();
            }
          }}
        />
        <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 font-mono">
          {prompt.length} chars
        </div>
      </div>

      {/* Sample Prompt Chips */}
      <div className="space-y-2">
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Try these prompts:</div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(sample)}
              className="text-xs text-slate-300 bg-slate-800/70 hover:bg-purple-900/40 hover:text-purple-200 border border-slate-700/60 hover:border-purple-500/40 px-2.5 py-1 rounded-lg transition text-left truncate max-w-xs"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Row & Generate CTA */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
        {/* Local Prompt Upsampling Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPromptUpsampling(!promptUpsampling)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              promptUpsampling ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                promptUpsampling ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setPromptUpsampling(!promptUpsampling)}>
            <Sparkles className={`w-3.5 h-3.5 ${promptUpsampling ? 'text-purple-400' : 'text-slate-500'}`} />
            <span className="text-xs font-medium text-slate-300">Local Magic Prompt</span>
            <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Qwen3-VL-8B</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition ${
              showAdvanced
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || !prompt.trim()}
            className="glow-button px-6 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating (48 steps)...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
