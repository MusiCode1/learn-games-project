<script lang="ts">
	import { slide } from 'svelte/transition';
	import { settings } from '$lib/stores/settings.svelte';
	import {
		boosterService,
		type Config,
		updateConfig as updateBoosterConfig,
		getAppsList as getAppsListFromFully,
		type AppListItem,
		isFullyKiosk
	} from 'learn-booster-kit';
	import { onMount, onDestroy } from 'svelte';

	let config = $state<Config>();
	let unsubscribeConfig: () => void;
	let appList = $state<AppListItem[]>([]);
	let loadingApps = $state(false);

	// Subscribe to booster configuration
	onMount(async () => {
		await boosterService.init();
		unsubscribeConfig = boosterService.config.subscribe((v) => {
			config = v;
		});

		// Load apps if needed
		if (isFullyKiosk()) {
			loadingApps = true;
			try {
				appList = await getAppsListFromFully();
			} catch (e) {
				console.error('Failed to load apps', e);
			} finally {
				loadingApps = false;
			}
		}
	});

	onDestroy(() => {
		if (unsubscribeConfig) unsubscribeConfig();
	});

	// Helper to update config
	async function updateConfig(newConfig: Config) {
		try {
			// Optimistic update
			config = newConfig;
			// Persist
			config = await updateBoosterConfig(newConfig);
		} catch (e) {
			console.error('Failed to update config', e);
		}
	}

	function updateRewardType(type: 'video' | 'app' | 'site') {
		if (!config) return;
		const newConfig = { ...config, rewardType: type };
		updateConfig(newConfig);
	}

	function updateVideoSource(source: 'local' | 'google-drive' | 'youtube') {
		if (!config) return;
		const newConfig = {
			...config,
			video: { ...config.video, source }
		};
		updateConfig(newConfig);
	}

	function updateBoosterUrl(url: string) {
		if (!config) return;
		const newConfig = {
			...config,
			booster: { ...config.booster, siteUrl: url }
		};
		updateConfig(newConfig);
	}

	function updateAppPackage(packageName: string) {
		if (!config) return;
		const newConfig = {
			...config,
			app: { ...config.app, packageName }
		};
		updateConfig(newConfig);
	}

	function updateNumberField(field: 'turnsPerReward' | 'rewardDisplayDurationMs', value: number) {
		if (!config) return;
		const newConfig = { ...config, [field]: value };
		updateConfig(newConfig);
	}
</script>

<div class="space-y-4 text-right" dir="rtl">
    <!-- Main Toggle for Booster -->
    <div class="flex items-center justify-between py-2 border-b border-gray-100">
        <div class="space-y-1">
            <div class="font-bold text-gray-800">חיזוקים (Gingim Booster)</div>
            <div class="text-xs text-gray-500">הפעלת מנגנון חיזוקים לאחר הצלחה</div>
        </div>
        <button
            dir="ltr"
            aria-label="הפעלת חיזוקים"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            class:bg-blue-600={settings.boosterEnabled}
            class:bg-gray-200={!settings.boosterEnabled}
            onclick={() => {
                settings.boosterEnabled = !settings.boosterEnabled;
                if (settings.boosterEnabled) boosterService.init();
            }}
        >
            <span
                class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm"
                class:left-1={!settings.boosterEnabled}
                class:left-6={settings.boosterEnabled}
            ></span>
        </button>
    </div>

    {#if settings.boosterEnabled && config}
        <div transition:slide={{ duration: 300, axis: 'y' }} class="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            
            <!-- Auto Loop -->
            <div class="flex items-center justify-between">
                <div class="space-y-1">
                    <div class="font-medium text-gray-700">לולאה אוטומטית</div>
                    <div class="text-xs text-gray-500">הפעלת מחזק וחזרה אוטומטית למשחק</div>
                </div>
                <button
                    dir="ltr"
                    aria-label="לולאה אוטומטית"
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    class:bg-blue-600={settings.autoBoosterLoop}
                    class:bg-gray-200={!settings.autoBoosterLoop}
                    onclick={() => (settings.autoBoosterLoop = !settings.autoBoosterLoop)}
                >
                    <span
                        class="absolute top-1 inline-block h-3 w-3 rounded-full bg-white transition-all duration-200 shadow-sm"
                        class:left-1={!settings.autoBoosterLoop}
                        class:left-5={settings.autoBoosterLoop}
                    ></span>
                </button>
            </div>

            <!-- Reward Type -->
            <div class="space-y-2">
                <label for="reward-type-select" class="block font-medium text-gray-700">סוג פרס</label>
                <select
                    id="reward-type-select"
                    value={config.rewardType}
                    onchange={(e) => updateRewardType(e.currentTarget.value as any)}
                    class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                >
                    <option value="video">וידאו</option>
                    <option value="app">אפליקציה</option>
                    <option value="site">אתר</option>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <!-- Turns per Reward -->
                <div class="space-y-2">
                    <label for="turns-input" class="block font-medium text-gray-700">תורות לחיזוק</label>
                    <input
                        id="turns-input"
                        type="number"
                        min="1"
                        bind:value={settings.turnsPerReward}
                        onchange={(e) => updateNumberField('turnsPerReward', parseInt(e.currentTarget.value))}
                        class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-center"
                    />
                </div>

                <!-- Display Duration -->
                <div class="space-y-2">
                    <label for="duration-input" class="block font-medium text-gray-700">משך (שניות)</label>
                    <input
                        id="duration-input"
                        type="number"
                        min="1"
                        value={Math.floor(config.rewardDisplayDurationMs / 1000)}
                        onchange={(e) =>
                            updateNumberField('rewardDisplayDurationMs', parseInt(e.currentTarget.value) * 1000)}
                        class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-center"
                    />
                </div>
            </div>

            <!-- Specific Type Settings -->
            <div class="pt-2 border-t border-gray-200">
                {#if config.rewardType === 'video'}
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <label for="video-source-select" class="text-sm font-medium text-gray-700"
                                >מקור הווידאו</label
                            >
                            <select
                                id="video-source-select"
                                value={config.video.source}
                                onchange={(e) => updateVideoSource(e.currentTarget.value as any)}
                                class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="local">תיקייה מקומית (Fully Kiosk)</option>
                                <option value="google-drive">גוגל דרייב</option>
                            </select>
                        </div>

                        {#if config.video.source === 'google-drive'}
                            <div class="space-y-1">
                                <label for="gdrive-folder-input" class="text-sm font-medium text-gray-700"
                                    >קישור לתיקייה</label
                                >
                                <input
                                    id="gdrive-folder-input"
                                    type="text"
                                    value={config.video.googleDriveFolderUrl || ''}
                                    onchange={(e) => {
                                        const newConfig = {
                                            ...config!,
                                            video: { ...config!.video, googleDriveFolderUrl: e.currentTarget.value }
                                        };
                                        updateConfig(newConfig);
                                    }}
                                    placeholder="הדבק קישור לתיקיית דרייב..."
                                    dir="ltr"
                                    class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        {/if}
                    </div>
                {:else if config.rewardType === 'site'}
                    <div class="space-y-2">
                        <label for="site-url-input" class="text-sm font-medium text-gray-700"
                            >כתובת האתר</label
                        >
                        <input
                            id="site-url-input"
                            type="url"
                            value={config.booster.siteUrl}
                            onchange={(e) => updateBoosterUrl(e.currentTarget.value)}
                            placeholder="https://example.com"
                            dir="ltr"
                            class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                {:else if config.rewardType === 'app'}
                    <div class="space-y-2">
                        <label for="app-selection" class="text-sm font-medium text-gray-700"
                            >בחירת אפליקציה</label
                        >
                        {#if loadingApps}
                            <div class="text-xs text-gray-500">טוען רשימת אפליקציות...</div>
                        {:else if appList.length > 0}
                            <select
                                id="app-selection"
                                value={config.app.packageName}
                                onchange={(e) => updateAppPackage(e.currentTarget.value)}
                                class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">בחר אפליקציה...</option>
                                {#each appList as app}
                                    <option value={app.package}>{app.label}</option>
                                {/each}
                            </select>
                        {:else}
                            <div class="text-xs text-orange-500">
                                לא נמצאו אפליקציות (האם Fully Kiosk פעיל?)
                            </div>
                            <input
                                id="app-selection"
                                type="text"
                                value={config.app.packageName}
                                onchange={(e) => updateAppPackage(e.currentTarget.value)}
                                placeholder="שם חבילה (למשל com.example.app)"
                                dir="ltr"
                                class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                            />
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    {:else if settings.boosterEnabled}
        <div class="text-center text-gray-400 text-sm py-4">טוען הגדרות...</div>
    {/if}
</div>
