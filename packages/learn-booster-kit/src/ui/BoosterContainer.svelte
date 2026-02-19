<script lang="ts">
  import { onMount, type Component } from "svelte";
  import { fade } from "svelte/transition";
  import { boosterService } from "../lib/booster-service";
  import type { PlayerControls, SiteBoosterControls, Config } from "../types";
  import VideoMain from "./VideoMain.svelte";
  import SiteBoosterMain from "./SiteBoosterMain.svelte";
  import Settings from "./components/Settings.svelte";
  import { log } from "../lib/logger.svelte";

  let videoMainInstance = $state<any>();
  let siteMainInstance = $state<any>();

  let videoControls: PlayerControls | undefined = $derived(
    videoMainInstance?.modalController,
  );
  let siteControls: SiteBoosterControls | undefined = $derived(
    siteMainInstance?.boosterController,
  );

  // Settings visibility managed here, triggered by service
  let settingsVisible = $state(false);

  // Configuration subscription
  let config = $state<Config>();
  let boosterReady = $state(false);

  onMount(() => {
    let unsubscribeConfig: () => void = () => {}  ;

    // Initialize the service (async, side effect)
    boosterService.init().then(() => {
      boosterReady = true;

      // Subscribe to config
      unsubscribeConfig = boosterService.config.subscribe((v) => (config = v));

      boosterService.registerSettingsControls({
        show: () => (settingsVisible = true),
        hide: () => (settingsVisible = false),
      });

      log("BoosterContainer mounted");
    });

    return () => {
      unsubscribeConfig();
    };
  });

  // Register controls when available
  $effect(() => {
    if (boosterReady && videoControls) {
      boosterService.registerVideoControls(videoControls);
      log("Video controls registered");
    }
  });
  $effect(() => {
    if (boosterReady && siteControls) {
      boosterService.registerSiteControls(siteControls);
      log("Site controls registered");
    }
  });

  function handleSettingsClose() {
    settingsVisible = false;
  }

  function handleShowVideoPreview(newConfig: Config) {
    log("Preview requested with config", newConfig);
    boosterService.triggerReward(undefined, newConfig);
  }
</script>

<!-- 
    BoosterContainer
    Acts as the View Manager. 
    It renders the heavy components (Video, Site) which manage their own DOM persistence (display: none).
    It renders the Settings Modal when requested.
-->

<div id="learn-booster-root">
  <div class="gingim-booster">
    {#if config && boosterService.timer}
      {#if config.rewardType === "video"}
        <div id="video-main-wrapper">
          <VideoMain
            {config}
            timer={boosterService.timer}
            bind:this={videoMainInstance}
          />
        </div>
      {/if}

      {#if config.rewardType === "site"}
        <div id="site-main-wrapper">
          <SiteBoosterMain
            {config}
            timer={boosterService.timer}
            bind:this={siteMainInstance}
            onNewConfig={() => {}}
          />
        </div>
      {/if}

      {#if settingsVisible && config}
        <!-- Z-index 100 to be above everything else -->
        <div
          id="settings-modal-overlay"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          transition:fade={{ duration: 200 }}
        >
          <div
            class="w-full max-w-xl mx-4 relative"
            role="button"
            tabindex="0"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
          >
            <Settings
              {config}
              controller={{
                show: () => (settingsVisible = true),
                hide: () => (settingsVisible = false),
                toggle: () => (settingsVisible = !settingsVisible),
              }}
              handleShowVideo={handleShowVideoPreview}
            />
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  #video-main-wrapper,
  #site-main-wrapper {
    display: contents;
  }

  /* Ensure the root doesn't block clicks when children are hidden */
  #learn-booster-root {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    overflow: visible;
    /* pointer-events: none; */
  }

  /* Re-enable pointer events for the modal wrapper */
  :global(#learn-booster-root > .fixed) {
    pointer-events: auto;
  }

  /* Children separate components (VideoMain, SiteBoosterMain) handle their own pointer-events/visibility */
</style>
