<script lang="ts">
  import "./app.css";
  import HeaderBar from "$lib/components/HeaderBar.svelte";
  import SettingsOverlay from "$lib/components/SettingsOverlay.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { boosterService } from "learn-booster-kit";
  import { onMount } from "svelte";

  let { children } = $props();
  let showSettings = $state(false);

  onMount(() => {
    if (settings.boosterEnabled) {
      boosterService.init();
    }

    // כלי דיבאג גלובלי
    (window as any).GameDebug = {
      hideModals: () => {
        showSettings = false;
      },
      toggleSettings: () => {
        showSettings = !showSettings;
      },
      // Other debug tools might need reference to gameState, which is not imported here yet.
      // We can attach layout specific debugs here, or keep the global object expandable.
      // For now, simple toggle actions.
      // Note: Logic for toggling Modals might need to be distributed or managed by a store if we split heavily.
      // But for now, basic layout handles Settings.
    };
  });

  function handleSettings() {
    showSettings = true;
  }
</script>

<div
  class="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500"
>
  <!-- עננים מונפשים ברקע (Global Background) -->
  <div class="clouds">
    <div class="cloud cloud-1"></div>
    <div class="cloud cloud-2"></div>
    <div class="cloud cloud-3"></div>
  </div>

  <HeaderBar onSettings={handleSettings} />

  <!-- Main Content Slot -->
  {@render children()}

  {#if showSettings}
    <SettingsOverlay onClose={() => (showSettings = false)} />
  {/if}
</div>

<style>
  /* Shared Global Animations for Clouds inside Layout */
  .clouds {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }

  .cloud {
    position: absolute;
    background: white;
    border-radius: 100px;
    opacity: 0.6;
  }

  .cloud::before,
  .cloud::after {
    content: "";
    position: absolute;
    background: white;
    border-radius: 50%;
  }

  .cloud-1 {
    width: 120px;
    height: 40px;
    top: 15%;
    animation: float-cloud 25s linear infinite;
  }

  .cloud-1::before {
    width: 50px;
    height: 50px;
    top: -25px;
    left: 15px;
  }

  .cloud-1::after {
    width: 40px;
    height: 40px;
    top: -20px;
    left: 55px;
  }

  .cloud-2 {
    width: 150px;
    height: 50px;
    top: 30%;
    animation: float-cloud 30s linear infinite;
    animation-delay: -10s;
  }

  .cloud-2::before {
    width: 60px;
    height: 60px;
    top: -30px;
    left: 20px;
  }

  .cloud-2::after {
    width: 50px;
    height: 50px;
    top: -25px;
    left: 70px;
  }

  .cloud-3 {
    width: 100px;
    height: 35px;
    top: 8%;
    animation: float-cloud 20s linear infinite;
    animation-delay: -5s;
  }

  .cloud-3::before {
    width: 40px;
    height: 40px;
    top: -20px;
    left: 10px;
  }

  .cloud-3::after {
    width: 35px;
    height: 35px;
    top: -18px;
    left: 45px;
  }

  @keyframes float-cloud {
    from {
      left: -200px;
    }
    to {
      left: 110%;
    }
  }
</style>
