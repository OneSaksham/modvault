import React from 'react';
import { Target, Edit2, Package, HardDrive, Download } from 'lucide-react';
import { DownloadStatus } from '../types';

interface BottomStatusBarProps {
  targetModsPath: string;
  onEditPath: () => void;
  engineState: DownloadStatus | 'idle' | 'searching';
  installedCount: number;
  totalSizeMB: string;
  activeDownloadsCount: number;
  onOpenDownloadManager: () => void;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  targetModsPath,
  onEditPath,
  engineState,
  installedCount,
  totalSizeMB,
  activeDownloadsCount,
  onOpenDownloadManager,
}) => {
  const getEngineStateLabel = () => {
    switch (engineState) {
      case 'searching':
        return 'Searching Modrinth API...';
      case 'downloading':
        return `Downloading (${activeDownloadsCount} active stream${activeDownloadsCount > 1 ? 's' : ''})...`;
      case 'verifying':
        return 'Verifying SHA-1 checksum integrity...';
      case 'installing':
        return 'Installing into mods folder...';
      case 'error':
        return 'Operation encountered an error';
      default:
        return 'Idle - Ready to install';
    }
  };

  const isWorking = engineState !== 'idle';

  return (
    <footer className="h-[52px] bg-[#121820] border-t border-[#2a3646] px-4 flex items-center justify-between select-none z-40 flex-shrink-0 text-xs">
      {/* Left: Target Directory Path */}
      <div className="flex items-center gap-2 max-w-[40%]">
        <Target className="w-4 h-4 text-[#10b981] flex-shrink-0" />
        <span className="text-[#64748b] font-medium hidden sm:inline">Target:</span>
        <div
          onClick={onEditPath}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1a222d] hover:bg-[#242a33] border border-[#2a3646] hover:border-[#10b981]/50 cursor-pointer transition-colors truncate"
          title="Click to change target Minecraft directory"
        >
          <code className="text-[11px] font-mono text-[#f8fafc] truncate">
            {targetModsPath || '%APPDATA%\\.minecraft\\mods'}
          </code>
          <Edit2 className="w-3 h-3 text-[#94a3b8] flex-shrink-0" />
        </div>
      </div>

      {/* Center: Live Engine State */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isWorking ? 'bg-[#10b981] animate-ping' : 'bg-[#10b981]'
          }`}
        />
        <span className="font-mono text-[11px] text-[#94a3b8] hidden md:inline">
          {getEngineStateLabel()}
        </span>
      </div>

      {/* Right: Summary Metrics & Queue Trigger */}
      <div className="flex items-center gap-3 font-mono text-[11px] text-[#94a3b8]">
        <div className="flex items-center gap-1.5 bg-[#1a222d] border border-[#2a3646] px-2.5 py-1 rounded-lg">
          <Package className="w-3 h-3 text-[#10b981]" />
          <span className="text-[#f8fafc] font-bold">{installedCount}</span>
          <span className="text-[#64748b]">Mods Installed</span>
        </div>

        <span className="text-[#2a3646] hidden sm:inline">|</span>

        <div className="hidden sm:flex items-center gap-1.5 bg-[#1a222d] border border-[#2a3646] px-2.5 py-1 rounded-lg">
          <HardDrive className="w-3 h-3 text-[#06b6d4]" />
          <span className="text-[#f8fafc] font-bold">{totalSizeMB} MB</span>
        </div>

        <button
          onClick={onOpenDownloadManager}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a222d] hover:bg-[#242a33] border border-[#2a3646] hover:border-[#10b981]/40 text-[#f8fafc] transition-colors"
          title="Open Download Manager"
        >
          <Download className="w-3 h-3 text-[#10b981]" />
          <span>Queue ({activeDownloadsCount})</span>
        </button>
      </div>
    </footer>
  );
};
