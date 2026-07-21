import React from 'react';
import type { HistoryItem } from '../types';
import { History, Trash2, ArrowUpRight } from 'lucide-react';

interface HistoryGalleryProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryGallery: React.FC<HistoryGalleryProps> = ({
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-200">Recent Generations</h3>
          <span className="text-xs text-slate-500 font-mono">({history.length})</span>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectHistory(item)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer hover:border-purple-500/60 transition shadow-md"
          >
            <img
              src={item.image}
              alt={item.prompt}
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-end">
              <p className="text-[11px] text-slate-200 line-clamp-2 leading-tight">
                {item.prompt}
              </p>
              <div className="flex items-center justify-between mt-1 text-[9px] text-purple-300 font-mono">
                <span>{item.width}x{item.height}</span>
                <ArrowUpRight className="w-3 h-3 text-purple-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
