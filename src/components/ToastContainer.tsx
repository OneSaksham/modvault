import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;

        const borderBg =
          toast.type === 'success'
            ? 'border-[#10b981]/40 bg-[#121820]'
            : toast.type === 'error'
            ? 'border-[#ef4444]/40 bg-[#121820]'
            : 'border-[#06b6d4]/40 bg-[#121820]';

        const iconColor =
          toast.type === 'success'
            ? 'text-[#10b981]'
            : toast.type === 'error'
            ? 'text-[#ef4444]'
            : 'text-[#06b6d4]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 animate-in slide-in-from-right-5 duration-200 ${borderBg}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#f8fafc]">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] text-[#94a3b8] mt-0.5 leading-snug break-words">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#64748b] hover:text-[#f8fafc] flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

