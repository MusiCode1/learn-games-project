<!--
	בר עליון עם כפתור בית ואינדיקציית סיבוב
-->
<script lang="ts">
  import { goto } from "$app/navigation";

  import { gameState } from "$lib/stores/game-state.svelte";

  import homeIcon from "$lib/assets/home.svg";
  import settingsIcon from "$lib/assets/settings.svg";

  interface Props {
    /** פונקציה לאיפוס המשחק */
    onReset?: () => void;
    /** פתיחת הגדרות */
    onSettings?: () => void;
  }
  let { onReset, onSettings }: Props = $props();

  function handleReset() {
    gameState.reset();
    onReset?.();
  }

  function handleHome() {
    goto("/");
  }
  import { AdminGate } from "learn-booster-kit";
</script>

<header
  class="flex items-center justify-between z-1
 bg-slate-800 px-4 py-3 text-white shadow-md"
>
  <!-- כפתור בית -->
  <button
    onclick={handleHome}
    onkeydown={(e) => e.key === "Enter" && handleHome()}
    class="rounded-full bg-slate-700 p-2 transition-colors hover:bg-slate-600"
    aria-label="חזרה לתפריט"
  >
    <img src={homeIcon} alt="בית" class="h-6 w-6" />
  </button>

  <!-- אינדיקציית סיבוב -->
  <div class="flex items-center gap-4 text-lg">
    <span class="text-slate-400">סיבוב:</span>
    <span class="font-bold text-green-400">{gameState.roundNumber}</span>

    <span class="text-slate-400">|</span>

    <span class="text-slate-400">נכון:</span>
    <span class="font-bold text-yellow-400">{gameState.correctCount}</span>
  </div>

  <!-- כפתור הגדרות (שמאל) -->
  <AdminGate onUnlock={() => onSettings?.()}>
    <button
      class="rounded-full bg-slate-700 p-2 transition-colors hover:bg-slate-600"
      aria-label="הגדרות"
    >
      <img src={settingsIcon} alt="הגדרות" class="h-6 w-6" />
    </button>
  </AdminGate>
</header>
