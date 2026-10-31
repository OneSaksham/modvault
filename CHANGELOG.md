# Changelog

All notable changes to the ModVault desktop engine and ecosystem will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-30

### Initial Production Release

#### Added
- **Universal Launcher Auto-Detection**: Zero-hardcoding filesystem scanner detecting:
  - TL Legacy (`%APPDATA%\.tlauncher\legacy\Minecraft\game`)
  - Standard TLauncher (`%APPDATA%\.minecraft`)
  - Prism Launcher (`%APPDATA%\PrismLauncher\instances`)
  - Modrinth App (`%APPDATA%\com.modrinth.theseus\profiles`)
  - CurseForge Client (`%USERPROFILE%\curseforge\minecraft\Instances`)
  - Official Mojang Vanilla Launcher (`%APPDATA%\.minecraft`)
  - Custom user directory selection across any local drive.
- **Recursive Dependency Resolver**: Modrinth v2 API integration automatically traversing dependency graphs to download required secondary libraries (Fabric API, Cloth Config, Indium) in the matching loader and game version build.
- **Curated 1-Click Packs**:
  - *Low-End PC FPS Booster*: Sodium, Lithium, FerriteCore, Entity Culling, ImmediatelyFast.
  - *Shaders Ready Pack*: Iris Shaders, Sodium, Indium, Cloth Config pre-tuned for BSL and Complementary.
  - *Essential QoL Pack*: AppleSkin, Mod Menu, Continuity, Mouse Tweaks.
- **Safe Sandboxing**: Non-destructive mod management via clean `.jar.disabled` toggle states without file deletion.
- **Electron 34 Desktop Shell**: Strict context isolation (`contextIsolation: true`), zero remote Node integration in renderer, and native Windows NSIS x64 packaging.
- **Production Marketing & SEO Landing Suite**:
  - Live landing page with Golden Ratio (phi = 1.618) design system.
  - Dedicated TLauncher Optimization Guide (`/tlauncher-mod-installer`).
  - Dedicated FPS Booster Guide (`/fps-booster-minecraft`).
  - Real-time GitHub Release API download counter and Vercel Analytics event tracking.
- **Security Verification**: Independent audit pass on ScanRepo with Low Risk verdict (14/100, zero malware, zero credential stealers).

#### Binary Metadata
- **File**: `ModVault-Setup-1.0.0.exe`
- **Size**: 92,676,413 bytes (92.67 MB)
- **SHA-256**: `C15D74FEEF1077F2B1760616898A4D528C99839F04E1C456FC7F2D80375C8142`
- **Target OS**: Windows 10 & Windows 11 (64-bit / x64)
