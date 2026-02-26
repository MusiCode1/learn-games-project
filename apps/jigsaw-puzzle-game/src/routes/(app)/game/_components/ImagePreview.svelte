<!--
  תמונת עזר קטנה — מציגה את התמונה המלאה בפינה
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";

  let expanded = $state(false);
</script>

{#if settings.showReferenceImage && gameState.currentImage && gameState.phase === "PLAYING"}
  <button
    onclick={() => { expanded = !expanded; }}
    class="fixed bottom-4 left-4 z-30 rounded-xl bg-white/90 p-1 shadow-lg transition-all duration-300 hover:scale-105 border-2 border-slate-300"
    class:w-16={!expanded}
    class:h-16={!expanded}
    class:w-48={expanded}
    class:h-36={expanded}
    aria-label={expanded ? "הקטן תמונת עזר" : "הגדל תמונת עזר"}
  >
    <img
      src={gameState.currentImage.src}
      alt="תמונת עזר"
      class="w-full h-full object-cover rounded-lg"
    />
  </button>
{/if}
