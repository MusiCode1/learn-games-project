<script lang="ts">
  import type { AppListItem, Config, SettingsController } from "../../types";
  import { onMount } from "svelte";
  import * as configManager from "../../lib/config-manager";
  import { log } from "../../lib/logger.svelte";
  import { isFullyKiosk } from "../../lib/fully-kiosk";
  import { getAppsList as getAppsListFromFully } from "../../lib/get-app-list";

  interface Props {
    config: Config;
    controller?: SettingsController;
    handleShowVideo: (newConfig: Config) => void;
  }

  let {
    config,
    controller = $bindable(),
    handleShowVideo = $bindable(),
  }: Props = $props();

  const msToSec = (n: number) => Math.floor(n / 1000);

  const isNotFullyKiosk = !isFullyKiosk();

  const disabledAppMode =
    config.environmentMode !== "development" && isNotFullyKiosk;

  $inspect("disabledAppMode:", disabledAppMode);

  let saveStatus = $state<"success" | "error" | null>(null);
  let saveStatusTimeoutHandle: NodeJS.Timeout;

  let newConfig = $state(structuredClone(config));

  let videoDisplayTime = $state(msToSec(config.rewardDisplayDurationMs));

  let videoDisplayTimeInSec = $derived(videoDisplayTime * 1000);

  async function onSaveHandle() {
    newConfig.rewardDisplayDurationMs = videoDisplayTimeInSec;

    config = await configManager.updateConfig($state.snapshot(newConfig));

    const saved = configManager.saveConfigToStorage();

    saveStatus = saved ? "success" : "error";

    if (saveStatusTimeoutHandle) clearTimeout(saveStatusTimeoutHandle);

    saveStatusTimeoutHandle = setTimeout(() => {
      if (saved) {
        controller?.hide();
        saveStatus = null;
      }
    }, 1500);
  }

  const showVideo = () => {
    newConfig.rewardDisplayDurationMs = videoDisplayTimeInSec;

    log(newConfig);
    handleShowVideo(newConfig);
  };

  const onClose = () => {
    newConfig = config;
    controller?.hide();
  };

  onMount(() => {
    return () => {
      if (saveStatusTimeoutHandle) clearTimeout(saveStatusTimeoutHandle);
    };
  });

  const appListPromise = (async function () {
    return getAppsListFromFully().catch((error) => {
      console.error(error);
      return [];
    });
  })();

  const appItemPromise = $derived.by(async () => {
    const packageName = newConfig.app.packageName;
    const appList = await appListPromise;
    const appItem = appList.filter((v) => v.package === packageName)?.[0];
    return appItem as unknown as AppListItem | undefined;
  });
</script>

<div
  id="container"
  class="bg-white rounded-lg shadow-xl w-full max-w-xl mx-auto"
>
  <div class="p-4 md:p-6 space-y-4 md:space-y-6">
    <h2 class="text-xl md:text-2xl font-bold text-right">הגדרות</h2>

    <div
      class="bg-gray-50 rounded-lg p-4 md:p-6 space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto"
    >
      <div class="space-y-4 md:space-y-5">
        <!-- סוג הפרס -->
        <section class="settings-card space-y-3 text-right">
          <div class="flex flex-col space-y-1 md:space-y-2">
            <label for="mode" class="font-medium text-base">סוג פרס:</label>
            <select
              id="mode"
              bind:value={newConfig.rewardType}
              class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
            >
              <option value="video">וידאו</option>
              <option value="app" disabled={disabledAppMode}>אפליקציה</option>
            </select>
          </div>
          <p class="settings-help-text">
            הגדירו אם הילדים מקבלים סרטון או גישה לאפליקציה לאחר הצלחה.
          </p>
        </section>

        <!-- הגדרות אפליקציה -->
        {#if newConfig.rewardType === "app"}
          <section class="settings-card space-y-4 text-right">
            <div class="flex flex-col space-y-1 md:space-y-2">
              <label for="appName" class="font-medium text-base"
                >שם האפליקציה:</label
              >

              <select
                id="appName"
                bind:value={newConfig.app.packageName}
                class="p-3 border rounded-lg bg-white text-base w-full touch-manipulation"
              >
                {#await appListPromise}
                  <option>טוען את רשימת האפליקציות המותקנות...</option>
                {:then appList}
                  {#each appList as app}
                    <option
                      dir="auto"
                      value={app.package}
                      class="text-center"
                      style={`background-image:url('data:image/png;base64,${app.icon ?? ""}');background-repeat:no-repeat;background-position:right 0.75rem center;background-size:1.5rem;padding-inline-end:2.5rem;`}
                    >
                      {app.label}
                    </option>
                  {:else}
                    <option selected disabled
                      >לא נמצאו אפליקציות זמינות במכשיר</option
                    >
                  {/each}
                {/await}
              </select>
              <p class="settings-help-text">
                בחרו אפליקציה מותקנת שתיפתח כפרס לאחר שהילד משלים את המשימה.
              </p>
            </div>

            <div class="flex flex-col space-y-1 md:space-y-2">
              <label for="appNameText" class="font-medium text-base"
                >Package Name:</label
              >
              <input
                id="appNameText"
                type="text"
                bind:value={newConfig.app.packageName}
                class="p-3 border rounded-lg text-left bg-white text-base w-full touch-manipulation"
                placeholder="com.example.app"
              />
              <p class="settings-help-text">
                אם ברצונכם לקבוע אפליקציה שלא מופיעה ברשימה מסיבה כלשהי, הזינו
                כאן את שאם האפליקציה המלא (מכונה לפעמים 'חתימת אפליקציה') להפעלה
                מדויקת של האפליקציה דרך Fully Kiosk. העתיקו אותו כפי שמופיע
                באנדרואיד.
              </p>
            </div>

            {#await appItemPromise then item}
              <div
                class="flex flex-row-reverse items-center justify-between gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/70 p-3"
              >
                {#if item}
                  <div class="flex-1 text-right">
                    <p class="text-sm font-medium text-gray-800" dir="auto">
                      {item.label}
                    </p>
                    <p class="settings-help-text">
                      מאומת מול Fully Kiosk כדי לוודא שבחרתם את האפליקציה
                      הנכונה.
                    </p>
                  </div>
                  <img
                    src={"data:image/png;base64," + item?.icon}
                    alt={item?.label + " icon"}
                    class="shrink-0 rounded-2xl border border-gray-200 bg-white
                    object-contain p-1 w-20 h-20 md:w-24 md:h-24"
                  />
                {:else}
                  <div class="flex-1 text-right">
                    <p class="text-sm font-medium text-gray-800" dir="auto">
                      אפליקציה לא ידועה
                    </p>
                    <p class="settings-help-text">
                      לא מצאנו את האפליקציה הזו ברשימת האפליקציות שמותקנות במכשיר.
                    </p>
                  </div>
                  <div
                    class="shrink-0 rounded-2xl border border-gray-200 bg-white p-1 w-20 h-20 md:w-24 md:h-24"
                    role="img"
                    aria-label="אפליקציה לא ידועה"
                  >
                    <svg
                      viewBox="0 0 48 48"
                      class="h-full w-full text-slate-400"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="48" height="48" rx="12" fill="#F1F5F9" />
                      <path
                        d="M24 30v-1.2c0-2.08 1.067-3.147 2.34-4.14C28.64 23.307 30 21.94 30 19.5 30 16.462 27.657 14 24 14c-2.77 0-4.91 1.357-5.86 3.59"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle cx="24" cy="35" r="2" fill="currentColor" />
                    </svg>
                  </div>
                {/if}
              </div>
            {/await}
          </section>
        {/if}

        <!-- הגדרות כלליות -->
        <section
          class="settings-card grid grid-cols-1 gap-4 text-right md:grid-cols-2"
        >
          <div class="flex flex-col space-y-1 md:space-y-2">
            <label for="displayTime" class="font-medium text-base"
              >זמן הצגת וידאו (בשניות):</label
            >
            <input
              id="displayTime"
              type="number"
              bind:value={videoDisplayTime}
              min="1"
              class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
            />
            <p class="settings-help-text">
              קובע כמה זמן הווידאו נשאר על המסך לפני שחוזרים למשחק.
            </p>
          </div>

          <div class="flex flex-col space-y-1 md:space-y-2">
            <label for="turnsPerVideo" class="font-medium text-base"
              >כמה תורות עד לפרס:</label
            >
            <input
              id="turnsPerVideo"
              type="number"
              bind:value={newConfig.turnsPerReward}
              min="1"
              class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
            />
            <p class="settings-help-text">
              הגדירו כמה תורות או משימות נדרשות עד להפעלת הפרס הבא.
            </p>
          </div>
        </section>

        <!-- הגדרות וידאו -->
        {#if newConfig.rewardType === "video"}
          <section class="settings-card space-y-4 text-right">
            <div class="flex flex-col space-y-1 md:space-y-2">
              <label for="videoSource" class="font-medium text-base"
                >מקור הווידאו:</label
              >
              <select
                id="videoSource"
                bind:value={newConfig.video.source}
                class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
              >
                <option value="local" disabled={isNotFullyKiosk}>מקומי</option>
                <option value="google-drive">Google Drive</option>
                <option value="youtube" disabled>YouTube</option>
              </select>
              <p class="settings-help-text">
                בחרו מאיפה נטען את קבצי הווידאו – מקומי נתמך רק ב-Fully Kiosk.
              </p>
            </div>

            {#if newConfig.video.source === "google-drive"}
              <div class="flex flex-col space-y-1 md:space-y-2">
                <label for="folderId" class="font-medium text-base"
                  >קישור לתיקיית Google Drive:</label
                >
                <input
                  id="folderId"
                  type="text"
                  bind:value={newConfig.video.googleDriveFolderUrl}
                  class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
                  placeholder="הדביקו קישור שיתוף"
                />
                <p class="settings-help-text">
                  ודאו שהתיקייה משותפת או ציבורית כדי שהמערכת תוכל להוריד את
                  הסרטונים.
                </p>
              </div>
            {/if}

            <div class="flex flex-col gap-2 rounded-lg bg-gray-50/80 p-3">
              <div class="flex items-center justify-end gap-2">
                <label for="hideProgress" class="font-medium text-base">
                  הסתירו את פס ההתקדמות
                </label>
                <input
                  id="hideProgress"
                  type="checkbox"
                  bind:checked={newConfig.video.hideProgressBar}
                  class="!static w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <p class="settings-help-text">
                שימושי כאשר רוצים שהילדים יצפו בקליפ בלי לדעת כמה זמן נשאר.
              </p>
            </div>

            <div class="flex flex-col space-y-1 md:space-y-2 text-right">
              <button
                onclick={showVideo}
                class="w-full px-6 py-3 rounded-lg bg-gray-100 text-gray-800 text-base hover:bg-gray-200 transition-colors touch-manipulation"
              >
                הצגת דוגמה
              </button>
              <p class="settings-help-text">
                השתמשו בתצוגה מקדימה כדי לוודא שהפרס טעון ושזמן ההצגה מתאים.
              </p>
            </div>
          </section>
        {/if}
      </div>
    </div>

    {#if saveStatus}
      <div
        class="text-right text-sm"
        class:text-green-600={saveStatus === "success"}
        class:text-red-600={saveStatus === "error"}
      >
        {saveStatus === "success"
          ? "הגדרות נשמרו בהצלחה"
          : "אירעה שגיאה בשמירה"}
      </div>
    {/if}

    <div
      class="sticky bottom-0 left-0 right-0 -mx-4 bg-white/95 px-4 pb-1 pt-4 shadow-[0_-4px_12px_rgba(15,23,42,0.08)] md:-mx-6 md:px-6"
    >
      <div class="grid grid-cols-2 gap-3">
        <button
          onclick={onClose}
          class="w-full px-6 py-3 rounded-lg border text-base hover:bg-gray-100 transition-colors touch-manipulation"
        >
          סגור
        </button>
        <button
          onclick={onSaveHandle}
          class="w-full px-6 py-3 rounded-lg bg-blue-500 text-white text-base hover:bg-blue-600 transition-colors touch-manipulation"
        >
          שמור
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.settings-card) {
    @apply rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5;
  }

  :global(.settings-help-text) {
    @apply text-xs leading-relaxed text-gray-500;
  }
</style>
