import React from 'react';
import { Zap, ShieldCheck, Download, CheckCircle } from 'lucide-react';
import { PresetBundle, ModLoader } from '../types';

interface QuickPresetsProps {
  activeLoader: ModLoader;
  activeVersion: string;
  onInstallBundle: (bundle: PresetBundle) => void;
  installingBundleId: string | null;
  installedBundleIds: Set<string>;
}

export const QuickPresets: React.FC<QuickPresetsProps> = ({
  activeLoader,
  activeVersion,
  onInstallBundle,
  installingBundleId,
  installedBundleIds,
}) => {
  const bundles: PresetBundle[] = [
    {
      id: 'fps-booster',
      title: 'FPS Booster Pack',
      subtitle: 'Maximum performance & frame rate stabilization',
      description:
        'A battle-tested suite of performance mods replacing the vanilla rendering engine. Up to 3x-4x frame rates and stutter-free chunk loading.',
      targetLoader: 'fabric',
      modSlugs: ['sodium', 'lithium', 'ferrite-core', 'entityculling'],
      modNames: ['Sodium', 'Lithium', 'FerriteCore', 'Entity Culling'],
      badge: 'RECOMMENDED',
    },
    {
      id: 'shaders-ready',
      title: 'Shaders Ready Pack',
      subtitle: 'Next-gen graphics with complete OptiFine shader support',
      description:
        'Enables full shaderpack support via Iris alongside Sodium. Run Complementary, BSL, and AstraLex shaders with high FPS.',
      targetLoader: 'fabric',
      modSlugs: ['sodium', 'iris'],
      modNames: ['Sodium', 'Iris Shaders'],
      badge: 'GRAPHICS',
    },
    {
      id: 'essential-qol',
      title: 'Essential Quality of Life',
      subtitle: 'Handy UI improvements and inventory enhancements',
      description:
        'Indispensable utilities that make survival gameplay cleaner: food hunger previews, in-game mod settings, and fast item dragging.',
      targetLoader: 'fabric',
      modSlugs: ['appleskin', 'modmenu', 'mouse-tweaks'],
      modNames: ['AppleSkin', 'Mod Menu', 'Mouse Tweaks'],
      badge: 'UTILITY',
    },
    {
      id: 'pvp-essentials',
      title: 'PvP & Combat Suite',
      subtitle: 'Minimal HUD enhancements and responsive mechanics',
      description:
        'Streamlined tools for competitive multiplayer: key stroke HUDs, clean crosshairs, custom armor durability indicators, and fullbright toggling.',
      targetLoader: 'fabric',
      modSlugs: ['appleskin', 'modmenu'],
      modNames: ['AppleSkin', 'Mod Menu', 'Status HUD'],
      badge: 'COMBAT',
    },
    {
      id: 'vanilla-plus',
      title: 'Lightweight Vanilla+',
      subtitle: 'Gentle performance & ambient improvements',
      description:
        'Keeps Minecraft 100% faithful to the original game while smoothing out lighting glitches, optimizing RAM consumption, and cleaning UI.',
      targetLoader: 'fabric',
      modSlugs: ['lithium', 'ferrite-core'],
      modNames: ['Lithium', 'FerriteCore'],
      badge: 'LIGHTWEIGHT',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#10b981]" />
          <h2 className="text-xl font-bold text-[#f8fafc]">Pre-Configured Mod Bundles</h2>
        </div>
        <p className="text-sm text-[#94a3b8]">
          Curated packages tested for zero conflicts, high performance, and seamless compatibility
          with {activeLoader.toUpperCase()} {activeVersion}.
        </p>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bundles.map((bundle) => {
          const isInstalling = installingBundleId === bundle.id;
          const isInstalled = installedBundleIds.has(bundle.id);

          return (
            <div
              key={bundle.id}
              className="bg-[#1a222d] border border-[#2a3646] hover:border-[#3b4d63] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                    {bundle.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>{bundle.modNames.length} Mods</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#f8fafc]">{bundle.title}</h3>
                  <p className="text-xs text-[#10b981] font-medium mt-0.5">{bundle.subtitle}</p>
                </div>

                <p className="text-xs text-[#94a3b8] leading-relaxed">{bundle.description}</p>

                {/* Included Mods Pills */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono text-[#64748b] block mb-1.5">
                    Included Components:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bundle.modNames.map((name) => (
                      <span
                        key={name}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#242a33] text-[#f8fafc] border border-[#2a3646]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Install CTA */}
              <div className="pt-3 border-t border-[#2a3646] flex items-center justify-between">
                <span className="text-xs font-mono text-[#64748b]">
                  Target: {activeLoader.toUpperCase()} {activeVersion}
                </span>

                <button
                  onClick={() => onInstallBundle(bundle)}
                  disabled={isInstalling || isInstalled}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isInstalled
                      ? 'bg-[#1a222d] text-[#10b981] border border-[#10b981]/40 cursor-default'
                      : isInstalling
                      ? 'bg-[#10b981]/60 text-[#0b0f14] cursor-wait'
                      : 'bg-[#10b981] hover:bg-[#059669] text-[#0b0f14] shadow-[0_0_15px_-3px_rgba(16,185,129,0.35)] active:scale-95'
                  }`}
                >
                  {isInstalled ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#10b981]" />
                      <span>Bundle Installed</span>
                    </>
                  ) : isInstalling ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#0b0f14] border-t-transparent rounded-full animate-spin" />
                      <span>Installing ({bundle.modNames.length} Mods)...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Install Bundle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
