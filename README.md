# ModVault — The High-Performance Minecraft Mod Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](./LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-06b6d4.svg)](#)
[![Engine: Modrinth v2](https://img.shields.io/badge/API-Modrinth%20v2-8b5cf6.svg)](https://modrinth.com)
[![Architect: Saksham](https://img.shields.io/badge/Architect-Saksham-10b981.svg)](https://github.com/saksham-kumar1621)
[![Version: v1.0.0](https://img.shields.io/badge/Release-v1.0.0-34d399.svg)](https://github.com/saksham-kumar1621/ModVault/releases)

ModVault is a desktop mod management engine and FPS optimization suite for Minecraft. Engineered with zero hardcoded paths, recursive Modrinth v2 API dependency resolution, and mathematical Golden Ratio (`phi = 1.618`) design aesthetics.

---

## Mission & Architectural Vision

Modding Minecraft has historically required manual jar-file copying, diagnosing unreadable JVM Exit Code 1 crashes, and untangling missing secondary dependencies like Fabric API, Cloth Config, and Indium. 

Third-party launchers (such as TL Legacy) use non-standard nested directories (`.tlauncher/legacy/Minecraft/game`), causing generic mod tools to fail silently.

ModVault solves this entirely:
- **Zero-Hardcoding Discovery**: Dynamically queries active Windows `%APPDATA%` structures across all major third-party and official launchers.
- **Recursive Safety Resolver**: Queries Modrinth's official v2 dependency tree to download matching library versions simultaneously.
- **Non-Destructive Toggling**: Temporarily disable mods via `.jar.disabled` without deleting files or losing configurations.
- **Zero Telemetry**: No analytics tracking, token grabbers, or third-party advertising.

---

## Supported Minecraft Launchers

ModVault automatically detects, validates, and hooks into:

| Launcher Name | Primary Discovered Path | Integration Method |
| :--- | :--- | :--- |
| **Legacy Launcher (TL Legacy)** | `%APPDATA%\.tlauncher\legacy\Minecraft\game` | Native Directory Parser |
| **TLauncher (Standard)** | `%APPDATA%\.minecraft` | Version Manifest Scanner |
| **Prism Launcher** | `%APPDATA%\PrismLauncher\instances` | Custom Instance Sandboxing |
| **Modrinth App** | `%APPDATA%\com.modrinth.theseus\profiles` | Profile Index Synchronization |
| **CurseForge Client** | `%USERPROFILE%\curseforge\minecraft\Instances` | Instance Directory Hook |
| **Official Mojang Launcher** | `%APPDATA%\.minecraft` | Fabric & Forge Profile Hook |
| **Custom Folder** | Any custom directory on drives C:, D:, E: | 1-Click Folder Picker |

---

## Core Features

### 1. Recursive Dependency Resolution (Zero Exit Code 1)
When downloading mods like Iris Shaders or Sodium, ModVault queries the Modrinth API v2 dependency tree. It identifies required libraries (e.g., Fabric API, Cloth Config, Indium) and pulls the exact matching loader and game version automatically.

### 2. Curated 1-Click Mod Packs
- **FPS Booster Pack (+338% Framerate Uplift)**:
  - Sodium (Modern GPU vertex shader replacement for archaic OpenGL)
  - Lithium (Physics, chunk ticking, and mob AI math optimizer)
  - FerriteCore (Reduces Minecraft RAM usage by up to 40%)
  - Entity Culling (Asynchronous raytracing to skip hidden mob/chest rendering)
  - ImmediatelyFast (HUD, font, and inventory render batching)
- **Shaders Ready Pack**:
  - Iris Shaders, Sodium, Indium, and Cloth Config pre-tuned for BSL and Complementary.
- **Essential Quality of Life Pack**:
  - AppleSkin (Food saturation HUD), Mod Menu, Continuity (Connected textures), Mouse Tweaks.

### 3. Golden Ratio (phi = 1.618) Aesthetic Design
- Visual layout splits, card ratios, and typography scale follow the Fibonacci sequence.
- Cyber Emerald (`#10b981`), Neon Cyan (`#06b6d4`), and Dark Obsidian (`#070a0e`) theme.
- Electron 34 with secure context isolation, zero remote node integration, and native Windows NSIS packaging.

---

## Built-In Landing Page & SEO Guides

ModVault includes a standalone high-converting landing page and dedicated SEO articles in the `landing/` directory:
- `landing/index.html`: Complete product showcase with live interactive telemetry, launcher switcher, and benchmark cards.
- `landing/tlauncher-mod-installer.html`: Dedicated guide for TLauncher & TL Legacy players with Schema.org `HowTo` structured data.
- `landing/fps-booster-minecraft.html`: Low-end PC optimization article with JVM memory allocation guide and hardware matrix.
- `landing/sitemap.xml` & `landing/robots.txt`: Search-engine indexing configuration.
- `vercel.json`: Pre-configured for 1-click Vercel hosting of the static landing page.

---

## Getting Started

### For Gamers (Windows Installer)
1. Navigate to [GitHub Releases](https://github.com/saksham-kumar1621/ModVault/releases/latest).
2. Download `ModVault Setup 1.0.0.exe`.
3. Run the installer. ModVault will automatically detect your installed launchers and active versions.

### For Developers (Build from Source)

#### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm
- Windows 10 or 11 (64-bit)

#### Installation Steps
```bash
# Clone repository
git clone https://github.com/saksham-kumar1621/ModVault.git
cd ModVault

# Install dependencies
npm install

# Run in Development Mode (Vite + Electron Hot-Reload)
npm run dev

# Compile Production App & Windows Installer (.exe)
npm run build:win
```

Production installers will be generated inside the `release/` directory:
- `ModVault Setup 1.0.0.exe` (NSIS Installer with desktop and start menu shortcuts)

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Desktop Shell** | Electron 34, IPC Handlers, Node.js FS APIs |
| **Frontend UI** | React 19, TypeScript 5.7, Tailwind CSS, Lucide Icons |
| **Bundler & Tooling** | Vite 6, vite-plugin-electron, electron-builder |
| **Remote APIs** | Modrinth v2 REST API (Official Checksums & Direct CDN) |
| **Website Hosting** | Vercel (Configured via `vercel.json` for `landing/` output) |

---

## Project Structure

```
ModVault/
├── .github/
│   └── workflows/
│       └── build.yml               # GitHub Actions CI build pipeline
├── electron/
│   ├── main.ts                     # Main process lifecycle and IPC registry
│   ├── preload.ts                  # Secure contextBridge API definition
│   └── services/
│       ├── launcherDetector.ts     # Multi-path zero-hardcoding scanner
│       ├── modInstaller.ts         # Recursive download & checksum engine
│       ├── modManager.ts           # File inspector & safe .disabled toggler
│       ├── modrinthClient.ts       # Modrinth v2 API client
│       └── settingsManager.ts      # Local persistent configuration
├── landing/                        # Vercel-ready marketing & SEO website
│   ├── index.html                  # Main product landing page
│   ├── tlauncher-mod-installer.html# Dedicated TLauncher SEO landing page
│   ├── fps-booster-minecraft.html  # Dedicated FPS booster SEO landing page
│   ├── logo.svg                    # Vector brand identity
│   ├── logo.png                    # Brand bitmap fallback
│   ├── sitemap.xml                 # Search engine sitemap
│   └── robots.txt                  # Web crawler rules
├── public/                         # App static icons and public assets
├── src/                            # React application source
│   ├── components/                 # UI components (Header, ModCard, Presets, etc.)
│   ├── services/                   # Fallback and client-side helpers
│   ├── types/                      # TypeScript domain types
│   ├── App.tsx                     # Main application layout
│   └── main.tsx                    # React DOM entry
├── build-setup.bat                 # 1-click Windows installer build script
├── open-landing-page.bat           # 1-click landing page preview script
├── start-dev.bat                   # 1-click development mode script
├── package.json                    # Project configuration and build scripts
├── vercel.json                     # Vercel hosting rules for landing page
└── LICENSE                         # MIT License
```

---

## Vercel Deployment

To host the landing page on Vercel without exposing or building the desktop app:
1. Connect your repository to [Vercel](https://vercel.com).
2. Vercel automatically detects `vercel.json` with `"outputDirectory": "landing"`.
3. Your landing page and SEO guides will be live instantly with clean URLs (`/tlauncher-mod-installer`, `/fps-booster-minecraft`).

---

## Creator & Maintainer

Engineered and maintained by **Saksham**:
- **GitHub**: [@saksham-kumar1621](https://github.com/saksham-kumar1621)
- **Instagram**: [@one._saksham._](https://www.instagram.com/one._saksham._/)

---

## License

This project is licensed under the [MIT License](./LICENSE) — Copyright (c) 2026 Saksham.

---

### Disclaimer
ModVault is an independent open-source tool. Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. Modrinth is a registered trademark of Rinth, Inc.

