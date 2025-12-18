<script lang="ts">
  import { goto } from "$app/navigation";
  import { gameState } from "$lib/stores/game-state.svelte";

  function handleStart() {
    gameState.startRound(); // Initialize state if needed
    goto("/game");
  }
</script>

<svelte:head>
  <title>משחק רכבת החיבור</title>
  <meta name="description" content="משחק לתרגול חיבור בשיטת המשך רצף" />
</svelte:head>

<main
  class="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 p-4 min-h-[80vh]"
>
  <div class="animate-fade-in text-center">
    <h1
      class="mb-6 animate-bounce text-5xl font-bold text-white drop-shadow-lg md:text-6xl"
    >
      🚂 רכבת החיבור
    </h1>
    <p class="mb-8 text-xl text-white/90 md:text-2xl">
      בנה את הרכבת וגלה כמה קרונות יש!
    </p>

    <button
      onclick={handleStart}
      class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-400 to-green-600 px-14 py-5 text-3xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-400/50 active:scale-95"
    >
      <span class="relative z-10 flex items-center gap-3"> 🎮 התחל לשחק </span>
      <!-- אפקט ברק -->
      <span
        class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full"
      ></span>
    </button>
  </div>
</main>

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
