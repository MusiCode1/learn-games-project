<!--
  לוח ספרות בסגנון מסך נעילה של iPad
  פריסה: 1 2 3 / 4 5 6 / 7 8 9 / _ 0 ⌫
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";

  type KeyRow = (string | null)[];

  const ROWS: KeyRow[] = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [null, "0", "backspace"],
  ];

  function handleDigit(digit: string) {
    gameState.pressDigit(digit);
  }

  function handleBackspace() {
    gameState.backspace();
  }

  const isDisabled = $derived(
    gameState.state === "ERROR" ||
    gameState.state === "SUCCESS" ||
    gameState.state === "REWARD"
  );

  const showBackspace = $derived(gameState.entered.length > 0);
</script>

<div class="flex flex-col items-center gap-4">
  {#each ROWS as row}
    <div class="flex gap-4">
      {#each row as key}
        {#if key === null}
          <!-- תא ריק לשמירת layout -->
          <div class="h-20 w-20"></div>
        {:else if key === "backspace"}
          {#if showBackspace}
            <button
              onclick={handleBackspace}
              disabled={isDisabled}
              aria-label="מחק ספרה"
              class="h-20 w-20 rounded-full bg-slate-600/60 text-3xl text-white shadow-md
                     backdrop-blur-sm transition-all duration-150
                     hover:bg-slate-500/80 active:scale-90 active:bg-slate-400/80
                     disabled:cursor-not-allowed disabled:opacity-40"
            >
              ⌫
            </button>
          {:else}
            <div class="h-20 w-20"></div>
          {/if}
        {:else}
          <button
            onclick={() => handleDigit(key)}
            disabled={isDisabled}
            aria-label={key}
            class="h-20 w-20 rounded-full bg-white/20 text-4xl font-light text-white shadow-md
                   backdrop-blur-sm ring-1 ring-white/30 transition-all duration-150
                   hover:bg-white/35 active:scale-90 active:bg-white/50
                   disabled:cursor-not-allowed disabled:opacity-40"
          >
            {key}
          </button>
        {/if}
      {/each}
    </div>
  {/each}
</div>
