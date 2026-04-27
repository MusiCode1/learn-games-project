<script lang="ts">
  import { goto } from "$app/navigation";
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { ALL_IMAGE_PACKS } from "$lib/data/image-packs";
  import { GRID_PRESETS, BEGINNER_MAX_GRID_INDEX } from "$lib/types";
  import type { ShapeStyle } from "$lib/types";

  const SHAPE_STYLES: { value: ShapeStyle; label: string }[] = [
    { value: "classic", label: "קלאסי" },
    { value: "triangle", label: "משולש" },
    { value: "round", label: "עגול" },
    { value: "straight", label: "ישר" },
  ];

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
  class="relative z-10 flex flex-1 flex-col items-center overflow-y-auto p-4"
>
  <div class="animate-fade-in w-full max-w-4xl">
    <!-- כותרת -->
    <div class="text-center mb-6">
      <h1
        class="mb-2 text-5xl font-black text-slate-800 drop-shadow-sm md:text-6xl"
      >
        🧩 פאזל
      </h1>
      <p class="text-xl text-slate-600 md:text-2xl">
        גרור את החלקים והרכב את התמונה!
      </p>
    </div>

    <!-- שורה עליונה: חבילת תמונות (שמאל) + הגדרות (ימין) -->
    <div class="flex flex-col lg:flex-row gap-6 mb-6">
      <!-- בחירת חבילת תמונות -->
      <div class="flex-1">
        <label class="block text-lg font-bold text-slate-700 mb-3">
          בחר נושא:
        </label>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {#each ALL_IMAGE_PACKS as pack}
            <button
              onclick={() => { settings.imagePackId = pack.id; }}
              class="pack-card rounded-xl p-3 text-right transition-all duration-200 {settings.imagePackId === pack.id
                ? 'bg-sky-400 shadow-lg scale-[1.02] ring-2 ring-sky-500'
                : 'bg-white/80 shadow-md hover:shadow-lg hover:scale-[1.01]'}"
            >
              <div class="flex items-center gap-2">
                <span class="text-2xl">{pack.icon}</span>
                <div class="min-w-0">
                  <div class="font-bold text-slate-800 text-sm">{pack.name}</div>
                  <div class="text-xs text-slate-500 truncate">{pack.description}</div>
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- הגדרות: גודל + סגנון -->
      <div class="flex flex-col gap-6 lg:w-64">
        <!-- בחירת גודל רשת -->
        <div>
          <label class="block text-lg font-bold text-slate-700 mb-3">
            גודל פאזל: {GRID_PRESETS[settings.gridPresetIndex].label}
          </label>
          <div class="flex flex-wrap justify-center gap-2">
            {#each GRID_PRESETS as preset, i}
              {@const disabled = settings.beginnerMode && i > BEGINNER_MAX_GRID_INDEX}
              <button
                onclick={() => { if (!disabled) settings.gridPresetIndex = i; }}
                {disabled}
                class="rounded-lg px-3 py-2 text-base font-bold transition-all duration-200 {settings.gridPresetIndex === i
                  ? 'bg-sky-500 text-white shadow-lg scale-105'
                  : disabled
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    : 'bg-white/80 text-slate-700 shadow-md hover:shadow-lg hover:scale-[1.02]'}"
              >
                {preset.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- בחירת סגנון צורה -->
        <div>
          <label class="block text-lg font-bold text-slate-700 mb-3">
            סגנון חלקים:
          </label>
          <div class="flex flex-wrap justify-center gap-2">
            {#each SHAPE_STYLES as style}
              <button
                onclick={() => { settings.shapeStyle = style.value; }}
                class="rounded-lg px-3 py-2 text-base font-bold transition-all duration-200 {settings.shapeStyle === style.value
                  ? 'bg-sky-500 text-white shadow-lg scale-105'
                  : 'bg-white/80 text-slate-700 shadow-md hover:shadow-lg hover:scale-[1.02]'}"
              >
                {style.label}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- כפתור התחלה -->
    <div class="text-center pb-4">
      <button
        onclick={handleStart}
        class="group relative overflow-hidden rounded-2xl bg-linear-to-br from-green-400 to-green-600 px-14 py-5 text-3xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-400/50 active:scale-95"
      >
        <span class="relative z-10 flex items-center gap-3">🎮 התחל לשחק</span>
        <span
          class="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full"
        ></span>
      </button>
    </div>
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
