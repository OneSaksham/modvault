import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, FolderCheck, Compass } from 'lucide-react';
import { MinecraftInstance } from '../types';
import { Logo } from './Logo';

interface OnboardingModalProps {
  isOpen: boolean;
  onFinish: () => void;
  instances: MinecraftInstance[];
  activeInstance: MinecraftInstance | null;
  onSelectInstance: (instance: MinecraftInstance) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onFinish,
  instances,
  activeInstance,
  onSelectInstance,
}) => {
  const [step, setStep] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-xl bg-[#121820] border border-[#2a3646] rounded-2xl shadow-2xl p-6 overflow-hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Progress indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a3646]">
          <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider">
            STEP {step} OF 3
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-colors ${
                  s <= step ? 'bg-[#10b981]' : 'bg-[#242a33]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 text-center py-4">
            <div className="flex justify-center mx-auto">
              <Logo size={72} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#f8fafc]">Welcome to ModVault</h2>
              <p className="text-xs text-[#94a3b8] max-w-md mx-auto leading-relaxed">
                ModVault is your centralized client for installing, updating, and managing Minecraft mods
                directly from Modrinth without manual file dragging or version guesswork.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setStep(2)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#0b0f14] font-bold text-xs mx-auto transition-all shadow-sm"
              >
                <span>Detect Installations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Instance Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#f8fafc]">Select Target Game Instance</h3>
              <p className="text-xs text-[#94a3b8]">
                We automatically scanned your system for Legacy Launcher, Official Minecraft, Prism, Modrinth, and third-party launchers.
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {instances.map((inst) => {
                const isSelected = activeInstance?.id === inst.id;
                return (
                  <div
                    key={inst.id}
                    onClick={() => onSelectInstance(inst)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#1a222d] border-[#10b981]'
                        : 'bg-[#161c24] border-[#2a3646] hover:bg-[#1a222d]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[#f8fafc]">{inst.name}</p>
                      <p className="text-[11px] font-mono text-[#64748b] truncate">{inst.rootPath}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#10b981]" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#0b0f14] font-bold text-xs transition-all"
              >
                <span>Confirm Target</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ready to Launch */}
        {step === 3 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center justify-center mx-auto">
              <FolderCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#f8fafc]">Configuration Complete</h3>
              <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
                ModVault is locked to:
              </p>
              <code className="text-xs font-mono text-[#10b981] bg-[#1a222d] px-3 py-1 rounded-lg border border-[#2a3646] inline-block mt-1">
                {activeInstance?.modsPath || '%APPDATA%\\.minecraft\\mods'}
              </code>
            </div>

            <p className="text-xs text-[#64748b]">
              All mod installs and dependency resolutions will automatically sync to this directory.
            </p>

            <div className="pt-2">
              <button
                onClick={onFinish}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#0b0f14] font-bold text-xs mx-auto transition-all shadow-md active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Start Discovering Mods</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

