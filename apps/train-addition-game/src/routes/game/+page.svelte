<script lang="ts">
  import InstructionPanel from "$lib/components/InstructionPanel.svelte";
  import TrainTrackArea from "$lib/components/TrainTrackArea.svelte";
  import DepotArea from "$lib/components/DepotArea.svelte";
  import AnswerPanel from "$lib/components/AnswerPanel.svelte";
  import FeedbackOverlay from "$lib/components/FeedbackOverlay.svelte";
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import {
    boosterService,
    BoosterContainer,
    ProgressWidget,
  } from "learn-booster-kit";
  import { onMount } from "svelte";

  // Extend Global Debug with game-specific actions
  onMount(() => {
    const existingDebug = (window as any).GameDebug || {};
    (window as any).GameDebug = {
      ...existingDebug,
      showCorrect: () => {
        gameState.state = "FEEDBACK_CORRECT";
      },
      showWrong: () => {
        gameState.state = "FEEDBACK_WRONG";
      },
      toggleWrong: () => {
        gameState.state === "FEEDBACK_WRONG"
          ? (gameState.state = "CHOOSE_ANSWER")
          : (gameState.state = "FEEDBACK_WRONG");
      },
      toggleBooster: (force?: boolean) => {
        settings.boosterEnabled = force ?? !settings.boosterEnabled;
        console.log("Booster enabled:", settings.boosterEnabled);
      },
    };
  });

  async function handleGetReward() {
    await boosterService.triggerReward();
    gameState.completeReward();
  }

  // מעבר אוטומטי לסיבוב הבא
  $effect(() => {
    if (gameState.state === "NEXT_ROUND") {
      gameState.startRound();
    }
  });

  // Handle initial state if user navigated directly
  $effect.root(() => {
    if (gameState.state === "INIT") {
      gameState.startRound();
    }
  });
</script>

<svelte:head>
  <title>רכבת החיבור - משחק</title>
</svelte:head>

<main
  class="relative z-10 flex flex-1 flex-col items-center justify-start gap-2 p-2 w-full max-w-5xl mx-auto"
>
  <!-- Progress Widget (Centered horizontally below header) -->
  {#if settings.boosterEnabled}
    <div class="flex w-full justify-center pt-2 z-20 relative">
      <ProgressWidget
        value={gameState.winsSinceLastReward}
        max={settings.turnsPerReward}
        orientation="horizontal"
        label="לפרס"
      />
    </div>
  {/if}
  {#if gameState.state === "REWARD_TIME" && !settings.autoBoosterLoop}
    <!-- מסך קבלת פרס (ידני) -->
    <div class="mt-20 animate-fade-in text-center z-20">
      <h2 class="mb-8 text-6xl font-black text-white drop-shadow-lg">
        🎉 כל הכבוד! 🎉
      </h2>
      <button
        onclick={handleGetReward}
        class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 px-12 py-8 text-4xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-400/50 active:scale-95"
      >
        <span class="flex items-center gap-4"> 🎁 קבל פרס </span>
      </button>
    </div>
  {:else}
    <!-- משחק פעיל (Layout יציב) -->
    <div class="animate-slide-up w-full flex justify-center">
      <InstructionPanel />
    </div>

    <div class="animate-slide-up animation-delay-100 w-full">
      <TrainTrackArea />
    </div>

    <!-- Depot Area (Conditional) -->
    {#if gameState.state === "BUILD_A" || gameState.state === "ADD_B"}
      <div
        class="animate-slide-up animation-delay-200 w-full flex justify-center"
      >
        <DepotArea />
      </div>
    {/if}

    <!-- Answer Panel Placeholder -->
    <div
      class="animate-slide-up animation-delay-300 w-full flex justify-center"
    >
      <AnswerPanel />
    </div>
  {/if}

  <!-- Overlays -->
  <FeedbackOverlay />
  <BoosterContainer />
</main>

<style>
  /* אנימציות */
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slide-up 0.5s ease-out both;
  }

  .animation-delay-100 {
    animation-delay: 0.1s;
  }
  .animation-delay-200 {
    animation-delay: 0.2s;
  }
  .animation-delay-300 {
    animation-delay: 0.3s;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }
</style>
