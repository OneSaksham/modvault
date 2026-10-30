import {
  MinecraftInstance,
  AppSettings,
  ModSearchFilter,
  ModVersion,
  InstalledMod,
  DownloadItem,
} from '../types';

export function initializeBrowserFallback() {
  if (typeof window === 'undefined' || window.api) {
    return;
  }

  console.info('ModVault: Operating in Web Browser Mode. Initializing client fallback bridge.');

  const progressListeners = new Set<(item: DownloadItem) => void>();

  const defaultSettings: AppSettings = {
    selectedInstanceId: 'tlauncher-default',
    customInstances: [],
    theme: 'dark',
    maxConcurrentDownloads: 3,
    autoResolveDependencies: true,
    checkUpdatesOnLaunch: true,
    activeGameVersion: '1.20.1',
    activeLoader: 'fabric',
    firstLaunchDone: false,
  };

  const defaultInstances: MinecraftInstance[] = [
    {
      id: 'legacy-default',
      name: 'Legacy Launcher (TL Legacy)',
      launcherType: 'legacy',
      rootPath: 'C:\\Users\\User\\AppData\\Roaming\\.tlauncher\\legacy\\Minecraft\\game',
      modsPath: 'C:\\Users\\User\\AppData\\Roaming\\.tlauncher\\legacy\\Minecraft\\game\\mods',
      detectedVersion: '26.3',
      detectedLoader: 'fabric',
      availableVersions: [
        { id: 'fabric-26.3', name: 'Fabric 26.3', gameVersion: '26.3', loader: 'fabric' },
        { id: 'fabric-1.21.5', name: 'Fabric 1.21.5', gameVersion: '1.21.5', loader: 'fabric' },
        { id: 'neoforge-1.21.5', name: 'NeoForge 1.21.5', gameVersion: '1.21.5', loader: 'neoforge' },
        { id: 'fabric-1.20.1', name: 'Fabric 1.20.1', gameVersion: '1.20.1', loader: 'fabric' },
      ],
      isDefault: true,
      modsCount: 9,
    },
    {
      id: 'modrinth-default',
      name: 'Modrinth App - Main Profile',
      launcherType: 'modrinth',
      rootPath: 'C:\\Users\\User\\AppData\\Roaming\\ModrinthApp\\profiles\\Main',
      modsPath: 'C:\\Users\\User\\AppData\\Roaming\\ModrinthApp\\profiles\\Main\\mods',
      detectedVersion: '1.21.1',
      detectedLoader: 'fabric',
      availableVersions: [
        { id: 'fabric-1.21.1', name: 'Fabric 1.21.1', gameVersion: '1.21.1', loader: 'fabric' },
      ],
      isDefault: false,
      modsCount: 0,
    },
    {
      id: 'official-default',
      name: 'Official Minecraft Launcher',
      launcherType: 'official',
      rootPath: 'C:\\Users\\User\\AppData\\Roaming\\.minecraft',
      modsPath: 'C:\\Users\\User\\AppData\\Roaming\\.minecraft\\mods',
      detectedVersion: '1.20.4',
      detectedLoader: 'fabric',
      availableVersions: [
        { id: 'fabric-1.20.4', name: 'Fabric 1.20.4', gameVersion: '1.20.4', loader: 'fabric' },
      ],
      isDefault: false,
      modsCount: 0,
    },
  ];

  window.api = {
    instances: {
      getAll: async () => {
        const stored = localStorage.getItem('modvault_instances');
        return stored ? JSON.parse(stored) : defaultInstances;
      },
      scan: async () => {
        return defaultInstances;
      },
      selectFolder: async () => {
        const input = prompt('Enter Minecraft folder path (browser fallback mode):', 'C:\\Minecraft');
        return input || null;
      },
      analyzeFolder: async (folderPath: string) => {
        return {
          id: `custom-${Date.now()}`,
          name: `Custom Instance (${folderPath.split('\\').pop() || 'Minecraft'})`,
          launcherType: 'custom',
          rootPath: folderPath,
          modsPath: `${folderPath}\\mods`,
          detectedVersion: '1.20.1',
          detectedLoader: 'fabric',
          availableVersions: [
            { id: '1.20.1-fabric', name: 'Fabric 1.20.1', gameVersion: '1.20.1', loader: 'fabric' },
          ],
          isDefault: false,
        };
      },
    },
    settings: {
      get: async () => {
        const stored = localStorage.getItem('modvault_settings');
        return stored ? JSON.parse(stored) : defaultSettings;
      },
      save: async (updates: Partial<AppSettings>) => {
        const current = await window.api.settings.get();
        const next = { ...current, ...updates };
        localStorage.setItem('modvault_settings', JSON.stringify(next));
        return next;
      },
    },
    modrinth: {
      search: async (filter: ModSearchFilter) => {
        const facets: string[][] = [['project_type:mod']];
        if (filter.loader && filter.loader !== 'all') {
          facets.push([`categories:${filter.loader}`]);
        }
        if (filter.version) {
          facets.push([`versions:${filter.version}`]);
        }
        if (filter.category && filter.category !== 'all') {
          facets.push([`categories:${filter.category.toLowerCase()}`]);
        }

        const params = new URLSearchParams({
          query: filter.query || '',
          index: filter.sort || 'downloads',
          offset: String(filter.offset || 0),
          limit: String(filter.limit || 21),
          facets: JSON.stringify(facets),
        });

        const res = await fetch(`https://api.modrinth.com/v2/search?${params.toString()}`);
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        return res.json();
      },
      getProject: async (slugOrId: string) => {
        const res = await fetch(`https://api.modrinth.com/v2/project/${encodeURIComponent(slugOrId)}`);
        if (!res.ok) throw new Error(`Get project failed: ${res.status}`);
        return res.json();
      },
      getVersions: async (projectId: string, loaders?: string[], gameVersions?: string[]) => {
        const params = new URLSearchParams();
        if (loaders && loaders.length > 0) {
          params.append('loaders', JSON.stringify(loaders));
        }
        if (gameVersions && gameVersions.length > 0) {
          params.append('game_versions', JSON.stringify(gameVersions));
        }
        const query = params.toString();
        const res = await fetch(
          `https://api.modrinth.com/v2/project/${encodeURIComponent(projectId)}/version${query ? `?${query}` : ''}`
        );
        if (!res.ok) throw new Error(`Get versions failed: ${res.status}`);
        return res.json();
      },
      getVersion: async (versionId: string) => {
        const res = await fetch(`https://api.modrinth.com/v2/version/${encodeURIComponent(versionId)}`);
        if (!res.ok) throw new Error(`Get version failed: ${res.status}`);
        return res.json();
      },
      resolveDependencies: async (version: ModVersion, loader: string, gameVersion: string) => {
        const resolved: any[] = [];
        if (!version.dependencies) return resolved;

        for (const dep of version.dependencies) {
          if (dep.dependency_type !== 'required') continue;
          try {
            if (dep.project_id) {
              const res = await fetch(
                `https://api.modrinth.com/v2/project/${dep.project_id}/version?loaders=${JSON.stringify([
                  loader,
                ])}&game_versions=${JSON.stringify([gameVersion])}`
              );
              if (res.ok) {
                const vers = await res.json();
                if (vers.length > 0) {
                  resolved.push({ projectId: dep.project_id, version: vers[0] });
                }
              }
            }
          } catch {}
        }
        return resolved;
      },
    },
    mods: {
      getInstalled: async () => {
        const stored = localStorage.getItem('modvault_installed_mods');
        return stored ? JSON.parse(stored) : [];
      },
      toggle: async (filePath: string) => {
        const list: InstalledMod[] = JSON.parse(localStorage.getItem('modvault_installed_mods') || '[]');
        const item = list.find((m) => m.filePath === filePath);
        if (item) {
          item.enabled = !item.enabled;
          item.fileName = item.enabled ? item.fileName.replace(/\.disabled$/, '') : `${item.fileName}.disabled`;
          localStorage.setItem('modvault_installed_mods', JSON.stringify(list));
          return item;
        }
        throw new Error('Mod not found');
      },
      uninstall: async (filePath: string) => {
        const list: InstalledMod[] = JSON.parse(localStorage.getItem('modvault_installed_mods') || '[]');
        const updated = list.filter((m) => m.filePath !== filePath);
        localStorage.setItem('modvault_installed_mods', JSON.stringify(updated));
        return true;
      },
      openFolder: async (modsDir: string) => {
        alert(`Target Folder: ${modsDir}\n\n(Opening in Windows Explorer is supported when running ModVault desktop executable)`);
      },
    },
    installer: {
      installMod: async (
        version: ModVersion,
        modId: string,
        modName: string,
        targetModsDir: string
      ) => {
        const file = version.files.find((f) => f.primary) || version.files[0];
        const fileSize = file?.size || 1024 * 512;
        const fileName = file?.filename || `${modId}.jar`;

        // Simulate streaming download progress
        const emit = (status: any, pct: number) => {
          const item: DownloadItem = {
            id: `${modId}-${fileName}`,
            modId,
            modName,
            fileName,
            bytesDownloaded: Math.round((fileSize * pct) / 100),
            totalBytes: fileSize,
            progressPercentage: pct,
            speedBytesPerSec: 1024 * 1024 * 2.5,
            status,
          };
          for (const cb of progressListeners) cb(item);
        };

        emit('downloading', 25);
        await new Promise((r) => setTimeout(r, 200));
        emit('downloading', 65);
        await new Promise((r) => setTimeout(r, 200));
        emit('downloading', 100);
        await new Promise((r) => setTimeout(r, 150));
        emit('verifying', 100);
        await new Promise((r) => setTimeout(r, 150));
        emit('installing', 100);
        await new Promise((r) => setTimeout(r, 150));
        emit('completed', 100);

        // Save to installed mods in localStorage
        const list: InstalledMod[] = JSON.parse(localStorage.getItem('modvault_installed_mods') || '[]');
        const existingIdx = list.findIndex((m) => m.name.toLowerCase() === modName.toLowerCase());
        const newMod: InstalledMod = {
          fileName,
          filePath: `${targetModsDir}\\${fileName}`,
          fileSize,
          name: modName,
          version: version.version_number,
          loader: version.loaders[0] || 'fabric',
          enabled: true,
          dateModified: new Date().toISOString(),
          sha1: file?.hashes?.sha1 || '',
        };

        if (existingIdx >= 0) {
          list[existingIdx] = newMod;
        } else {
          list.push(newMod);
        }
        localStorage.setItem('modvault_installed_mods', JSON.stringify(list));

        return { installedFiles: [fileName], dependenciesInstalled: 0 };
      },
      cancelDownload: async () => {},
      onDownloadProgress: (callback: (item: DownloadItem) => void) => {
        progressListeners.add(callback);
        return () => {
          progressListeners.delete(callback);
        };
      },
    },
    system: {
      openExternal: async (url: string) => {
        window.open(url, '_blank');
      },
      openLandingPage: async () => {
        window.open('./landing.html', '_blank');
        return '';
      },
    },
  };
}
