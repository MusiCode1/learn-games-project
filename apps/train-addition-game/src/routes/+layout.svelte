<script lang="ts">
  import "./app.css";
  import HeaderBar from "$lib/components/HeaderBar.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { boosterService } from "learn-booster-kit";
  import { onMount } from "svelte";
  import { preloadAllAssets } from "$lib/utils/tts";

  let { children } = $props();

  onMount(() => {
    if (settings.boosterEnabled) {
      boosterService.init();
    }
    preloadAllAssets();
  });
</script>

<div
  class="flex h-screen flex-col overflow-hidden bg-linear-to-b from-sky-300 via-sky-400 to-sky-500"
>
  <HeaderBar />

  <!-- Main Content Slot -->
  {@render children()}
</div>
