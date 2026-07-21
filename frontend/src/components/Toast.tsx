import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-bounce-short">
      <div
        className={`glass-panel p-4 rounded-xl border shadow-2xl flex items-start gap-3 ${
          isError
            ? 'border-rose-500/50 bg-rose-950/40 text-rose-200'
            : 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-wider">{toast.title}</h4>
          <p className="text-xs mt-0.5 opacity-90 leading-relaxed break-words">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
