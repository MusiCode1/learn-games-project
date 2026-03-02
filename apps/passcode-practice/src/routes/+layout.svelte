<script lang="ts">
  import "./app.css";
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

<!-- רקע כהה בסגנון מסך נעילה של iOS -->
<div
  class="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900"
>
  <HeaderBar />
  {@render children()}
</div>

<div class="relative z-[9999] pointer-events-none">
  <BoosterContainer />
</div>
