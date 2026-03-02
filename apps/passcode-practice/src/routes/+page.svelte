<script lang="ts">
  import NumericKeypad from "./_components/NumericKeypad.svelte";
  import PasscodeDots from "./_components/PasscodeDots.svelte";
  import PasscodeHint from "./_components/PasscodeHint.svelte";
  import FeedbackOverlay from "./_components/FeedbackOverlay.svelte";
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import {
    boosterService,
    ProgressWidget,
    type Config,
  } from "learn-booster-kit";
  import { onDestroy, onMount } from "svelte";

  let config = $state<Config>();
  let unsubscribeConfig: (() => void) | undefined;
  let isRewardPending = $state(false);

  onMount(async () => {
    await boosterService.init();
    unsubscribeConfig = boosterService.config.subscribe((value) => {
      config = value;
    });
  });

  onDestroy(() => {
    unsubscribeConfig?.();
  });

  async function handleGetReward() {
    if (isRewardPending) return;
    isRewardPending = true;
    await boosterService.triggerReward();
    gameState.completeReward();
    isRewardPending = false;
  }

  // הפעלת פרס אוטומטית כשמגיע ל-REWARD
  $effect(() => {
    if (gameState.state === "REWARD") {
      handleGetReward();
    }
  });

  // איפוס isRewardPending כשיוצאים ממצב REWARD
  $effect(() => {
    if (gameState.state !== "REWARD") {
      isRewardPending = false;
    }
  });

  const progressValue = $derived(gameState.winsSinceLastReward);
  const progressMax = $derived(config?.turnsPerReward ?? 3);

  // ספירה לאחור לcooldown
  let now = $state(Date.now());
  $effect(() => {
    const interval = setInterval(() => {
      now = Date.now();
    }, 100);
    return () => clearInterval(interval);
  });

  const cooldownRemaining = $derived(
    gameState.state === "ERROR"
      ? Math.max(0, Math.ceil((gameState.cooldownUntilTs - now) / 1000))
      : 0
  );
</script>

<svelte:head>
  <title>תרגול סיסמא</title>
</svelte:head>

<main class="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-4 py-6">

  <!-- Progress Widget (פינה שמאלית עליונה) -->
  {#if settings.boosterEnabled && config}
    <div class="absolute top-4 left-2 z-50 pointer-events-auto">
      <ProgressWidget
        value={progressValue}
        max={progressMax}
        orientation="vertical"
        label="לפרס"
      />
    </div>
  {/if}

  <!-- אזור מרכזי -->
  <div class="flex w-full max-w-xs flex-col items-center gap-6">

    <!-- כרטיס רמז (מוצג כשshowHint מופעל) -->
    <PasscodeHint />

    <!-- נקודות התקדמות -->
    <PasscodeDots />

    <!-- ספירה לאחור בשגיאה -->
    {#if gameState.state === "ERROR" && cooldownRemaining > 0}
      <div class="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-red-300">
        <span class="text-2xl font-bold">{cooldownRemaining}</span>
        <span class="text-sm">שניות להמתנה</span>
      </div>
    {/if}

    <!-- לוח הספרות -->
    <NumericKeypad />

  </div>
</main>

<!-- Overlay משוב -->
<FeedbackOverlay />
