<!--
	Overlay משוב - מציג תשובה נכונה או שגויה עם אנימציות מרשימות
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";

  const isCorrect = $derived(gameState.state === "FEEDBACK_CORRECT");
  const isWrong = $derived(gameState.state === "FEEDBACK_WRONG");
  const isVisible = $derived(isCorrect || isWrong);
</script>

{#if isVisible}
  <div
    id="feedback-overlay"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="position: fixed; inset: 0; width: 100%; height: 100%;"
  >
    {#if isCorrect}
      <!-- משוב חיובי עם אנימציית חגיגה -->
      <div
        class="animate-success rounded-3xl bg-gradient-to-br from-green-400 to-green-600 px-16 py-10 text-center text-white shadow-2xl"
      >
        <!-- כוכבים מסביב -->
        <div class="stars">
          <span class="star">⭐</span>
          <span class="star">✨</span>
          <span class="star">🌟</span>
          <span class="star">⭐</span>
        </div>

        <div class="animate-bounce text-8xl">✓</div>
        <div class="mt-4 text-4xl font-bold">נכון!</div>
        <div class="mt-2 text-xl">כל הכבוד! 🎉</div>
      </div>
    {:else if isWrong}
      <!-- משוב שגיאה עם אנימציית רעידה -->
      <div
        class="animate-shake rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 px-12 py-8 text-center text-white shadow-2xl"
      >
        <div class="text-7xl">✗</div>
        <div class="mt-3 text-2xl font-bold">לא נכון</div>
        <div class="mt-2 text-lg">
          היו <span class="font-bold">{gameState.round.a}</span>
          + הוספת <span class="font-bold">{gameState.round.b}</span>
        </div>
        <div class="mt-2 text-lg font-medium">נסה שוב! 💪</div>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* אנימציית הצלחה */
  @keyframes success-pop {
    0% {
      transform: scale(0) rotate(-10deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(5deg);
    }
    70% {
      transform: scale(0.9) rotate(-3deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  .animate-success {
    animation: success-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* כוכבים מסביב */
  .stars {
    position: absolute;
    inset: -30px;
    pointer-events: none;
  }

  .star {
    position: absolute;
    font-size: 2rem;
    animation: star-float 1s ease-out forwards;
  }

  .star:nth-child(1) {
    top: 0;
    left: 20%;
    animation-delay: 0.1s;
  }
  .star:nth-child(2) {
    top: 10%;
    right: 10%;
    animation-delay: 0.2s;
  }
  .star:nth-child(3) {
    bottom: 10%;
    left: 10%;
    animation-delay: 0.3s;
  }
  .star:nth-child(4) {
    bottom: 0;
    right: 20%;
    animation-delay: 0.4s;
  }

  @keyframes star-float {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.5) rotate(180deg);
      opacity: 1;
    }
    100% {
      transform: scale(1) rotate(360deg) translateY(-20px);
      opacity: 0.7;
    }
  }

  /* אנימציית רעידה לטעות */
  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
      transform: translateX(-8px);
    }
    20%,
    40%,
    60%,
    80% {
      transform: translateX(8px);
    }
  }

  .animate-shake {
    animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
  }
</style>
