import React from 'react';
import {
  Settings,
  HardDrive,
  DownloadCloud,
  Shield,
  FolderOpen,
  CheckCircle2,
  Globe,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { AppSettings, MinecraftInstance } from '../types';

interface LauncherSettingsProps {
  settings: AppSettings;
  activeInstance: MinecraftInstance | null;
  instances?: MinecraftInstance[];
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onOpenFolder: (path: string) => void;
  onOpenInstanceModal: () => void;
}

export const LauncherSettings: React.FC<LauncherSettingsProps> = ({
  settings,
  activeInstance,
  onSaveSettings,
  onOpenFolder,
  onOpenInstanceModal,
}) => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto select-none">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#10b981]" />
          <h2 className="text-xl font-bold text-[#f8fafc]">Launcher & Application Settings</h2>
        </div>
        <p className="text-sm text-[#94a3b8]">
          Manage directory targets, instance overrides, download concurrency, and network integration.
        </p>
      </div>

      <div className="space-y-5">
        {/* Minecraft Instance Target */}
        <div className="bg-[#1a222d] border border-[#2a3646] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#10b981]" />
              <h3 className="font-bold text-sm text-[#f8fafc]">Active Minecraft Instance</h3>
            </div>
            <button
              onClick={onOpenInstanceModal}
              className="px-3 py-1.5 rounded-lg bg-[#242a33] hover:bg-[#2f353e] text-[#f8fafc] text-xs font-semibold border border-[#2a3646] transition-colors"
            >
              Browse & Switch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#64748b] block">
                Selected Profile
              </label>
              <div className="p-3 bg-[#121820] border border-[#2a3646] rounded-xl text-xs font-semibold text-[#f8fafc] truncate">
                {activeInstance?.name || 'Minecraft Instance'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#64748b] block">
                Launcher Engine Type
              </label>
              <div className="p-3 bg-[#121820] border border-[#2a3646] rounded-xl text-xs font-mono text-[#06b6d4] uppercase">
                {activeInstance?.launcherType ? activeInstance.launcherType.toUpperCase() : 'AUTO-DETECTED'}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#64748b] block">
              Mods Installation Folder
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-[#121820] border border-[#2a3646] rounded-xl text-xs font-mono text-[#94a3b8] truncate">
                {activeInstance?.modsPath || '%APPDATA%\\.minecraft\\mods'}
              </div>
              <button
                onClick={() => activeInstance?.modsPath && onOpenFolder(activeInstance.modsPath)}
                className="p-3 bg-[#242a33] hover:bg-[#2f353e] text-[#f8fafc] border border-[#2a3646] rounded-xl transition-colors"
                title="Open in Windows Explorer"
              >
                <FolderOpen className="w-4 h-4 text-[#10b981]" />
              </button>
            </div>
          </div>
        </div>

        {/* Downloads & Concurrency */}
        <div className="bg-[#1a222d] border border-[#2a3646] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-4 h-4 text-[#10b981]" />
            <h3 className="font-bold text-sm text-[#f8fafc]">Download & Resolution Pipeline</h3>
          </div>

          <div className="space-y-4">
            {/* Auto-resolve Dependencies Switch */}
            <div className="flex items-center justify-between p-3.5 bg-[#121820] border border-[#2a3646] rounded-xl">
              <div>
                <p className="text-xs font-bold text-[#f8fafc]">Auto-Resolve Dependencies</p>
                <p className="text-[11px] text-[#94a3b8]">
                  Automatically download required APIs (Fabric API, Architectury, Cloth Config) when installing mods.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoResolveDependencies}
                onChange={(e) => onSaveSettings({ autoResolveDependencies: e.target.checked })}
                className="w-4 h-4 accent-[#10b981] rounded cursor-pointer"
              />
            </div>

            {/* Concurrent Downloads Limit */}
            <div className="flex items-center justify-between p-3.5 bg-[#121820] border border-[#2a3646] rounded-xl">
              <div>
                <p className="text-xs font-bold text-[#f8fafc]">Max Concurrent Downloads</p>
                <p className="text-[11px] text-[#94a3b8]">
                  Limits parallel network streams during bundle or multi-dependency downloads.
                </p>
              </div>
              <select
                value={settings.maxConcurrentDownloads}
                onChange={(e) => onSaveSettings({ maxConcurrentDownloads: Number(e.target.value) })}
                className="bg-[#1a222d] border border-[#2a3646] text-[#f8fafc] text-xs font-mono px-3 py-1.5 rounded-lg outline-none cursor-pointer"
              >
                <option value={1}>1 stream</option>
                <option value={2}>2 streams</option>
                <option value={3}>3 streams (Default)</option>
                <option value={5}>5 streams (High Speed)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & System Status */}
        <div className="bg-[#1a222d] border border-[#2a3646] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#10b981]" />
            <h3 className="font-bold text-sm text-[#f8fafc]">Integrity & Security</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#121820] border border-[#2a3646] rounded-xl text-xs">
              <span className="text-[#94a3b8]">Modrinth API Connection:</span>
              <span className="flex items-center gap-1.5 text-[#10b981] font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ONLINE (REST v2)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#121820] border border-[#2a3646] rounded-xl text-xs">
              <span className="text-[#94a3b8]">Hash Checksum Verification:</span>
              <span className="text-[#f8fafc] font-mono font-bold">SHA-1 / SHA-512 STRICT</span>
            </div>
          </div>
        </div>

        {/* Developer & Landing Page */}
        <div className="bg-[#1a222d] border border-[#2a3646] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#10b981]" />
              <h3 className="font-bold text-sm text-[#f8fafc]">Developer & Official Website</h3>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
              BY SAKSHAM
            </span>
          </div>

          <p className="text-xs text-[#94a3b8] leading-relaxed">
            ModVault is engineered by <strong className="text-[#f8fafc]">Saksham</strong> with golden ratio layout aesthetics, clean TypeScript architecture, and zero telemetry.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.api?.system?.openExternal) {
                  window.api.system.openExternal('https://github.com/saksham-kumar1621');
                } else {
                  window.open('https://github.com/saksham-kumar1621', '_blank');
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121820] hover:bg-[#242a33] border border-[#2a3646] hover:border-[#10b981]/50 text-xs text-[#f8fafc] font-mono transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#10b981]" />
              <span>github.com/saksham-kumar1621</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.api?.system?.openExternal) {
                  window.api.system.openExternal('https://www.instagram.com/one._saksham._/');
                } else {
                  window.open('https://www.instagram.com/one._saksham._/', '_blank');
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121820] hover:bg-[#242a33] border border-[#2a3646] hover:border-pink-500/50 text-xs text-[#f8fafc] font-mono transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
              <span>@one._saksham._</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.api?.system?.openLandingPage) {
                  window.api.system.openLandingPage();
                } else {
                  window.open('./landing.html', '_blank');
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#10b981]/15 hover:bg-[#10b981]/25 border border-[#10b981]/40 text-xs text-[#10b981] font-semibold transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Open Landing Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
