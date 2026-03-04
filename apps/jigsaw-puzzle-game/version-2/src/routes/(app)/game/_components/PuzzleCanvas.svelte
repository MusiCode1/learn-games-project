<!--
  קומפוננטת Canvas של הפאזל — v2
  Full-screen container עם canvas per-piece (codeaashu engine)
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { Puzzle } from "$lib/puzzle/puzzle";
  import { PuzzleInteraction } from "../_lib/puzzle-interaction";

  let containerEl: HTMLDivElement;
  let puzzle: Puzzle | null = null;
  let interaction: PuzzleInteraction | null = null;

  function destroyCurrent() {
    interaction?.detach();
    interaction = null;
    puzzle?.destroy();
    puzzle = null;
  }

  onMount(() => {
    window.addEventListener("resize", handleResize);
  });

  onDestroy(() => {
    destroyCurrent();
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });

  $effect(() => {
    // כשהפאזה עוברת ל-LOADING — טען פאזל חדש
    if (gameState.phase === "LOADING" && containerEl) {
      loadCurrentPuzzle();
    }
  });

  function handleResize() {
    puzzle?.handleResize();
  }

  function loadCurrentPuzzle() {
    if (!gameState.currentImage || !containerEl) return;

    // ניקוי קודם
    destroyCurrent();
    containerEl.innerHTML = "";

    // טעינת התמונה
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const grid = gameState.currentGrid;
        puzzle = new Puzzle({
          container: containerEl,
          image: img,
          columns: grid.columns,
          rows: grid.rows,
          shapeStyle: settings.shapeStyle,
          onPieceConnected: () => {
            gameState.onPieceConnected();
          },
          onPuzzleSolved: () => {
            gameState.onPuzzleSolved();
          },
        });

        puzzle.init();

        // Override snap distance based on proximity setting (must be AFTER init)
        puzzle.dConnect = Math.max(
          10,
          Math.min(puzzle.scalex, puzzle.scaley) * (settings.proximity / 300),
        );

        interaction = new PuzzleInteraction(puzzle);
        interaction.attach();

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
  class="absolute inset-0 overflow-hidden"
></div>
