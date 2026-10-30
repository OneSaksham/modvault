import React from 'react';
import { Search, ChevronDown, RefreshCw, Layers } from 'lucide-react';
import { MinecraftInstance, ModLoader, ModSearchFilter } from '../types';

interface HeaderProps {
  activeInstance: MinecraftInstance | null;
  onOpenInstanceModal: () => void;
  filter: ModSearchFilter;
  onFilterChange: (newFilter: Partial<ModSearchFilter>) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeInstance,
  onOpenInstanceModal,
  filter,
  onFilterChange,
  onRefresh,
  isLoading,
}) => {
  const loaderOptions: { id: ModLoader; label: string }[] = [
    { id: 'all', label: 'All Loaders' },
    { id: 'fabric', label: 'Fabric' },
    { id: 'forge', label: 'Forge' },
    { id: 'neoforge', label: 'NeoForge' },
    { id: 'quilt', label: 'Quilt' },
  ];

  const commonVersions = [
    '1.21.5',
    '1.21.4',
    '1.21.1',
    '1.21',
    '1.20.6',
    '1.20.4',
    '1.20.2',
    '1.20.1',
    '1.19.4',
    '1.19.2',
    '1.18.2',
    '1.16.5',
    '1.12.2',
  ];

  // Dynamically build version list with all installed versions from active instance prioritized
  const installedVersions = activeInstance?.availableVersions || [];
  const installedSet = new Set(installedVersions.map((v) => v.gameVersion));

  const versionOptions: { value: string; label: string }[] = [
    ...installedVersions.map((v) => ({
      value: v.gameVersion,
      label: `MC ${v.gameVersion} (${v.loader.toUpperCase()} - Installed)`,
    })),
    ...commonVersions
      .filter((v) => !installedSet.has(v))
      .map((v) => ({
        value: v,
        label: `MC ${v}`,
      })),
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'optimization', label: 'Performance' },
    { id: 'shaders', label: 'Shaders' },
    { id: 'utility', label: 'QoL & HUD' },
    { id: 'equipment', label: 'PvP & Combat' },
    { id: 'technology', label: 'Technology' },
    { id: 'worldgen', label: 'World Generation' },
    { id: 'adventure', label: 'Adventure' },
  ];

  const sortOptions = [
    { id: 'downloads', label: 'Most Downloads' },
    { id: 'updated', label: 'Recently Updated' },
    { id: 'newest', label: 'Recently Published' },
    { id: 'relevance', label: 'Relevance' },
  ];

  return (
    <header className="bg-[#121820] border-b border-[#2a3646] p-4 space-y-4 select-none">
      {/* Instance Detection Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1a222d] border border-[#2a3646] px-4 py-2.5 rounded-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse flex-shrink-0" />
          <div className="flex flex-wrap items-center gap-2 text-xs min-w-0">
            <span className="text-[#94a3b8] font-medium flex-shrink-0">Detected Instance:</span>
            <span className="font-semibold text-[#f8fafc] truncate" title={activeInstance?.rootPath}>
              {activeInstance?.name || 'Minecraft Instance'}
            </span>
            <span className="text-[#2a3646]">|</span>
            <span className="font-mono text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-2 py-0.5 rounded text-[11px] font-bold">
              Release {filter.version || activeInstance?.detectedVersion || '1.20.1'}
            </span>
            <span className="text-[#2a3646]">|</span>
            <span className="font-mono text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
              {filter.loader !== 'all'
                ? `${filter.loader} Loader`
                : activeInstance?.detectedLoader
                ? `${activeInstance.detectedLoader} Loader`
                : 'Fabric Loader'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenInstanceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242a33] hover:bg-[#2f353e] text-[#f8fafc] text-xs font-semibold border border-[#2a3646] transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Change Instance</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-[#242a33] hover:bg-[#2f353e] text-[#94a3b8] hover:text-[#f8fafc] border border-[#2a3646] transition-colors"
            title="Refresh Listings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#10b981]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search thousands of mods on Modrinth (Sodium, Iris, JEI, AppleSkin)..."
            value={filter.query}
            onChange={(e) => onFilterChange({ query: e.target.value, offset: 0 })}
            className="w-full bg-[#1a222d] border border-[#2a3646] focus:border-[#10b981] text-[#f8fafc] placeholder-[#64748b] pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-colors"
          />
        </div>

        {/* Loader Filter Dropdown / Badges */}
        <div className="flex items-center gap-1.5 bg-[#1a222d] p-1 rounded-xl border border-[#2a3646] overflow-x-auto max-w-full">
          {loaderOptions.map((opt) => {
            const isActive = filter.loader === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onFilterChange({ loader: opt.id, offset: 0 })}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#10b981] text-[#0b0f14] font-bold shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#242a33]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Version Selector */}
        <div className="flex items-center gap-2">
          <select
            value={filter.version}
            onChange={(e) => {
              const selectedVer = e.target.value;
              const matching = installedVersions.find((v) => v.gameVersion === selectedVer);
              if (matching && matching.loader && matching.loader !== 'all') {
                onFilterChange({ version: selectedVer, loader: matching.loader, offset: 0 });
              } else {
                onFilterChange({ version: selectedVer, offset: 0 });
              }
            }}
            className="bg-[#1a222d] border border-[#2a3646] focus:border-[#10b981] text-[#f8fafc] text-xs font-mono px-3 py-2 rounded-xl outline-none cursor-pointer max-w-[190px] truncate"
          >
            {versionOptions.map((v, idx) => (
              <option key={`${v.value}-${idx}`} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={filter.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value as any, offset: 0 })}
            className="bg-[#1a222d] border border-[#2a3646] focus:border-[#10b981] text-[#f8fafc] text-xs px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            {sortOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = filter.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.id, offset: 0 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-semibold'
                  : 'bg-[#1a222d]/60 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a222d] border border-[#2a3646]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
