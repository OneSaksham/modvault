export type LauncherType =
  | 'legacy'
  | 'official'
  | 'modrinth'
  | 'prism'
  | 'multimc'
  | 'curseforge'
  | 'atlauncher'
  | 'tlauncher'
  | 'feather'
  | 'lunar'
  | 'badlion'
  | 'custom';

export type ModLoader = 'fabric' | 'forge' | 'neoforge' | 'quilt' | 'all';

export interface MinecraftInstance {
  id: string;
  name: string;
  launcherType: LauncherType;
  rootPath: string;
  modsPath: string;
  detectedVersion?: string;
  detectedLoader?: ModLoader;
  availableVersions: {
    id: string;
    name: string;
    gameVersion: string;
    loader: ModLoader;
  }[];
  isDefault: boolean;
  modsCount?: number;
  isRunning?: boolean;
}

export interface ModSearchResult {
  project_id: string;
  project_type: string;
  slug: string;
  author: string;
  title: string;
  description: string;
  categories: string[];
  display_categories: string[];
  versions: string[];
  downloads: number;
  follows: number;
  icon_url: string | null;
  date_created: string;
  date_modified: string;
  latest_version: string;
  license: string;
  gallery: string[];
  featured_gallery?: string;
}

export interface ModVersionFile {
  hashes: {
    sha1: string;
    sha512: string;
  };
  url: string;
  filename: string;
  primary: boolean;
  size: number;
}

export interface ModDependency {
  version_id: string | null;
  project_id: string | null;
  file_name: string | null;
  dependency_type: 'required' | 'optional' | 'incompatible' | 'embedded';
}

export interface ModVersion {
  id: string;
  project_id: string;
  author_id: string;
  featured: boolean;
  name: string;
  version_number: string;
  changelog: string | null;
  date_published: string;
  downloads: number;
  version_type: 'release' | 'beta' | 'alpha';
  files: ModVersionFile[];
  dependencies: ModDependency[];
  game_versions: string[];
  loaders: string[];
}

export interface InstalledMod {
  fileName: string;
  filePath: string;
  fileSize: number;
  modId?: string;
  name: string;
  version?: string;
  loader?: string;
  enabled: boolean;
  dateModified: string;
  sha1: string;
  updateAvailable?: boolean;
  latestVersion?: string;
  latestVersionId?: string;
}

export type DownloadStatus = 
  | 'pending'
  | 'downloading'
  | 'verifying'
  | 'installing'
  | 'completed'
  | 'error';

export interface DownloadItem {
  id: string;
  modId: string;
  modName: string;
  fileName: string;
  bytesDownloaded: number;
  totalBytes: number;
  progressPercentage: number;
  speedBytesPerSec: number;
  status: DownloadStatus;
  errorMessage?: string;
}

export interface PresetBundle {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  targetLoader: ModLoader;
  modSlugs: string[];
  modNames: string[];
  badge: string;
}

export interface AppSettings {
  selectedInstanceId: string | null;
  customInstances: MinecraftInstance[];
  theme: 'dark';
  maxConcurrentDownloads: number;
  autoResolveDependencies: boolean;
  checkUpdatesOnLaunch: boolean;
  activeGameVersion: string;
  activeLoader: ModLoader;
  firstLaunchDone?: boolean;
  favoriteSlugs?: string[];
}

export interface ModSearchFilter {
  query: string;
  loader: ModLoader;
  version: string;
  category: string;
  sort: 'relevance' | 'downloads' | 'follows' | 'newest' | 'updated';
  offset: number;
  limit: number;
}

