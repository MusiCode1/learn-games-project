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

  // מעבר אוטומטי לפאזל הבא — מטופל ב-PuzzleComplete.svelte
</script>

<svelte:head>
  <title>פאזל - משחק</title>
</svelte:head>

<div class="relative flex flex-1 flex-col overflow-hidden">
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

  <!-- כותרת התמונה -->
  {#if gameState.currentImage && (gameState.phase === "PLAYING" || gameState.phase === "PIECE_FEEDBACK")}
    <div class="animate-slide-up text-center py-3">
      <h2 class="text-2xl md:text-3xl font-black text-slate-700">
        {gameState.currentImage.name}
      </h2>
      <p class="text-sm text-slate-500 mt-1">
        {gameState.connectedPieces} / {gameState.totalPieces} חלקים
      </p>
    </div>
  {/if}

  <!-- אזור הפאזל — נשאר גלוי גם בסיום כדי להציג את הפאזל המושלם -->
  {#if gameState.phase === "LOADING" || gameState.phase === "PLAYING" || gameState.phase === "PIECE_FEEDBACK" || gameState.phase === "PUZZLE_COMPLETE"}
    <div class="flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
      <div class="w-full h-full max-w-3xl max-h-[70vh]">
        <PuzzleCanvas />
      </div>
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
