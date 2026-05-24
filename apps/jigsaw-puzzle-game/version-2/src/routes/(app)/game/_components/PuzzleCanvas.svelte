<!--
  קומפוננטת Canvas של הפאזל — v2
  Full-screen container עם canvas per-piece (codeaashu engine)
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { Puzzle } from "$lib/puzzle/puzzle";
  import { adaptGridToImage } from "$lib/puzzle/adaptive-grid";
  import { PuzzleInteraction } from "../_lib/puzzle-interaction";

  let containerEl: HTMLDivElement;
  let puzzle: Puzzle | null = null;
  let interaction: PuzzleInteraction | null = null;

  /** סידור מחדש של חלקים בודדים — משמש את כפתור הסידור מחדש */
  export function rearrange() {
    puzzle?.rearrangeUnconnected();
  }

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
    interaction?.resetZoom();
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
        // התאמה דינמית של ה-grid לפרופורציות התמונה (כשההגדרה דלוקה)
        let columns = grid.columns;
        let rows = grid.rows;
        if (settings.adaptGridToImage) {
          const targetPieceCount = grid.columns * grid.rows;
          const imageAspectRatio = img.naturalWidth / img.naturalHeight;
          const adapted = adaptGridToImage({ targetPieceCount, imageAspectRatio });
          columns = adapted.columns;
          rows = adapted.rows;
        }
        puzzle = new Puzzle({
          container: containerEl,
          image: img,
          columns,
          rows,
          shapeStyle: settings.shapeStyle,
          organizedStart: !settings.shufflePiecePlacement,
          organizedGap: settings.organizedGap,
          prePlacedPieces: settings.prePlacedPieces,
          loosePieceSelection: settings.loosePieceSelection,
          loosePiecesCount: settings.loosePiecesCount,
          onPieceConnected: (count: number) => {
            gameState.onPieceConnected(count);
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

        interaction = new PuzzleInteraction(puzzle, settings.beginnerMode);
        interaction.attach();

        gameState.puzzleReady();
      } catch (e) {
        console.error("Failed to create puzzle:", e);
      }
    };
    img.onerror = () => {
      console.error("Failed to load image:", gameState.currentImage?.src);
      gameState.advanceToNextImage();
    };
    img.src = gameState.currentImage.src;
  }
</script>

<div
  bind:this={containerEl}
  class="absolute inset-0 overflow-hidden"
></div>
