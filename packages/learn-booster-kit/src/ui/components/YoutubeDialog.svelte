<script lang="ts">
  import { scale } from "svelte/transition";
  import PlayLogo from "../assets/play.svg";
  import LoadingSpinner from "./LoadingSpinner.svelte";

  interface Props {
    videoUrl: string;
    time?: number;
    volume?: number;
    onTimeUpdate?: (time: number) => void;
  }

  type CurrentTimeEvent = Event & {
    currentTarget: EventTarget & HTMLVideoElement;
  };

  let { videoUrl, onTimeUpdate, time = 0, volume = 1 }: Props = $props();

  let videoElement = $state() as HTMLVideoElement;
  let loading = $state(true);

  function handleVideoLoaded() {
    loading = false;
    videoElement.play();
  }

  function handleVideoError(error: any) {
    throw error;
  }

  function onClickVideoToggle() {
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  function ontimeupdate(ev: CurrentTimeEvent) {
    if (onTimeUpdate) onTimeUpdate(ev.currentTarget.currentTime);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div id="container" class="p-5">
  <div
    id="card"
    class="w-full max-h-svh rounded-2xl overflow-hidden bg-white
            border-2 border-gray-500 shadow-lg"
    transition:scale
  >
    <!-- כותרת -->
    <div
      id="header"
      class="py-2 px-4
      bg-gradient-to-r from-gray-400 to-gray-500
      border-b-2 border-gray-500
      flex gap-3 items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <img src={PlayLogo} alt="" class="w-6 h-6 text-white animate-pulse" />
        <h2 class="text-xl font-bold text-white">וידאו</h2>
      </div>

      <div
        class="border border-gray-600 bg-gray-500
                     rounded-full aspect-square h-4 cursor-pointer"
      ></div>
    </div>

    <!-- תוכן -->
    <div id="content" class="relative aspect-video" style="padding-top: 56.25%">

      <iframe
        id="ytplayer"
        frameborder="0"
        sandbox="allow-scripts allow-same-origin"
        allow="autoplay; encrypted-media"
        title="video"
        src="https://www.youtube.com/embed/M7lc1UVf-VE?" 
        class="absolute inset-0 w-full h-full"
      ></iframe>

      <!-- svelte-ignore a11y_media_has_caption -->
      <!-- <video
        bind:this={videoElement}
        bind:volume
        bind:currentTime={time}
        class="rounded-lg
        border border-gray-500"
        onloadeddata={handleVideoLoaded}
        onerror={handleVideoError}
        onclick={onClickVideoToggle}
        {ontimeupdate}
      >
        <source src={videoUrl} type="video/mp4" />
        הדפדפן שלך לא תומך בתגית וידאו.
      </video> -->
    </div>
  </div>
</div>

<style type="text/postcss">

</style>
