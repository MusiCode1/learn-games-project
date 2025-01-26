<script lang="ts">
  import { onMount } from "svelte";
  import VideoDialog from "./components/VideoDialog.svelte";
  import Modal from "./components/Modal.svelte";
  import LeftButton from "./components/LeftButton.svelte";
  import { sleep } from "../lib/sleep";
  import { msToTime } from "../lib/utils/ms-to-time";
  import type { Config, VideoController, PlayerControls } from "../types";
  import { getVideoBlob, isFullyKiosk } from "../lib/fully-kiosk";

  interface Props {
    config: Config;
  }

  let { config }: Props = $props();

  let visible = $state(false);
  let modalVisible = $state(false);
  let videoVisible = $state(false);
  let videoController = $state<VideoController>();
  let currentVideoIndex = $state(0);
  let time = $state("00:00");
  let intervalId: number | undefined;

  let videoUrl = $state("");

  // svelte-ignore state_referenced_locally
  window.currentVideoIndex = currentVideoIndex;

  onMount(() => nextVideo());

  function nextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % config.videoUrls.length;
    const originalUrl = config.videoUrls[currentVideoIndex];
    if (isFullyKiosk()) {
      if (videoUrl.startsWith("blob:")) URL.revokeObjectURL(videoUrl);

      getVideoBlob(originalUrl).then((res) => (videoUrl = res));
    } else {
      videoUrl = originalUrl;
    }
  }

  function startTimer() {
    const startTime = Date.now();
    intervalId = setInterval(() => {
      const elapsedTimeInMS = Date.now() - startTime;
      const remainingTimeInMS = Math.max(
        0,
        config.videoDisplayTimeInMS - elapsedTimeInMS,
      );
      // עיגול לשנייה הקרובה כדי למנוע קפיצות
      const remainingTimeInSeconds =
        Math.round(remainingTimeInMS / 1000) * 1000;
      time = msToTime(remainingTimeInSeconds);
    }, 100);
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
    time = "00:00"; // איפוס הטיימר בסגירה
  }

  async function showModal() {
    startTimer();
    videoController?.play();
    visible = true;
    await sleep(10);
    modalVisible = true;
    await sleep(500);
    videoVisible = true;
  }

  async function hideModal() {
    stopTimer();
    videoVisible = false;
    await sleep(1000 * 1.5);
    modalVisible = false;
    await sleep(700);
    visible = false;
    videoController?.pause();
  }

  async function toggle() {
    if (visible) {
      hideModal();
    } else {
      showModal();
    }
  }

  export const modalController = {
    show: showModal,
    hide: hideModal,
    toggle,
    getVideo(): VideoController | undefined {
      return videoController;
    },
  };
</script>

<div id="show-container" class:show={visible}>
  <main class="min-h-screen flex items-center justify-center">
    <Modal visible={modalVisible}>
      <VideoDialog
        visible={videoVisible}
        {videoUrl}
        type={config.type}
        bind:videoController
        onVideoEnded={nextVideo}
        {time}
        hideProgress={config.hideVideoProgress}
      />
    </Modal>
  </main>
</div>

<style>
  #show-container {
    display: none;
  }

  #show-container.show {
    display: block;
  }
</style>
