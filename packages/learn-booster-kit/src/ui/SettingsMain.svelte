<!-- <svelte:options customElement="booster-settings" /> -->

<script lang="ts">
  import "./app.css";

  import { fade } from "svelte/transition";

  import LeftButton from "./components/LeftButton.svelte";
  import Settings from "./components/Settings.svelte";
  import Modal from "./components/Modal.svelte";

  import type { Config } from "../types";

  interface Props {
    config: Config;
    handleShowVideo: (newConfig: Config) => void;
  }

  let { config, handleShowVideo = $bindable() }: Props = $props();

  let settingsVisible = $state(false);
  export const settingsController = {
    show: () => (settingsVisible = true),
    hide: () => (settingsVisible = false),
    toggle: () => (settingsVisible = !settingsVisible),
  };

  function onclick() {
    settingsController.toggle();
  }
</script>

<div>
  <LeftButton {onclick} />

  {#if settingsVisible}
    <div transition:fade>
      <Modal visible={true}>
        <div transition:fade={{ delay: 500, duration: 1000 }}>
          <Settings
            {config}
            controller={settingsController}
            {handleShowVideo}
          />
        </div>
      </Modal>
    </div>
  {/if}
</div>

<style>
  @reference "tailwindcss";
</style>
