<script lang="ts">
  import type { Config, SettingsController } from "../../types";
  import SettingsForm from "./SettingsForm.svelte";

  interface Props {
    config: Config;
    controller?: SettingsController;
    handleShowVideo: (newConfig: Config) => void;
  }

  let { config, controller = $bindable(), handleShowVideo }: Props = $props();

  const onClose = () => {
    controller?.hide();
  };
</script>

<div
  id="container"
  class="bg-white rounded-lg shadow-xl w-full max-w-xl mx-auto"
>
  <div class="p-4 md:p-6">
    <SettingsForm
      {config}
      bind:controller
      {handleShowVideo}
      {onClose}
      embedded={false}
    />
  </div>
</div>
