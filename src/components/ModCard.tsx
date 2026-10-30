import React from 'react';
import { Download, Check, Trash2, Box, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { ModSearchResult, DownloadItem } from '../types';

interface ModCardProps {
  mod: ModSearchResult;
  isInstalled: boolean;
  downloadProgress?: DownloadItem;
  onInstall: (mod: ModSearchResult) => void;
  onUninstall: (mod: ModSearchResult) => void;
  onSelect: (mod: ModSearchResult) => void;
}

export const ModCard: React.FC<ModCardProps> = ({
  mod,
  isInstalled,
  downloadProgress,
  onInstall,
  onUninstall,
  onSelect,
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return String(num);
  };

  const isDownloading =
    downloadProgress &&
    (downloadProgress.status === 'downloading' ||
      downloadProgress.status === 'verifying' ||
      downloadProgress.status === 'installing');

  const isError = downloadProgress && downloadProgress.status === 'error';

  return (
    <div
      onClick={() => onSelect(mod)}
      className="group relative bg-[#1a222d] hover:bg-[#222d3d] border border-[#2a3646] hover:border-[#3b4d63] rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 cursor-pointer select-none shadow-sm hover:shadow-md"
    >
      <div className="space-y-3">
        {/* Top Row: Icon + Title + Author */}
        <div className="flex items-start gap-3.5">
          {mod.icon_url ? (
            <img
              src={mod.icon_url}
              alt={mod.title}
              className="w-14 h-14 rounded-xl object-cover bg-[#121820] border border-[#2a3646] flex-shrink-0 group-hover:border-[#10b981]/50 transition-colors"
              onError={(e) => {
                // fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#121820] border border-[#2a3646] flex items-center justify-center text-[#10b981] flex-shrink-0">
              <Box className="w-7 h-7" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-[#f8fafc] truncate group-hover:text-[#10b981] transition-colors">
              {mod.title}
            </h3>
            <p className="text-xs text-[#94a3b8] truncate mt-0.5">
              by <span className="text-[#f8fafc] font-medium">{mod.author}</span>
            </p>

            {/* Metrics */}
            <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-[#64748b]">
              <span className="flex items-center gap-1">
                <ArrowDownCircle className="w-3 h-3 text-[#10b981]" />
                {formatNumber(mod.downloads)}
              </span>
              <span>•</span>
              <span className="truncate">
                {mod.categories.slice(0, 2).map((c) => c.toUpperCase()).join(' / ')}
              </span>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-[#94a3b8] leading-relaxed text-truncate-2 min-h-[36px]">
          {mod.description || 'No description provided.'}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {mod.categories.includes('fabric') && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30">
              Fabric
            </span>
          )}
          {mod.categories.includes('forge') && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/30">
              Forge
            </span>
          )}
          {mod.categories.includes('neoforge') && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30">
              NeoForge
            </span>
          )}
          {mod.display_categories && mod.display_categories[0] && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#94a3b8] bg-[#242a33] border border-[#2a3646]">
              {mod.display_categories[0]}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-3 border-t border-[#2a3646]/60 flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-[#64748b]">
          {mod.latest_version ? `v${mod.latest_version.slice(0, 10)}` : 'Latest'}
        </span>

        {/* Multi-state button */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isDownloading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#242a33] border border-[#10b981]/50 text-xs font-mono text-[#10b981]">
              <span className="w-3.5 h-3.5 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
              <span>
                {downloadProgress.status === 'verifying'
                  ? 'Verifying...'
                  : downloadProgress.status === 'installing'
                  ? 'Installing...'
                  : `${downloadProgress.progressPercentage}%`}
              </span>
            </div>
          ) : isInstalled ? (
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-xs font-semibold">
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Installed</span>
              </span>
              <button
                onClick={() => onUninstall(mod)}
                className="p-1.5 rounded-lg bg-[#242a33] hover:bg-[#ef4444]/20 text-[#94a3b8] hover:text-[#ef4444] border border-[#2a3646] hover:border-[#ef4444]/40 transition-colors"
                title="Uninstall Mod"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isError ? (
            <button
              onClick={() => onInstall(mod)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ef4444] border border-[#ef4444]/30 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          ) : (
            <button
              onClick={() => onInstall(mod)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-[#0b0f14] font-bold text-xs transition-colors shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

