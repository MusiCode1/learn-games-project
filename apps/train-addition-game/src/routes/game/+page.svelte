<script lang="ts">
  import InstructionPanel from "$lib/components/InstructionPanel.svelte";
  import TrainTrackArea from "$lib/components/TrainTrackArea.svelte";
  import DepotArea from "$lib/components/DepotArea.svelte";
  import AnswerPanel from "$lib/components/AnswerPanel.svelte";
  import FeedbackOverlay from "$lib/components/FeedbackOverlay.svelte";
  import GameWorld from "$lib/components/GameWorld.svelte"; // [NEW]
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import {
    boosterService,
    BoosterContainer,
    ProgressWidget,
  } from "learn-booster-kit";
  import { onMount } from "svelte";

  const config = boosterService.config;

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

  // Auto-trigger reward in Continuous Mode
  $effect(() => {
    if (
      gameState.state === "REWARD_TIME" &&
      settings.gameMode === "continuous"
    ) {
      handleGetReward();
    }
  });
</script>

<svelte:head>
  <title>רכבת החיבור - משחק</title>
</svelte:head>

<!-- Wrap game in the GameWorld -->
<GameWorld>
  <!-- Main Content Wrapper (Top + Controls) - Allows vertical spacing -->
  <div
    class="flex-1 w-full flex flex-col justify-start gap-2 sm:gap-6 md:gap-12 z-20 pointer-events-none px-4 pt-2"
  >
    <!-- Top Section: Progress & Instructions -->
    <div class="flex flex-col items-center w-full pointer-events-auto">
      <!-- Progress Widget -->
      {#if settings.boosterEnabled}
        <div class="mb-2 relative">
          <ProgressWidget
            value={gameState.winsSinceLastReward}
            max={$config?.turnsPerReward ?? 3}
            orientation="horizontal"
            label="לפרס"
          />
        </div>
      {/if}

      {#if gameState.state === "REWARD_TIME" && settings.gameMode !== "continuous"}
        <!-- Reward Screen -->
        <div class="mt-20 animate-fade-in text-center">
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
      {:else if gameState.state === "LEVEL_END"}
        <!-- Level End Screen (Play Again) -->
        <div class="mt-20 animate-fade-in text-center">
          <h2 class="mb-8 text-6xl font-black text-white drop-shadow-lg">
            כל הכבוד! סיימת את השלב.
          </h2>
          <button
            onclick={() => gameState.nextRound()}
            class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-green-700 px-12 py-8 text-4xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-400/50 active:scale-95"
          >
            <span class="flex items-center gap-4"> 🔄 שחק שוב </span>
          </button>
        </div>
      {:else}
        <!-- Active Game Instructions -->
        <div class="animate-slide-up w-full flex justify-center">
          <InstructionPanel />
        </div>
      {/if}
    </div>

    <!-- Controls Section: Interactions -->
    {#if gameState.state !== "REWARD_TIME" && gameState.state !== "LEVEL_END"}
      <div
        class="w-full flex flex-col justify-center gap-4 pointer-events-auto"
      >
        {#if gameState.state === "BUILD_A" || gameState.state === "ADD_B"}
          <div
            class="animate-slide-up animation-delay-200 w-full flex justify-center"
          >
            <DepotArea />
          </div>
        {/if}

        <div
          class="animate-slide-up animation-delay-300 w-full flex justify-center"
        >
          <AnswerPanel />
        </div>
      </div>
    {/if}
  </div>

  <!-- Bottom Section: Train Track (Anchored to Grass) -->
  {#if gameState.state !== "REWARD_TIME" && gameState.state !== "LEVEL_END"}
    <div
      data-testid="train-track-container"
      class="absolute bottom-0 left-0 w-full flex items-end justify-center pb-[48px] md:pb-[120px] z-10 pointer-events-none animate-slide-up animation-delay-100"
    >
      <div class="pointer-events-auto">
        <TrainTrackArea />
      </div>
    </div>
  {/if}
</GameWorld>

<!-- Overlays - Placed outside GameWorld to ensure they are on top of everything without stacking context issues -->
<FeedbackOverlay />
<BoosterContainer />

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
