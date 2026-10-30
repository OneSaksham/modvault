import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { MinecraftInstance, ModLoader, LauncherType } from '../../src/types';

interface VersionJson {
  id?: string;
  jar?: string;
  inheritsFrom?: string;
  mainClass?: string;
  assets?: string;
  complianceLevel?: number;
  libraries?: Array<{
    name?: string;
    url?: string;
  }>;
}

interface LauncherProfilesJson {
  profiles?: Record<
    string,
    {
      name?: string;
      lastVersionId?: string;
      gameDir?: string;
      icon?: string;
      type?: string;
    }
  >;
}

export class LauncherDetector {
  private appDataPath: string;
  private localAppDataPath: string;
  private userHome: string;

  constructor() {
    this.appDataPath = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    this.localAppDataPath = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    this.userHome = os.homedir();
  }

  /**
   * Scans the system dynamically for all installed Minecraft launchers, instances,
   * active running game processes, and profiles without any hardcoding.
   */
  public detectAllInstances(): MinecraftInstance[] {
    const instanceMap = new Map<string, MinecraftInstance>();

    const registerInstance = (inst: MinecraftInstance | null) => {
      if (!inst) return;
      const normalized = path.resolve(inst.rootPath).toLowerCase();
      if (!instanceMap.has(normalized)) {
        instanceMap.set(normalized, inst);
      } else {
        // Merge available versions if an existing entry had fewer
        const existing = instanceMap.get(normalized)!;
        if (inst.availableVersions.length > existing.availableVersions.length) {
          existing.availableVersions = inst.availableVersions;
        }
        if (inst.modsCount !== undefined && inst.modsCount > (existing.modsCount || 0)) {
          existing.modsCount = inst.modsCount;
        }
        if (inst.isRunning) {
          existing.isRunning = true;
          existing.name = `${existing.name} (Running)`;
        }
      }
    };

    // 1. Dynamic Running Process Detection (Detect active Minecraft / Java instance)
    try {
      const runningDir = this.detectRunningGameDirectory();
      if (runningDir && fs.existsSync(runningDir)) {
        const liveInst = this.analyzeMinecraftDir(runningDir, 'Active Minecraft Game (Live)', 'custom');
        if (liveInst) {
          liveInst.isRunning = true;
          registerInstance(liveInst);
        }
      }
    } catch (err) {
      // Process detection optional; silent ignore
    }

    // 2. Legacy Launcher (TL Legacy / Legacy Launcher)
    // Priority check: .tlauncher/legacy/Minecraft/tl.properties
    const legacyPropertiesPath = path.join(this.appDataPath, '.tlauncher', 'legacy', 'Minecraft', 'tl.properties');
    if (fs.existsSync(legacyPropertiesPath)) {
      try {
        const props = this.parsePropertiesFile(legacyPropertiesPath);
        const gameDir = props['minecraft.gamedir'];
        const activeVer = props['login.version'];
        if (gameDir && fs.existsSync(gameDir)) {
          const inst = this.analyzeMinecraftDir(gameDir, 'Legacy Launcher (TL Legacy)', 'legacy', activeVer);
          if (inst) registerInstance(inst);
        }
      } catch (err) {
        console.warn('Failed reading legacy.properties:', err);
      }
    }

    // Check default Legacy Launcher game directories
    const legacyGameDir = path.join(this.appDataPath, '.tlauncher', 'legacy', 'Minecraft', 'game');
    if (fs.existsSync(legacyGameDir)) {
      const inst = this.analyzeMinecraftDir(legacyGameDir, 'Legacy Launcher (game)', 'legacy');
      if (inst) registerInstance(inst);
    }

    const legacyRoot = path.join(this.appDataPath, '.tlauncher', 'legacy', 'Minecraft');
    if (fs.existsSync(legacyRoot) && !instanceMap.has(path.resolve(legacyGameDir).toLowerCase())) {
      const inst = this.analyzeMinecraftDir(legacyRoot, 'Legacy Launcher', 'legacy');
      if (inst) registerInstance(inst);
    }

    // 3. Modrinth App Profiles
    const modrinthProfilePaths = [
      path.join(this.appDataPath, 'ModrinthApp', 'profiles'),
      path.join(this.localAppDataPath, 'ModrinthApp', 'profiles'),
      path.join(this.appDataPath, 'com.modrinth.theseus', 'profiles'),
    ];

    for (const pDir of modrinthProfilePaths) {
      if (fs.existsSync(pDir)) {
        try {
          const profiles = fs.readdirSync(pDir, { withFileTypes: true });
          for (const dirent of profiles) {
            if (dirent.isDirectory()) {
              const profileDir = path.join(pDir, dirent.name);
              const inst = this.analyzeMinecraftDir(profileDir, `Modrinth - ${dirent.name}`, 'modrinth');
              if (inst) registerInstance(inst);
            }
          }
        } catch {
          // ignore
        }
      }
    }

    // 4. Official Minecraft Launcher (.minecraft) & Custom GameDirs in launcher_profiles.json
    const standardDotMinecraft = path.join(this.appDataPath, '.minecraft');
    if (fs.existsSync(standardDotMinecraft)) {
      const isLegacy = this.checkIsLegacy(standardDotMinecraft);
      const isTL = !isLegacy && this.checkIsTLauncherOnly(standardDotMinecraft);
      const type: LauncherType = isLegacy ? 'legacy' : isTL ? 'tlauncher' : 'official';
      const label = isLegacy
        ? 'Legacy Launcher (.minecraft)'
        : isTL
        ? 'TLauncher (.minecraft)'
        : 'Official Minecraft Launcher';

      const inst = this.analyzeMinecraftDir(standardDotMinecraft, label, type);
      if (inst) registerInstance(inst);

      // Check for custom gameDirs inside launcher_profiles.json
      const lpFile = path.join(standardDotMinecraft, 'launcher_profiles.json');
      if (fs.existsSync(lpFile)) {
        try {
          const lpData: LauncherProfilesJson = JSON.parse(fs.readFileSync(lpFile, 'utf8'));
          if (lpData.profiles) {
            for (const [profKey, prof] of Object.entries(lpData.profiles)) {
              if (prof.gameDir && fs.existsSync(prof.gameDir)) {
                const customInst = this.analyzeMinecraftDir(
                  prof.gameDir,
                  `Minecraft Profile: ${prof.name || profKey}`,
                  'official',
                  prof.lastVersionId
                );
                if (customInst) registerInstance(customInst);
              }
            }
          }
        } catch {
          // ignore invalid json
        }
      }
    }

    // Microsoft Store / Xbox App Minecraft Package
    const msStoreMinecraft = path.join(
      this.localAppDataPath,
      'Packages',
      'Microsoft.4297127D64EC6_8wekyb3d8bbwe',
      'LocalCache',
      'Roaming',
      '.minecraft'
    );
    if (fs.existsSync(msStoreMinecraft)) {
      const inst = this.analyzeMinecraftDir(msStoreMinecraft, 'Minecraft (Microsoft Store)', 'official');
      if (inst) registerInstance(inst);
    }

    // 5. Prism Launcher Instances
    const prismDirs = [
      path.join(this.appDataPath, 'PrismLauncher', 'instances'),
      path.join(this.localAppDataPath, 'Programs', 'PrismLauncher', 'instances'),
    ];
    for (const pDir of prismDirs) {
      if (fs.existsSync(pDir)) {
        try {
          const entries = fs.readdirSync(pDir, { withFileTypes: true });
          for (const dirent of entries) {
            if (dirent.isDirectory()) {
              const instDir = path.join(pDir, dirent.name);
              const dotMc = path.join(instDir, '.minecraft');
              const target = fs.existsSync(dotMc) ? dotMc : instDir;
              const inst = this.analyzeMinecraftDir(target, `Prism - ${dirent.name}`, 'prism');
              if (inst) registerInstance(inst);
            }
          }
        } catch {
          // ignore
        }
      }
    }

    // 6. MultiMC Instances
    const multimcDirs = [
      path.join(this.appDataPath, 'MultiMC', 'instances'),
      path.join(this.userHome, 'MultiMC', 'instances'),
      'C:\\MultiMC\\instances',
      'D:\\MultiMC\\instances',
    ];
    for (const mDir of multimcDirs) {
      if (fs.existsSync(mDir)) {
        try {
          const entries = fs.readdirSync(mDir, { withFileTypes: true });
          for (const dirent of entries) {
            if (dirent.isDirectory()) {
              const instDir = path.join(mDir, dirent.name);
              const dotMc = path.join(instDir, '.minecraft');
              const target = fs.existsSync(dotMc) ? dotMc : instDir;
              const inst = this.analyzeMinecraftDir(target, `MultiMC - ${dirent.name}`, 'multimc');
              if (inst) registerInstance(inst);
            }
          }
        } catch {
          // ignore
        }
      }
    }

    // 7. CurseForge Instances
    const curseforgeDirs = [
      path.join(this.userHome, 'curseforge', 'minecraft', 'Instances'),
      path.join(this.appDataPath, 'curseforge', 'minecraft', 'Instances'),
    ];
    for (const cDir of curseforgeDirs) {
      if (fs.existsSync(cDir)) {
        try {
          const entries = fs.readdirSync(cDir, { withFileTypes: true });
          for (const dirent of entries) {
            if (dirent.isDirectory()) {
              const instDir = path.join(cDir, dirent.name);
              const inst = this.analyzeMinecraftDir(instDir, `CurseForge - ${dirent.name}`, 'curseforge');
              if (inst) registerInstance(inst);
            }
          }
        } catch {
          // ignore
        }
      }
    }

    // 8. ATLauncher Instances
    const atlauncherDirs = [
      path.join(this.appDataPath, 'ATLauncher', 'instances'),
      'C:\\ATLauncher\\instances',
      'D:\\ATLauncher\\instances',
    ];
    for (const aDir of atlauncherDirs) {
      if (fs.existsSync(aDir)) {
        try {
          const entries = fs.readdirSync(aDir, { withFileTypes: true });
          for (const dirent of entries) {
            if (dirent.isDirectory()) {
              const instDir = path.join(aDir, dirent.name);
              const inst = this.analyzeMinecraftDir(instDir, `ATLauncher - ${dirent.name}`, 'atlauncher');
              if (inst) registerInstance(inst);
            }
          }
        } catch {
          // ignore
        }
      }
    }

    // 9. Feather Launcher
    const featherDir = path.join(this.appDataPath, '.feather');
    if (fs.existsSync(featherDir)) {
      const inst = this.analyzeMinecraftDir(featherDir, 'Feather Client', 'feather');
      if (inst) registerInstance(inst);
    }

    // 10. Lunar Client
    const lunarDir = path.join(this.userHome, '.lunarclient', 'offline', 'multiver');
    if (fs.existsSync(lunarDir)) {
      const inst = this.analyzeMinecraftDir(lunarDir, 'Lunar Client', 'lunar');
      if (inst) registerInstance(inst);
    }

    // 11. Badlion Client
    const badlionDir = path.join(this.appDataPath, 'badlion-client');
    if (fs.existsSync(badlionDir)) {
      const inst = this.analyzeMinecraftDir(badlionDir, 'Badlion Client', 'badlion');
      if (inst) registerInstance(inst);
    }

    // 12. GDLauncher / GDLauncher Next
    const gdlauncherDirs = [
      path.join(this.appDataPath, 'gdlauncher_next', 'instances'),
      path.join(this.appDataPath, 'gdlauncher', 'datastore', 'instances'),
    ];
    for (const gDir of gdlauncherDirs) {
      if (fs.existsSync(gDir)) {
        try {
          const entries = fs.readdirSync(gDir, { withFileTypes: true });
          for (const dirent of entries) {
            if (dirent.isDirectory()) {
              const inst = this.analyzeMinecraftDir(path.join(gDir, dirent.name), `GDLauncher - ${dirent.name}`, 'custom');
              if (inst) registerInstance(inst);
            }
          }
        } catch {
          // ignore
        }
      }
    }

    // 13. SKLauncher
    const sklauncherDir = path.join(this.appDataPath, 'sklauncher');
    if (fs.existsSync(sklauncherDir)) {
      const inst = this.analyzeMinecraftDir(sklauncherDir, 'SKLauncher', 'custom');
      if (inst) registerInstance(inst);
    }

    const all = Array.from(instanceMap.values());

    // 14. Fallback if no Minecraft directories were found
    if (all.length === 0) {
      all.push({
        id: 'fallback-default',
        name: 'Default Minecraft (.minecraft)',
        launcherType: 'official',
        rootPath: standardDotMinecraft,
        modsPath: path.join(standardDotMinecraft, 'mods'),
        detectedVersion: '1.20.1',
        detectedLoader: 'fabric',
        availableVersions: [
          {
            id: 'fabric-1.20.1',
            name: 'Fabric 1.20.1',
            gameVersion: '1.20.1',
            loader: 'fabric',
          },
        ],
        isDefault: true,
        modsCount: 0,
      });
      return all;
    }

    // 15. Intelligent Prioritization: Pick the best active instance
    // Rank criteria: Running > Mods count > Modded versions > Legacy Launcher / populated > Fallback
    all.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.isRunning) scoreA += 10000;
      if (b.isRunning) scoreB += 10000;

      scoreA += (a.modsCount || 0) * 100;
      scoreB += (b.modsCount || 0) * 100;

      const aHasModded = a.availableVersions.some((v) => v.loader !== 'all');
      const bHasModded = b.availableVersions.some((v) => v.loader !== 'all');
      if (aHasModded) scoreA += 500;
      if (bHasModded) scoreB += 500;

      if (a.launcherType === 'legacy') scoreA += 300;
      if (b.launcherType === 'legacy') scoreB += 300;

      scoreA += a.availableVersions.length * 20;
      scoreB += b.availableVersions.length * 20;

      return scoreB - scoreA;
    });

    // Mark the top instance as default
    all.forEach((inst, index) => {
      inst.isDefault = index === 0;
    });

    return all;
  }

  /**
   * Analyzes an arbitrary Minecraft directory on any drive/path with zero hardcoding.
   */
  public analyzeMinecraftDir(
    rootDir: string,
    displayName: string,
    explicitLauncherType?: LauncherType,
    preferredVersionId?: string
  ): MinecraftInstance | null {
    if (!fs.existsSync(rootDir)) return null;

    try {
      const stat = fs.statSync(rootDir);
      if (!stat.isDirectory()) return null;
    } catch {
      return null;
    }

    // Determine mods directory (handle Prism / MultiMC .minecraft nesting)
    let modsPath = path.join(rootDir, 'mods');
    const nestedDotMc = path.join(rootDir, '.minecraft');
    if (!fs.existsSync(modsPath) && fs.existsSync(nestedDotMc)) {
      const nestedMods = path.join(nestedDotMc, 'mods');
      if (fs.existsSync(nestedMods)) {
        modsPath = nestedMods;
      }
    }

    // Count installed mods (.jar and .jar.disabled)
    let modsCount = 0;
    if (fs.existsSync(modsPath)) {
      try {
        const files = fs.readdirSync(modsPath);
        modsCount = files.filter((f) => f.toLowerCase().endsWith('.jar') || f.toLowerCase().endsWith('.jar.disabled')).length;
      } catch {
        modsCount = 0;
      }
    } else {
      try {
        fs.mkdirSync(modsPath, { recursive: true });
      } catch {
        // ignore
      }
    }

    // Determine versions directory
    let versionsDir = path.join(rootDir, 'versions');
    if (!fs.existsSync(versionsDir) && fs.existsSync(nestedDotMc)) {
      const nestedVersions = path.join(nestedDotMc, 'versions');
      if (fs.existsSync(nestedVersions)) {
        versionsDir = nestedVersions;
      }
    }

    const availableVersions: {
      id: string;
      name: string;
      gameVersion: string;
      loader: ModLoader;
    }[] = [];

    const versionSeen = new Set<string>();

    // Scan all installed versions in versions/ directory
    if (fs.existsSync(versionsDir)) {
      try {
        const versionFolders = fs.readdirSync(versionsDir, { withFileTypes: true });

        for (const dirent of versionFolders) {
          if (!dirent.isDirectory()) continue;
          const versionId = dirent.name;
          const jsonPath = path.join(versionsDir, versionId, `${versionId}.json`);

          let rawJson: VersionJson = {};
          if (fs.existsSync(jsonPath)) {
            try {
              rawJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            } catch {
              // ignore invalid json
            }
          }

          const parsed = this.classifyVersion(versionId, rawJson);
          versionSeen.add(versionId.toLowerCase());
          availableVersions.push({
            id: versionId,
            name: versionId,
            gameVersion: parsed.gameVersion,
            loader: parsed.loader,
          });
        }
      } catch (err) {
        console.error('Failed reading versions in:', versionsDir, err);
      }
    }

    // Also parse launcher_profiles.json to discover profiles if versions folder is sparse
    const launcherProfilesPath = path.join(rootDir, 'launcher_profiles.json');
    if (fs.existsSync(launcherProfilesPath)) {
      try {
        const lpData: LauncherProfilesJson = JSON.parse(fs.readFileSync(launcherProfilesPath, 'utf8'));
        if (lpData.profiles) {
          for (const [profKey, prof] of Object.entries(lpData.profiles)) {
            const vId = prof.lastVersionId || prof.name || profKey;
            if (vId && !versionSeen.has(vId.toLowerCase())) {
              versionSeen.add(vId.toLowerCase());
              const parsed = this.classifyVersion(vId, {});
              availableVersions.push({
                id: vId,
                name: prof.name || vId,
                gameVersion: parsed.gameVersion,
                loader: parsed.loader,
              });
            }
          }
        }
      } catch {
        // ignore
      }
    }

    // Auto-detect launcher type if not provided
    const launcherType = explicitLauncherType || this.detectLauncherTypeFromDir(rootDir);

    // Pick active version
    let detectedVersion = '1.20.1';
    let detectedLoader: ModLoader = 'fabric';

    if (preferredVersionId) {
      const matchPref = availableVersions.find(
        (v) => v.id.toLowerCase() === preferredVersionId.toLowerCase() || v.name.toLowerCase() === preferredVersionId.toLowerCase()
      );
      if (matchPref) {
        detectedVersion = matchPref.gameVersion;
        detectedLoader = matchPref.loader;
      }
    }

    if (!preferredVersionId || detectedVersion === '1.20.1') {
      if (availableVersions.length > 0) {
        // Prefer modern Fabric or NeoForge or Forge
        const best =
          availableVersions.find((v) => v.loader === 'fabric') ||
          availableVersions.find((v) => v.loader === 'neoforge') ||
          availableVersions.find((v) => v.loader === 'forge') ||
          availableVersions[0];

        detectedVersion = best.gameVersion;
        detectedLoader = best.loader;
      } else {
        availableVersions.push({
          id: '1.20.1-Fabric',
          name: 'Fabric 1.20.1 (Default)',
          gameVersion: '1.20.1',
          loader: 'fabric',
        });
      }
    }

    return {
      id: Buffer.from(rootDir).toString('base64').substring(0, 16),
      name: displayName,
      launcherType,
      rootPath: rootDir,
      modsPath,
      detectedVersion,
      detectedLoader,
      availableVersions,
      isDefault: false,
      modsCount,
    };
  }

  /**
   * Identifies the launcher type based on folder location and filesystem markers.
   */
  private detectLauncherTypeFromDir(dir: string): LauncherType {
    const lower = dir.toLowerCase();
    if (lower.includes('.tlauncher\\legacy') || lower.includes('.tlauncher/legacy') || lower.includes('legacy')) {
      return 'legacy';
    }
    if (lower.includes('modrinth')) {
      return 'modrinth';
    }
    if (lower.includes('prism')) {
      return 'prism';
    }
    if (lower.includes('multimc')) {
      return 'multimc';
    }
    if (lower.includes('curseforge')) {
      return 'curseforge';
    }
    if (lower.includes('atlauncher')) {
      return 'atlauncher';
    }
    if (lower.includes('feather')) {
      return 'feather';
    }
    if (lower.includes('lunar')) {
      return 'lunar';
    }
    if (lower.includes('badlion')) {
      return 'badlion';
    }
    if (lower.includes('.tlauncher') || fs.existsSync(path.join(dir, 'tlauncher.json'))) {
      return 'tlauncher';
    }
    if (lower.includes('.minecraft')) {
      return 'official';
    }
    return 'custom';
  }

  private checkIsLegacy(dotMinecraftPath: string): boolean {
    const parentDir = path.dirname(dotMinecraftPath);
    if (parentDir.toLowerCase().includes('legacy')) return true;
    const legacyFlag = path.join(dotMinecraftPath, 'tlauncher-legacy.properties');
    return fs.existsSync(legacyFlag);
  }

  private checkIsTLauncherOnly(dotMinecraftPath: string): boolean {
    const tlauncherProps = path.join(dotMinecraftPath, 'tlauncher.json');
    const tlauncherSkin = path.join(dotMinecraftPath, 'skin.json');
    return fs.existsSync(tlauncherProps) || fs.existsSync(tlauncherSkin);
  }

  /**
   * Dynamically inspects running Java / Minecraft processes to extract the active gameDir.
   */
  private detectRunningGameDirectory(): string | null {
    if (process.platform !== 'win32') return null;

    try {
      // Query WMIC or PowerShell for processes with commandlines containing gameDir or TargetDirectory
      const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name LIKE '%java%' OR Name LIKE '%minecraft%'\\" | Select-Object -ExpandProperty CommandLine"`;
      const output = execSync(cmd, { encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] });

      if (!output) return null;

      // Check for --gameDir <path>
      const gameDirMatch = output.match(/--gameDir\s+([^\s"]+|"[^"]+")/i);
      if (gameDirMatch && gameDirMatch[1]) {
        const extracted = gameDirMatch[1].replace(/^"|"$/g, '').trim();
        if (fs.existsSync(extracted)) return extracted;
      }

      // Check for -Dminecraft.applet.TargetDirectory=<path>
      const targetDirMatch = output.match(/-Dminecraft\.applet\.TargetDirectory=([^\s"]+|"[^"]+")/i);
      if (targetDirMatch && targetDirMatch[1]) {
        const extracted = targetDirMatch[1].replace(/^"|"$/g, '').trim();
        if (fs.existsSync(extracted)) return extracted;
      }
    } catch {
      // Ignore if process inspection fails or timed out
    }

    return null;
  }

  private parsePropertiesFile(filePath: string): Record<string, string> {
    const content = fs.readFileSync(filePath, 'utf8');
    const result: Record<string, string> = {};
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        // Unescape escaped backslashes and colons (e.g. C\:\\Users)
        value = value.replace(/\\:/g, ':').replace(/\\\\/g, '\\');
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Accurately parses Minecraft version metadata and loader from version ID and JSON definitions.
   */
  private classifyVersion(folderName: string, json: VersionJson): { gameVersion: string; loader: ModLoader } {
    let loader: ModLoader = 'fabric';

    // 1. Inspect libraries array if present
    const libNames = (json.libraries || []).map((l) => l.name || '').join(' ').toLowerCase();

    // 2. Combine all version strings
    const combined = `${folderName} ${json.id || ''} ${json.jar || ''} ${json.inheritsFrom || ''} ${json.mainClass || ''} ${libNames}`.toLowerCase();

    if (combined.includes('neoforge') || libNames.includes('net.neoforged')) {
      loader = 'neoforge';
    } else if (combined.includes('forge') || combined.includes('fml') || libNames.includes('net.minecraftforge')) {
      loader = 'forge';
    } else if (combined.includes('quilt') || libNames.includes('org.quiltmc')) {
      loader = 'quilt';
    } else if (combined.includes('fabric') || libNames.includes('net.fabricmc.loader') || combined.includes('knotclient')) {
      loader = 'fabric';
    }

    // 3. Extract game version
    let gameVersion = '1.20.1';

    // Priority A: JSON 'jar' field (official Mojang target version, e.g. "1.21.5" or "26.3")
    if (json.jar && json.jar.trim()) {
      gameVersion = json.jar.trim();
    }
    // Priority B: inheritsFrom (e.g. "1.21.5")
    else if (json.inheritsFrom && json.inheritsFrom.trim()) {
      const inhMatch = json.inheritsFrom.match(/1\.\d+(\.\d+)?/);
      if (inhMatch) {
        gameVersion = inhMatch[0];
      } else {
        gameVersion = json.inheritsFrom.trim();
      }
    }
    // Priority C: Match standard Minecraft version pattern 1.x.x
    else {
      const match = combined.match(/1\.\d+(\.\d+)?/);
      if (match) {
        gameVersion = match[0];
      } else {
        // Priority D: Match snapshots or major subversions like 26.3, 26.2, 24w14a
        const snapMatch = combined.match(/(\d\d\.\d+|\d\dw\d\d[a-z])/);
        if (snapMatch) {
          gameVersion = snapMatch[0];
        }
      }
    }

    return { gameVersion, loader };
  }
}
