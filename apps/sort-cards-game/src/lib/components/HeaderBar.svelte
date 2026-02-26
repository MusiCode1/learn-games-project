<!--
	בר עליון עם כפתור בית ואינדיקציית סיבוב
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { gameState } from "$lib/stores/game-state.svelte";
  import homeIcon from "$lib/assets/home.svg";
  import settingsIcon from "$lib/assets/settings.svg";
  import { AdminGate } from "learn-booster-kit";

  function handleHome() {
    gameState.reset();
    goto("/");
  }

  function handleSettings() {
    goto("/settings");
  }
</script>

<header
  class="flex items-center justify-between z-10 bg-slate-800 px-4 py-3 text-white shadow-md"
>
  <!-- כפתור בית -->
  <button
    onclick={handleHome}
    class="rounded-full bg-slate-700 p-2 transition-colors hover:bg-slate-600"
    aria-label="חזרה לתפריט"
  >
    <img src={homeIcon} alt="בית" class="h-6 w-6 invert" />
  </button>

  <!-- אינדיקציית כרטיסים -->
  <div class="flex items-center gap-4 text-lg">
    <span class="text-slate-400">כרטיס:</span>
    <span class="font-bold text-green-400" dir="ltr">{gameState.sortedCardsInRound}/{gameState.totalCardsInRound}</span>

    <span class="text-slate-400">|</span>

    <span class="text-slate-400">נכון:</span>
    <span class="font-bold text-yellow-400">{gameState.correctCount}</span>
  </div>

  <!-- כפתור הגדרות -->
  <AdminGate onUnlock={handleSettings}>
    <button
      class="rounded-full bg-slate-700 p-2 transition-colors hover:bg-slate-600"
      aria-label="הגדרות"
    >
      <img src={settingsIcon} alt="הגדרות" class="h-6 w-6 invert" />
    </button>
  </AdminGate>
</header>
