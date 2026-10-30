import fs from 'fs';
import path from 'path';
import os from 'os';
import { AppSettings } from '../../src/types';

export class SettingsManager {
  private configDir: string;
  private configFilePath: string;
  private defaultSettings: AppSettings = {
    selectedInstanceId: null,
    customInstances: [],
    theme: 'dark',
    maxConcurrentDownloads: 3,
    autoResolveDependencies: true,
    checkUpdatesOnLaunch: true,
    activeGameVersion: '1.20.1',
    activeLoader: 'fabric',
    firstLaunchDone: false,
  };

  constructor() {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    this.configDir = path.join(appData, 'ModVault');
    this.configFilePath = path.join(this.configDir, 'config.json');

    if (!fs.existsSync(this.configDir)) {
      try {
        fs.mkdirSync(this.configDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create ModVault config dir:', err);
      }
    }
  }

  public getSettings(): AppSettings {
    if (!fs.existsSync(this.configFilePath)) {
      try {
        fs.writeFileSync(this.configFilePath, JSON.stringify(this.defaultSettings, null, 2), 'utf8');
      } catch (err) {
        console.error('Failed to create initial ModVault config:', err);
      }
      return this.defaultSettings;
    }

    try {
      const data = fs.readFileSync(this.configFilePath, 'utf8');
      const parsed = JSON.parse(data);
      return { ...this.defaultSettings, ...parsed };
    } catch (err) {
      console.error('Failed to read ModVault settings, resetting:', err);
      return this.defaultSettings;
    }
  }

  public saveSettings(settings: Partial<AppSettings>): AppSettings {
    let current = this.defaultSettings;
    try {
      if (fs.existsSync(this.configFilePath)) {
        const data = fs.readFileSync(this.configFilePath, 'utf8');
        current = { ...this.defaultSettings, ...JSON.parse(data) };
      }
    } catch (err) {
      console.warn('Could not read existing config, using defaults:', err);
    }

    const updated = { ...current, ...settings };
    try {
      fs.writeFileSync(this.configFilePath, JSON.stringify(updated, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save ModVault settings:', err);
    }
    return updated;
  }
}
