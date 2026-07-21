import React from 'react';
import { Sparkles, Zap, ExternalLink } from 'lucide-react';
import { MODAL_API_URL } from '../config/api';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-white/10 glass-panel sticky top-0 z-50 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                Ideogram <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">4.0 Studio</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                NF4 DiT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Open-weight 9.3B Foundation Model</span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-400 font-medium">NVIDIA L4 GPU</span>
            </p>
          </div>
        </div>

        {/* Right Badges & Status */}
        <div className="flex items-center gap-3">
          {/* Live Modal Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Modal Server Live</span>
          </div>

          <a
            href={MODAL_API_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>API Specs</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>
    </header>
  );
};
