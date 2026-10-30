import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { BrowserWindow } from 'electron';
import { ModVersion, ModVersionFile, DownloadItem } from '../../src/types';
import { ModrinthClient } from './modrinthClient';

export class ModInstaller {
  private tempDir: string;
  private modrinthClient: ModrinthClient;
  private activeDownloads: Map<string, AbortController> = new Map();

  constructor(modrinthClient: ModrinthClient) {
    this.modrinthClient = modrinthClient;
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    this.tempDir = path.join(appData, 'ModVault', 'temp');

    if (!fs.existsSync(this.tempDir)) {
      try {
        fs.mkdirSync(this.tempDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create temp dir:', err);
      }
    }
  }

  private emitProgress(window: BrowserWindow | null, item: DownloadItem) {
    if (window && !window.isDestroyed()) {
      window.webContents.send('download:progress', item);
    }
  }

  public cancelDownload(downloadId: string) {
    const controller = this.activeDownloads.get(downloadId);
    if (controller) {
      controller.abort();
      this.activeDownloads.delete(downloadId);
    }
  }

  public async installVersionFile(
    file: ModVersionFile,
    modId: string,
    modName: string,
    targetModsDir: string,
    window: BrowserWindow | null
  ): Promise<string> {
    const downloadId = `${modId}-${file.filename}`;
    const abortController = new AbortController();
    this.activeDownloads.set(downloadId, abortController);

    const tempFilePath = path.join(this.tempDir, `${file.filename}.${Date.now()}.tmp`);
    const finalFilePath = path.join(targetModsDir, file.filename);

    const progressItem: DownloadItem = {
      id: downloadId,
      modId,
      modName,
      fileName: file.filename,
      bytesDownloaded: 0,
      totalBytes: file.size,
      progressPercentage: 0,
      speedBytesPerSec: 0,
      status: 'downloading',
    };

    this.emitProgress(window, progressItem);

    try {
      if (!fs.existsSync(targetModsDir)) {
        fs.mkdirSync(targetModsDir, { recursive: true });
      }

      // Check if already installed
      if (fs.existsSync(finalFilePath)) {
        const existingSha1 = await this.computeSha1(finalFilePath);
        if (existingSha1.toLowerCase() === file.hashes.sha1.toLowerCase()) {
          progressItem.status = 'completed';
          progressItem.progressPercentage = 100;
          this.emitProgress(window, progressItem);
          this.activeDownloads.delete(downloadId);
          return finalFilePath;
        }
      }

      const response = await fetch(file.url, {
        signal: abortController.signal,
        headers: {
          'User-Agent': 'ModVault-Desktop/1.0.0 (https://github.com/modvault/client)',
        },
      });

      if (!response.ok || !response.body) {
        throw new Error(`Download failed with status: ${response.status}`);
      }

      const totalLength = Number(response.headers.get('content-length')) || file.size;
      progressItem.totalBytes = totalLength;

      const fileStream = fs.createWriteStream(tempFilePath);
      const reader = response.body.getReader();

      let receivedBytes = 0;
      let lastReportTime = Date.now();
      let bytesSinceLastReport = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fileStream.write(Buffer.from(value));
        receivedBytes += value.length;
        bytesSinceLastReport += value.length;

        const now = Date.now();
        const elapsed = (now - lastReportTime) / 1000;

        if (elapsed >= 0.25 || receivedBytes === totalLength) {
          const speed = bytesSinceLastReport / (elapsed || 0.001);
          progressItem.bytesDownloaded = receivedBytes;
          progressItem.progressPercentage = Math.min(100, Math.round((receivedBytes / totalLength) * 100));
          progressItem.speedBytesPerSec = Math.round(speed);
          this.emitProgress(window, progressItem);

          lastReportTime = now;
          bytesSinceLastReport = 0;
        }
      }

      await new Promise<void>((resolve, reject) => {
        fileStream.end((err?: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Verification Phase
      progressItem.status = 'verifying';
      this.emitProgress(window, progressItem);

      const downloadedSha1 = await this.computeSha1(tempFilePath);
      if (downloadedSha1.toLowerCase() !== file.hashes.sha1.toLowerCase()) {
        throw new Error(`SHA-1 checksum verification failed! Expected: ${file.hashes.sha1}, Computed: ${downloadedSha1}`);
      }

      // Moving to target directory
      progressItem.status = 'installing';
      this.emitProgress(window, progressItem);

      // Clean up old versions if they exist
      this.removeConflictingModJars(targetModsDir, modId, file.filename);

      fs.copyFileSync(tempFilePath, finalFilePath);
      fs.unlinkSync(tempFilePath);

      progressItem.status = 'completed';
      progressItem.progressPercentage = 100;
      this.emitProgress(window, progressItem);

      return finalFilePath;
    } catch (err: any) {
      if (fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch {}
      }

      progressItem.status = 'error';
      progressItem.errorMessage = err.message || 'Download failed';
      this.emitProgress(window, progressItem);
      throw err;
    } finally {
      this.activeDownloads.delete(downloadId);
    }
  }

  public async installModWithDependencies(
    version: ModVersion,
    modId: string,
    modName: string,
    targetModsDir: string,
    targetLoader: string,
    targetGameVersion: string,
    autoDependencies: boolean,
    window: BrowserWindow | null
  ): Promise<{ installedFiles: string[]; dependenciesInstalled: number }> {
    const primaryFile = version.files.find((f) => f.primary) || version.files[0];
    if (!primaryFile) {
      throw new Error('No downloadable file found for this mod version.');
    }

    const installedFiles: string[] = [];
    let dependenciesInstalled = 0;

    // 1. Install primary mod
    const mainPath = await this.installVersionFile(primaryFile, modId, modName, targetModsDir, window);
    installedFiles.push(mainPath);

    // 2. Resolve & install required dependencies
    if (autoDependencies && version.dependencies && version.dependencies.length > 0) {
      const dependencies = await this.modrinthClient.resolveDependencies(version, targetLoader, targetGameVersion);

      for (const dep of dependencies) {
        const depPrimaryFile = dep.version.files.find((f) => f.primary) || dep.version.files[0];
        if (depPrimaryFile) {
          const depFinalPath = path.join(targetModsDir, depPrimaryFile.filename);
          if (!fs.existsSync(depFinalPath)) {
            try {
              const depPath = await this.installVersionFile(
                depPrimaryFile,
                dep.projectId,
                dep.title || dep.projectId,
                targetModsDir,
                window
              );
              installedFiles.push(depPath);
              dependenciesInstalled++;
            } catch (depErr) {
              console.warn(`Could not install dependency ${dep.projectId}:`, depErr);
            }
          }
        }
      }
    }

    return { installedFiles, dependenciesInstalled };
  }

  private removeConflictingModJars(targetModsDir: string, _modId: string, currentFilename: string) {
    try {
      // Find files with similar base names if updating
      const baseName = currentFilename.split(/[-_]\d/)[0];
      if (!baseName || baseName.length < 3) return;

      const files = fs.readdirSync(targetModsDir);
      for (const f of files) {
        if (f.endsWith('.jar') && f !== currentFilename && f.toLowerCase().startsWith(baseName.toLowerCase())) {
          try {
            fs.unlinkSync(path.join(targetModsDir, f));
            console.log(`Replaced older mod version: ${f} -> ${currentFilename}`);
          } catch {}
        }
      }
    } catch {
      // ignore
    }
  }

  private computeSha1(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha1');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    });
  }
}

