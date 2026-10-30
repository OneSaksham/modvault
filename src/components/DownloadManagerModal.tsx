import React from 'react';
import { X, Download } from 'lucide-react';
import { DownloadItem } from '../types';

interface DownloadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadItems: DownloadItem[];
  onCancelDownload: (downloadId: string) => void;
  onClearCompleted: () => void;
}

export const DownloadManagerModal: React.FC<DownloadManagerModalProps> = ({
  isOpen,
  onClose,
  downloadItems,
  onCancelDownload,
  onClearCompleted,
}) => {
  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const formatSpeed = (bytesPerSec: number) => {
    if (bytesPerSec >= 1024 * 1024) return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
    if (bytesPerSec >= 1024) return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
    return `${bytesPerSec} B/s`;
  };

  const activeCount = downloadItems.filter(
    (i) => i.status === 'downloading' || i.status === 'verifying' || i.status === 'installing'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-[#121820] border border-[#2a3646] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a222d] border-b border-[#2a3646] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-[#10b981]" />
            <div>
              <h3 className="font-bold text-sm text-[#f8fafc]">Download Manager</h3>
              <p className="text-[11px] font-mono text-[#94a3b8]">
                {activeCount} active stream{activeCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {downloadItems.some((i) => i.status === 'completed' || i.status === 'error') && (
              <button
                onClick={onClearCompleted}
                className="px-3 py-1.5 rounded-lg bg-[#242a33] hover:bg-[#2f353e] text-xs font-mono text-[#94a3b8] hover:text-[#f8fafc] border border-[#2a3646] transition-colors"
              >
                Clear Finished
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-[#242a33] hover:bg-[#2f353e] text-[#94a3b8] hover:text-[#f8fafc] border border-[#2a3646] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Downloads List */}
        <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {downloadItems.length === 0 ? (
            <div className="text-center py-12 text-[#94a3b8] space-y-1">
              <Download className="w-8 h-8 text-[#64748b] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#f8fafc]">No active downloads</p>
              <p className="text-xs text-[#64748b]">
                Install mods from the Explore or Presets tab to see real-time download streaming.
              </p>
            </div>
          ) : (
            downloadItems.map((item) => {
              const isWorking =
                item.status === 'downloading' ||
                item.status === 'verifying' ||
                item.status === 'installing';

              return (
                <div
                  key={item.id}
                  className="bg-[#1a222d] border border-[#2a3646] rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#f8fafc] truncate">
                          {item.modName}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                            item.status === 'completed'
                              ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30'
                              : item.status === 'error'
                              ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30'
                              : 'bg-[#06b6d4]/15 text-[#06b6d4] border-[#06b6d4]/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#64748b] truncate mt-0.5">
                        {item.fileName}
                      </p>
                    </div>

                    {isWorking && (
                      <button
                        onClick={() => onCancelDownload(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#242a33] hover:bg-[#ef4444]/20 text-[#94a3b8] hover:text-[#ef4444] border border-[#2a3646] text-xs font-mono transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#121820] overflow-hidden border border-[#2a3646]">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        item.status === 'completed'
                          ? 'bg-[#10b981]'
                          : item.status === 'error'
                          ? 'bg-[#ef4444]'
                          : 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      }`}
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>

                  {/* Telemetry Row */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#64748b]">
                    <span>
                      {formatBytes(item.bytesDownloaded)} / {formatBytes(item.totalBytes)} (
                      {item.progressPercentage}%)
                    </span>
                    {isWorking && (
                      <span className="text-[#10b981] font-semibold">
                        {formatSpeed(item.speedBytesPerSec)}
                      </span>
                    )}
                  </div>

                  {item.errorMessage && (
                    <p className="text-xs text-[#ef4444] font-mono bg-[#ef4444]/10 p-2 rounded-lg border border-[#ef4444]/20">
                      Error: {item.errorMessage}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

