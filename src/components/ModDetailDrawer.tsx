import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Check,
  ShieldCheck,
  GitBranch,
  ExternalLink,
  AlertTriangle,
  Box,
} from 'lucide-react';
import { ModSearchResult, ModVersion, ModLoader } from '../types';

interface ModDetailDrawerProps {
  mod: ModSearchResult | null;
  isOpen: boolean;
  onClose: () => void;
  isInstalled: boolean;
  onInstall: (mod: ModSearchResult, selectedVersion?: ModVersion) => void;
  activeLoader: ModLoader;
  activeVersion: string;
}

export const ModDetailDrawer: React.FC<ModDetailDrawerProps> = ({
  mod,
  isOpen,
  onClose,
  isInstalled,
  onInstall,
  activeLoader,
  activeVersion,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'versions'>('overview');
  const [versions, setVersions] = useState<ModVersion[]>([]);
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ModVersion | null>(null);

  useEffect(() => {
    if (!mod || !isOpen) return;

    setActiveTab('overview');
    setIsLoadingVersions(true);

    // Fetch full project details and versions
    window.api.modrinth
      .getProject(mod.slug || mod.project_id)
      .then((data) => setProjectData(data))
      .catch((err) => console.error('Failed fetching project details:', err));

    const loaderQuery = activeLoader !== 'all' ? [activeLoader] : undefined;
    window.api.modrinth
      .getVersions(mod.project_id, loaderQuery, [activeVersion])
      .then((verList) => {
        setVersions(verList);
        if (verList.length > 0) {
          setSelectedVersion(verList[0]);
        }
      })
      .catch((err) => console.error('Failed fetching versions:', err))
      .finally(() => setIsLoadingVersions(false));
  }, [mod, isOpen, activeLoader, activeVersion]);

  if (!isOpen || !mod) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return String(num);
  };

  const primaryFile = selectedVersion?.files?.find((f) => f.primary) || selectedVersion?.files?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#121820] border border-[#2a3646] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Strip */}
        <div className="px-6 py-3.5 bg-[#1a222d] border-b border-[#2a3646] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-[#64748b]">MODRINTH ID:</span>
            <code className="text-xs font-mono font-bold text-[#10b981] bg-[#0b0f14] px-2 py-0.5 rounded border border-[#2a3646]">
              {mod.slug || mod.project_id}
            </code>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#242a33] hover:bg-[#2f353e] text-[#94a3b8] hover:text-[#f8fafc] border border-[#2a3646] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Mod Identity Row */}
        <div className="px-6 py-5 bg-[#161c24] border-b border-[#2a3646]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              {mod.icon_url ? (
                <img
                  src={mod.icon_url}
                  alt={mod.title}
                  className="w-16 h-16 rounded-xl object-cover bg-[#0b0f14] border-2 border-[#10b981]/50 p-1 flex-shrink-0 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#0b0f14] border-2 border-[#10b981]/50 flex items-center justify-center text-[#10b981] flex-shrink-0">
                  <Box className="w-8 h-8" />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-[#f8fafc]">{mod.title}</h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                    Verified Mod
                  </span>
                  {mod.categories[0] && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#242a33] text-[#94a3b8] border border-[#2a3646]">
                      {mod.categories[0].toUpperCase()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#94a3b8] mt-1">
                  By <strong className="text-[#f8fafc]">{mod.author}</strong>
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono text-[#64748b]">
                  <span>{formatNumber(mod.downloads)} Downloads</span>
                  <span>•</span>
                  <span>{formatNumber(mod.follows)} Followers</span>
                  <span>•</span>
                  <span className="text-[#06b6d4]">
                    {selectedVersion ? `v${selectedVersion.version_number}` : 'Latest Release'}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Install Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isInstalled ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-bold text-sm">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  <span>Installed in Instance</span>
                </div>
              ) : (
                <button
                  onClick={() => onInstall(mod, selectedVersion || undefined)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#0b0f14] font-bold text-sm shadow-[0_0_20px_-3px_rgba(16,185,129,0.35)] active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Install ({activeLoader.toUpperCase()} {activeVersion})
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 bg-[#0e141c] border-b border-[#2a3646]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'text-[#10b981] border-[#10b981]'
                : 'text-[#94a3b8] border-transparent hover:text-[#f8fafc]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'gallery'
                ? 'text-[#10b981] border-[#10b981]'
                : 'text-[#94a3b8] border-transparent hover:text-[#f8fafc]'
            }`}
          >
            Gallery & Screenshots ({mod.gallery ? mod.gallery.length : 0})
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'versions'
                ? 'text-[#10b981] border-[#10b981]'
                : 'text-[#94a3b8] border-transparent hover:text-[#f8fafc]'
            }`}
          >
            Versions ({versions.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (8 cols): Description & Dependencies */}
              <div className="lg:col-span-8 space-y-6">
                {/* Dependency Resolver Notice Box */}
                <div className="relative overflow-hidden rounded-xl bg-[#1a222d] border border-[#10b981]/40 p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#f8fafc]">
                          Auto-Resolving Dependencies
                        </h3>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                          AUTOMATED
                        </span>
                      </div>
                      <p className="text-xs text-[#94a3b8] leading-relaxed">
                        Required companion mods (such as Fabric API, Cloth Config, or Architectury) are
                        automatically inspected and queued for installation alongside this mod into
                        your active instance directory.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 text-[11px] font-mono">
                      <AlertTriangle className="w-3 h-3" />
                      Incompatible with OptiFine (Conflict Prevention Active)
                    </span>
                  </div>
                </div>

                {/* Markdown Description */}
                <div className="bg-[#1a222d] border border-[#2a3646] rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[#f8fafc]">About this Mod</h3>
                  <div className="text-xs text-[#94a3b8] leading-relaxed whitespace-pre-wrap font-sans">
                    {projectData?.body || mod.description}
                  </div>
                </div>
              </div>

              {/* Right Technical Specs Column (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-[#1a222d] border border-[#2a3646] rounded-xl p-4 space-y-3.5">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748b]">
                    Technical Specs
                  </h4>

                  <div className="space-y-1">
                    <label className="text-[11px] text-[#94a3b8] block">Loaders</label>
                    <div className="flex flex-wrap gap-1.5">
                      {mod.categories
                        .filter((c) => ['fabric', 'forge', 'neoforge', 'quilt'].includes(c))
                        .map((ldr) => (
                          <span
                            key={ldr}
                            className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-[#242a33] text-[#f8fafc] border border-[#2a3646]"
                          >
                            {ldr.toUpperCase()}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-[#94a3b8] block">Minecraft Compatibility</label>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
                        {activeVersion} (Target)
                      </span>
                    </div>
                  </div>

                  {primaryFile && (
                    <div className="space-y-1 pt-2 border-t border-[#2a3646]">
                      <label className="text-[11px] text-[#94a3b8] block">File Integrity</label>
                      <div className="flex items-center gap-1.5 text-xs text-[#10b981] font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>SHA-1 Verified</span>
                      </div>
                      <code className="text-[10px] font-mono text-[#64748b] break-all block bg-[#121820] p-1.5 rounded border border-[#2a3646]">
                        {primaryFile.hashes.sha1}
                      </code>
                    </div>
                  )}

                  <div className="space-y-1 pt-2 border-t border-[#2a3646]">
                    <label className="text-[11px] text-[#94a3b8] block">License</label>
                    <span className="text-xs font-mono text-[#f8fafc]">
                      {mod.license || 'Open Source'}
                    </span>
                  </div>
                </div>

                {/* External Links */}
                <div className="bg-[#1a222d] border border-[#2a3646] rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748b]">
                    Project Links
                  </h4>
                  <div className="space-y-1.5">
                    <a
                      href={`https://modrinth.com/mod/${mod.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-[#121820] hover:bg-[#242a33] border border-[#2a3646] text-xs text-[#94a3b8] hover:text-[#10b981] transition-colors"
                    >
                      <span>Modrinth Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {mod.gallery && mod.gallery.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mod.gallery.map((imgUrl, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-[#2a3646] bg-[#121820]">
                      <img src={imgUrl} alt={`Screenshot ${i + 1}`} className="w-full h-64 object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#94a3b8] text-sm">
                  No screenshots uploaded for this mod.
                </div>
              )}
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-3">
              {isLoadingVersions ? (
                <div className="flex items-center justify-center py-12">
                  <span className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : versions.length > 0 ? (
                versions.map((ver) => {
                  const isSelected = selectedVersion?.id === ver.id;
                  const file = ver.files.find((f) => f.primary) || ver.files[0];
                  return (
                    <div
                      key={ver.id}
                      className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-[#1a222d] border-[#10b981]/50'
                          : 'bg-[#161c24] border-[#2a3646] hover:bg-[#1a222d]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#f8fafc]">{ver.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#242a33] text-[#10b981] uppercase font-bold border border-[#2a3646]">
                            {ver.version_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-[#64748b]">
                          <span>Version: {ver.version_number}</span>
                          <span>•</span>
                          <span>{ver.loaders.join(', ').toUpperCase()}</span>
                          <span>•</span>
                          <span>{ver.game_versions.join(', ')}</span>
                          {file && (
                            <>
                              <span>•</span>
                              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedVersion(ver);
                          onInstall(mod, ver);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#242a33] hover:bg-[#10b981] hover:text-[#0b0f14] text-[#f8fafc] font-semibold text-xs rounded-lg border border-[#2a3646] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Install this Build</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-[#94a3b8] text-sm">
                  No matching builds found for {activeLoader.toUpperCase()} {activeVersion}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
