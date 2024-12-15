<script lang="ts">
  import { untrack } from "svelte";
  import VideoDialog from "./components/VideoDialog.svelte";
  import Modal from "./components/Modal.svelte";
  import LeftButton from "./components/LeftButton.svelte";
  import { sleep } from "../lib/sleep";
  import type { Config, VideoController, PlayerControls } from "../types";

  interface Props {
    config: Config;
  }

  let { config }: Props = $props();

  let isShowing = $state(false);
  let visible = $state(false);
  let modalVisible = $state(false);
  let videoVisible = $state(false);
  let videoController = $state<VideoController>();

  async function showModal() {
    videoController?.play();
    visible = true;
    await sleep(10);
    modalVisible = true;
    await sleep(500);
    videoVisible = true;
  }

  async function hideModal() {
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
        videoUrl={config.videoUrl}
        type={config.type}
        bind:videoController
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
