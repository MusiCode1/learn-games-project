<!--
  קומפוננטת canvas של הפאזל — wrapper ל-headbreaker
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { createPuzzle, destroyPuzzle } from "$lib/utils/puzzle-engine";

  let containerEl: HTMLDivElement;
  let canvas: ReturnType<typeof createPuzzle> | null = null;

  onMount(() => {
    loadCurrentPuzzle();
  });

  onDestroy(() => {
    destroyPuzzle(canvas);
  });

  $effect(() => {
    // כשהפאזה עוברת ל-LOADING — טען פאזל חדש
    if (gameState.phase === "LOADING" && containerEl) {
      loadCurrentPuzzle();
    }
  });

  function loadCurrentPuzzle() {
    if (!gameState.currentImage || !containerEl) return;

    // ניקוי קודם
    destroyPuzzle(canvas);
    canvas = null;
    containerEl.innerHTML = "";

    // יצירת div פנימי ל-headbreaker
    const innerDiv = document.createElement("div");
    innerDiv.id = "puzzle-canvas-inner";
    innerDiv.style.width = "100%";
    innerDiv.style.height = "100%";
    containerEl.appendChild(innerDiv);

    // טעינת התמונה
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        canvas = createPuzzle({
          container: innerDiv,
          image: img,
          grid: gameState.currentGrid,
          outlineStyle: settings.outlineStyle,
          proximity: settings.proximity,
          allowDisconnect: settings.allowDisconnect,
          pieceFilter: settings.pieceFilter,
          onPieceConnected: () => {
            gameState.onPieceConnected();
          },
          onPuzzleSolved: () => {
            gameState.onPuzzleSolved();
          },
        });
        gameState.puzzleReady();
      } catch (e) {
        console.error("Failed to create puzzle:", e);
      }
    };
    img.onerror = () => {
      console.error("Failed to load image:", gameState.currentImage?.src);
    };
    img.src = gameState.currentImage.src;
  }
</script>

<div
  bind:this={containerEl}
  class="w-full h-full relative rounded-xl border-4 border-dashed border-slate-300 bg-white/50"
></div>
