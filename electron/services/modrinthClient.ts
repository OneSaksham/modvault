import { ModSearchResult, ModVersion, ModSearchFilter } from '../../src/types';

export class ModrinthClient {
  private baseUrl = 'https://api.modrinth.com/v2';
  private userAgent = 'ModVault-Desktop/1.0.0 (https://github.com/modvault/client)';

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Modrinth API error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as T;
  }

  public async searchMods(filter: ModSearchFilter): Promise<{ hits: ModSearchResult[]; total_hits: number }> {
    const facets: string[][] = [
      ['project_type:mod'],
    ];

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
      limit: String(filter.limit || 20),
      facets: JSON.stringify(facets),
    });

    const url = `${this.baseUrl}/search?${params.toString()}`;
    return this.fetchJson<{ hits: ModSearchResult[]; total_hits: number }>(url);
  }

  public async getProject(slugOrId: string): Promise<any> {
    const url = `${this.baseUrl}/project/${encodeURIComponent(slugOrId)}`;
    return this.fetchJson<any>(url);
  }

  public async getProjectVersions(
    projectId: string,
    loaders?: string[],
    gameVersions?: string[]
  ): Promise<ModVersion[]> {
    const params = new URLSearchParams();
    if (loaders && loaders.length > 0) {
      params.append('loaders', JSON.stringify(loaders));
    }
    if (gameVersions && gameVersions.length > 0) {
      params.append('game_versions', JSON.stringify(gameVersions));
    }

    const query = params.toString();
    const url = `${this.baseUrl}/project/${encodeURIComponent(projectId)}/version${query ? `?${query}` : ''}`;
    return this.fetchJson<ModVersion[]>(url);
  }

  public async getVersion(versionId: string): Promise<ModVersion> {
    const url = `${this.baseUrl}/version/${encodeURIComponent(versionId)}`;
    return this.fetchJson<ModVersion>(url);
  }

  public async resolveDependencies(
    version: ModVersion,
    targetLoader: string,
    targetGameVersion: string
  ): Promise<{ projectId: string; version: ModVersion; title?: string }[]> {
    const resolved: { projectId: string; version: ModVersion; title?: string }[] = [];
    const visited = new Set<string>();

    const traverse = async (currentVer: ModVersion) => {
      if (!currentVer.dependencies) return;

      for (const dep of currentVer.dependencies) {
        if (dep.dependency_type !== 'required') continue;

        let depVersion: ModVersion | null = null;
        let depProjectId = dep.project_id;

        if (dep.version_id && !visited.has(dep.version_id)) {
          visited.add(dep.version_id);
          try {
            depVersion = await this.getVersion(dep.version_id);
            depProjectId = depVersion.project_id;
          } catch (err) {
            console.error(`Failed resolving version id ${dep.version_id}:`, err);
          }
        } else if (depProjectId && !visited.has(depProjectId)) {
          visited.add(depProjectId);
          try {
            const versions = await this.getProjectVersions(depProjectId, [targetLoader], [targetGameVersion]);
            if (versions.length > 0) {
              depVersion = versions[0];
            }
          } catch (err) {
            console.error(`Failed resolving project id ${depProjectId}:`, err);
          }
        }

        if (depVersion && depProjectId) {
          resolved.push({
            projectId: depProjectId,
            version: depVersion,
          });
          // Recurse for nested dependencies
          await traverse(depVersion);
        }
      }
    };

    await traverse(version);
    return resolved;
  }
}

