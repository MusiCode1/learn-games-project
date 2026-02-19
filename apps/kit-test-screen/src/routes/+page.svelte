<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { SettingsForm, boosterService, type Config } from "learn-booster-kit";

  let config = $state<Config>();
  let isRewardActive = $state(false);
  let boosterReady = $state(false);

  let unsubscribeConfig: (() => void) | undefined;
  let unsubscribeActive: (() => void) | undefined;

  onMount(async () => {
    await boosterService.init();
    boosterReady = true;
    unsubscribeConfig = boosterService.config.subscribe((value) => {
      config = value;
    });
    unsubscribeActive = boosterService.isRewardActive.subscribe((value) => {
      isRewardActive = value;
    });
  });

  onDestroy(() => {
    unsubscribeConfig?.();
    unsubscribeActive?.();
  });

  async function triggerReward() {

    boosterService.triggerReward();
  }

  function handleShowVideo(newConfig: Config) {
    boosterService.triggerReward(undefined, newConfig);
  }
</script>

<main class="page">
  <header class="header">
    <div>
      <p class="eyebrow">מסך בדיקה</p>
      <h1 class="title">בדיקת learn-booster-kit</h1>
      <p class="subtitle">כוון הגדרות, לחץ הפעלה, וודא חזרה בזמן.</p>
    </div>
    <button
      class="trigger-button"
      disabled={!boosterReady || isRewardActive}
      onclick={triggerReward}
    >
      {isRewardActive ? "מחזק פעיל..." : "הפעל מחזק"}
    </button>
  </header>

  <section class="grid">
    <div class="panel">
      <h2 class="panel-title">הגדרות מחזק</h2>
      {#if config}
        <SettingsForm {config} embedded={true} {handleShowVideo} />
      {:else}
        <div class="loading">טוען הגדרות...</div>
      {/if}
    </div>

    <div class="panel status-panel">
      <h2 class="panel-title">סטטוס מהיר</h2>
      {#if config}
        <div class="status-row">
          <span class="label">סוג מחזק</span>
          <span class="value">{config.rewardType}</span>
        </div>
        <div class="status-row">
          <span class="label">משך בשניות</span>
          <span class="value">{Math.floor(config.rewardDisplayDurationMs / 1000)}</span>
        </div>
      {:else}
        <div class="loading">טוען סטטוס...</div>
      {/if}
      <p class="status-note">
        לאחר ההפעלה, ודא שהמחזק נסגר אוטומטית לאחר הזמן שהוגדר.
      </p>
    </div>
  </section>
</main>

<style>
  @reference "tailwindcss";

  .page {
    @apply min-h-screen bg-slate-50 px-6 py-8;
  }

  .header {
    @apply flex flex-col gap-4 items-start justify-between rounded-3xl;
    @apply bg-white shadow-sm border border-slate-200 p-6 md:flex-row md:items-center;
  }

  .eyebrow {
    @apply text-xs uppercase tracking-[0.3em] text-slate-400;
  }

  .title {
    @apply text-3xl font-bold text-slate-900;
  }

  .subtitle {
    @apply text-sm text-slate-500 mt-1;
  }

  .trigger-button {
    @apply rounded-full bg-slate-900 px-6 py-3 text-white font-semibold;
    @apply shadow-md transition-transform hover:scale-105;
  }

  .trigger-button:disabled {
    @apply opacity-60 cursor-not-allowed shadow-none;
  }

  .grid {
    @apply mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)];
  }

  .panel {
    @apply rounded-3xl bg-white border border-slate-200 shadow-sm p-6;
  }

  .panel-title {
    @apply text-lg font-semibold text-slate-800 mb-4;
  }

  .status-panel {
    @apply flex flex-col gap-3;
  }

  .status-row {
    @apply flex items-center justify-between text-sm;
  }

  .label {
    @apply text-slate-500;
  }

  .value {
    @apply font-semibold text-slate-800;
  }

  .status-note {
    @apply mt-2 text-xs text-slate-400 leading-relaxed;
  }

  .loading {
    @apply text-sm text-slate-400;
  }
</style>
