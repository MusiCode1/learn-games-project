<script lang="ts">
  import { goto } from "$app/navigation";
  import { slide } from "svelte/transition";
  import { settings } from "$lib/stores/settings.svelte";
  import {
    boosterService,
    type Config,
    updateConfig as updateBoosterConfig,
    getAppsList as getAppsListFromFully,
    type AppListItem,
    isFullyKiosk,
    OverlayTimerSettings,
  } from "learn-booster-kit";
  import { onMount, onDestroy } from "svelte";

  let config = $state<Config>();
  let unsubscribeConfig: () => void;
  let appList = $state<AppListItem[]>([]);
  let loadingApps = $state(false);
  let showPasscode = $state(false);

  onMount(async () => {
    if (settings.boosterEnabled) {
      await boosterService.init();
    }

    unsubscribeConfig = boosterService.config.subscribe((v) => {
      config = v;
    });

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

  function handleBack() {
    goto("/");
  }

  async function updateConfig(newConfig: Config) {
    try {
      config = newConfig;
      config = await updateBoosterConfig(newConfig);
    } catch (e) {
      console.error("Failed to update config", e);
    }
  }

  function updateRewardType(type: "video" | "app" | "site") {
    if (!config) return;
    updateConfig({ ...config, rewardType: type });
  }

  function updateVideoSource(source: "local" | "google-drive" | "youtube") {
    if (!config) return;
    updateConfig({ ...config, video: { ...config.video, source } });
  }

  function updateBoosterUrl(url: string) {
    if (!config) return;
    updateConfig({ ...config, booster: { ...config.booster, siteUrl: url } });
  }

  function updateAppPackage(packageName: string) {
    if (!config) return;
    updateConfig({ ...config, app: { ...config.app, packageName } });
  }

  function updateNumberField(
    field: "turnsPerReward" | "rewardDisplayDurationMs",
    value: number,
  ) {
    if (!config) return;
    updateConfig({ ...config, [field]: value });
  }

  // ולידציה: רק ספרות
  function handlePasscodeInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    const cleaned = target.value.replace(/\D/g, "");
    settings.passcode = cleaned;
    target.value = cleaned;
  }
</script>

<svelte:head>
  <title>הגדרות - תרגול סיסמא</title>
</svelte:head>

<main class="flex-1 overflow-y-auto p-4 md:p-8" dir="rtl">
  <div class="mx-auto max-w-lg">

    <!-- כותרת -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-black text-white">⚙️ הגדרות</h1>
      <button
        onclick={handleBack}
        class="rounded-xl bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-600"
      >
        חזרה
      </button>
    </div>

    <div class="space-y-6">

      <!-- === סיסמא === -->
      <div class="rounded-2xl bg-white/10 p-5 shadow-md space-y-3">
        <label for="passcode-input" class="block text-lg font-bold text-white">
          הסיסמא לתרגול
        </label>
        <p class="text-sm text-slate-300">הזן את קוד הגישה של האייפד (ספרות בלבד)</p>

        <div class="flex items-center gap-2">
          <input
            id="passcode-input"
            type={showPasscode ? "text" : "password"}
            value={settings.passcode}
            oninput={handlePasscodeInput}
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="8"
            dir="ltr"
            placeholder="1234"
            class="flex-1 rounded-xl border-2 border-white/20 bg-white/10 p-3 text-2xl
                   tracking-widest text-white placeholder:text-slate-400 text-center
                   focus:border-white/50 focus:outline-none"
          />
          <button
            onclick={() => (showPasscode = !showPasscode)}
            class="rounded-xl bg-slate-600/50 px-3 py-3 text-white transition-colors hover:bg-slate-500/60"
            aria-label={showPasscode ? "הסתר סיסמא" : "הצג סיסמא"}
          >
            {showPasscode ? "🙈" : "👁️"}
          </button>
        </div>

        {#if !settings.isPasscodeValid && settings.passcode.length > 0}
          <p class="text-sm text-red-400">הסיסמא חייבת להכיל ספרות בלבד</p>
        {/if}

        <p class="text-sm text-slate-400">
          אורך הסיסמא: {settings.passcode.length} ספרות
        </p>
      </div>

      <!-- === הצגת רמז === -->
      <div class="rounded-2xl bg-white/10 p-5 shadow-md">
        <label class="flex cursor-pointer items-center justify-between">
          <div>
            <span class="text-lg font-bold text-white">הצג רמז מעל הלוח</span>
            <p class="text-sm text-slate-300">תצוגת הסיסמא לתרגול ראשוני עם הדגמה</p>
          </div>
          <input
            type="checkbox"
            bind:checked={settings.showHint}
            class="h-6 w-6 accent-blue-400"
          />
        </label>
      </div>

      <!-- === זמן cooldown === -->
      <div class="rounded-2xl bg-white/10 p-5 shadow-md">
        <label for="cooldown-range" class="block text-lg font-bold text-white mb-3">
          זמן המתנה בטעות: {(settings.cooldownMs / 1000).toFixed(0)} שניות
        </label>
        <input
          id="cooldown-range"
          type="range"
          bind:value={settings.cooldownMs}
          min="500"
          max="8000"
          step="500"
          class="w-full accent-blue-400"
        />
        <div class="flex justify-between text-sm text-slate-400 mt-1">
          <span>0.5</span>
          <span>8</span>
        </div>
      </div>

      <!-- === הקראה === -->
      <div class="rounded-2xl bg-white/10 p-5 shadow-md space-y-3">
        <label class="flex cursor-pointer items-center justify-between">
          <div>
            <span class="text-lg font-bold text-white">הקראת משוב</span>
            <p class="text-sm text-slate-300">הקראת "כל הכבוד" / "נסה שוב" בקול</p>
          </div>
          <input
            type="checkbox"
            bind:checked={settings.voiceEnabled}
            class="h-6 w-6 accent-blue-400"
          />
        </label>

        {#if settings.voiceEnabled}
          <label
            transition:slide={{ duration: 200 }}
            class="flex cursor-pointer items-center justify-between border-t border-white/10 pt-3"
          >
            <div>
              <span class="font-medium text-white">קריאת ספרות</span>
              <p class="text-sm text-slate-300">קריאת כל ספרה בעת לחיצה</p>
            </div>
            <input
              type="checkbox"
              bind:checked={settings.speakDigits}
              class="h-6 w-6 accent-blue-400"
            />
          </label>
        {/if}
      </div>

      <!-- === חיזוקים === -->
      <div class="rounded-2xl bg-white/10 p-5 shadow-md space-y-4">
        <label class="flex cursor-pointer items-center justify-between">
          <div>
            <span class="text-lg font-bold text-white">חיזוקים (Gingim Booster)</span>
            <p class="text-sm text-slate-300">הפעלת מנגנון חיזוקים לאחר הצלחה</p>
          </div>
          <input
            type="checkbox"
            checked={settings.boosterEnabled}
            onchange={() => {
              settings.boosterEnabled = !settings.boosterEnabled;
              if (settings.boosterEnabled) boosterService.init();
            }}
            class="h-6 w-6 accent-blue-400"
          />
        </label>

        {#if settings.boosterEnabled}
          {#if config}
            <div
              transition:slide={{ duration: 300, axis: "y" }}
              class="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <!-- סוג פרס -->
              <div class="space-y-2">
                <label for="reward-type-select" class="block text-sm font-medium text-white">
                  סוג פרס
                </label>
                <select
                  id="reward-type-select"
                  value={config.rewardType}
                  onchange={(e) => updateRewardType(e.currentTarget.value as any)}
                  class="w-full rounded-lg border border-white/20 bg-slate-700 px-3 py-2 text-sm
                         text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="video">וידאו</option>
                  <option value="app">אפליקציה</option>
                  <option value="site">אתר</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <!-- תורות לחיזוק -->
                <div class="space-y-2">
                  <label for="turns-input" class="block text-sm font-medium text-white">
                    הצלחות לפרס
                  </label>
                  <input
                    id="turns-input"
                    type="number"
                    min="1"
                    value={config.turnsPerReward}
                    onchange={(e) =>
                      updateNumberField("turnsPerReward", parseInt(e.currentTarget.value))}
                    class="w-full rounded-lg border border-white/20 bg-slate-700 px-3 py-2
                           text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- משך פרס -->
                <div class="space-y-2">
                  <label for="duration-input" class="block text-sm font-medium text-white">
                    משך (שניות)
                  </label>
                  <input
                    id="duration-input"
                    type="number"
                    min="1"
                    value={Math.floor(config.rewardDisplayDurationMs / 1000)}
                    onchange={(e) =>
                      updateNumberField("rewardDisplayDurationMs", parseInt(e.currentTarget.value) * 1000)}
                    class="w-full rounded-lg border border-white/20 bg-slate-700 px-3 py-2
                           text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- בדיקת מחזק -->
              <button
                onclick={async () => { await boosterService.triggerReward(); }}
                class="w-full rounded-lg border border-blue-500/30 bg-blue-600/30 px-4 py-2
                       text-sm font-bold text-blue-200 transition-colors hover:bg-blue-600/50"
              >
                בדיקת מחזק
              </button>

              <!-- הגדרות טיימר אוברליי -->
              <div class="mt-2 border-t border-white/10 pt-2">
                <OverlayTimerSettings />
              </div>

              <!-- הגדרות ספציפיות לסוג -->
              <div class="mt-2 border-t border-white/10 pt-2">
                {#if config.rewardType === "video"}
                  <div class="space-y-3">
                    <div class="space-y-1">
                      <label for="video-source-select" class="text-sm font-medium text-white">
                        מקור הווידאו
                      </label>
                      <select
                        id="video-source-select"
                        value={config.video.source}
                        onchange={(e) => updateVideoSource(e.currentTarget.value as any)}
                        class="w-full rounded-lg border border-white/20 bg-slate-700 px-3 py-2
                               text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="local">תיקייה מקומית (Fully Kiosk)</option>
                        <option value="google-drive">גוגל דרייב</option>
                      </select>
                    </div>

                    {#if config.video.source === "google-drive"}
                      <div class="space-y-1">
                        <label for="gdrive-folder-input" class="text-sm font-medium text-white">
                          קישור לתיקייה
                        </label>
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
                          class="w-full rounded-lg border border-white/20 bg-slate-700 px-3 py-2
                                 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    {/if}
                  </div>
                {:else if config.rewardType === "site"}
                  <div class="space-y-2">
                    <label for="site-url-input" class="text-sm font-medium text-white">
                      כתובת האתר
                    </label>
                    <input
                      id="site-url-input"
                      type="url"
                      value={config.booster.siteUrl}
                      onchange={(e) => updateBoosterUrl(e.currentTarget.value)}
                      placeholder="https://example.com"
                      dir="ltr"
                      class="w-full rounded-lg border border-white/20 bg-slate-700 px-3 py-2
                             text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                {:else if config.rewardType === "app"}
                  <div class="space-y-2">
                    <label for="app-selection" class="text-sm font-medium text-white">
                      בחירת אפליקציה
                    </label>
                    {#if loadingApps}
                      <div class="text-xs text-slate-400">טוען רשימת אפליקציות...</div>
                    {:else if appList.length > 0}
                      <select
                        id="app-selection"
                        value={config.app.packageName}
                        onchange={(e) => updateAppPackage(e.currentTarget.value)}
                        class="w-full rounded-lg border border-white/20 bg-slate-700 px-3 py-2
                               text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">בחר אפליקציה...</option>
                        {#each appList as app}
                          <option value={app.package}>{app.label}</option>
                        {/each}
                      </select>
                    {:else}
                      <div class="text-xs text-orange-400">
                        לא נמצאו אפליקציות (האם Fully Kiosk פעיל?)
                      </div>
                      <input
                        id="app-selection"
                        type="text"
                        value={config.app.packageName}
                        onchange={(e) => updateAppPackage(e.currentTarget.value)}
                        placeholder="שם חבילה (למשל com.example.app)"
                        dir="ltr"
                        class="mt-1 w-full rounded-lg border border-white/20 bg-slate-700 px-3 py-2
                               text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          {:else}
            <div class="animate-pulse py-4 text-center text-slate-400">
              טוען הגדרות...
            </div>
          {/if}
        {/if}
      </div>

      <!-- === איפוס === -->
      <button
        onclick={() => settings.reset()}
        class="w-full rounded-2xl border border-red-500/30 bg-red-900/30 p-4
               text-lg font-bold text-red-300 transition-colors hover:bg-red-900/50"
      >
        🔄 איפוס להגדרות ברירת מחדל
      </button>

    </div>
  </div>
</main>
