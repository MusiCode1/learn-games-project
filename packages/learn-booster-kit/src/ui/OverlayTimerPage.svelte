<!--
  דף Web Overlay — טיימר עגול שקוף לשימוש כ-Fully Kiosk Web Overlay.
  הדף תמיד טעון, הטיימר מוצג רק כשיש reward פעיל.
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createOverlayTimerState } from '../lib/overlay/overlay-timer-state.svelte';
  import {
    loadOverlaySettings,
    onOverlaySettingsChange,
    type OverlayTimerSettings,
  } from '../lib/overlay/overlay-settings';

  const timer = createOverlayTimerState();

  let overlaySettings = $state<OverlayTimerSettings>(loadOverlaySettings());
  let cleanupSettingsListener: (() => void) | undefined;

  // SVG קבועים
  const RADIUS = 45;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const strokeDasharray = $derived(
    `${(timer.progress / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`
  );

  const isVisible = $derived(timer.isActive && overlaySettings.enabled);

  // גודל דינמי
  const sizePx = $derived(overlaySettings.sizePx);
  const svgSize = $derived(sizePx - 12);
  const fontSize = $derived(Math.max(1.2, sizePx / 56));

  onMount(() => {
    timer.start();
    cleanupSettingsListener = onOverlaySettingsChange((newSettings) => {
      overlaySettings = newSettings;
    });
  });

  onDestroy(() => {
    timer.destroy();
    cleanupSettingsListener?.();
  });
</script>

<svelte:head>
  <style>
    html, body {
      background: transparent !important;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</svelte:head>

<div class="overlay-root" class:visible={isVisible}>
  <div
    class="timer-container"
    style:left="{overlaySettings.xPercent}%"
    style:top="{overlaySettings.yPercent}%"
    style:width="{sizePx}px"
    style:height="{sizePx}px"
  >
    <!-- עיגול SVG -->
    <svg class="timer-svg" viewBox="0 0 100 100"
      style:width="{svgSize}px" style:height="{svgSize}px"
    >
      <!-- רקע -->
      <circle
        cx="50"
        cy="50"
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        stroke-width="8"
      />
      <!-- התקדמות -->
      <circle
        cx="50"
        cy="50"
        r={RADIUS}
        fill="none"
        stroke={timer.color}
        stroke-width="8"
        stroke-linecap="round"
        stroke-dasharray={strokeDasharray}
        class="progress-arc"
      />
    </svg>
    <!-- ספרות במרכז -->
    <span class="countdown" style:color={timer.color} style:font-size="{fontSize}rem">
      {timer.remainingSeconds}
    </span>
  </div>
</div>

<style>
  .overlay-root {
    position: relative;
    width: 100vw;
    height: 100vh;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .overlay-root.visible {
    opacity: 1;
  }

  .timer-container {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .timer-svg {
    position: absolute;
    transform: rotate(-90deg);
  }

  .progress-arc {
    transition: stroke 0.5s ease;
  }

  .countdown {
    font-weight: 700;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    z-index: 1;
  }
</style>
