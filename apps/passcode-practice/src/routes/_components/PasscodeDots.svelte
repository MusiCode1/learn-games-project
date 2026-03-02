<!--
  נקודות התקדמות — מספר הנקודות = אורך הסיסמא
  נקודה מלאה = הוכנסה, נקודה ריקה = ממתינה
  אנימציות: shake בשגיאה, bounce בהצלחה
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";

  const passcodeLength = $derived(settings.passcode.length);
  const filledCount = $derived(gameState.entered.length);

  const isError = $derived(gameState.state === "ERROR");
  const isSuccess = $derived(gameState.state === "SUCCESS");
</script>

<div
  class="flex items-center justify-center gap-4"
  class:animate-shake={isError}
  class:animate-success-bounce={isSuccess}
  aria-label="הסיסמא: {filledCount} מתוך {passcodeLength} ספרות הוכנסו"
  dir="ltr"
>
  {#each Array(passcodeLength) as _, i}
    <div
      class="h-5 w-5 rounded-full border-2 transition-all duration-200
             {i < filledCount
               ? 'border-white bg-white scale-110'
               : 'border-white/60 bg-transparent'}"
    ></div>
  {/each}
</div>

<style>
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    15%, 45%, 75% { transform: translateX(-8px); }
    30%, 60%, 90% { transform: translateX(8px); }
  }

  .animate-shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
  }

  @keyframes success-bounce {
    0%, 100% { transform: scale(1); }
    30% { transform: scale(1.25); }
    60% { transform: scale(0.95); }
    80% { transform: scale(1.05); }
  }

  .animate-success-bounce {
    animation: success-bounce 0.6s ease-out;
  }
</style>
