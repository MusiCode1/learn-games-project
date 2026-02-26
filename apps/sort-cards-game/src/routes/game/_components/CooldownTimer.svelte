<!--
  טיימר cooldown עגול — SVG עם ספירה לאחור
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";

  let now = $state(Date.now());

  // עדכון כל 100ms
  $effect(() => {
    const interval = setInterval(() => {
      now = Date.now();
    }, 100);
    return () => clearInterval(interval);
  });

  const isOnCooldown = $derived(now < gameState.cooldownUntilTs);

  const cooldownRemaining = $derived(
    isOnCooldown ? Math.ceil((gameState.cooldownUntilTs - now) / 1000) : 0,
  );

  const cooldownProgress = $derived(
    isOnCooldown
      ? ((gameState.cooldownUntilTs - now) / settings.cooldownMs) * 100
      : 0,
  );
</script>

<div
  class="flex flex-col items-center gap-2 transition-opacity duration-300 {isOnCooldown
    ? 'opacity-100'
    : 'invisible opacity-0'}"
  aria-hidden={!isOnCooldown}
>
  <!-- עיגול SVG -->
  <div
    class="relative flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center"
  >
    <!-- רקע -->
    <svg
      class="absolute h-14 w-14 sm:h-20 sm:w-20 -rotate-90"
      viewBox="0 0 80 80"
    >
      <circle
        cx="40"
        cy="40"
        r="35"
        fill="none"
        stroke="#e5e7eb"
        stroke-width="6"
      />
      <!-- התקדמות -->
      <circle
        cx="40"
        cy="40"
        r="35"
        fill="none"
        stroke="#ef4444"
        stroke-width="6"
        stroke-linecap="round"
        stroke-dasharray="{(cooldownProgress / 100) * 220} 220"
      />
    </svg>
    <!-- מספר במרכז -->
    <span class="text-xl sm:text-3xl font-bold text-red-500"
      >{cooldownRemaining}</span
    >
  </div>
  <span class="text-lg font-medium text-slate-600">המתן...</span>
</div>
