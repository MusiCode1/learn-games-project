<!--
	מאגר קרונות - כפתור להוספת קרון עם אנימציות
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";

  // האם הכפתור פעיל
  const isActive = $derived(
    gameState.state === "BUILD_A" || gameState.state === "ADD_B"
  );

  // ספירה נוכחית והמטרה
  const current = $derived(
    gameState.state === "BUILD_A"
      ? gameState.round.builtA
      : gameState.round.addedB
  );
  const target = $derived(
    gameState.state === "BUILD_A" ? gameState.round.a : gameState.round.b
  );

  // צבע לפי קבוצה
  const buttonColors = $derived(
    gameState.state === "BUILD_A"
      ? "from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
      : "from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
  );

  // אפקט פעימה
  let isPulsing = $state(true);

  function handleAdd() {
    if (isActive) {
      isPulsing = false; // עצור את הפעימה ברגע שלוחצים
      gameState.addCar();

      // החזר את הפעימה אחרי רגע
      setTimeout(() => {
        isPulsing = true;
      }, 300);
    }
  }
</script>

<div class="flex flex-col items-center gap-4">
  <!-- כפתור הוספה -->
  <button
    onclick={handleAdd}
    disabled={!isActive}
    class="group relative flex items-center justify-center gap-3 rounded-2xl
		px-4 py-2 text-base sm:px-6 sm:py-3 sm:text-lg md:px-10 md:py-5 md:text-xl font-bold text-white shadow-xl transition-all duration-300
			{isActive
      ? `bg-linear-to-br ${buttonColors} active:scale-95`
      : 'cursor-not-allowed bg-gray-400'}"
    class:animate-pulse-glow={isActive && isPulsing}
    aria-label="הוסף קרון"
  >
    <!-- אייקון פלוס עם אנימציה -->
    <svg
      class="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="3"
        d="M12 4v16m8-8H4"
      />
    </svg>

    <span class="text-lg sm:text-xl md:text-2xl">הוסף קרון</span>

    <!-- אפקט גל בלחיצה -->
    <span class="ripple"></span>
  </button>

  <!-- מונה התקדמות עם אנימציה -->
  {#if isActive}
    <div class="flex items-center gap-2 text-lg font-medium text-slate-600">
      <span class="transition-all duration-300" class:scale-125={current > 0}
        >{current}</span
      >
      <span>/</span>
      <span>{target}</span>

      <!-- פס התקדמות -->
      <div class="ml-3 h-3 w-24 overflow-hidden rounded-full bg-slate-200">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out {gameState.state ===
          'BUILD_A'
            ? 'bg-green-500'
            : 'bg-blue-500'}"
          style="width: {(current / target) * 100}%"
        ></div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* אנימציית זוהר פעימה */
  @keyframes pulse-glow {
    0%,
    100% {
      box-shadow:
        0 0 20px rgba(74, 222, 128, 0.4),
        0 10px 30px rgba(0, 0, 0, 0.2);
    }
    50% {
      box-shadow:
        0 0 40px rgba(74, 222, 128, 0.6),
        0 10px 30px rgba(0, 0, 0, 0.3);
    }
  }

  .animate-pulse-glow {
    animation: pulse-glow 1.5s ease-in-out infinite;
  }

  /* אפקט גל בלחיצה */
  .ripple {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
  }

  button:active .ripple::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 70%
    );
    animation: ripple-effect 0.4s ease-out;
  }

  @keyframes ripple-effect {
    from {
      transform: scale(0);
      opacity: 1;
    }
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
</style>
