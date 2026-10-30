import { ModVaultAPI } from '../../electron/preload';

declare global {
  interface Window {
    api: ModVaultAPI;
  }
}

