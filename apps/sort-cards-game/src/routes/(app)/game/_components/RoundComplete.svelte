<!--
  מסך סיום סיבוב
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";

  interface Props {
    onNextRound: () => void;
    onGetReward?: () => void;
    rewardPending?: boolean;
  }

  let { onNextRound, onGetReward, rewardPending = false }: Props = $props();
</script>

{#if gameState.state === "ROUND_COMPLETE" || gameState.state === "GAME_COMPLETE"}
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div class="animate-fade-in mx-4 rounded-3xl bg-white p-8 md:p-12 text-center shadow-2xl max-w-md w-full">
      <!-- כותרת -->
      <h2 class="mb-4 text-4xl md:text-5xl font-black text-slate-800">
        {gameState.state === "GAME_COMPLETE" ? "🏆 סיימת!" : "🎉 כל הכבוד!"}
      </h2>

      <!-- סטטיסטיקות -->
      <div class="mb-6 flex justify-center gap-6 text-lg">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-500">{gameState.round?.correctCount ?? 0}</div>
          <div class="text-slate-500">נכון</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-red-400">{gameState.round?.wrongCount ?? 0}</div>
          <div class="text-slate-500">טעויות</div>
        </div>
      </div>

      <!-- כפתורים -->
      <div class="flex flex-col gap-3">
        {#if gameState.state === "GAME_COMPLETE"}
          <button
            onclick={() => { gameState.reset(); }}
            class="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 px-8 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            🔄 שחק שוב
          </button>
        {:else}
          <button
            onclick={onNextRound}
            class="rounded-2xl bg-gradient-to-br from-green-500 to-green-700 px-8 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            ➡️ סיבוב הבא
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if gameState.state === "REWARD_TIME"}
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div class="animate-fade-in mx-4 rounded-3xl bg-white p-8 md:p-12 text-center shadow-2xl max-w-md w-full">
      <h2 class="mb-6 text-5xl font-black text-slate-800">
        🎉 מגיע לך פרס!
      </h2>
      <button
        onclick={onGetReward}
        disabled={rewardPending}
        class="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 px-10 py-5 text-3xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
      >
        🎁 קבל פרס
      </button>
    </div>
  </div>
{/if}

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }
</style>
