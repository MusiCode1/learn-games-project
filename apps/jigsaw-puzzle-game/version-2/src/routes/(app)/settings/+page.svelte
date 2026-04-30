<script lang="ts">
  import { goto } from "$app/navigation";
  import { slide } from "svelte/transition";
  import { settings } from "$lib/stores/settings.svelte";
  import { ALL_IMAGE_PACKS } from "$lib/data/image-packs";
  import { GRID_PRESETS, BEGINNER_MAX_GRID_INDEX } from "$lib/types";
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
</script>

<svelte:head>
  <title>הגדרות - פאזל</title>
</svelte:head>

<main class="flex-1 overflow-y-auto p-4 md:p-8">
  <div class="mx-auto max-w-lg">
    <!-- כותרת -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-black text-slate-800">⚙️ הגדרות</h1>
      <button
        onclick={handleBack}
        class="rounded-xl bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-600"
      >
        חזרה
      </button>
    </div>

    <div class="space-y-6">
      <!-- מצב מתחילים -->
      <div class="rounded-2xl bg-amber-50 p-5 shadow-md border-2 border-amber-200">
        <label class="flex items-center justify-between">
          <div>
            <span class="text-lg font-bold text-slate-700">מצב מתחילים</span>
            <p class="text-sm text-slate-500">
              ללא הגדלה/הקטנה. החלקים מסודרים במיקום קבוע על המסך.
              מוגבל עד {GRID_PRESETS[BEGINNER_MAX_GRID_INDEX].label}.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.beginnerMode}
            onchange={() => settings.setBeginnerMode(!settings.beginnerMode)}
            class="h-6 w-6 accent-amber-500"
          />
        </label>
      </div>

      <!-- מצב נעילה לתלמידים -->
      <div class="rounded-2xl bg-rose-50 p-5 shadow-md border-2 border-rose-200">
        <label class="flex items-center justify-between">
          <div>
            <span class="text-lg font-bold text-slate-700">מצב נעילה לתלמידים</span>
            <p class="text-sm text-slate-500">
              מסתיר את כפתור הבית העליון בזמן המשחק
            </p>
          </div>
          <input
            type="checkbox"
            bind:checked={settings.studentLockMode}
            class="h-6 w-6 accent-rose-500"
          />
        </label>
      </div>

      <!-- כפתור סידור מחדש -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="flex items-center justify-between">
          <div>
            <span class="text-lg font-bold text-slate-700">כפתור סידור מחדש</span>
            <p class="text-sm text-slate-500">
              מציג כפתור ליד שם הפאזל שמסדר מחדש את החלקים שלא חוברו
            </p>
          </div>
          <input
            type="checkbox"
            bind:checked={settings.showRearrangeButton}
            class="h-6 w-6 accent-sky-500"
          />
        </label>
      </div>

      <!-- חבילת תמונות -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="block text-lg font-bold text-slate-700 mb-3">
          חבילת תמונות
        </label>
        <select
          bind:value={settings.imagePackId}
          class="w-full rounded-xl border-2 border-slate-300 p-3 text-lg"
        >
          {#each ALL_IMAGE_PACKS as pack}
            <option value={pack.id}>{pack.icon} {pack.name}</option>
          {/each}
        </select>
      </div>

      <!-- גודל רשת -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="block text-lg font-bold text-slate-700 mb-3">
          גודל פאזל: {GRID_PRESETS[settings.gridPresetIndex].label}
        </label>
        <div class="flex flex-wrap gap-2">
          {#each GRID_PRESETS as preset, i}
            {@const disabled = settings.beginnerMode && i > BEGINNER_MAX_GRID_INDEX}
            <button
              onclick={() => { if (!disabled) settings.gridPresetIndex = i; }}
              {disabled}
              class="rounded-lg px-3 py-2 text-sm font-bold transition-all {settings.gridPresetIndex === i
                ? 'bg-sky-500 text-white shadow-lg'
                : disabled
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
            >
              {preset.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- סגנון צורה -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="block text-lg font-bold text-slate-700 mb-3">
          סגנון חלקים
        </label>
        <select
          bind:value={settings.shapeStyle}
          class="w-full rounded-xl border-2 border-slate-300 p-3 text-lg"
        >
          <option value="classic">קלאסי (פטרייה)</option>
          <option value="triangle">משולש</option>
          <option value="round">עגול</option>
          <option value="straight">ישר (ללא חיבורים)</option>
        </select>
      </div>

      <!-- רגישות snap -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="block text-lg font-bold text-slate-700 mb-3">
          רגישות חיבור: {settings.proximity}
        </label>
        <input
          type="range"
          bind:value={settings.proximity}
          min="20"
          max="80"
          step="5"
          class="w-full accent-sky-500"
        />
        <div class="flex justify-between text-sm text-slate-500 mt-1">
          <span>מדויק</span>
          <span>מקל</span>
        </div>
      </div>

      <!-- פירוק חלקים -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md space-y-4">
        <label class="flex items-center justify-between">
          <div>
            <span class="text-lg font-bold text-slate-700">אפשר פירוק חלקים</span>
            <p class="text-sm text-slate-500">ניתן לפרק חלקים שכבר חוברו (כרגע לא פעיל)</p>
          </div>
          <input
            type="checkbox"
            bind:checked={settings.allowDisconnect}
            class="h-6 w-6 accent-sky-500"
          />
        </label>
      </div>

      <!-- סינון חלקים -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="block text-lg font-bold text-slate-700 mb-3">
          הצגת חלקים
        </label>
        <select
          bind:value={settings.pieceFilter}
          class="w-full rounded-xl border-2 border-slate-300 p-3 text-lg"
        >
          <option value="all">כל החלקים</option>
          <option value="border_only">מסגרת בלבד</option>
        </select>
        {#if settings.pieceFilter === "border_only"}
          <p class="text-sm text-slate-500 mt-2">
            חלקי הפנים ימוקמו מראש — רק חלקי המסגרת יפוזרו
          </p>
        {/if}
      </div>

      <!-- תמונת עזר -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="flex items-center justify-between">
          <span class="text-lg font-bold text-slate-700">תמונת עזר</span>
          <input
            type="checkbox"
            bind:checked={settings.showReferenceImage}
            class="h-6 w-6 accent-sky-500"
          />
        </label>
      </div>

      <!-- ערבוב תמונות -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="flex items-center justify-between">
          <span class="text-lg font-bold text-slate-700">ערבוב תמונות</span>
          <input
            type="checkbox"
            bind:checked={settings.shuffleImages}
            class="h-6 w-6 accent-sky-500"
          />
        </label>
      </div>

      <!-- ערבוב חלקים -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="flex items-center justify-between">
          <div>
            <span class="text-lg font-bold text-slate-700">ערבוב חלקים</span>
            <p class="text-sm text-slate-500">
              כשכבוי — החלקים מסודרים בשורה במיקום קבוע
            </p>
          </div>
          <input
            type="checkbox"
            bind:checked={settings.shufflePiecePlacement}
            class="h-6 w-6 accent-sky-500"
          />
        </label>
      </div>

      <!-- מצב משחק -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="block text-lg font-bold text-slate-700 mb-3">
          מצב משחק
        </label>
        <select
          bind:value={settings.gameMode}
          class="w-full rounded-xl border-2 border-slate-300 p-3 text-lg"
        >
          <option value="manual_end">ידני — כפתור "הבא"</option>
          <option value="continuous">רציף — מעבר אוטומטי</option>
        </select>
      </div>

      <!-- כפתור המשך לצד פרס -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="flex items-center justify-between">
          <div>
            <span class="text-lg font-bold text-slate-700">כפתור "המשך" לצד פרס</span>
            <p class="text-sm text-slate-500">מציג כפתור "המשך לפאזל הבא" לצד "קבל פרס"</p>
          </div>
          <input
            type="checkbox"
            bind:checked={settings.showContinueButton}
            class="h-6 w-6 accent-sky-500"
          />
        </label>
      </div>

      <!-- הקראה -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md">
        <label class="flex items-center justify-between">
          <div>
            <span class="text-lg font-bold text-slate-700">הקראת משוב</span>
            <p class="text-sm text-slate-500">הקראת שם התמונה בסיום פאזל</p>
          </div>
          <input
            type="checkbox"
            bind:checked={settings.voiceEnabled}
            class="h-6 w-6 accent-sky-500"
          />
        </label>
      </div>

      <!-- חיזוקים (Booster) -->
      <div class="rounded-2xl bg-white/80 p-5 shadow-md space-y-4">
        <label class="flex items-center justify-between">
          <div>
            <span class="text-lg font-bold text-slate-700">חיזוקים (Gingim Booster)</span>
            <p class="text-sm text-slate-500">הפעלת מנגנון חיזוקים לאחר הצלחה</p>
          </div>
          <input
            type="checkbox"
            checked={settings.boosterEnabled}
            onchange={() => {
              settings.boosterEnabled = !settings.boosterEnabled;
              if (settings.boosterEnabled) boosterService.init();
            }}
            class="h-6 w-6 accent-sky-500"
          />
        </label>

        {#if settings.boosterEnabled}
          {#if config}
            <div
              transition:slide={{ duration: 300, axis: "y" }}
              class="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200"
            >
              <!-- סוג פרס -->
              <div class="space-y-2">
                <label for="reward-type-select" class="block font-medium text-slate-700">
                  סוג פרס
                </label>
                <select
                  id="reward-type-select"
                  value={config.rewardType}
                  onchange={(e) => updateRewardType(e.currentTarget.value as any)}
                  class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700"
                >
                  <option value="video">וידאו</option>
                  <option value="app">אפליקציה</option>
                  <option value="site">אתר</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <!-- תורות לחיזוק -->
                <div class="space-y-2">
                  <label for="turns-input" class="block font-medium text-slate-700">
                    פאזלים לחיזוק
                  </label>
                  <input
                    id="turns-input"
                    type="number"
                    min="1"
                    value={config.turnsPerReward}
                    onchange={(e) =>
                      updateNumberField("turnsPerReward", parseInt(e.currentTarget.value))}
                    class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 text-center"
                  />
                </div>

                <!-- משך פרס -->
                <div class="space-y-2">
                  <label for="duration-input" class="block font-medium text-slate-700">
                    משך (שניות)
                  </label>
                  <input
                    id="duration-input"
                    type="number"
                    min="1"
                    value={Math.floor(config.rewardDisplayDurationMs / 1000)}
                    onchange={(e) =>
                      updateNumberField("rewardDisplayDurationMs", parseInt(e.currentTarget.value) * 1000)}
                    class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 text-center"
                  />
                </div>
              </div>

              <!-- בדיקת מחזק -->
              <button
                onclick={async () => { await boosterService.triggerReward(); }}
                class="w-full rounded-lg bg-sky-100 px-4 py-2 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-200"
              >
                בדיקת מחזק
              </button>

              <!-- הגדרות טיימר אוברליי -->
              <div class="pt-2 border-t border-slate-200 mt-2">
                <OverlayTimerSettings />
              </div>

              <!-- הגדרות ספציפיות לסוג -->
              <div class="pt-2 border-t border-slate-200 mt-2">
                {#if config.rewardType === "video"}
                  <div class="space-y-3">
                    <div class="space-y-1">
                      <label for="video-source-select" class="text-sm font-medium text-slate-700">
                        מקור הווידאו
                      </label>
                      <select
                        id="video-source-select"
                        value={config.video.source}
                        onchange={(e) => updateVideoSource(e.currentTarget.value as any)}
                        class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="local">תיקייה מקומית (Fully Kiosk)</option>
                        <option value="google-drive">גוגל דרייב</option>
                      </select>
                    </div>

                    {#if config.video.source === "google-drive"}
                      <div class="space-y-1">
                        <label for="gdrive-folder-input" class="text-sm font-medium text-slate-700">
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
                          class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    {/if}
                  </div>
                {:else if config.rewardType === "site"}
                  <div class="space-y-2">
                    <label for="site-url-input" class="text-sm font-medium text-slate-700">
                      כתובת האתר
                    </label>
                    <input
                      id="site-url-input"
                      type="url"
                      value={config.booster.siteUrl}
                      onchange={(e) => updateBoosterUrl(e.currentTarget.value)}
                      placeholder="https://example.com"
                      dir="ltr"
                      class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                {:else if config.rewardType === "app"}
                  <div class="space-y-2">
                    <label for="app-selection" class="text-sm font-medium text-slate-700">
                      בחירת אפליקציה
                    </label>
                    {#if loadingApps}
                      <div class="text-xs text-slate-500">טוען רשימת אפליקציות...</div>
                    {:else if appList.length > 0}
                      <select
                        id="app-selection"
                        value={config.app.packageName}
                        onchange={(e) => updateAppPackage(e.currentTarget.value)}
                        class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                        class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 mt-1"
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
      </div>

      <!-- איפוס -->
      <button
        onclick={() => settings.reset()}
        class="w-full rounded-2xl bg-red-100 p-4 text-lg font-bold text-red-600 transition-colors hover:bg-red-200"
      >
        🔄 איפוס להגדרות ברירת מחדל
      </button>
    </div>
  </div>
</main>
