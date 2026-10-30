import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  showText = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 512 512"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <defs>
            <radialGradient id="mv-bgGlow" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="45%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0b0f14" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="mv-topFaceGrad" x1="256" y1="80" x2="256" y2="240" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="mv-leftFaceGrad" x1="120" y1="160" x2="256" y2="380" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f2922" />
              <stop offset="35%" stopColor="#064e3b" />
              <stop offset="85%" stopColor="#091b17" />
              <stop offset="100%" stopColor="#051310" />
            </linearGradient>

            <linearGradient id="mv-rightFaceGrad" x1="392" y1="160" x2="256" y2="380" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="30%" stopColor="#083344" />
              <stop offset="75%" stopColor="#08202b" />
              <stop offset="100%" stopColor="#041117" />
            </linearGradient>

            <linearGradient id="mv-shieldGrad" x1="256" y1="40" x2="256" y2="470" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#070c12" />
            </linearGradient>

            <linearGradient id="mv-borderGrad" x1="100" y1="50" x2="412" y2="460" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="30%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <radialGradient id="mv-keyholeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="40%" stopColor="#34d399" />
              <stop offset="80%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="256" cy="245" r="210" fill="url(#mv-bgGlow)" />

          {/* Outer Tech Shield Crest */}
          <polygon
            points="256,42 416,112 416,330 256,462 96,330 96,112"
            fill="url(#mv-shieldGrad)"
            stroke="url(#mv-borderGrad)"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Inner Armor Inset Lines */}
          <polygon
            points="256,64 396,126 396,316 256,436 116,316 116,126"
            fill="#0b1118"
            stroke="#1e2d3d"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Minecraft Pixel Grid Geometric Guide Accents */}
          <path
            d="M120 180 L160 160 M392 180 L352 160 M256 70 L256 100 M256 405 L256 430"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Corner Tech Brackets */}
          <path d="M136 142 L136 130 L156 120" stroke="#10b981" strokeWidth="3" fill="none" opacity="0.8" />
          <path d="M376 142 L376 130 L356 120" stroke="#10b981" strokeWidth="3" fill="none" opacity="0.8" />
          <path d="M136 295 L136 308 L156 318" stroke="#06b6d4" strokeWidth="3" fill="none" opacity="0.8" />
          <path d="M376 295 L376 308 L356 318" stroke="#06b6d4" strokeWidth="3" fill="none" opacity="0.8" />

          {/* Top Isometric Rhombus Face */}
          <polygon
            points="256,104 366,168 256,232 146,168"
            fill="url(#mv-topFaceGrad)"
            stroke="#6ee7b7"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Top Face Pixelated Facet Geometry */}
          <polygon points="256,104 311,136 256,168 201,136" fill="#6ee7b7" opacity="0.5" />
          <polygon points="256,168 311,136 366,168 311,200" fill="#059669" opacity="0.4" />
          <polygon points="146,168 201,136 256,168 201,200" fill="#34d399" opacity="0.6" />
          <polygon points="201,200 256,168 311,200 256,232" fill="#047857" opacity="0.7" />

          {/* Left Isometric Side Face */}
          <polygon
            points="146,168 256,232 256,368 146,304"
            fill="url(#mv-leftFaceGrad)"
            stroke="#059669"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Left Face Faceted Overlay */}
          <polygon points="146,168 201,200 201,268 146,236" fill="#047857" opacity="0.45" />
          <polygon points="201,200 256,232 256,300 201,268" fill="#10b981" opacity="0.2" />
          <polygon points="146,236 201,268 201,336 146,304" fill="#022c22" opacity="0.6" />
          <polygon points="201,268 256,300 256,368 201,336" fill="#064e3b" opacity="0.4" />

          {/* Right Isometric Side Face */}
          <polygon
            points="256,232 366,168 366,304 256,368"
            fill="url(#mv-rightFaceGrad)"
            stroke="#0891b2"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Right Face Faceted Overlay */}
          <polygon points="256,232 311,200 311,268 256,300" fill="#0e7490" opacity="0.3" />
          <polygon points="311,200 366,168 366,236 311,268" fill="#083344" opacity="0.5" />
          <polygon points="256,300 311,268 311,336 256,368" fill="#155e75" opacity="0.25" />
          <polygon points="311,268 366,236 366,304 311,336" fill="#04202c" opacity="0.7" />

          {/* Central Vault Emblem & Cyber Lock */}
          <path
            d="M228 205 C228 188 284 188 284 205 L284 235 L228 235 Z"
            fill="#0f172a"
            stroke="#34d399"
            strokeWidth="4.5"
          />
          <circle cx="256" cy="210" r="12" fill="#064e3b" stroke="#6ee7b7" strokeWidth="2" />

          {/* Vault Padlock Body */}
          <polygon
            points="214,232 298,232 310,296 256,326 202,296"
            fill="#090d14"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Inner Keyhole Inset */}
          <circle cx="256" cy="262" r="14" fill="url(#mv-keyholeGlow)" stroke="#a7f3d0" strokeWidth="2" />
          <polygon points="250,266 262,266 266,286 246,286" fill="url(#mv-keyholeGlow)" />

          {/* Cyber Circuit Nodes */}
          <path d="M256 296 L256 316" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M224 254 L208 254 L204 266" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M288 254 L304 254 L308 266" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Glowing Laser Edge Highlight Lines */}
          <line x1="256" y1="104" x2="256" y2="232" stroke="#a7f3d0" strokeWidth="2.5" opacity="0.8" />
          <line x1="146" y1="168" x2="256" y2="232" stroke="#6ee7b7" strokeWidth="2" opacity="0.6" />
          <line x1="366" y1="168" x2="256" y2="232" stroke="#67e8f9" strokeWidth="2" opacity="0.6" />

          {/* Particles */}
          <polygon points="172,118 175,126 183,129 175,132 172,140 169,132 161,129 169,126" fill="#a7f3d0" />
          <polygon points="348,270 350,276 356,278 350,280 348,286 346,280 340,278 346,276" fill="#67e8f9" />
          <circle cx="256" cy="72" r="3" fill="#34d399" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-[#f8fafc] font-sans">
              ModVault
            </span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 tracking-wider">
              CLIENT
            </span>
          </div>
          <span className="text-[10px] text-[#64748b] font-mono">
            Minecraft Mod Engine
          </span>
        </div>
      )}
    </div>
  );
};
