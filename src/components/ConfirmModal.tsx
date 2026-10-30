import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-[#121820] border border-[#2a3646] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl border flex-shrink-0 ${
              isDestructive
                ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30'
                : 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30'
            }`}
          >
            {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
          </div>

          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-sm text-[#f8fafc]">{title}</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[#242a33] hover:bg-[#2f353e] text-[#f8fafc] text-xs font-semibold border border-[#2a3646] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isDestructive
                ? 'bg-[#ef4444] hover:bg-red-600 text-white shadow-sm'
                : 'bg-[#10b981] hover:bg-[#059669] text-[#0b0f14]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
