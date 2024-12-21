<script lang="ts">
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import PlayLogo from "../assets/play.svg?raw";
  import LoadingSpinner from "./LoadingSpinner.svelte";
  import type { VideoDialogProps, VideoController } from "../../types";

  let {
    videoUrl,
    type,
    visible = $bindable(false),
    videoController = $bindable() as VideoController,
    onVideoEnded = $bindable() as (() => void) | undefined,
  }: VideoDialogProps = $props();

  let videoElement = $state() as HTMLVideoElement;
  let loading = $state(true);
  let paused = $state(true);
  let error = $state<string | null>(null);

  function play() {
    if (!videoElement) return;
    videoElement
      .play()
      .then(() => {
        paused = false;
      })
      .catch((err) => {
        paused = true;
        error = `שגיאה בהפעלת הסרטון: ${err.message}`;
      });
  }

  function pause() {
    if (!videoElement) return;
    videoElement.pause();
    paused = true;
  }

  function toggle() {
    if (paused) {
      play();
    } else {
      pause();
    }
  }

  onMount(() => {
    videoController = {
      play,
      pause,
      toggle,
    };
  });

  // כשמשתנה כתובת הסרטון
  $effect(() => {
    if (videoUrl) {
      loading = true;
      error = null;
      if (videoElement) {
        videoElement.load(); // טעינה מחדש של הסרטון
      }
    }
  });

  function handleVideoLoaded() {
    loading = false;
    error = null;
    if (videoElement && visible) {
      play();
    }
  }

  function handleVideoError(event: Event) {
    loading = false;
    error = `שגיאה בטעינת הסרטון`;
    console.error('שגיאת וידאו:', event);
  }

  function onClickVideoToggle() {
    if (paused) {
      play();
    } else {
      pause();
    }
  }

  function handleVideoEnded() {
    if (onVideoEnded) {
      onVideoEnded();
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div id="container" class="p-5 w-full flex justify-center">
  <div
    id="card"
    class="max-h-svh rounded-2xl overflow-hidden bg-white
            border-2 border-gray-500 shadow-lg w-[80%]"
    class:visible
  >
    <!-- כותרת -->
    <div
      id="header"
      class="py-[1vw] px-4
      bg-gradient-to-r from-gray-400 to-gray-500
      border-b-2 border-gray-500
      flex gap-3 items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <div class="animate-pulse">
          {@html PlayLogo}
        </div>
        <h2 class="text-xl font-bold text-white">וידאו</h2>
      </div>

      <div
        class="border border-gray-600 bg-gray-500
                     rounded-full aspect-square h-4 cursor-pointer"
      ></div>
    </div>

    <!-- תוכן -->
    <div id="content" class="p-[2.5vw]">
      {#if loading}
        <LoadingSpinner message="טוען את הסרטון..." />
      {/if}

      {#if error}
        <div class="text-red-500 text-center mb-4">{error}</div>
      {/if}

      <!-- svelte-ignore a11y_media_has_caption -->
      <video
        controls
        controlslist="nodownload nofullscreen noplaybackrate noremoteplayback novolume"
        preload="auto"
        bind:this={videoElement}
        bind:paused
        class="rounded-lg
        border border-gray-500
        bg-gray-400
        w-full
        "
        onloadeddata={handleVideoLoaded}
        onerror={handleVideoError}
        onclick={onClickVideoToggle}
        onended={handleVideoEnded}
      >
        <source src={videoUrl} {type} />
        הדפדפן שלך לא תומך בתגית וידאו.
      </video>
    </div>
  </div>
</div>

<style>
  #card {
    transition: transform 1.5s;
    transform: scale(0);
  }
  #card.visible {
    transform: scale(1);
  }

  h2 {
    font-family: "Heebo", sans-serif;
    font-optical-sizing: auto;
    font-weight: 300;
  }

  video::-webkit-media-controls-volume-slider,
  video::-webkit-media-controls-volume-control-container,
  video::-webkit-media-controls-mute-button,
  video::-webkit-media-controls-fullscreen-button {
    display: none !important;
  }
</style>
