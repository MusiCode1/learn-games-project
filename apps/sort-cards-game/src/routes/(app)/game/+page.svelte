<script lang="ts">
  import SortBox from "./_components/SortBox.svelte";
  import DraggableCard from "./_components/DraggableCard.svelte";
  import FeedbackOverlay from "./_components/FeedbackOverlay.svelte";
  import RoundComplete from "./_components/RoundComplete.svelte";
  import CooldownTimer from "./_components/CooldownTimer.svelte";
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import {
    boosterService,
    BoosterContainer,
    ProgressWidget,
    type Config,
  } from "learn-booster-kit";
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { get } from "svelte/store";

  let config = $state<Config>();
  let unsubscribeConfig: (() => void) | undefined;
  let hoveredBoxId = $state<string | null>(null);
  let isRewardPending = $state(false);

  onMount(async () => {
    await boosterService.init();
    unsubscribeConfig = boosterService.config.subscribe((value) => {
      config = value;
    });

    // אם הגיעו לדף ישירות ללא startGame
    if (gameState.state === "INIT") {
      gameState.startGame();
    }
  });

  onDestroy(() => {
    unsubscribeConfig?.();
  });

  async function handleGetReward() {
    if (isRewardPending) return;
    isRewardPending = true;
    await boosterService.triggerReward();
    gameState.completeReward();
  }

  function handleNextRound() {
    gameState.nextRound();
  }

  function handleHoverBox(categoryId: string | null) {
    hoveredBoxId = categoryId;
  }

  // מעבר אוטומטי בסיום סיבוב במצב רציף
  $effect(() => {
    if (gameState.state === "ROUND_COMPLETE" && settings.gameMode === "continuous") {
      setTimeout(() => gameState.nextRound(), 1500);
    }
  });

  // הפעלת פרס אוטומטית במצב רציף
  $effect(() => {
    if (gameState.state === "REWARD_TIME" && settings.gameMode === "continuous") {
      handleGetReward();
    }
  });

  // איפוס מצב פרס
  $effect(() => {
    if (gameState.state !== "REWARD_TIME") {
      isRewardPending = false;
    }
  });

  // חזרה לדף הבית בסיום משחק
  $effect(() => {
    if (gameState.state === "GAME_COMPLETE" && settings.gameMode === "continuous") {
      gameState.reset();
      goto("/");
    }
  });
</script>

<svelte:head>
  <title>מיון כרטיסים - משחק</title>
</svelte:head>

<div class="relative flex flex-1 flex-col overflow-hidden">
  <!-- Progress Widget — כרטיסים בסיבוב -->
  {#if gameState.totalCardsInRound > 0}
    <div class="absolute top-4 right-2 z-50 pointer-events-auto">
      <ProgressWidget
        value={gameState.sortedCardsInRound}
        max={gameState.totalCardsInRound}
        orientation="vertical"
        label="כרטיסים"
      />
    </div>
  {/if}

  <!-- כותרת הסיבוב -->
  {#if gameState.round && gameState.state === "PLAYING"}
    <div class="animate-slide-up text-center py-3 md:py-5">
      <h2 class="text-2xl md:text-3xl font-black text-slate-700">
        {gameState.round.definition.title}
      </h2>
      <p class="text-sm text-slate-500 mt-1">
        נותרו {gameState.remainingCards} כרטיסים
      </p>
    </div>
  {/if}

  <!-- אזור הכרטיס -->
  <div class="flex-1 flex flex-col items-center justify-center gap-4 px-4">
    {#if gameState.currentCard && (gameState.state === "PLAYING" || gameState.state === "FEEDBACK_WRONG")}
      {#key gameState.currentCard.id}
        <DraggableCard
          card={gameState.currentCard}
          onHoverBox={handleHoverBox}
        />
      {/key}
    {/if}

    <!-- טיימר cooldown -->
    <CooldownTimer />
  </div>

  <!-- אזור הארגזים -->
  {#if gameState.round}
    <div class="animate-slide-up-boxes flex justify-center gap-3 md:gap-5 px-4 pb-4 md:pb-6">
      {#each gameState.round.definition.categories as category}
        <SortBox
          {category}
          isHighlighted={hoveredBoxId === category.id}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- Overlays -->
<FeedbackOverlay />
<RoundComplete
  onNextRound={handleNextRound}
  onGetReward={handleGetReward}
  rewardPending={isRewardPending}
/>

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

  @keyframes slide-up-boxes {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-up-boxes {
    animation: slide-up-boxes 0.5s ease-out 0.2s both;
  }
</style>
