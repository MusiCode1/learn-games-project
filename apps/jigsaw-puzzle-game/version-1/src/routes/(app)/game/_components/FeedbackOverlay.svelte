<!--
  אנימציית משוב כשחלק מתחבר
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";
</script>

{#if gameState.phase === "PIECE_FEEDBACK"}
  <div class="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
    <div class="animate-piece-feedback text-6xl">
      ✨
    </div>
  </div>
{/if}

<style>
  @keyframes piece-feedback {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
    100% {
      opacity: 0;
      transform: scale(1.5);
    }
  }

  .animate-piece-feedback {
    animation: piece-feedback 0.6s ease-out forwards;
  }
</style>
