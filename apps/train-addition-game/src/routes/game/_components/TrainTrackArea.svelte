<!--
	אזור המסילה - מציג את כל הקרונות בשורה
	עם מספרים דינמיים מעל כל קבוצה (גם בזמן בנייה)
-->
<script lang="ts">
  import TrainCar from "./TrainCar.svelte";
  import { gameState } from "$lib/stores/game-state.svelte";

  // מערך קרונות קבוצה A
  const carsA = $derived(Array(gameState.round.builtA).fill(null));

  // מערך קרונות קבוצה B
  const carsB = $derived(Array(gameState.round.addedB).fill(null));

  // האם להציג רווח בין הקבוצות
  const showGap = $derived(
    gameState.round.builtA > 0 && gameState.round.addedB > 0
  );

  // האם קרון הוא חדש (האחרון במערך)
  const isNewA = $derived(
    (i: number) =>
      i === gameState.round.builtA - 1 && gameState.state === "BUILD_A"
  );
  const isNewB = $derived(
    (i: number) =>
      i === gameState.round.addedB - 1 && gameState.state === "ADD_B"
  );

  // האם להציג את הקטר (תמיד כשהמשחק פעיל)
  const showLocomotive = $derived(
    gameState.state !== "INIT" && gameState.state !== "NEXT_ROUND"
  );

  // האם להציג את סימן החיבור (+)
  const showPlusSign = $derived(
    gameState.round.builtA > 0 && gameState.round.addedB > 0
  );

  const hideBubblesOnMobile = $derived(
    gameState.state === "CHOOSE_ANSWER" ||
      gameState.state === "FEEDBACK_CORRECT" ||
      gameState.state === "FEEDBACK_WRONG"
  );
</script>

<div class="relative flex w-full flex-col items-center justify-center px-4">
  <!-- מסילה - הוסרה לטובת הרקע הכללי, או אם רוצים אפשר להוסיף תמונה של מסילה שטוחה כאן -->
  <!-- כרגע נסיר את הציור CSS כדי שהרכבת "תשב" על הדשא -->

  <!-- קרונות -->
  <div class="relative z-10 flex items-end gap-0" dir="ltr">
    <!-- קטר - מוצג תמיד כשהמשחק פעיל (קובץ SVG חיצוני) -->
    {#if showLocomotive}
      <div class="relative mr-1">
        <img
          src="/images/locomotive-v2.svg"
          alt="קטר"
          class="h-20 w-20 md:h-32 md:w-32 filter drop-shadow-lg"
        />
      </div>
    {/if}

    <!-- קבוצה A עם מספר דינמי מעל -->
    {#if carsA.length > 0}
      <div class="relative flex flex-col items-center">
        <!-- מספר מעל קבוצה A - מוצג תמיד (גם בזמן בנייה) -->
        <div
          class="{hideBubblesOnMobile
            ? 'hidden md:flex'
            : 'flex'} mb-1 h-10 w-10 items-center justify-center rounded-full bg-green-500 text-2xl font-bold text-white shadow-lg ring-2 ring-green-300 sm:ring-4 sm:mb-2 sm:h-16 sm:w-16 sm:text-4xl md:h-24 md:w-24 md:text-6xl"
        >
          {gameState.round.builtA}
        </div>

        <!-- קרונות קבוצה A -->
        <div class="flex">
          {#each carsA as _, i}
            <TrainCar group="a" isNew={isNewA(i)} />
          {/each}
        </div>
      </div>
    {/if}

    <!-- סימן חיבור (+) -->
    {#if showPlusSign}
      <div
        class="{hideBubblesOnMobile
          ? 'hidden md:flex'
          : 'flex'} mx-1 h-8 w-8 self-start mt-1 items-center justify-center rounded-full bg-amber-500 text-2xl font-bold text-white shadow-lg sm:h-14 sm:w-14 sm:text-4xl sm:mx-3 sm:mt-2 md:h-20 md:w-20 md:text-5xl md:mt-4 border-2 sm:border-4 border-white"
      >
        +
      </div>
    {/if}

    <!-- קבוצה B עם מספר דינמי מעל -->
    {#if carsB.length > 0}
      <div class="relative flex flex-col items-center">
        <!-- מספר מעל קבוצה B - מוצג תמיד (גם בזמן בנייה) -->
        <div
          class="{hideBubblesOnMobile
            ? 'hidden md:flex'
            : 'flex'} mb-1 h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white shadow-lg ring-2 ring-blue-300 sm:ring-4 sm:mb-2 sm:h-16 sm:w-16 sm:text-4xl md:h-24 md:w-24 md:text-6xl"
        >
          {gameState.round.addedB}
        </div>

        <!-- קרונות קבוצה B -->
        <div class="flex">
          {#each carsB as _, i}
            <TrainCar group="b" isNew={isNewB(i)} />
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
