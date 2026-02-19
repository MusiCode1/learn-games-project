<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { writable, derived } from "svelte/store";

  import VideoDialog from "./components/VideoDialog.svelte";
  import Modal from "./components/Modal.svelte";
  import LeftButton from "./components/LeftButton.svelte";
  import { sleep } from "../lib/sleep";
  import { msToTime } from "../lib/utils/ms-to-time";
  import { getVideoBlob, isFullyKiosk } from "../lib/fully-kiosk";
  import { getAllConfig, addConfigListener } from "../lib/config-manager";

  import type {
    Config,
    VideoController,
    VideoItem,
    PlayerControls,
    TimerController,
  } from "../types";

  interface Props {
    config?: Config;
    timer: TimerController;
  }

  let { config, timer }: Props = $props();

  let localConfig = config || getAllConfig();

  const configSubscriber = addConfigListener((newConfig) => {
    config = newConfig;
  });

  onDestroy(configSubscriber);

  let visible = $state(false);
  let modalVisible = $state(false);
  let videoVisible = $state(false);
  let videoController = $state<VideoController>();
  let currentVideoIndex = $state(0);
  let videoUrl = $state("");

  // svelte-ignore state_referenced_locally
  window.currentVideoIndex = currentVideoIndex;

  onMount(() => {
    nextVideo();
  });

  const timeFormatted = derived(timer.time, ($time) => {
    const remainingInSeconds = Math.round($time / 1000) * 1000;
    return msToTime(remainingInSeconds);
  });

  function nextVideo() {
    currentVideoIndex =
      (currentVideoIndex + 1) % localConfig.video.videos.length;
    const videoItem: VideoItem = localConfig.video.videos[currentVideoIndex];

    if (isFullyKiosk() && localConfig.video.source === "local") {
      if (videoUrl.startsWith("blob:")) URL.revokeObjectURL(videoUrl);

      getVideoBlob(videoItem.url).then((res) => (videoUrl = res));
    } else {
      videoUrl = videoItem.url;
    }
  }

  async function showModal() {
    timer.start();
    videoController?.play();
    visible = true;
    await sleep(10);
    modalVisible = true;
    await sleep(500);
    videoVisible = true;
  }

  async function hideModal() {
    timer.stop();
    videoVisible = false;
    await sleep(1000 * 1.5);
    modalVisible = false;
    await sleep(700);
    visible = false;
    videoController?.pause();
    modalHasHidden.set(true);
  }

  async function toggle() {
    if (visible) {
      hideModal();
    } else {
      showModal();
    }
  }

  const modalHasHidden = writable(false);

  export const modalController = {
    show: showModal,
    hide: hideModal,
    toggle,
    getVideo(): VideoController | undefined {
      return videoController;
    },
    modalHasHidden,
  };
</script>

<div id="show-container" class:show={visible}>
  <main class="min-h-screen flex items-center justify-center">
    <Modal visible={modalVisible}>
      <VideoDialog
        config={localConfig}
        visible={videoVisible}
        {videoUrl}
        mimeType={localConfig.video.videos[currentVideoIndex]?.mimeType}
        bind:videoController
        onVideoEnded={nextVideo}
        time={$timeFormatted}
        {hideModal}
        {modalHasHidden}
        {timer}
      />
    </Modal>
  </main>
</div>

<!-- שקול שינוי שם הקובץ למשהו שמתאר נגן וידאו, במידה וזה יותר ברור.
 -->

<style type="text/postcss">
  #show-container {
    display: none;
  }

  #show-container.show {
    display: block;
  }
</style>
