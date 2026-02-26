<!--
  מסך סיום פאזל — כפתור המשך / פרס
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { boosterService } from "learn-booster-kit";

  let isRewardPending = $state(false);

  async function handleGetReward() {
    if (isRewardPending) return;
    isRewardPending = true;
    await boosterService.triggerReward();
    gameState.completeReward();
  }

  function handleNextPuzzle() {
    gameState.nextPuzzle();
  }

  // איפוס מצב הפרס כשיוצאים מ-REWARD_TIME
  $effect(() => {
    if (gameState.phase !== "REWARD_TIME") {
      isRewardPending = false;
    }
  });

  // טריגר אוטומטי במצב רציף
  $effect(() => {
    if (
      gameState.phase === "REWARD_TIME" &&
      settings.gameMode === "continuous"
    ) {
      handleGetReward();
    }
  });
</script>

{#if gameState.phase === "PUZZLE_COMPLETE"}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div class="animate-fade-in text-center">
      <h2 class="mb-8 text-6xl font-black text-white drop-shadow-lg">
        🎉 כל הכבוד! 🎉
      </h2>
      {#if gameState.currentImage}
        <p class="mb-6 text-3xl text-white font-bold drop-shadow">
          {gameState.currentImage.name}
        </p>
      {/if}

      {#if settings.gameMode === "continuous"}
        <!-- מצב רציף — מעבר אוטומטי -->
        <button
          onclick={handleNextPuzzle}
          class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-green-700 px-12 py-8 text-4xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span class="flex items-center gap-4">🧩 פאזל הבא</span>
        </button>
      {:else}
        <!-- מצב ידני -->
        <button
          onclick={handleNextPuzzle}
          class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-green-700 px-12 py-8 text-4xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span class="flex items-center gap-4">🧩 פאזל הבא</span>
        </button>
      {/if}
    </div>
  </div>
{:else if gameState.phase === "REWARD_TIME" && settings.gameMode !== "continuous"}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div class="animate-fade-in text-center">
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
  </div>
{/if}

<style>
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
