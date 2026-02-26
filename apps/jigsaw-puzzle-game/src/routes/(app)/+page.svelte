<script lang="ts">
  import { goto } from "$app/navigation";
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { ALL_IMAGE_PACKS } from "$lib/data/image-packs";
  import { GRID_PRESETS } from "$lib/types";

  function handleStart() {
    gameState.startGame();
    goto("/game");
  }
</script>

<svelte:head>
  <title>משחק פאזל</title>
  <meta name="description" content="משחק פאזל חינוכי — הרכבת תמונות" />
</svelte:head>

<main
  class="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 p-4"
>
  <div class="animate-fade-in text-center max-w-lg w-full">
    <!-- כותרת -->
    <h1
      class="mb-4 text-5xl font-black text-slate-800 drop-shadow-sm md:text-6xl"
    >
      🧩 פאזל
    </h1>
    <p class="mb-8 text-xl text-slate-600 md:text-2xl">
      גרור את החלקים והרכב את התמונה!
    </p>

    <!-- בחירת חבילת תמונות -->
    <div class="mb-6">
      <label class="block text-lg font-bold text-slate-700 mb-3">
        בחר נושא:
      </label>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {#each ALL_IMAGE_PACKS as pack}
          <button
            onclick={() => { settings.imagePackId = pack.id; }}
            class="pack-card rounded-xl p-4 text-right transition-all duration-200 {settings.imagePackId === pack.id
              ? 'bg-sky-400 shadow-lg scale-[1.02] ring-2 ring-sky-500'
              : 'bg-white/80 shadow-md hover:shadow-lg hover:scale-[1.01]'}"
          >
            <div class="flex items-center gap-3">
              <span class="text-3xl">{pack.icon}</span>
              <div>
                <div class="font-bold text-slate-800">{pack.name}</div>
                <div class="text-sm text-slate-500">{pack.description}</div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- בחירת גודל רשת -->
    <div class="mb-8">
      <label class="block text-lg font-bold text-slate-700 mb-3">
        גודל פאזל: {GRID_PRESETS[settings.gridPresetIndex].label}
      </label>
      <div class="flex flex-wrap justify-center gap-2">
        {#each GRID_PRESETS as preset, i}
          <button
            onclick={() => { settings.gridPresetIndex = i; }}
            class="rounded-lg px-4 py-2 text-lg font-bold transition-all duration-200 {settings.gridPresetIndex === i
              ? 'bg-sky-500 text-white shadow-lg scale-105'
              : 'bg-white/80 text-slate-700 shadow-md hover:shadow-lg hover:scale-[1.02]'}"
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- כפתור התחלה -->
    <button
      onclick={handleStart}
      class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-400 to-green-600 px-14 py-5 text-3xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-400/50 active:scale-95"
    >
      <span class="relative z-10 flex items-center gap-3">🎮 התחל לשחק</span>
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
