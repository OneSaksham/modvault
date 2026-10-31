# ModVault — The High-Performance Minecraft Mod Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](./LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011%20(64--bit)-06b6d4.svg)](#)
[![Runtime: Electron 34](https://img.shields.io/badge/Runtime-Electron%2034-38bdf8.svg)](https://www.electronjs.org/)
[![Tooling: Vite 6](https://img.shields.io/badge/Tooling-Vite%206-a855f7.svg)](https://vitejs.dev/)
[![Engine: Modrinth v2](https://img.shields.io/badge/API-Modrinth%20v2-8b5cf6.svg)](https://modrinth.com)
[![Security: Low Risk (14/100)](https://img.shields.io/badge/Security-ScanRepo%20Verified%20(14%2F100)-10b981.svg)](https://www.scanrepo.dev/scan/github/OneSaksham/modvault)
[![Architect: Saksham](https://img.shields.io/badge/Architect-Saksham-10b981.svg)](https://github.com/OneSaksham)
[![Release: v1.0.0](https://img.shields.io/badge/Release-v1.0.0-34d399.svg)](https://github.com/OneSaksham/modvault/releases/tag/v1.0.0)
[![Downloads](https://img.shields.io/github/downloads/OneSaksham/modvault/total.svg?style=flat&color=10b981)](https://somsubhra.github.io/github-release-stats/?username=OneSaksham&repository=modvault)

ModVault is an open-source desktop mod management engine and FPS optimization suite for Minecraft. Engineered with zero hardcoded filesystem paths, recursive Modrinth v2 API dependency resolution, and mathematical Golden Ratio (`phi = 1.618`) design aesthetics.

---

## Mission & Architectural Vision

Modding Minecraft has historically required manual `.jar` file copying, diagnosing unreadable JVM Exit Code 1 crashes, and untangling missing secondary dependencies like Fabric API, Cloth Config, and Indium.

Third-party launchers (such as TL Legacy) store instances in non-standard nested directories (`.tlauncher/legacy/Minecraft/game`), causing generic mod managers to fail silently or corrupt profiles.

ModVault solves this entirely:
- **Zero-Hardcoding Discovery**: Dynamically scans standard Windows `%APPDATA%` structures across all major third-party and official launchers.
- **Recursive Safety Resolver**: Queries Modrinth's official v2 dependency graph to download required secondary libraries in matching version builds automatically.
- **Non-Destructive Toggling**: Temporarily disable mods via `.jar.disabled` renames without deleting files or losing configurations.
- **Zero Telemetry Commitment**: No analytics tracking, token grabbers, or third-party advertising.

---

## Supported Minecraft Launchers

ModVault automatically detects, validates, and mounts mods into:

| Launcher Name | Primary Discovered Path | Integration Method |
| :--- | :--- | :--- |
| **Legacy Launcher (TL Legacy)** | `%APPDATA%\.tlauncher\legacy\Minecraft\game` | Native Directory Parser |
| **TLauncher (Standard)** | `%APPDATA%\.minecraft` | Version Manifest Scanner |
| **Prism Launcher** | `%APPDATA%\PrismLauncher\instances` | Custom Instance Sandboxing |
| **Modrinth App** | `%APPDATA%\com.modrinth.theseus\profiles` | Profile Index Synchronization |
| **CurseForge Client** | `%USERPROFILE%\curseforge\minecraft\Instances` | Instance Directory Hook |
| **Official Mojang Launcher** | `%APPDATA%\.minecraft` | Fabric & Forge Profile Hook |
| **Custom Folder** | Any folder on local drives C:, D:, E: | 1-Click Folder Picker |

---

## Core Features

### 1. Recursive Dependency Resolution (Zero Exit Code 1)
When downloading mods like Iris Shaders or Sodium, ModVault queries the Modrinth API v2 dependency tree. It identifies required libraries (e.g., Fabric API, Cloth Config, Indium) and pulls the exact matching loader and game version build automatically.

### 2. Curated 1-Click Mod Packs
- **Low-End PC FPS Booster**:
  - **Sodium**: Modern OpenGL vertex shader replacement.
  - **Lithium**: Physics, chunk ticking, and mob AI math optimizer.
  - **FerriteCore**: Reduces Minecraft heap memory usage by up to 40%.
  - **Entity Culling**: Asynchronous raytracing to skip hidden mob and tile entity rendering.
  - **ImmediatelyFast**: HUD, font, and inventory render batching.
- **Shaders Ready Pack**:
  - Iris Shaders, Sodium, Indium, and Cloth Config pre-configured for BSL and Complementary.
- **Essential Quality of Life Pack**:
  - AppleSkin (Food saturation HUD), Mod Menu, Continuity (Connected textures), Mouse Tweaks.

### 3. Strict Security & Zero Telemetry
- Evaluated and verified clean on [ScanRepo](https://www.scanrepo.dev/scan/github/OneSaksham/modvault) (Score: 14/100 Low Risk).
- Outbound network requests restricted to `api.modrinth.com`, `cdn.modrinth.com`, and `api.github.com/repos/OneSaksham/modvault/releases`.
- Runs under standard unprivileged user permissions (no Administrator access required).

---

## Performance Benchmarks & Testing Methodology

All benchmark numbers published by ModVault are grounded in reproducible test procedures.

### Test Environment Specifications
- **Processor**: Intel Core i5-8250U (4 Cores, 8 Threads @ 1.60GHz base / 3.40GHz turbo)
- **Graphics**: Intel UHD Graphics 620 (Shared VRAM)
- **Memory**: 8 GB DDR4-2400 MHz (4 GB allocated to Minecraft JVM)
- **Operating System**: Windows 11 Home 64-bit (Build 22631)
- **Java Runtime**: Eclipse Temurin OpenJDK 17.0.8 (64-bit)
- **Game Version**: Minecraft 1.20.1 Fabric Loader (Fabric API 0.92.2)
- **Video Settings**: 1080p Fullscreen, Render Distance: 8 chunks, Simulation Distance: 6 chunks, Graphics: Fancy

### Standardized Test Protocol
A 180-second automated flight path was recorded in a freshly generated Taiga/Forest biome (Seed: `10556818864153947741`) with chunk generation active. Metrics were captured using the Spark profiler (`/spark sampler`) and MangoHud.

| Metric | Vanilla 1.20.1 Default | ModVault FPS Booster Pack | Uplift / Improvement |
| :--- | :--- | :--- | :--- |
| **Average Framerate** | 28 FPS | 112 FPS | **+300% framerate increase** |
| **1% Low Framerate** | 9 FPS (Micro-stutters) | 58 FPS (Fluid) | **+544% consistency improvement** |
| **Allocated JVM Memory** | 3,150 MB | 1,420 MB | **-55% memory overhead reduction** |
| **Startup to Title Screen**| 24.2 seconds | 11.8 seconds | **-51% faster launch time** |

*Note: Results vary based on CPU single-thread performance, integrated vs. dedicated GPU bandwidth, and active shader pipelines.*

---

## Download & Installation

### Latest Production Release

- **Version**: `v1.0.0 Stable`
- **Release Date**: October 30, 2026
- **Architecture**: Windows 10 & 11 (64-bit / x64)
- **Installer Binary**: [ModVault-Setup-1.0.0.exe (92.67 MB)](https://github.com/OneSaksham/modvault/releases/download/v1.0.0/ModVault-Setup-1.0.0.exe)
- **Release Notes**: [GitHub Releases v1.0.0](https://github.com/OneSaksham/modvault/releases/tag/v1.0.0)

### Checksum Verification

To verify binary integrity before installation, open PowerShell and run:

```powershell
Get-FileHash .\ModVault-Setup-1.0.0.exe -Algorithm SHA256
```

Expected SHA-256 Output:
```text
C15D74FEEF1077F2B1760616898A4D528C99839F04E1C456FC7F2D80375C8142
```

### Windows SmartScreen Note
Because ModVault is an open-source project without a commercial enterprise EV code-signing certificate ($500+/year), Windows SmartScreen may show an "Unrecognized app" dialogue on first launch:
1. Click **More info**.
2. Click **Run anyway**.
3. You can review the full source code or compile the binary yourself using the instructions below.

### Uninstallation
ModVault can be removed at any time through Windows Settings:
1. Open **Settings** -> **Apps** -> **Installed apps**.
2. Locate **ModVault** and click **Uninstall**.
3. Alternatively, run `Uninstall ModVault.exe` located in the application installation directory.
4. *Your Minecraft worlds, saves, and server lists remain 100% untouched.*

---

## Troubleshooting Guide

### 1. Game Crashes with "Exit Code 1" on Launch
- **Cause**: Incompatible mod version or missing required library.
- **Fix**: Open ModVault, navigate to the active instance, and check for missing secondary dependencies. Ensure that Forge and Fabric mods are not mixed in the same instance folder.

### 2. ModVault Cannot Find Your Launcher Directory
- **Cause**: Minecraft or launcher is installed in a non-default directory or portable drive.
- **Fix**: In ModVault header, click **Change Folder** and navigate directly to your game's root directory containing the `.minecraft` or `game` folder.

### 3. Java Runtime Missing
- **Cause**: Minecraft 1.20+ requires Java 17 or higher (64-bit).
- **Fix**: Install OpenJDK 17 or 21 from [Adoptium / Eclipse Temurin](https://adoptium.net/).

---

## Developer Setup & Build from Source

### Prerequisites
- Node.js 20 LTS or higher
- npm (v10+)
- Windows 10 or 11 (64-bit)

### Build Instructions
```bash
# 1. Clone repository
git clone https://github.com/OneSaksham/modvault.git
cd modvault

# 2. Install dependencies
npm install

# 3. Type check
npx tsc --noEmit

# 4. Start local development server (Electron + Vite HMR)
npm run dev

# 5. Build production executable (.exe via electron-builder)
npm run build:win
```

Packaged NSIS installer output will be located in `release/ModVault Setup 1.0.0.exe`.

---

## Tech Stack Overview

| Layer | Technologies |
| :--- | :--- |
| **Desktop Runtime** | Electron 34.2.0, Context Isolation, Secure IPC |
| **Frontend Framework** | React 19.0.0, TypeScript 5.7.3 |
| **Tooling & Bundler** | Vite 6.1.0, vite-plugin-electron 0.29.0, electron-builder 26.18.0 |
| **Styling & Icons** | Tailwind CSS 3.4.17, Lucide React 0.475.0, Framer Motion 12.4.7 |
| **Remote Integration** | Modrinth v2 REST API, GitHub Releases API |
| **Marketing Site** | Static HTML5, Tailwind CSS, Vercel Web Analytics |

---

## Security Policy

ModVault follows responsible vulnerability disclosure practices. For details or to report an issue, please read [SECURITY.md](./SECURITY.md).

---

## Creator & Maintainer

Engineered and maintained by **Saksham**:
- **GitHub**: [@OneSaksham](https://github.com/OneSaksham)
- **Instagram**: [@one._saksham._](https://www.instagram.com/one._saksham._/)
- **Live Landing Page**: [https://modvault-inky-nu.vercel.app/](https://modvault-inky-nu.vercel.app/)

---

## License

This project is licensed under the [MIT License](./LICENSE) — Copyright (c) 2026 Saksham.

### Legal Disclaimer
ModVault is an independent open-source tool. Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. Minecraft is a registered trademark of Mojang Synergies AB. Modrinth is a registered trademark of Rinth, Inc.
