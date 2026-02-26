<!--
  משוב ויזואלי — נכון/שגוי
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";
</script>

{#if gameState.state === "FEEDBACK_CORRECT"}
  <div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
    <div class="feedback-correct rounded-3xl bg-green-500/90 px-12 py-8 text-center shadow-2xl backdrop-blur-sm">
      <div class="text-6xl mb-3 animate-success-pop">✓</div>
      <p class="text-3xl font-black text-white">נכון!</p>

      <!-- כוכבים מרחפים -->
      <span class="star" style="--delay: 0s; --x: -40px;">⭐</span>
      <span class="star" style="--delay: 0.1s; --x: 40px;">⭐</span>
      <span class="star" style="--delay: 0.2s; --x: -20px;">🌟</span>
      <span class="star" style="--delay: 0.3s; --x: 30px;">✨</span>
    </div>
  </div>
{/if}


<style>
  @keyframes success-pop {
    0% { transform: scale(0); }
    50% { transform: scale(1.3) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg); }
  }

  .animate-success-pop {
    animation: success-pop 0.4s ease-out;
  }

  @keyframes star-float {
    0% { opacity: 1; transform: translateY(0) translateX(var(--x, 0)); }
    100% { opacity: 0; transform: translateY(-80px) translateX(var(--x, 0)); }
  }

  .star {
    position: absolute;
    font-size: 1.5rem;
    animation: star-float 0.8s ease-out var(--delay, 0s) forwards;
  }

  .feedback-correct {
    position: relative;
  }
</style>
