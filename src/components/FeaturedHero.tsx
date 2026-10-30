import React from 'react';
import { Gauge, CheckCircle, Download, ShieldCheck } from 'lucide-react';
import { ModLoader } from '../types';

interface FeaturedHeroProps {
  onInstallBundle: () => void;
  isInstalling: boolean;
  isInstalled: boolean;
  activeLoader: ModLoader;
  activeVersion: string;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({
  onInstallBundle,
  isInstalling,
  isInstalled,
  activeLoader,
  activeVersion,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a222d] via-[#161f2b] to-[#121820] border border-[#10b981]/40 p-6 shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)] select-none">
      {/* Background glow orb */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
              FEATURED PERFORMANCE BUNDLE
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-[#94a3b8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
              Auto-Validated for {activeLoader.toUpperCase()} {activeVersion}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#f8fafc]">
            LOW-END PC FPS BOOSTER PACK
          </h2>

          <p className="text-sm text-[#94a3b8] leading-relaxed">
            Improve Minecraft performance with a carefully selected collection of optimization mods.
            Engineered to boost frame rates by up to 300% on budget and mid-range PCs.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[#64748b]">Includes:</span>
            {['Sodium / Embeddium', 'Lithium', 'FerriteCore', 'Entity Culling'].map((mod) => (
              <span
                key={mod}
                className="px-2 py-0.5 rounded-md bg-[#242a33] text-[#f8fafc] text-xs font-mono border border-[#2a3646]"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-[#10b981]">
            <Gauge className="w-4 h-4 text-[#10b981]" />
            <span>Estimated Gain: +150% to +350% FPS</span>
          </div>

          <button
            onClick={onInstallBundle}
            disabled={isInstalling || isInstalled}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] ${
              isInstalled
                ? 'bg-[#1a222d] text-[#10b981] border border-[#10b981]/50 cursor-default'
                : isInstalling
                ? 'bg-[#10b981]/70 text-[#0b0f14] cursor-wait'
                : 'bg-[#10b981] hover:bg-[#059669] text-[#0b0f14] shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)]'
            }`}
          >
            {isInstalled ? (
              <>
                <CheckCircle className="w-4 h-4 text-[#10b981]" />
                <span>Bundle Installed</span>
              </>
            ) : isInstalling ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0b0f14] border-t-transparent rounded-full animate-spin" />
                <span>Installing Bundle...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Install Bundle (4 Mods)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

