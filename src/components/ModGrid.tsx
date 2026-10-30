import React from 'react';
import { ModSearchResult, DownloadItem } from '../types';
import { ModCard } from './ModCard';
import { SearchX, ChevronDown } from 'lucide-react';

interface ModGridProps {
  mods: ModSearchResult[];
  installedModSlugs: Set<string>;
  downloadItems: Map<string, DownloadItem>;
  isLoading: boolean;
  onInstallMod: (mod: ModSearchResult) => void;
  onUninstallMod: (mod: ModSearchResult) => void;
  onSelectMod: (mod: ModSearchResult) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  onResetFilter: () => void;
}

export const ModGrid: React.FC<ModGridProps> = ({
  mods,
  installedModSlugs,
  downloadItems,
  isLoading,
  onInstallMod,
  onUninstallMod,
  onSelectMod,
  onLoadMore,
  hasMore,
  onResetFilter,
}) => {
  if (isLoading && mods.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div
            key={idx}
            className="h-44 rounded-2xl bg-[#1a222d] border border-[#2a3646] p-4 flex flex-col justify-between animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-xl bg-[#242a33]" />
              <div className="space-y-2 flex-1">
                <div className="w-3/4 h-4 rounded bg-[#242a33]" />
                <div className="w-1/2 h-3 rounded bg-[#242a33]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded bg-[#242a33]" />
              <div className="w-2/3 h-3 rounded bg-[#242a33]" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="w-12 h-3 rounded bg-[#242a33]" />
              <div className="w-20 h-7 rounded bg-[#242a33]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mods.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[#1a222d] border border-[#2a3646] rounded-2xl my-6">
        <div className="w-12 h-12 rounded-xl bg-[#242a33] flex items-center justify-center text-[#64748b] mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#f8fafc]">No matching mods found</h3>
        <p className="text-sm text-[#94a3b8] max-w-sm mt-1">
          Try adjusting your search query, or change the selected Minecraft version or mod loader.
        </p>
        <button
          onClick={onResetFilter}
          className="mt-4 px-4 py-2 bg-[#242a33] hover:bg-[#2f353e] text-[#f8fafc] text-xs font-semibold rounded-lg border border-[#2a3646] transition-colors"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mods.map((mod) => {
          const isInstalled =
            installedModSlugs.has(mod.slug.toLowerCase()) ||
            installedModSlugs.has(mod.project_id.toLowerCase()) ||
            installedModSlugs.has(mod.title.toLowerCase());

          const progress = downloadItems.get(mod.project_id) || downloadItems.get(mod.slug);

          return (
            <ModCard
              key={mod.project_id}
              mod={mod}
              isInstalled={isInstalled}
              downloadProgress={progress}
              onInstall={onInstallMod}
              onUninstall={onUninstallMod}
              onSelect={onSelectMod}
            />
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2 pb-6">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a222d] hover:bg-[#242a33] border border-[#2a3646] hover:border-[#3b4d63] text-[#f8fafc] text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#10b981]" />
            )}
            <span>Load More Mods</span>
          </button>
        </div>
      )}
    </div>
  );
};

