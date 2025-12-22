<script lang="ts">
  import { slide } from "svelte/transition";
  import { settings } from "$lib/stores/settings.svelte";
  import {
    boosterService,
    type Config,
    updateConfig as updateBoosterConfig,
    getAppsList as getAppsListFromFully,
    type AppListItem,
    isFullyKiosk,
  } from "learn-booster-kit";
  import { onMount, onDestroy } from "svelte";

  let config = $state<Config>();
  let unsubscribeConfig: () => void;
  let appList = $state<AppListItem[]>([]);
  let loadingApps = $state(false);

  // Subscribe to booster configuration
  onMount(async () => {
    // ensure booster service is initialized if enabled (or just init generally if safe)
    if (settings.boosterEnabled) {
      await boosterService.init();
    }

    unsubscribeConfig = boosterService.config.subscribe((v) => {
      config = v;
    });

    // Load apps if needed
    if (isFullyKiosk()) {
      loadingApps = true;
      try {
        appList = await getAppsListFromFully();
      } catch (e) {
        console.error("Failed to load apps", e);
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
      console.error("Failed to update config", e);
    }
  }

  function updateRewardType(type: "video" | "app" | "site") {
    if (!config) return;
    const newConfig = { ...config, rewardType: type };
    updateConfig(newConfig);
  }

  function updateVideoSource(source: "local" | "google-drive" | "youtube") {
    if (!config) return;
    const newConfig = {
      ...config,
      video: { ...config.video, source },
    };
    updateConfig(newConfig);
  }

  function updateBoosterUrl(url: string) {
    if (!config) return;
    const newConfig = {
      ...config,
      booster: { ...config.booster, siteUrl: url },
    };
    updateConfig(newConfig);
  }

  function updateAppPackage(packageName: string) {
    if (!config) return;
    const newConfig = {
      ...config,
      app: { ...config.app, packageName },
    };
    updateConfig(newConfig);
  }

  function updateNumberField(
    field: "turnsPerReward" | "rewardDisplayDurationMs",
    value: number
  ) {
    if (!config) return;
    const newConfig = { ...config, [field]: value };
    updateConfig(newConfig);
  }
</script>

<div
  class="space-y-8 text-right bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
  dir="rtl"
>
  <!-- === Game Settings Section === -->
  <section class="space-y-6">
    <h2 class="text-xl font-bold text-slate-800 border-b pb-2">הגדרות משחק</h2>

    <!-- Game Mode -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="font-bold text-slate-700">מצב משחק</div>
        <div class="text-sm text-slate-500">בחר את זרימת המשחק הרצויה</div>
      </div>
      <select
        bind:value={settings.gameMode}
        class="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
      >
        <option value="manual_end">ידני (עצירה בסיום שלב)</option>
        <option value="continuous">רציף (מעבר אוטומטי)</option>
      </select>
    </div>

    <!-- Numbers Range -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label for="max-a" class="block font-medium text-slate-700"
          >מקסימום קבוצה A</label
        >
        <input
          id="max-a"
          type="number"
          min="1"
          max="10"
          bind:value={settings.maxA}
          class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
      </div>
      <div class="space-y-2">
        <label for="max-b" class="block font-medium text-slate-700"
          >מקסימום קבוצה B</label
        >
        <input
          id="max-b"
          type="number"
          min="1"
          max="10"
          bind:value={settings.maxB}
          class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
      </div>
    </div>

    <!-- Interface Settings -->
    <div
      class="flex items-center justify-between border-t border-slate-100 pt-4"
    >
      <div class="space-y-1">
        <div class="font-bold text-slate-700">מספר אפשרויות</div>
      </div>
      <div class="flex gap-2 bg-slate-100 p-1 rounded-lg">
        <button
          class="px-4 py-1 rounded-md transition-colors"
          class:bg-white={settings.choicesCount === 2}
          class:shadow-sm={settings.choicesCount === 2}
          class:text-slate-500={settings.choicesCount !== 2}
          onclick={() => (settings.choicesCount = 2)}>2</button
        >
        <button
          class="px-4 py-1 rounded-md transition-colors"
          class:bg-white={settings.choicesCount === 3}
          class:shadow-sm={settings.choicesCount === 3}
          class:text-slate-500={settings.choicesCount !== 3}
          onclick={() => (settings.choicesCount = 3)}>3</button
        >
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="font-bold text-slate-700">מצב קלט</div>
      </div>
      <select
        bind:value={settings.inputMode}
        class="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
      >
        <option value="tap">לחיצה בלבד</option>
        <option value="drag">גרירה בלבד</option>
        <option value="both">גם וגם</option>
      </select>
    </div>

    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="font-bold text-slate-700">הקראת הוראות</div>
      </div>
      <button
        dir="ltr"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        class:bg-blue-600={settings.voiceEnabled}
        class:bg-slate-200={!settings.voiceEnabled}
        onclick={() => (settings.voiceEnabled = !settings.voiceEnabled)}
        aria-label="הקראת הוראות"
      >
        <span
          class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm"
          class:left-1={!settings.voiceEnabled}
          class:left-6={settings.voiceEnabled}
        ></span>
      </button>
    </div>
  </section>

  <!-- === Booster Settings Section === -->
  <section class="space-y-6 pt-4 border-t-2 border-slate-100">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h2 class="text-xl font-bold text-slate-800">
          חיזוקים (Gingim Booster)
        </h2>
        <div class="text-sm text-slate-500">
          הפעלת מנגנון חיזוקים לאחר הצלחה
        </div>
      </div>
      <button
        dir="ltr"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        class:bg-blue-600={settings.boosterEnabled}
        class:bg-slate-200={!settings.boosterEnabled}
        onclick={() => {
          settings.boosterEnabled = !settings.boosterEnabled;
          if (settings.boosterEnabled) boosterService.init();
        }}
        aria-label="הפעלת חיזוקים"
      >
        <span
          class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm"
          class:left-1={!settings.boosterEnabled}
          class:left-6={settings.boosterEnabled}
        ></span>
      </button>
    </div>

    {#if settings.boosterEnabled}
      {#if config}
        <div
          transition:slide={{ duration: 300, axis: "y" }}
          class="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200"
        >
          <!-- Reward Type -->
          <div class="space-y-2">
            <label
              for="reward-type-select"
              class="block font-medium text-slate-700">סוג פרס</label
            >
            <select
              id="reward-type-select"
              value={config.rewardType}
              onchange={(e) => updateRewardType(e.currentTarget.value as any)}
              class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="video">וידאו</option>
              <option value="app">אפליקציה</option>
              <option value="site">אתר</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Turns per Reward -->
            <div class="space-y-2">
              <label for="turns-input" class="block font-medium text-slate-700"
                >תורות לחיזוק</label
              >
              <input
                id="turns-input"
                type="number"
                min="1"
                value={config.turnsPerReward}
                onchange={(e) =>
                  updateNumberField(
                    "turnsPerReward",
                    parseInt(e.currentTarget.value)
                  )}
                class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-center"
              />
            </div>

            <!-- Display Duration -->
            <div class="space-y-2">
              <label
                for="duration-input"
                class="block font-medium text-slate-700">משך (שניות)</label
              >
              <input
                id="duration-input"
                type="number"
                min="1"
                value={Math.floor(config.rewardDisplayDurationMs / 1000)}
                onchange={(e) =>
                  updateNumberField(
                    "rewardDisplayDurationMs",
                    parseInt(e.currentTarget.value) * 1000
                  )}
                class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-center"
              />
            </div>
          </div>

          <!-- Specific Type Settings -->
          <div class="pt-2 border-t border-slate-200 mt-2">
            {#if config.rewardType === "video"}
              <div class="space-y-3">
                <div class="space-y-1">
                  <label
                    for="video-source-select"
                    class="text-sm font-medium text-slate-700"
                    >מקור הווידאו</label
                  >
                  <select
                    id="video-source-select"
                    value={config.video.source}
                    onchange={(e) =>
                      updateVideoSource(e.currentTarget.value as any)}
                    class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="local">תיקייה מקומית (Fully Kiosk)</option>
                    <option value="google-drive">גוגל דרייב</option>
                  </select>
                </div>

                {#if config.video.source === "google-drive"}
                  <div class="space-y-1">
                    <label
                      for="gdrive-folder-input"
                      class="text-sm font-medium text-slate-700"
                      >קישור לתיקייה</label
                    >
                    <input
                      id="gdrive-folder-input"
                      type="text"
                      value={config.video.googleDriveFolderUrl || ""}
                      onchange={(e) => {
                        const newConfig = {
                          ...config!,
                          video: {
                            ...config!.video,
                            googleDriveFolderUrl: e.currentTarget.value,
                          },
                        };
                        updateConfig(newConfig);
                      }}
                      placeholder="הדבק קישור לתיקיית דרייב..."
                      dir="ltr"
                      class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                {/if}
              </div>
            {:else if config.rewardType === "site"}
              <div class="space-y-2">
                <label
                  for="site-url-input"
                  class="text-sm font-medium text-slate-700">כתובת האתר</label
                >
                <input
                  id="site-url-input"
                  type="url"
                  value={config.booster.siteUrl}
                  onchange={(e) => updateBoosterUrl(e.currentTarget.value)}
                  placeholder="https://example.com"
                  dir="ltr"
                  class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            {:else if config.rewardType === "app"}
              <div class="space-y-2">
                <label
                  for="app-selection"
                  class="text-sm font-medium text-slate-700"
                  >בחירת אפליקציה</label
                >
                {#if loadingApps}
                  <div class="text-xs text-slate-500">
                    טוען רשימת אפליקציות...
                  </div>
                {:else if appList.length > 0}
                  <select
                    id="app-selection"
                    value={config.app.packageName}
                    onchange={(e) => updateAppPackage(e.currentTarget.value)}
                    class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="text-center text-slate-400 py-4 animate-pulse">
          טוען הגדרות...
        </div>
      {/if}
    {/if}
  </section>
</div>
