import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { shell } from 'electron';
import { InstalledMod } from '../../src/types';

export class ModManager {
  private userAgent = 'ModVault-Desktop/1.0.0 (https://github.com/modvault/client)';

  public async getInstalledMods(modsDir: string): Promise<InstalledMod[]> {
    if (!fs.existsSync(modsDir)) {
      try {
        fs.mkdirSync(modsDir, { recursive: true });
      } catch {
        return [];
      }
    }

    let files: string[] = [];
    try {
      files = fs.readdirSync(modsDir);
    } catch (err) {
      console.error('Failed reading mods directory:', err);
      return [];
    }

    const modFiles = files.filter((f) => f.endsWith('.jar') || f.endsWith('.jar.disabled'));
    const results: InstalledMod[] = [];
    const sha1Map: Map<string, InstalledMod> = new Map();

    for (const file of modFiles) {
      const fullPath = path.join(modsDir, file);
      try {
        const stats = fs.statSync(fullPath);
        const sha1 = await this.computeSha1(fullPath);
        const enabled = !file.endsWith('.disabled');
        const cleanName = file.replace(/\.jar(\.disabled)?$/, '');

        const modItem: InstalledMod = {
          fileName: file,
          filePath: fullPath,
          fileSize: stats.size,
          name: cleanName,
          enabled,
          dateModified: stats.mtime.toISOString(),
          sha1,
        };

        results.push(modItem);
        sha1Map.set(sha1.toLowerCase(), modItem);
      } catch (err) {
        console.warn(`Failed reading mod file ${file}:`, err);
      }
    }

    // Attempt Modrinth batch hash lookup to enrich with real mod metadata and update checks
    if (sha1Map.size > 0) {
      try {
        const hashes = Array.from(sha1Map.keys());
        const response = await fetch('https://api.modrinth.com/v2/version_files', {
          method: 'POST',
          headers: {
            'Content-Agent': 'application/json',
            'User-Agent': this.userAgent,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hashes,
            algorithm: 'sha1',
          }),
        });

        if (response.ok) {
          const matchedData: Record<string, any> = await response.json();
          for (const [hash, verData] of Object.entries(matchedData)) {
            const item = sha1Map.get(hash.toLowerCase());
            if (item && verData) {
              item.modId = verData.project_id;
              item.version = verData.version_number;
              item.name = verData.name || item.name;
              if (verData.loaders && verData.loaders.length > 0) {
                item.loader = verData.loaders[0];
              }
            }
          }
        }
      } catch (lookupErr) {
        console.warn('Modrinth hash lookup failed, using local names:', lookupErr);
      }
    }

    return results;
  }

  public toggleMod(filePath: string): InstalledMod {
    if (!fs.existsSync(filePath)) {
      throw new Error('Mod file does not exist.');
    }

    let newPath: string;
    let enabled: boolean;

    if (filePath.endsWith('.disabled')) {
      newPath = filePath.replace(/\.disabled$/, '');
      enabled = true;
    } else {
      newPath = `${filePath}.disabled`;
      enabled = false;
    }

    fs.renameSync(filePath, newPath);
    const stats = fs.statSync(newPath);
    const fileName = path.basename(newPath);

    return {
      fileName,
      filePath: newPath,
      fileSize: stats.size,
      name: fileName.replace(/\.jar(\.disabled)?$/, ''),
      enabled,
      dateModified: stats.mtime.toISOString(),
      sha1: '',
    };
  }

  public uninstallMod(filePath: string): boolean {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  public openModsFolder(modsDir: string) {
    if (!fs.existsSync(modsDir)) {
      fs.mkdirSync(modsDir, { recursive: true });
    }
    shell.openPath(modsDir);
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

