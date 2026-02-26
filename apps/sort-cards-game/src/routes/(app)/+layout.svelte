<script lang="ts">
  import "../app.css";
  import HeaderBar from "$lib/components/HeaderBar.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import { boosterService, BoosterContainer } from "learn-booster-kit";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(() => {
    if (settings.boosterEnabled) {
      boosterService.init();
    }
  });
</script>

<div
  class="flex h-screen flex-col overflow-hidden bg-linear-to-b from-amber-100 via-orange-50 to-yellow-100"
>
  <HeaderBar />
  {@render children()}
</div>

<div class="relative z-[9999] pointer-events-none">
  <BoosterContainer />
</div>
