<!--
  כרטיס רמז — מצב showHint: מציג תמיד.
  מצב עיוור (!showHint): כפתור רמז עם 2 טיימרים סדרתיים:
    שלב 1 — רמז גלוי (אמבר)
    שלב 2 — המתנה (לבן)
-->
<script lang="ts">
  import { settings } from "$lib/stores/settings.svelte";
  import { gameState } from "$lib/stores/game-state.svelte";

  interface Props {
    now: number;
  }

  let { now }: Props = $props();

  const isHintVisible = $derived(now < gameState.hintVisibleUntilTs);
  const isOnCooldown  = $derived(now < gameState.hintCooldownUntilTs);

  // שלב 1: טיימר הצגת הרמז (צהוב/אמבר)
  const visibleRemaining = $derived(
    isHintVisible ? Math.ceil((gameState.hintVisibleUntilTs - now) / 1000) : 0
  );
  const visibleProgress = $derived(
    isHintVisible
      ? ((gameState.hintVisibleUntilTs - now) / settings.hintVisibleMs) * 100
      : 0
  );

  // שלב 2: טיימר המתנה — רק לאחר שהרמז נעלם
  const waitRemaining = $derived(
    !isHintVisible && isOnCooldown
      ? Math.ceil((gameState.hintCooldownUntilTs - now) / 1000)
      : 0
  );
  const waitProgress = $derived(
    !isHintVisible && isOnCooldown
      ? ((gameState.hintCooldownUntilTs - now) / settings.hintCooldownMs) * 100
      : 0
  );

  const CIRCUMFERENCE = 220;
</script>

{#if settings.isPasscodeValid}
  {#if settings.showHint}
    <!-- מצב תמידי: הסיסמא תמיד גלויה -->
    <div
      class="rounded-2xl bg-white/15 px-8 py-4 shadow-lg backdrop-blur-sm
             ring-1 ring-white/30 text-center"
      aria-label="הסיסמא לתרגול"
    >
      <p class="mb-2 text-xs font-medium uppercase tracking-wider text-white/60">
        הסיסמא לתרגול
      </p>
      <div class="flex justify-center gap-3" dir="ltr">
        {#each settings.passcode.split("") as digit}
          <span class="text-5xl font-bold text-white drop-shadow-sm">
            {digit}
          </span>
        {/each}
      </div>
    </div>

  {:else}
    <!-- מצב עיוור -->
    <div class="flex flex-col items-center gap-3">

      {#if isHintVisible}
        <!-- שלב 1: הסיסמא גלויה + טיימר אמבר -->
        <div
          class="rounded-2xl bg-amber-400/20 px-8 py-4 shadow-lg backdrop-blur-sm
                 ring-1 ring-amber-300/40 text-center"
          aria-label="רמז: הסיסמא לתרגול"
        >
          <p class="mb-2 text-xs font-medium uppercase tracking-wider text-amber-300/80">
            💡 רמז
          </p>
          <div class="flex justify-center gap-3" dir="ltr">
            {#each settings.passcode.split("") as digit}
              <span class="text-5xl font-bold text-white drop-shadow-sm">
                {digit}
              </span>
            {/each}
          </div>
        </div>

        <!-- SVG countdown אמבר — זמן הצגת הרמז -->
        <div class="relative flex h-14 w-14 items-center justify-center">
          <svg viewBox="0 0 80 80" class="absolute inset-0 -rotate-90 h-full w-full">
            <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(251,191,36,0.2)" stroke-width="6"/>
            <circle
              cx="40" cy="40" r="35" fill="none"
              stroke="rgba(251,191,36,0.85)" stroke-width="6"
              stroke-linecap="round"
              stroke-dasharray="{(visibleProgress / 100) * CIRCUMFERENCE} {CIRCUMFERENCE}"
            />
          </svg>
          <span class="relative text-lg font-bold text-amber-300">{visibleRemaining}</span>
        </div>

      {:else if isOnCooldown}
        <!-- שלב 2: המתנה — SVG לבן -->
        <div class="relative flex h-16 w-16 items-center justify-center">
          <svg viewBox="0 0 80 80" class="absolute inset-0 -rotate-90 h-full w-full">
            <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="6"/>
            <circle
              cx="40" cy="40" r="35" fill="none"
              stroke="rgba(255,255,255,0.7)" stroke-width="6"
              stroke-linecap="round"
              stroke-dasharray="{(waitProgress / 100) * CIRCUMFERENCE} {CIRCUMFERENCE}"
            />
          </svg>
          <span class="relative text-xl font-bold text-white">{waitRemaining}</span>
        </div>

      {:else}
        <!-- כפתור רמז זמין -->
        <button
          onclick={() => gameState.useHint()}
          class="flex items-center gap-2 rounded-2xl bg-white/15 px-6 py-3 text-white
                 shadow-lg backdrop-blur-sm ring-1 ring-white/30
                 transition-all duration-150 active:scale-95 hover:bg-white/25"
          aria-label="הצג רמז"
        >
          <span class="text-2xl">💡</span>
          <span class="text-lg font-bold">רמז</span>
        </button>
      {/if}

    </div>
  {/if}
{/if}
