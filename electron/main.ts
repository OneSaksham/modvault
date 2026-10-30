import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { LauncherDetector } from './services/launcherDetector';

const currentDir = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
import { SettingsManager } from './services/settingsManager';
import { ModrinthClient } from './services/modrinthClient';
import { ModInstaller } from './services/modInstaller';
import { ModManager } from './services/modManager';
import { ModSearchFilter, ModVersion } from '../src/types';

let mainWindow: BrowserWindow | null = null;

const launcherDetector = new LauncherDetector();
const settingsManager = new SettingsManager();
const modrinthClient = new ModrinthClient();
const modInstaller = new ModInstaller(modrinthClient);
const modManager = new ModManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#0b0f14',
    title: 'ModVault - Minecraft Mod Installer & Manager',
    icon: path.join(currentDir, '../public/icon.png'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(currentDir, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(currentDir, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  // Instances
  ipcMain.handle('instances:getAll', async () => {
    const settings = settingsManager.getSettings();
    const detected = launcherDetector.detectAllInstances();
    const all = [...detected, ...(settings.customInstances || [])];

    // Ensure a valid active instance is selected (replace old fallback IDs)
    const exists = all.find((i) => i.id === settings.selectedInstanceId && i.id !== 'fallback-default');
    if (!exists && all.length > 0) {
      const defaultInst = all.find((i) => i.isDefault) || all[0];
      settingsManager.saveSettings({ selectedInstanceId: defaultInst.id });
    }

    return all;
  });

  ipcMain.handle('instances:scan', async () => {
    return launcherDetector.detectAllInstances();
  });

  ipcMain.handle('instances:selectFolder', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Minecraft Directory or Instance Folder',
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle('instances:analyzeFolder', async (_event, folderPath: string) => {
    return launcherDetector.analyzeMinecraftDir(folderPath, path.basename(folderPath), 'custom');
  });

  // Settings
  ipcMain.handle('settings:get', async () => {
    return settingsManager.getSettings();
  });

  ipcMain.handle('settings:save', async (_event, newSettings) => {
    return settingsManager.saveSettings(newSettings);
  });

  // Modrinth API
  ipcMain.handle('modrinth:search', async (_event, filter: ModSearchFilter) => {
    return modrinthClient.searchMods(filter);
  });

  ipcMain.handle('modrinth:getProject', async (_event, slugOrId: string) => {
    return modrinthClient.getProject(slugOrId);
  });

  ipcMain.handle(
    'modrinth:getVersions',
    async (_event, projectId: string, loaders?: string[], gameVersions?: string[]) => {
      return modrinthClient.getProjectVersions(projectId, loaders, gameVersions);
    }
  );

  ipcMain.handle('modrinth:getVersion', async (_event, versionId: string) => {
    return modrinthClient.getVersion(versionId);
  });

  ipcMain.handle(
    'modrinth:resolveDependencies',
    async (_event, version: ModVersion, loader: string, gameVersion: string) => {
      return modrinthClient.resolveDependencies(version, loader, gameVersion);
    }
  );

  // Installed Mods Management
  ipcMain.handle('mods:getInstalled', async (_event, modsDir: string) => {
    return modManager.getInstalledMods(modsDir);
  });

  ipcMain.handle('mods:toggle', async (_event, filePath: string) => {
    return modManager.toggleMod(filePath);
  });

  ipcMain.handle('mods:uninstall', async (_event, filePath: string) => {
    return modManager.uninstallMod(filePath);
  });

  ipcMain.handle('mods:openFolder', async (_event, modsDir: string) => {
    modManager.openModsFolder(modsDir);
  });

  // Installation Engine
  ipcMain.handle(
    'installer:installMod',
    async (
      _event,
      version: ModVersion,
      modId: string,
      modName: string,
      targetModsDir: string,
      targetLoader: string,
      targetGameVersion: string,
      autoDependencies: boolean
    ) => {
      return modInstaller.installModWithDependencies(
        version,
        modId,
        modName,
        targetModsDir,
        targetLoader,
        targetGameVersion,
        autoDependencies,
        mainWindow
      );
    }
  );

  ipcMain.handle('installer:cancelDownload', async (_event, downloadId: string) => {
    modInstaller.cancelDownload(downloadId);
  });

  // System & External Links
  ipcMain.handle('system:openExternal', async (_event, url: string) => {
    return shell.openExternal(url);
  });

  ipcMain.handle('system:openLandingPage', async () => {
    const landingPath = path.resolve(currentDir, '../landing/index.html');
    return shell.openPath(landingPath);
  });
}

