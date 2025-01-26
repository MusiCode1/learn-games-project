<script lang="ts">
  import type { Config, SettingsController } from "../../types";
  import { onMount } from "svelte";
  import { saveConfigToLocalStorage } from "../../config";

  let saveStatus = $state<"success" | "error" | null>(null);
  let saveStatusTimeoutHandle: number;

  interface Props {
    config: Config;
    controller?: SettingsController;
  }

  let { config, controller = $bindable() }: Props = $props();

  const videoDisplayTimeInSec = Math.floor(
    // המרה ממילישניות לשניות
    (config.videoDisplayTimeInMS || 10000) / 1000,
  );

  let googleDriveFolderUrl = $state(config.googleDriveFolderUrl || "");
  let videoDisplayTime = $state(videoDisplayTimeInSec);
  let videoSource = $state(config.videoSource || "local");
  let hideVideoProgress = $state(config.hideVideoProgress || false);
  let turnsPerVideo = $state(config.turnsPerVideo || 1);

  function handleSave() {
    config.hideVideoProgress = hideVideoProgress;
    // עדכון הקונפיגורציה - חילוץ ID מה-URL אם זה URL של גוגל דרייב
    config.googleDriveFolderUrl = googleDriveFolderUrl;
    config.videoDisplayTimeInMS = videoDisplayTime * 1000; // המרה משניות למילישניות
    config.videoSource = videoSource;
    config.turnsPerVideo = turnsPerVideo;

    // שמירת הקונפיגורציה בלוקל סטורג'
    const saved = saveConfigToLocalStorage(config);

    // עדכון סטטוס השמירה
    saveStatus = saved ? "success" : "error";

    // ניקוי הטיימר הקודם אם קיים
    if (saveStatusTimeoutHandle) clearTimeout(saveStatusTimeoutHandle);

    // הסתרת ההודעה אחרי 1.5 שניות
    saveStatusTimeoutHandle = setTimeout(() => {
      if (saved) {
        controller?.hide();
        saveStatus = null;
        window.location.reload();
      }
    }, 1500);
  }

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
      <!-- מקור הסרטונים -->
      <div class="flex flex-col space-y-1 md:space-y-2 text-right">
        <label for="videoSource" class="font-medium text-base"
          >מקור הסרטונים:</label
        >
        <select
          id="videoSource"
          bind:value={videoSource}
          class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
        >
          <option value="local">מקומי</option>
          <option value="google-drive">גוגל דרייב</option>
          <option value="youtube">יוטיוב</option>
        </select>
      </div>

      <!-- מזהה תיקייה בגוגל דרייב -->
      {#if videoSource === "google-drive"}
        <div class="flex flex-col space-y-1 md:space-y-2 text-right">
          <label for="folderId" class="font-medium text-base"
            >מזהה תיקייה בגוגל דרייב:</label
          >
          <input
            id="folderId"
            type="text"
            bind:value={googleDriveFolderUrl}
            class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
            placeholder="הכנס את מזהה התיקייה"
          />
        </div>
      {/if}

      <!-- זמן הצגת הסרטון -->
      <div class="flex flex-col space-y-1 md:space-y-2 text-right">
        <label for="displayTime" class="font-medium text-base"
          >זמן הצגת הסרטון (שניות):</label
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
          >הצג סרטון כל כמה סיבובים:</label
        >
        <input
          id="turnsPerVideo"
          type="number"
          bind:value={turnsPerVideo}
          min="1"
          class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
        />
      </div>

      <!-- הסתרת פס התקדמות -->
      <div class="flex items-center justify-end gap-2">
        <label for="hideProgress" class="font-medium text-base">
          הסתר את פס ההתקדמות בסרטון
        </label>
        <input
          id="hideProgress"
          type="checkbox"
          bind:checked={hideVideoProgress}
          class="!static w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
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
        onclick={() => controller?.hide()}
        class="w-full px-6 py-3 rounded-lg border text-base hover:bg-gray-100 transition-colors touch-manipulation"
      >
        ביטול
      </button>
      <button
        onclick={handleSave}
        class="w-full px-6 py-3 rounded-lg bg-blue-500 text-white text-base hover:bg-blue-600 transition-colors touch-manipulation"
      >
        שמירה
      </button>
    </div>
  </div>
</div>
