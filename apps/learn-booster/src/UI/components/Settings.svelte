<script lang="ts">
  import type { Config, SettingsController } from "../../types";
  import { onMount } from "svelte";
  import * as configManager from "../../lib/config-manager";
  import { log } from "../../lib/logger.svelte";
  import { isFullyKiosk } from "../../lib/fully-kiosk";

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

  let saveStatus = $state<"success" | "error" | null>(null);
  let saveStatusTimeoutHandle: NodeJS.Timeout;

  let newConfig = $state(structuredClone(config));

  let videoDisplayTime = $state(msToSec(config.rewardDisplayDurationMs));

  let videoDisplayTimeInSec = $derived(videoDisplayTime * 1000);

  function onSaveHandle() {
    newConfig.rewardDisplayDurationMs = videoDisplayTimeInSec; // המרה משניות למילישניות

    configManager.updateConfig($state.snapshot(newConfig));
    config = configManager.getAllConfig();

    // שמירת הקונפיגורציה בלוקל סטורג'
    const saved = configManager.saveConfigToStorage();

    // עדכון סטטוס השמירה
    saveStatus = saved ? "success" : "error";

    // ניקוי הטיימר הקודם אם קיים
    if (saveStatusTimeoutHandle) clearTimeout(saveStatusTimeoutHandle);

    // הסתרת ההודעה אחרי 1.5 שניות
    saveStatusTimeoutHandle = setTimeout(() => {
      if (saved) {
        controller?.hide();
        saveStatus = null;
      }
    }, 1500);
  }

  const showVideo = () => {
    newConfig.rewardDisplayDurationMs = videoDisplayTimeInSec; // המרה משניות למילישניות

    log(newConfig);
    handleShowVideo(newConfig);
  };

  const onClose = () => {
    newConfig = config;
    controller?.hide();
  };

  // ניקוי הטיימר בעת הסרת הקומפוננטה
  onMount(() => {
    return () => {
      if (saveStatusTimeoutHandle) clearTimeout(saveStatusTimeoutHandle);
    };
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
      <!-- בחירת מצב (סרטון/אפליקציה) -->
      <div class="flex flex-col space-y-1 md:space-y-2 text-right">
        <label for="mode" class="font-medium text-base">מצב מחזק:</label>
        <select
          id="mode"
          bind:value={newConfig.rewardType}
          class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
        >
          <option value="video">סרטון</option>
          <option value="app" disabled={isNotFullyKiosk}>אפליקציה</option>
        </select>
      </div>

      <!-- הגדרות מצב אפליקציה -->
      {#if newConfig.rewardType === "app"}
        <div class="flex flex-col space-y-1 md:space-y-2 text-right">
          <label for="appName" class="font-medium text-base"
            >שם האפליקציה:</label
          >
          <input
            id="appName"
            type="text"
            bind:value={newConfig.app.packageName}
            class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
            placeholder="com.example.app"
          />
          <p class="text-gray-500 text-sm text-right">
            הזן את שם החבילה (Package Name) של האפליקציה
          </p>
        </div>
      {/if}

      <!-- זמן הצגת הסרטון -->
      <div class="flex flex-col space-y-1 md:space-y-2 text-right">
        <label for="displayTime" class="font-medium text-base"
          >זמן הצגת מחזק (שניות):</label
        >
        <input
          id="displayTime"
          type="number"
          bind:value={videoDisplayTime}
          min="1"
          class="p-3 border
                  rounded-lg text-right bg-white text-base w-full touch-manipulation"
        />
      </div>

      <!-- מספר סיבובים בין הסרטונים -->
      <div class="flex flex-col space-y-1 md:space-y-2 text-right">
        <label for="turnsPerVideo" class="font-medium text-base"
          >הצג מחזק כל כמה סיבובים:</label
        >
        <input
          id="turnsPerVideo"
          type="number"
          bind:value={newConfig.turnsPerReward}
          min="1"
          class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
        />
      </div>

      <!-- הגדרות מצב סרטון -->
      {#if newConfig.rewardType === "video"}
        <!-- מקור הסרטונים -->
        <div class="flex flex-col space-y-1 md:space-y-2 text-right">
          <label for="videoSource" class="font-medium text-base"
            >מקור הסרטונים:</label
          >
          <select
            id="videoSource"
            bind:value={newConfig.video.source}
            class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
          >
            <option value="local" disabled={isNotFullyKiosk}>מקומי</option>
            <option value="google-drive">גוגל דרייב</option>
            <option value="youtube" disabled>יוטיוב</option>
          </select>
        </div>

        <!-- מזהה תיקייה בגוגל דרייב -->
        {#if newConfig.video.source === "google-drive"}
          <div class="flex flex-col space-y-1 md:space-y-2 text-right">
            <label for="folderId" class="font-medium text-base"
              >מזהה תיקייה בגוגל דרייב:</label
            >
            <input
              id="folderId"
              type="text"
              bind:value={newConfig.video.googleDriveFolderUrl}
              class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
              placeholder="הכנס את מזהה התיקייה"
            />
          </div>
        {/if}

        <!-- הסתרת פס התקדמות -->
        <div class="flex items-center justify-end gap-2">
          <label for="hideProgress" class="font-medium text-base">
            הסתר את פס ההתקדמות בסרטון
          </label>
          <input
            id="hideProgress"
            type="checkbox"
            bind:checked={newConfig.video.hideProgressBar}
            class="!static w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <!-- כפתור בדיקת סרטון -->
        <div class="flex flex-col space-y-1 md:space-y-2 text-right">
          <button
            onclick={showVideo}
            class="w-full px-6 py-3 rounded-lg bg-gray-100 text-gray-800 text-base hover:bg-gray-200 transition-colors touch-manipulation"
          >
            בדיקת סרטון
          </button>
        </div>
      {/if}
    </div>

    <!-- הודעת סטטוס -->
    {#if saveStatus}
      <div
        class="text-right text-sm"
        class:text-green-600={saveStatus === "success"}
        class:text-red-600={saveStatus === "error"}
      >
        {saveStatus === "success"
          ? "ההגדרות נשמרו בהצלחה"
          : "שגיאה בשמירת ההגדרות"}
      </div>
    {/if}

    <!-- כפתורי פעולה -->
    <div class="grid grid-cols-2 gap-3">
      <button
        onclick={onClose}
        class="w-full px-6 py-3 rounded-lg border text-base hover:bg-gray-100 transition-colors touch-manipulation"
      >
        ביטול
      </button>
      <button
        onclick={onSaveHandle}
        class="w-full px-6 py-3 rounded-lg bg-blue-500 text-white text-base hover:bg-blue-600 transition-colors touch-manipulation"
      >
        שמירה
      </button>
    </div>
  </div>
</div>
