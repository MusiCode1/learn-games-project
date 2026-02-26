<!--
  מסך סיום פאזל — הצגת הפאזל המושלם 5 שניות, אז כפתור המשך / פרס
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { boosterService } from "learn-booster-kit";

  let isRewardPending = $state(false);

  /** האם עברו 5 שניות מרגע השלמת הפאזל */
  let showcaseFinished = $state(false);
  let showcaseTimer: ReturnType<typeof setTimeout> | null = null;

  // כשנכנסים ל-PUZZLE_COMPLETE — מתחילים ספירה של 5 שניות
  $effect(() => {
    if (gameState.phase === "PUZZLE_COMPLETE") {
      showcaseFinished = false;
      showcaseTimer = setTimeout(() => {
        showcaseFinished = true;

        // במצב רציף — ממשיכים אוטומטית אחרי ה-showcase
        if (settings.gameMode === "continuous") {
          gameState.nextPuzzle();
        }
      }, 5000);
    } else {
      // ניקוי
      if (showcaseTimer) {
        clearTimeout(showcaseTimer);
        showcaseTimer = null;
      }
      showcaseFinished = false;
    }
  });

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

  // טריגר אוטומטי במצב רציף — פרס
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
  <!-- שכבת חגיגה שקופה למחצה — הפאזל המושלם נראה מאחוריה -->
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-end pb-12 pointer-events-none">
    <!-- באנר חגיגה — תמיד מוצג -->
    <div class="animate-fade-in text-center pointer-events-none">
      <h2 class="mb-4 text-5xl font-black text-white drop-shadow-lg"
        style="text-shadow: 0 2px 12px rgba(0,0,0,0.5)">
        🎉 כל הכבוד! 🎉
      </h2>
      {#if gameState.currentImage}
        <p class="mb-6 text-3xl text-white font-bold"
          style="text-shadow: 0 2px 8px rgba(0,0,0,0.5)">
          {gameState.currentImage.name}
        </p>
      {/if}
    </div>

    <!-- כפתורי פעולה — מופיעים רק אחרי 5 שניות, במצב ידני -->
    {#if showcaseFinished && settings.gameMode === "manual_end"}
      <div class="animate-fade-in pointer-events-auto">
        <button
          onclick={handleNextPuzzle}
          class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-green-700 px-12 py-8 text-4xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span class="flex items-center gap-4">🧩 פאזל הבא</span>
        </button>
      </div>
    {/if}
  </div>

  <!-- רקע חצי-שקוף — מופיע רק כשמציגים כפתורים -->
  {#if showcaseFinished && settings.gameMode === "manual_end"}
    <div class="fixed inset-0 z-40 bg-black/30"></div>
  {/if}
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
