import React, { useState } from 'react';
import {
  Package,
  Search,
  Trash2,
  FolderOpen,
  RefreshCw,
  Power,
  HardDrive,
  CheckCircle2,
  FileText,
  CheckSquare,
  Square,
  ArrowUpDown,
} from 'lucide-react';
import { InstalledMod } from '../types';

interface InstalledModsViewProps {
  installedMods: InstalledMod[];
  modsPath: string;
  onToggleMod: (mod: InstalledMod) => void;
  onUninstallMod: (mod: InstalledMod) => void;
  onBatchUninstall: (mods: InstalledMod[]) => void;
  onRefresh: () => void;
  onOpenFolder: () => void;
  isLoading: boolean;
}

export const InstalledModsView: React.FC<InstalledModsViewProps> = ({
  installedMods,
  modsPath,
  onToggleMod,
  onUninstallMod,
  onBatchUninstall,
  onRefresh,
  onOpenFolder,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  // Filter & Search
  const filteredMods = installedMods.filter((mod) => {
    const matchesSearch =
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterEnabled === 'enabled') return matchesSearch && mod.enabled;
    if (filterEnabled === 'disabled') return matchesSearch && !mod.enabled;
    return matchesSearch;
  });

  // Sorting
  filteredMods.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'size') return b.fileSize - a.fileSize;
    if (sortBy === 'date') return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
    return 0;
  });

  const totalSizeMB = (
    installedMods.reduce((acc, m) => acc + m.fileSize, 0) /
    (1024 * 1024)
  ).toFixed(1);

  const toggleSelectAll = () => {
    if (selectedPaths.size === filteredMods.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(filteredMods.map((m) => m.filePath)));
    }
  };

  const toggleSelectItem = (filePath: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  const handleBatchDelete = () => {
    const selectedMods = installedMods.filter((m) => selectedPaths.has(m.filePath));
    if (selectedMods.length > 0) {
      onBatchUninstall(selectedMods);
      setSelectedPaths(new Set());
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto select-none">
      {/* Top Banner and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1a222d] border border-[#2a3646] p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#10b981]" />
            <h2 className="text-xl font-bold text-[#f8fafc]">Installed Mods Manager</h2>
          </div>
          <p className="text-xs font-mono text-[#94a3b8] truncate max-w-lg" title={modsPath}>
            Target: {modsPath}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#121820] border border-[#2a3646] text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-[#f8fafc] font-bold">
                {installedMods.filter((m) => m.enabled).length} Enabled
              </span>
            </div>
            <span className="text-[#2a3646]">|</span>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#06b6d4]" />
              <span className="text-[#f8fafc] font-bold">{totalSizeMB} MB</span>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#242a33] hover:bg-[#2f353e] text-[#94a3b8] hover:text-[#f8fafc] border border-[#2a3646] transition-colors"
            title="Refresh Files & Check Hashes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#10b981]' : ''}`} />
          </button>

          <button
            onClick={onOpenFolder}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#10b981]/15 hover:bg-[#10b981]/25 text-[#10b981] border border-[#10b981]/30 text-xs font-semibold transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Open in Explorer</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Batch Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search installed mods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a222d] border border-[#2a3646] focus:border-[#10b981] text-[#f8fafc] placeholder-[#64748b] pl-9 pr-3 py-1.5 rounded-xl text-xs outline-none"
          />
        </div>

        {/* Middle: Selection Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {filteredMods.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a222d] hover:bg-[#242a33] border border-[#2a3646] text-xs font-semibold text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            >
              {selectedPaths.size === filteredMods.length && filteredMods.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#10b981]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-[#64748b]" />
              )}
              <span>
                {selectedPaths.size === filteredMods.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          )}

          {selectedPaths.size > 0 && (
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] border border-[#ef4444]/40 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedPaths.size})</span>
            </button>
          )}
        </div>

        {/* Right: State Filters & Sorting */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 bg-[#1a222d] p-1 rounded-xl border border-[#2a3646]">
            {(['all', 'enabled', 'disabled'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterEnabled(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-colors ${
                  filterEnabled === filter
                    ? 'bg-[#10b981] text-[#0b0f14] font-bold'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#1a222d] px-2.5 py-1.5 rounded-xl border border-[#2a3646]">
            <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-[#f8fafc] text-xs font-mono outline-none cursor-pointer"
            >
              <option value="name" className="bg-[#1a222d]">Name</option>
              <option value="size" className="bg-[#1a222d]">File Size</option>
              <option value="date" className="bg-[#1a222d]">Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Installed Mods List */}
      {filteredMods.length === 0 ? (
        <div className="bg-[#1a222d] border border-[#2a3646] rounded-2xl p-12 text-center space-y-2">
          <FileText className="w-8 h-8 text-[#64748b] mx-auto" />
          <h3 className="text-sm font-bold text-[#f8fafc]">No installed mods found</h3>
          <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
            Your instance mods folder is currently empty. Visit the Explore tab or Presets to install
            mods with one click.
          </p>
        </div>
      ) : (
        <div className="bg-[#1a222d] border border-[#2a3646] rounded-2xl overflow-hidden divide-y divide-[#2a3646]/60">
          {filteredMods.map((mod) => {
            const isSelected = selectedPaths.has(mod.filePath);
            return (
              <div
                key={mod.filePath}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isSelected ? 'bg-[#222d3d]/90' : 'hover:bg-[#222d3d]/50'
                }`}
              >
                {/* Left Identity with Checkbox & Power Toggle */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleSelectItem(mod.filePath)}
                    className="text-[#64748b] hover:text-[#10b981] flex-shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#10b981]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#64748b]" />
                    )}
                  </button>

                  <button
                    onClick={() => onToggleMod(mod)}
                    className={`p-2 rounded-xl border transition-colors flex-shrink-0 ${
                      mod.enabled
                        ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/25'
                        : 'bg-[#242a33] text-[#64748b] border-[#2a3646] hover:text-[#94a3b8]'
                    }`}
                    title={mod.enabled ? 'Click to Disable' : 'Click to Enable'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-sm truncate ${
                          mod.enabled ? 'text-[#f8fafc]' : 'text-[#64748b] line-through'
                        }`}
                      >
                        {mod.name}
                      </span>
                      {mod.version && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#242a33] text-[#10b981] border border-[#2a3646]">
                          v{mod.version}
                        </span>
                      )}
                      {!mod.enabled && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#242a33] text-[#64748b] border border-[#2a3646]">
                          DISABLED
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-mono text-[#64748b] truncate mt-0.5">
                      {mod.fileName}
                    </p>
                  </div>
                </div>

                {/* Right Metadata and Delete */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs font-mono text-[#94a3b8]">
                    {(mod.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>

                  <button
                    onClick={() => onUninstallMod(mod)}
                    className="p-2 rounded-lg bg-[#242a33] hover:bg-[#ef4444]/20 text-[#94a3b8] hover:text-[#ef4444] border border-[#2a3646] hover:border-[#ef4444]/40 transition-colors"
                    title="Uninstall and Delete JAR"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
