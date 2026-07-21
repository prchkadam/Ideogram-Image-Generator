import React from 'react';
import { PRESET_RATIOS } from '../config/api';
import type { PresetRatio } from '../types';
import { Square, Monitor, Smartphone, LayoutGrid, Dices, Layers } from 'lucide-react';

interface ControlPanelProps {
  width: number;
  setWidth: (val: number) => void;
  height: number;
  setHeight: (val: number) => void;
  seed: number | null;
  setSeed: (val: number | null) => void;
  guidanceScale: number | null;
  setGuidanceScale: (val: number | null) => void;
  numInferenceSteps: number | null;
  setNumInferenceSteps: (val: number | null) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  width,
  setWidth,
  height,
  setHeight,
  seed,
  setSeed,
  guidanceScale,
  setGuidanceScale,
  numInferenceSteps,
  setNumInferenceSteps,
}) => {
  const handleSelectPreset = (preset: PresetRatio) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000000));
  };

  const activePreset = PRESET_RATIOS.find(
    (p) => p.width === width && p.height === height
  );

  const getRatioIcon = (ratio: string) => {
    switch (ratio) {
      case '1:1':
        return <Square className="w-4 h-4" />;
      case '16:9':
        return <Monitor className="w-4 h-4" />;
      case '9:16':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Generation Parameters</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {width} × {height} px
        </span>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="space-y-2.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Aspect Ratio Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESET_RATIOS.map((preset) => {
            const isSelected = activePreset?.ratio === preset.ratio;
            return (
              <button
                key={preset.ratio}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {getRatioIcon(preset.ratio)}
                <span className="text-xs font-semibold">{preset.label}</span>
                <span className="text-[10px] opacity-60 font-mono">
                  {preset.width}x{preset.height}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Custom Resolution Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Width</span>
            <span className="font-mono text-purple-400">{width} px</span>
          </div>
          <input
            type="range"
            min={256}
            max={2048}
            step={16}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>256px</span>
            <span>Multiple of 16</span>
            <span>2048px</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Height</span>
            <span className="font-mono text-purple-400">{height} px</span>
          </div>
          <input
            type="range"
            min={256}
            max={2048}
            step={16}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>256px</span>
            <span>Multiple of 16</span>
            <span>2048px</span>
          </div>
        </div>
      </div>

      {/* Advanced Seed & Guidance Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
        {/* Seed */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span>Random Seed</span>
            <button
              type="button"
              onClick={handleRandomSeed}
              className="text-purple-400 hover:text-purple-300 text-[11px] flex items-center gap-1"
            >
              <Dices className="w-3 h-3" />
              <span>Random</span>
            </button>
          </div>
          <input
            type="number"
            placeholder="Random"
            value={seed ?? ''}
            onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : null)}
            className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Guidance Scale */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span>Guidance Scale</span>
            <span className="font-mono text-xs text-purple-400">
              {guidanceScale ?? 'Default (3.5)'}
            </span>
          </div>
          <input
            type="range"
            min={1.0}
            max={15.0}
            step={0.5}
            value={guidanceScale ?? 3.5}
            onChange={(e) => setGuidanceScale(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>1.0</span>
            <button
              type="button"
              onClick={() => setGuidanceScale(null)}
              className="hover:text-slate-300 underline"
            >
              Reset
            </button>
            <span>15.0</span>
          </div>
        </div>

        {/* Inference Steps */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span>Inference Steps</span>
            <span className="font-mono text-xs text-purple-400">
              {numInferenceSteps ?? 'Default (48)'}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={numInferenceSteps ?? 48}
            onChange={(e) => setNumInferenceSteps(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>10</span>
            <button
              type="button"
              onClick={() => setNumInferenceSteps(null)}
              className="hover:text-slate-300 underline"
            >
              Reset
            </button>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
