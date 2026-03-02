<!--
  בר עליון עם כפתור בית, מונה הצלחות וכפתור הגדרות (AdminGate)
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

  <!-- מונה הצלחות -->
  <div class="flex items-center gap-3 text-lg">
    <span class="text-slate-400">הצלחות:</span>
    <span class="font-bold text-green-400 text-xl">{gameState.correctCount}</span>
  </div>

  <!-- כפתור הגדרות (מוגן AdminGate) -->
  <AdminGate onUnlock={handleSettings}>
    <button
      class="rounded-full bg-slate-700 p-2 transition-colors hover:bg-slate-600"
      aria-label="הגדרות"
    >
      <img src={settingsIcon} alt="הגדרות" class="h-6 w-6 invert" />
    </button>
  </AdminGate>
</header>
