import React from 'react';
import { Compass, Zap, Package, Settings, FolderOpen } from 'lucide-react';
import { MinecraftInstance } from '../types';
import { Logo } from './Logo';

export type NavTab = 'explore' | 'presets' | 'installed' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  installedCount: number;
  activeInstance: MinecraftInstance | null;
  onOpenModsFolder: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  installedCount,
  activeInstance,
  onOpenModsFolder,
}) => {
  const navItems = [
    { id: 'explore', label: 'Explore Mods', icon: Compass },
    { id: 'presets', label: 'Quick Presets', icon: Zap },
    { id: 'installed', label: 'Installed Mods', icon: Package, badge: installedCount },
    { id: 'settings', label: 'Launcher Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 h-full bg-[#121820] border-r border-[#2a3646] flex flex-col justify-between p-4 flex-shrink-0 select-none">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2 pt-1">
          <Logo size={38} showText={true} />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1a222d] text-[#f8fafc] border-l-4 border-[#10b981] shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a222d]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#10b981]' : 'text-[#64748b]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                      isActive
                        ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30'
                        : 'bg-[#1a222d] text-[#94a3b8] border border-[#2a3646]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Launcher Status Card */}
      <div className="space-y-3 pt-4 border-t border-[#2a3646]">
        <div className="p-3 bg-[#1a222d] rounded-xl border border-[#2a3646]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">
              Connected Launcher
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#10b981] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              ACTIVE
            </span>
          </div>

          <p className="text-xs font-semibold text-[#f8fafc] truncate" title={activeInstance?.name || 'Minecraft Instance'}>
            {activeInstance?.name || 'Minecraft Instance'}
          </p>

          <p className="text-[11px] text-[#94a3b8] truncate font-mono mt-0.5">
            {activeInstance?.detectedLoader
              ? `${activeInstance.detectedLoader.toUpperCase()} ${activeInstance.detectedVersion || '1.20.1'}`
              : 'FABRIC 1.20.1'}
          </p>
        </div>

        <button
          onClick={onOpenModsFolder}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#1a222d]/60 hover:bg-[#1a222d] border border-[#2a3646] hover:border-[#3b4d63] rounded-lg text-xs font-medium text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Open Mods Folder</span>
        </button>
      </div>
    </aside>
  );
};

