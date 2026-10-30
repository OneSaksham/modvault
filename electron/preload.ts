import { contextBridge, ipcRenderer } from 'electron';
import {
  MinecraftInstance,
  AppSettings,
  ModSearchFilter,
  ModSearchResult,
  ModVersion,
  InstalledMod,
  DownloadItem,
} from '../src/types';

const api = {
  instances: {
    getAll: (): Promise<MinecraftInstance[]> => ipcRenderer.invoke('instances:getAll'),
    scan: (): Promise<MinecraftInstance[]> => ipcRenderer.invoke('instances:scan'),
    selectFolder: (): Promise<string | null> => ipcRenderer.invoke('instances:selectFolder'),
    analyzeFolder: (folderPath: string): Promise<MinecraftInstance | null> =>
      ipcRenderer.invoke('instances:analyzeFolder', folderPath),
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    save: (settings: Partial<AppSettings>): Promise<AppSettings> =>
      ipcRenderer.invoke('settings:save', settings),
  },
  modrinth: {
    search: (filter: ModSearchFilter): Promise<{ hits: ModSearchResult[]; total_hits: number }> =>
      ipcRenderer.invoke('modrinth:search', filter),
    getProject: (slugOrId: string): Promise<any> =>
      ipcRenderer.invoke('modrinth:getProject', slugOrId),
    getVersions: (
      projectId: string,
      loaders?: string[],
      gameVersions?: string[]
    ): Promise<ModVersion[]> =>
      ipcRenderer.invoke('modrinth:getVersions', projectId, loaders, gameVersions),
    getVersion: (versionId: string): Promise<ModVersion> =>
      ipcRenderer.invoke('modrinth:getVersion', versionId),
    resolveDependencies: (
      version: ModVersion,
      loader: string,
      gameVersion: string
    ): Promise<any[]> =>
      ipcRenderer.invoke('modrinth:resolveDependencies', version, loader, gameVersion),
  },
  mods: {
    getInstalled: (modsDir: string): Promise<InstalledMod[]> =>
      ipcRenderer.invoke('mods:getInstalled', modsDir),
    toggle: (filePath: string): Promise<InstalledMod> =>
      ipcRenderer.invoke('mods:toggle', filePath),
    uninstall: (filePath: string): Promise<boolean> =>
      ipcRenderer.invoke('mods:uninstall', filePath),
    openFolder: (modsDir: string): Promise<void> =>
      ipcRenderer.invoke('mods:openFolder', modsDir),
  },
  installer: {
    installMod: (
      version: ModVersion,
      modId: string,
      modName: string,
      targetModsDir: string,
      targetLoader: string,
      targetGameVersion: string,
      autoDependencies: boolean
    ): Promise<{ installedFiles: string[]; dependenciesInstalled: number }> =>
      ipcRenderer.invoke(
        'installer:installMod',
        version,
        modId,
        modName,
        targetModsDir,
        targetLoader,
        targetGameVersion,
        autoDependencies
      ),
    cancelDownload: (downloadId: string): Promise<void> =>
      ipcRenderer.invoke('installer:cancelDownload', downloadId),
    onDownloadProgress: (callback: (item: DownloadItem) => void) => {
      const handler = (_event: any, item: DownloadItem) => callback(item);
      ipcRenderer.on('download:progress', handler);
      return () => {
        ipcRenderer.removeListener('download:progress', handler);
      };
    },
  },
  system: {
    openExternal: (url: string): Promise<void> => ipcRenderer.invoke('system:openExternal', url),
    openLandingPage: (): Promise<string> => ipcRenderer.invoke('system:openLandingPage'),
  },
};

export type ModVaultAPI = typeof api;

contextBridge.exposeInMainWorld('api', api);

