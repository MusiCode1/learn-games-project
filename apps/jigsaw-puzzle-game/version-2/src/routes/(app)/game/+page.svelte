<script lang="ts">
  import PuzzleCanvas from "./_components/PuzzleCanvas.svelte";
  import FeedbackOverlay from "./_components/FeedbackOverlay.svelte";
  import PuzzleComplete from "./_components/PuzzleComplete.svelte";
  import ImagePreview from "./_components/ImagePreview.svelte";
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import {
    boosterService,
    ProgressWidget,
    type Config,
  } from "learn-booster-kit";
  import { onDestroy, onMount } from "svelte";

  let config = $state<Config>();
  let unsubscribeConfig: (() => void) | undefined;
  let puzzleCanvas: { rearrange: () => void } | undefined = $state();

  function handleRearrange() {
    puzzleCanvas?.rearrange();
  }

  onMount(async () => {
    await boosterService.init();
    unsubscribeConfig = boosterService.config.subscribe((value) => {
      config = value;
    });

    // אם הגיעו לדף ישירות
    if (gameState.phase === "INIT") {
      gameState.startGame();
    }
  });

  onDestroy(() => {
    unsubscribeConfig?.();
  });
</script>

<svelte:head>
  <title>פאזל - משחק</title>
</svelte:head>

<div class="relative flex-1 overflow-hidden">
  <!-- Progress Widget — חלקים שחוברו -->
  {#if settings.boosterEnabled && gameState.phase !== "INIT"}
    <div class="absolute top-4 right-2 z-50 pointer-events-auto">
      <ProgressWidget
        value={gameState.winsSinceLastReward}
        max={config?.turnsPerReward ?? 3}
        orientation="vertical"
        label="לפרס"
      />
    </div>
  {/if}

  <!-- כותרת התמונה + כפתור סידור מחדש -->
  {#if gameState.currentImage && (gameState.phase === "PLAYING" || gameState.phase === "PIECE_FEEDBACK")}
    <div class="absolute top-0 left-0 right-0 animate-slide-up py-3 z-20">
      <div class="flex items-center justify-center gap-3 pointer-events-none">
        <h2 class="text-2xl md:text-3xl font-black text-slate-700 drop-shadow-sm">
          {gameState.currentImage.name}
        </h2>
        {#if settings.showRearrangeButton}
          <button
            onclick={handleRearrange}
            class="pointer-events-auto rounded-full bg-sky-500/90 hover:bg-sky-600 text-white p-2 shadow-md transition-colors active:scale-95"
            aria-label="סידור מחדש"
            title="סידור מחדש של החלקים"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
        {/if}
      </div>
      <p class="text-sm text-slate-500 mt-1 text-center pointer-events-none">
        {gameState.connectedPieces} / {gameState.totalPieces} חלקים
      </p>
    </div>
  {/if}

  <!-- אזור הפאזל — full-screen canvas, תופס את כל השטח -->
  {#if gameState.phase === "LOADING" || gameState.phase === "PLAYING" || gameState.phase === "PIECE_FEEDBACK" || gameState.phase === "PUZZLE_COMPLETE"}
    <div class="absolute inset-0">
      <PuzzleCanvas bind:this={puzzleCanvas} />
    </div>
  {/if}

  <!-- מסך טעינה -->
  {#if gameState.phase === "LOADING"}
    <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
      <div class="text-2xl text-slate-500 animate-pulse">טוען פאזל...</div>
    </div>
  {/if}
</div>

<!-- Overlays -->
<FeedbackOverlay />
<PuzzleComplete />
<ImagePreview />

<style>
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slide-up 0.4s ease-out;
  }
</style>
