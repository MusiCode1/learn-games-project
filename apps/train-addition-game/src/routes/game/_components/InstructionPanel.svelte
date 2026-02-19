<!--
	פאנל הוראות - מציג את ההוראה הנוכחית עם מספר גדול
	עיצוב "ענן" / טקסט צף לשילוב ברקע
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte"; // ייבוא settings
  import { speakBuildA, speakAddB, speakChooseAnswer } from "$lib/utils/tts";

  // חישוב ההוראה לפי המצב
  const instruction = $derived.by(() => {
    switch (gameState.state) {
      case "BUILD_A":
        return `שים ${gameState.round.a} קרונות`;
      case "ADD_B":
        return `הוסף עוד ${gameState.round.b} קרונות`;
      case "CHOOSE_ANSWER":
      case "FEEDBACK_WRONG":
        return "כמה קרונות יש עכשיו?";
      case "FEEDBACK_CORRECT":
        return "נכון! 🎉";
      case "ASSIST_OVERLAY":
        return "בוא נראה יחד...";
      default:
        return "לחץ להתחלה";
    }
  });

  // המספר להצגה ליד ההוראה
  const targetNumber = $derived(
    gameState.state === "BUILD_A"
      ? gameState.round.a
      : gameState.state === "ADD_B"
        ? gameState.round.b
        : null
  );

  // צבע המספר לפי השלב
  const numberColor = $derived(
    gameState.state === "BUILD_A"
      ? "bg-green-500 ring-green-300"
      : "bg-blue-500 ring-blue-300"
  );

  // השמעה חוזרת של ההוראה
  function replay() {
    if (!settings.voiceEnabled) return;

    switch (gameState.state) {
      case "BUILD_A":
        speakBuildA(gameState.round.a);
        break;
      case "ADD_B":
        speakAddB(gameState.round.b);
        break;
      case "CHOOSE_ANSWER":
        speakChooseAnswer();
        break;
    }
  }
</script>

<!-- הקונטיינר הראשי מרחף, ללא רקע מגביל -->
<div class="flex flex-col items-center gap-4 py-4 drop-shadow-xl">
  <!-- הוראה עם מספר גדול -->
  <div class="flex items-center gap-6">
    <!-- מספר גדול -->
    {#if targetNumber !== null}
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full {numberColor} text-3xl font-black text-white shadow-2xl ring-4 transform scale-110 sm:h-14 sm:w-14 sm:text-4xl md:h-16 md:w-16 md:text-5xl xl:h-24 xl:w-24 xl:text-6xl bg-white/10 backdrop-blur-sm border-2 border-white/50"
      >
        {targetNumber}
      </div>
    {/if}

    <!-- הוראה טקסטית - בתוך "ענן" עדין -->
    <div
      class="flex flex-row items-center gap-2 sm:gap-4 bg-white/80 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-2 rounded-full border border-white/60 shadow-lg"
    >
      <p
        data-testid="instruction-text"
        class="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl xl:text-4xl text-stroke"
      >
        {instruction}
      </p>

      <!-- כפתור השמעה -->
      <button
        onclick={replay}
        disabled={!(
          gameState.state === "BUILD_A" ||
          gameState.state === "ADD_B" ||
          gameState.state === "CHOOSE_ANSWER"
        )}
        class="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-white shadow-md transition-all hover:scale-110 hover:bg-amber-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="השמע שוב"
      >
        <svg class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
          />
        </svg>
      </button>
    </div>
  </div>
</div>

<style type="text/postcss">
  /* הוספת קונטור עדין לטקסט לקריאות משופרת על רקע השמיים */
  .text-stroke {
    text-shadow:
      1px 1px 0 #fff,
      -1px -1px 0 #fff,
      1px -1px 0 #fff,
      -1px 1px 0 #fff;
  }
</style>
