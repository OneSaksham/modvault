import React from 'react';
import { X, Layers, FolderPlus, CheckCircle2, ChevronRight, Activity, PackageCheck } from 'lucide-react';
import { MinecraftInstance, LauncherType } from '../types';

interface InstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  instances: MinecraftInstance[];
  activeInstanceId: string | null;
  onSelectInstance: (instance: MinecraftInstance) => void;
  onAddCustomFolder: () => void;
  onRescan: () => void;
  isScanning: boolean;
}

export const InstanceModal: React.FC<InstanceModalProps> = ({
  isOpen,
  onClose,
  instances,
  activeInstanceId,
  onSelectInstance,
  onAddCustomFolder,
  onRescan,
  isScanning,
}) => {
  if (!isOpen) return null;

  const getLauncherBadge = (type: LauncherType) => {
    switch (type) {
      case 'legacy':
        return { label: 'Legacy Launcher', color: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40' };
      case 'modrinth':
        return { label: 'Modrinth App', color: 'bg-[#00af5c]/15 text-[#00af5c] border-[#00af5c]/40' };
      case 'prism':
        return { label: 'Prism Launcher', color: 'bg-[#06b6d4]/15 text-[#06b6d4] border-[#06b6d4]/40' };
      case 'multimc':
        return { label: 'MultiMC', color: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40' };
      case 'curseforge':
        return { label: 'CurseForge', color: 'bg-[#f97316]/15 text-[#f97316] border-[#f97316]/40' };
      case 'official':
        return { label: 'Official / Vanilla', color: 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/40' };
      case 'tlauncher':
        return { label: 'TLauncher', color: 'bg-[#0ea5e9]/15 text-[#0ea5e9] border-[#0ea5e9]/40' };
      case 'feather':
        return { label: 'Feather Client', color: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/40' };
      case 'lunar':
        return { label: 'Lunar Client', color: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/40' };
      case 'badlion':
        return { label: 'Badlion Client', color: 'bg-[#eab308]/15 text-[#eab308] border-[#eab308]/40' };
      default:
        return { label: 'Custom Directory', color: 'bg-[#64748b]/15 text-[#94a3b8] border-[#64748b]/40' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-[#121820] border border-[#2a3646] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a222d] border-b border-[#2a3646] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#10b981]" />
            <div>
              <h3 className="font-bold text-sm text-[#f8fafc]">Detected Minecraft Instances & Launchers</h3>
              <p className="text-[11px] text-[#94a3b8]">Auto-detected from your installed launchers and custom game folders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#242a33] hover:bg-[#2f353e] text-[#94a3b8] hover:text-[#f8fafc] border border-[#2a3646] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instances List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {instances.map((inst) => {
            const isSelected = inst.id === activeInstanceId;
            const badge = getLauncherBadge(inst.launcherType);

            return (
              <div
                key={inst.id}
                onClick={() => {
                  onSelectInstance(inst);
                  onClose();
                }}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1a222d] border-[#10b981] shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]'
                    : 'bg-[#161c24] border-[#2a3646] hover:bg-[#1a222d] hover:border-[#3b4d63]'
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#f8fafc] truncate">{inst.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold border ${badge.color}`}
                    >
                      {badge.label}
                    </span>

                    {inst.isRunning && (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-bold animate-pulse">
                        <Activity className="w-3 h-3" />
                        RUNNING
                      </span>
                    )}

                    {inst.isDefault && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                        DEFAULT
                      </span>
                    )}

                    {inst.modsCount !== undefined && inst.modsCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#242a33] text-[#f8fafc] border border-[#2a3646]">
                        <PackageCheck className="w-3 h-3 text-[#10b981]" />
                        {inst.modsCount} mods installed
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-mono text-[#64748b] truncate" title={inst.rootPath}>
                    {inst.rootPath}
                  </p>

                  {/* Installed Versions tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-mono text-[#94a3b8] mr-1">Installed Versions:</span>
                    {inst.availableVersions.slice(0, 4).map((v) => (
                      <span
                        key={v.id}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#121820] text-[#06b6d4] border border-[#2a3646]"
                      >
                        {v.name}
                      </span>
                    ))}
                    {inst.availableVersions.length > 4 && (
                      <span className="text-[10px] font-mono text-[#64748b]">
                        +{inst.availableVersions.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#64748b]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#1a222d] border-t border-[#2a3646] flex items-center justify-between">
          <button
            onClick={onRescan}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-xl bg-[#242a33] hover:bg-[#2f353e] text-xs font-semibold text-[#f8fafc] border border-[#2a3646] transition-colors"
          >
            {isScanning ? 'Scanning Launchers...' : 'Rescan All Launchers'}
          </button>

          <button
            onClick={onAddCustomFolder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#0b0f14] text-xs font-bold transition-colors shadow-sm"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Add Custom Minecraft Folder</span>
          </button>
        </div>
      </div>
    </div>
  );
};
