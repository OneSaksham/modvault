import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { FeaturedHero } from './components/FeaturedHero';
import { ModGrid } from './components/ModGrid';
import { ModDetailDrawer } from './components/ModDetailDrawer';
import { QuickPresets } from './components/QuickPresets';
import { InstalledModsView } from './components/InstalledModsView';
import { LauncherSettings } from './components/LauncherSettings';
import { BottomStatusBar } from './components/BottomStatusBar';
import { InstanceModal } from './components/InstanceModal';
import { ConfirmModal } from './components/ConfirmModal';
import { DownloadManagerModal } from './components/DownloadManagerModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import {
  MinecraftInstance,
  AppSettings,
  ModSearchFilter,
  ModSearchResult,
  InstalledMod,
  DownloadItem,
  DownloadStatus,
  ModVersion,
  PresetBundle,
} from './types';

export const App: React.FC = () => {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('explore');

  // Instances & Settings
  const [instances, setInstances] = useState<MinecraftInstance[]>([]);
  const [activeInstance, setActiveInstance] = useState<MinecraftInstance | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    selectedInstanceId: null,
    customInstances: [],
    theme: 'dark',
    maxConcurrentDownloads: 3,
    autoResolveDependencies: true,
    checkUpdatesOnLaunch: true,
    activeGameVersion: '1.20.1',
    activeLoader: 'fabric',
  });

  // Search & Filters
  const [filter, setFilter] = useState<ModSearchFilter>({
    query: '',
    loader: 'fabric',
    version: '1.20.1',
    category: 'all',
    sort: 'downloads',
    offset: 0,
    limit: 21,
  });

  // Mod Data
  const [mods, setMods] = useState<ModSearchResult[]>([]);
  const [totalModsCount, setTotalModsCount] = useState(0);
  const [installedMods, setInstalledMods] = useState<InstalledMod[]>([]);
  const [installedModSlugs, setInstalledModSlugs] = useState<Set<string>>(new Set());
  const [downloadItems, setDownloadItems] = useState<Map<string, DownloadItem>>(new Map());
  const [engineState, setEngineState] = useState<DownloadStatus | 'idle' | 'searching'>('idle');

  // UI Modals & Drawers
  const [selectedModForDetail, setSelectedModForDetail] = useState<ModSearchResult | null>(null);
  const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false);
  const [isDownloadManagerOpen, setIsDownloadManagerOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isScanningInstances, setIsScanningInstances] = useState(false);
  const [isLoadingMods, setIsLoadingMods] = useState(false);
  const [isLoadingInstalled, setIsLoadingInstalled] = useState(false);

  // Bundles State
  const [installingBundleId, setInstallingBundleId] = useState<string | null>(null);
  const [installedBundleIds, setInstalledBundleIds] = useState<Set<string>>(new Set());

  // Confirm Modal & Toasts
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Load: Load Instances & Settings
  useEffect(() => {
    const initApp = async () => {
      try {
        const [loadedSettings, detectedInstances] = await Promise.all([
          window.api.settings.get(),
          window.api.instances.getAll(),
        ]);

        setSettings(loadedSettings);
        setInstances(detectedInstances);

        if (!loadedSettings.firstLaunchDone) {
          setIsOnboardingOpen(true);
        }

        let selected = detectedInstances.find((i) => i.id === loadedSettings.selectedInstanceId && i.id !== 'fallback-default');
        if (!selected && detectedInstances.length > 0) {
          selected = detectedInstances.find((i) => i.isDefault) || detectedInstances[0];
          if (selected) {
            window.api.settings.save({ selectedInstanceId: selected.id });
          }
        }

        if (selected) {
          setActiveInstance(selected);
          const detectedVer = selected.detectedVersion || '1.20.1';
          const detectedLdr = selected.detectedLoader || 'fabric';

          setFilter((prev) => ({
            ...prev,
            version: detectedVer,
            loader: detectedLdr,
          }));

          loadInstalledMods(selected.modsPath);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        addToast('error', 'Initialization Failed', 'Could not detect Minecraft instances.');
      }
    };

    initApp();

    // Register Download Progress Listener
    const cleanup = window.api.installer.onDownloadProgress((item: DownloadItem) => {
      setDownloadItems((prev) => {
        const next = new Map(prev);
        next.set(item.modId, item);
        return next;
      });

      if (item.status === 'downloading' || item.status === 'verifying' || item.status === 'installing') {
        setEngineState(item.status);
      } else if (item.status === 'completed' || item.status === 'error') {
        setTimeout(() => setEngineState('idle'), 1500);
      }
    });

    return () => {
      cleanup();
    };
  }, []);

  // 2. Load Installed Mods from Disk
  const loadInstalledMods = async (modsDir: string) => {
    setIsLoadingInstalled(true);
    try {
      const list = await window.api.mods.getInstalled(modsDir);
      setInstalledMods(list);

      const slugs = new Set<string>();
      for (const m of list) {
        slugs.add(m.name.toLowerCase());
        slugs.add(m.fileName.toLowerCase());
        if (m.modId) slugs.add(m.modId.toLowerCase());
      }
      setInstalledModSlugs(slugs);
    } catch (err) {
      console.error('Failed reading installed mods:', err);
    } finally {
      setIsLoadingInstalled(false);
    }
  };

  // 3. Search Mods from Modrinth with Debounce
  const searchTimeoutRef = useRef<any>(null);

  const fetchMods = useCallback(
    async (currentFilter: ModSearchFilter, append = false) => {
      setIsLoadingMods(true);
      setEngineState('searching');
      try {
        const res = await window.api.modrinth.search(currentFilter);
        setTotalModsCount(res.total_hits);
        if (append) {
          setMods((prev) => [...prev, ...res.hits]);
        } else {
          setMods(res.hits);
        }
      } catch (err) {
        console.error('Modrinth search failed:', err);
        addToast('error', 'Network Error', 'Could not fetch mods from Modrinth.');
      } finally {
        setIsLoadingMods(false);
        setEngineState('idle');
      }
    },
    []
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchMods(filter, filter.offset > 0);
    }, 280);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [filter, fetchMods]);

  const handleFilterChange = (updates: Partial<ModSearchFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  const handleLoadMore = () => {
    setFilter((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  // 4. Install a Mod
  const handleInstallMod = async (mod: ModSearchResult, chosenVersion?: ModVersion) => {
    if (!activeInstance) {
      addToast('error', 'No Target Instance', 'Please select a Minecraft instance first.');
      return;
    }

    try {
      let targetVersion: ModVersion | null = chosenVersion || null;

      if (!targetVersion) {
        const loaderQuery = filter.loader !== 'all' ? [filter.loader] : undefined;
        const available = await window.api.modrinth.getVersions(mod.project_id, loaderQuery, [
          filter.version,
        ]);

        if (available.length === 0) {
          addToast(
            'error',
            'Incompatible Mod',
            `No compatible version found for ${filter.loader.toUpperCase()} ${filter.version}.`
          );
          return;
        }
        targetVersion = available[0];
      }

      setEngineState('downloading');
      const result = await window.api.installer.installMod(
        targetVersion,
        mod.project_id,
        mod.title,
        activeInstance.modsPath,
        filter.loader,
        filter.version,
        settings.autoResolveDependencies
      );

      addToast(
        'success',
        'Installation Complete',
        `${mod.title} was installed successfully.${
          result.dependenciesInstalled > 0
            ? ` (${result.dependenciesInstalled} dependencies included)`
            : ''
        }`
      );

      // Refresh installed mods
      await loadInstalledMods(activeInstance.modsPath);
    } catch (err: any) {
      console.error('Failed installing mod:', err);
      addToast('error', 'Installation Failed', err.message || 'File download was interrupted.');
    } finally {
      setEngineState('idle');
    }
  };

  // 5. Uninstall a Mod
  const handleUninstallMod = (mod: ModSearchResult) => {
    const installed = installedMods.find(
      (m) =>
        m.name.toLowerCase() === mod.title.toLowerCase() ||
        m.fileName.toLowerCase().includes(mod.slug.toLowerCase())
    );

    if (!installed) {
      addToast('info', 'Not Installed', 'This mod is not present in the local mods directory.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Uninstall ${mod.title}?`,
      message: `This will permanently delete "${installed.fileName}" from your instance mods folder.`,
      onConfirm: async () => {
        try {
          await window.api.mods.uninstall(installed.filePath);
          addToast('info', 'Mod Removed', `${mod.title} was removed.`);
          if (activeInstance) {
            await loadInstalledMods(activeInstance.modsPath);
          }
        } catch (err: any) {
          addToast('error', 'Uninstall Failed', err.message);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 6. Install Preset Bundle
  const handleInstallBundle = async (bundle: PresetBundle) => {
    if (!activeInstance) return;

    setInstallingBundleId(bundle.id);
    setEngineState('downloading');

    let successCount = 0;
    const errors: string[] = [];

    for (const slug of bundle.modSlugs) {
      try {
        const versions = await window.api.modrinth.getVersions(slug, [filter.loader], [filter.version]);
        if (versions.length > 0) {
          await window.api.installer.installMod(
            versions[0],
            slug,
            slug,
            activeInstance.modsPath,
            filter.loader,
            filter.version,
            true
          );
          successCount++;
        } else {
          errors.push(slug);
        }
      } catch (err: any) {
        errors.push(slug);
      }
    }

    setInstallingBundleId(null);
    setEngineState('idle');

    if (activeInstance) {
      await loadInstalledMods(activeInstance.modsPath);
    }

    if (successCount > 0) {
      setInstalledBundleIds((prev) => new Set([...prev, bundle.id]));
      addToast(
        'success',
        'Bundle Installed',
        `Installed ${successCount} mods from ${bundle.title}.${
          errors.length > 0 ? ` (${errors.length} skipped due to version limits)` : ''
        }`
      );
    } else {
      addToast('error', 'Bundle Failed', 'Could not install bundle mods for this game version.');
    }
  };

  // 7. Toggle Mod Enabled/Disabled
  const handleToggleInstalledMod = async (mod: InstalledMod) => {
    try {
      await window.api.mods.toggle(mod.filePath);
      if (activeInstance) {
        await loadInstalledMods(activeInstance.modsPath);
      }
    } catch (err: any) {
      addToast('error', 'Toggle Failed', err.message);
    }
  };

  // 8. Delete Installed Mod
  const handleDeleteInstalledMod = (mod: InstalledMod) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete ${mod.name}?`,
      message: `Are you sure you want to delete ${mod.fileName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await window.api.mods.uninstall(mod.filePath);
          addToast('info', 'File Deleted', `${mod.fileName} was deleted.`);
          if (activeInstance) {
            await loadInstalledMods(activeInstance.modsPath);
          }
        } catch (err: any) {
          addToast('error', 'Delete Failed', err.message);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleBatchUninstall = (selectedList: InstalledMod[]) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete ${selectedList.length} Selected Mods?`,
      message: `Are you sure you want to permanently delete ${selectedList.length} JAR files from your mods directory?`,
      onConfirm: async () => {
        let count = 0;
        for (const m of selectedList) {
          try {
            await window.api.mods.uninstall(m.filePath);
            count++;
          } catch {}
        }
        addToast('info', 'Batch Uninstall Complete', `Deleted ${count} mod files.`);
        if (activeInstance) {
          await loadInstalledMods(activeInstance.modsPath);
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCancelDownload = (downloadId: string) => {
    window.api.installer.cancelDownload(downloadId);
    setDownloadItems((prev) => {
      const next = new Map(prev);
      next.delete(downloadId);
      return next;
    });
    addToast('info', 'Download Cancelled', downloadId);
  };

  // 9. Add Custom Minecraft Folder
  const handleAddCustomFolder = async () => {
    try {
      const folderPath = await window.api.instances.selectFolder();
      if (!folderPath) return;

      const analyzed = await window.api.instances.analyzeFolder(folderPath);
      if (analyzed) {
        const updatedCustom = [...(settings.customInstances || []), analyzed];
        const newSettings = await window.api.settings.save({
          customInstances: updatedCustom,
          selectedInstanceId: analyzed.id,
        });

        setSettings(newSettings);
        setInstances((prev) => [...prev, analyzed]);
        setActiveInstance(analyzed);
        loadInstalledMods(analyzed.modsPath);
        addToast('success', 'Custom Folder Added', analyzed.name);
      }
    } catch (err: any) {
      addToast('error', 'Invalid Directory', err.message);
    }
  };

  const handleSelectInstance = (inst: MinecraftInstance) => {
    setActiveInstance(inst);
    window.api.settings.save({ selectedInstanceId: inst.id });
    loadInstalledMods(inst.modsPath);
    if (inst.detectedVersion) {
      setFilter((prev) => ({
        ...prev,
        version: inst.detectedVersion || '1.20.1',
        loader: inst.detectedLoader || 'fabric',
      }));
    }
  };

  const totalSizeMB = (
    installedMods.reduce((acc, m) => acc + m.fileSize, 0) /
    (1024 * 1024)
  ).toFixed(1);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f14] text-[#f8fafc]">
      {/* 1. Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        installedCount={installedMods.length}
        activeInstance={activeInstance}
        onOpenModsFolder={() =>
          activeInstance && window.api.mods.openFolder(activeInstance.modsPath)
        }
      />

      {/* 2. Main Central Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header & Filters */}
        <Header
          activeInstance={activeInstance}
          onOpenInstanceModal={() => setIsInstanceModalOpen(true)}
          filter={filter}
          onFilterChange={handleFilterChange}
          onRefresh={() => fetchMods(filter)}
          isLoading={isLoadingMods}
        />

        {/* Scrollable Stage Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentTab === 'explore' && (
            <>
              {/* Featured FPS Booster Pack Banner */}
              <FeaturedHero
                onInstallBundle={() =>
                  handleInstallBundle({
                    id: 'fps-booster',
                    title: 'FPS Booster Pack',
                    subtitle: 'Optimization Pack',
                    description: '',
                    targetLoader: 'fabric',
                    modSlugs: ['sodium', 'lithium', 'ferrite-core', 'entityculling'],
                    modNames: ['Sodium', 'Lithium', 'FerriteCore', 'Entity Culling'],
                    badge: 'FEATURED',
                  })
                }
                isInstalling={installingBundleId === 'fps-booster'}
                isInstalled={installedBundleIds.has('fps-booster')}
                activeLoader={filter.loader}
                activeVersion={filter.version}
              />

              {/* Mod Discovery Grid */}
              <ModGrid
                mods={mods}
                installedModSlugs={installedModSlugs}
                downloadItems={downloadItems}
                isLoading={isLoadingMods}
                onInstallMod={(m) => handleInstallMod(m)}
                onUninstallMod={handleUninstallMod}
                onSelectMod={(m) => setSelectedModForDetail(m)}
                onLoadMore={handleLoadMore}
                hasMore={mods.length < totalModsCount}
                onResetFilter={() =>
                  handleFilterChange({ query: '', category: 'all', offset: 0 })
                }
              />
            </>
          )}

          {currentTab === 'presets' && (
            <QuickPresets
              activeLoader={filter.loader}
              activeVersion={filter.version}
              onInstallBundle={handleInstallBundle}
              installingBundleId={installingBundleId}
              installedBundleIds={installedBundleIds}
            />
          )}

          {currentTab === 'installed' && (
            <InstalledModsView
              installedMods={installedMods}
              modsPath={activeInstance?.modsPath || '%APPDATA%\\.minecraft\\mods'}
              onToggleMod={handleToggleInstalledMod}
              onUninstallMod={handleDeleteInstalledMod}
              onBatchUninstall={handleBatchUninstall}
              onRefresh={() => activeInstance && loadInstalledMods(activeInstance.modsPath)}
              onOpenFolder={() =>
                activeInstance && window.api.mods.openFolder(activeInstance.modsPath)
              }
              isLoading={isLoadingInstalled}
            />
          )}

          {currentTab === 'settings' && (
            <LauncherSettings
              settings={settings}
              activeInstance={activeInstance}
              instances={instances}
              onSaveSettings={(updates) => {
                window.api.settings.save(updates).then((updated) => setSettings(updated));
                addToast('success', 'Settings Saved', 'Preferences updated successfully.');
              }}
              onOpenFolder={(p) => window.api.mods.openFolder(p)}
              onOpenInstanceModal={() => setIsInstanceModalOpen(true)}
            />
          )}
        </main>

        {/* 3. Bottom Status Bar (52px) */}
        <BottomStatusBar
          targetModsPath={activeInstance?.modsPath || '%APPDATA%\\.minecraft\\mods'}
          onEditPath={() => setIsInstanceModalOpen(true)}
          engineState={engineState}
          installedCount={installedMods.length}
          totalSizeMB={totalSizeMB}
          activeDownloadsCount={
            Array.from(downloadItems.values()).filter(
              (i) => i.status === 'downloading' || i.status === 'verifying'
            ).length
          }
          onOpenDownloadManager={() => setIsDownloadManagerOpen(true)}
        />
      </div>

      {/* Download Manager Modal */}
      <DownloadManagerModal
        isOpen={isDownloadManagerOpen}
        onClose={() => setIsDownloadManagerOpen(false)}
        downloadItems={Array.from(downloadItems.values())}
        onCancelDownload={handleCancelDownload}
        onClearCompleted={() => {
          setDownloadItems((prev) => {
            const next = new Map();
            for (const [k, v] of prev.entries()) {
              if (
                v.status === 'downloading' ||
                v.status === 'verifying' ||
                v.status === 'installing'
              ) {
                next.set(k, v);
              }
            }
            return next;
          });
        }}
      />

      {/* First Launch Onboarding Wizard */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onFinish={() => {
          setIsOnboardingOpen(false);
          window.api.settings.save({ firstLaunchDone: true });
        }}
        instances={instances}
        activeInstance={activeInstance}
        onSelectInstance={handleSelectInstance}
      />

      {/* Mod Detail Slide-Over Drawer */}
      <ModDetailDrawer
        mod={selectedModForDetail}
        isOpen={Boolean(selectedModForDetail)}
        onClose={() => setSelectedModForDetail(null)}
        isInstalled={
          Boolean(selectedModForDetail) &&
          (installedModSlugs.has(selectedModForDetail!.slug.toLowerCase()) ||
            installedModSlugs.has(selectedModForDetail!.project_id.toLowerCase()))
        }
        onInstall={(m, ver) => handleInstallMod(m, ver)}
        activeLoader={filter.loader}
        activeVersion={filter.version}
      />

      {/* Instance Switcher Modal */}
      <InstanceModal
        isOpen={isInstanceModalOpen}
        onClose={() => setIsInstanceModalOpen(false)}
        instances={instances}
        activeInstanceId={activeInstance?.id || null}
        onSelectInstance={handleSelectInstance}
        onAddCustomFolder={handleAddCustomFolder}
        onRescan={async () => {
          setIsScanningInstances(true);
          try {
            const scanned = await window.api.instances.scan();
            setInstances(scanned);
            addToast('success', 'Scan Complete', `Found ${scanned.length} installations.`);
          } finally {
            setIsScanningInstances(false);
          }
        }}
        isScanning={isScanningInstances}
      />

      {/* Destructive Action Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

