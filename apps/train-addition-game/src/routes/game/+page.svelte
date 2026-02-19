<script lang="ts">
  import InstructionPanel from "./_components/InstructionPanel.svelte";
  import TrainTrackArea from "./_components/TrainTrackArea.svelte";
  import DepotArea from "./_components/DepotArea.svelte";
  import AnswerPanel from "./_components/AnswerPanel.svelte";
  import FeedbackOverlay from "./_components/FeedbackOverlay.svelte";
  import GameWorld from "./_components/GameWorld.svelte"; // [NEW]
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import {
    boosterService,
    BoosterContainer,
    ProgressWidget,
    type Config,
  } from "learn-booster-kit";
  import { onDestroy, onMount } from "svelte";

  let config = $state<Config>();
  let unsubscribeConfig: (() => void) | undefined;

  // Extend Global Debug with game-specific actions
  let isShortScreen = $state(false);
  let isRewardPending = $state(false);

  onMount(async () => {
    await boosterService.init();
    unsubscribeConfig = boosterService.config.subscribe((value) => {
      config = value;
    });

    const checkHeight = () => {
      isShortScreen = window.innerHeight < 720;
    };
    checkHeight();
    window.addEventListener("resize", checkHeight);

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

    return () => window.removeEventListener("resize", checkHeight);
  });

  onDestroy(() => {
    unsubscribeConfig?.();
  });

  async function handleGetReward() {
    if (isRewardPending) return; // מניעת לחיצות כפולות
    isRewardPending = true;
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

  // איפוס מצב המחזק כשיוצאים ממצב פרס
  $effect(() => {
    if (gameState.state !== "REWARD_TIME") {
      isRewardPending = false;
    }
  });
</script>

<svelte:head>
  <title>רכבת החיבור - משחק</title>
</svelte:head>

<!-- Wrap game in the GameWorld -->
<!-- Wrap game in the GameWorld -->
<GameWorld>
  <!-- Main Root Container: Flex Column -->
  <div class="relative w-full h-full flex flex-col overflow-hidden">
    <!-- Content Container (Fills space above grass) -->
    <div
      class="flex-grow flex flex-col relative w-full overflow-hidden gap-1"
      style="zoom: {isShortScreen ? 0.85 : 1};"
    >
      <!-- Progress Widget - Absolute Positioned (Vertical) -->
      {#if settings.boosterEnabled}
        <div class="absolute top-4 right-2 z-50 pointer-events-auto">
          <ProgressWidget
            value={gameState.winsSinceLastReward}
            max={config?.turnsPerReward ?? 3}
            orientation="vertical"
            label="לפרס"
          />
        </div>
      {/if}

      <!-- Top Section: Instructions -->
      <div
        class="flex-shrink-0 w-full z-20 mt-4 xl:mt-12 mb-2 pointer-events-auto relative"
      >
        {#if gameState.state === "REWARD_TIME" && settings.gameMode !== "continuous"}
          <!-- Reward Screen -->
          <div class="mt-20 animate-fade-in text-center">
            <h2 class="mb-8 text-6xl font-black text-white drop-shadow-lg">
              🎉 כל הכבוד! 🎉
            </h2>
            <button
              onclick={handleGetReward}
              disabled={isRewardPending}
              class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 px-12 py-8 text-4xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-400/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
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

      <!-- Center Section: Interaction (Depot / Answer) -->
      {#if gameState.state !== "REWARD_TIME" && gameState.state !== "LEVEL_END"}
        <div
          class="flex-grow flex items-center justify-center min-h-0 w-full z-20 pointer-events-auto py-1"
        >
          <div class="w-full flex flex-col justify-center gap-2 md:gap-4">
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
        </div>
      {/if}

      <!-- Bottom: Train Track -->
      {#if gameState.state !== "REWARD_TIME" && gameState.state !== "LEVEL_END"}
        <div
          data-testid="train-track-container"
          class="flex-shrink-0 mt-auto w-full z-10 pointer-events-auto animate-slide-up animation-delay-100 origin-bottom transition-transform duration-300"
        >
          <TrainTrackArea />
        </div>
      {/if}
    </div>

    <!-- Grass Footer (Outside Main Content) -->
    <div
      class="flex-shrink-0 w-full grass-bg z-10"
      style="
            background-image: url('/assets/grassMid.png');
            background-repeat: repeat-x;
            background-size: 128px 128px;
            background-position: top center; 
          "
    ></div>
  </div>
</GameWorld>

<!-- Overlays -->
<FeedbackOverlay />
<div class="relative z-[9999] pointer-events-none">
  <BoosterContainer />
</div>

<style>
  .grass-bg {
    height: 50px;
  }
  @media (min-height: 800px) {
    .grass-bg {
      height: 128px;
    }
  }

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
