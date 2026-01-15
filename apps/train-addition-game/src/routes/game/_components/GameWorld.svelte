<script lang="ts">
  import { onMount } from "svelte";

  // Props for any future customization
  export let theme: "grass" | "desert" = "grass";
</script>

<div class="fixed inset-0 overflow-hidden pointer-events-none select-none">
  <!-- Sky / Far Background -->
  <!-- Using standard background-size: cover to fill the screen -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
    style="background-image: url('/assets/blue_grass.png');"
  ></div>

  <!-- Parallax or multiple decorative layers could go here -->

  <!-- Decorative elements (can be randomized later) -->
  <img
    src="/assets/bush.png"
    alt="Bush"
    class="absolute bottom-[40px] left-2 w-12 h-12 md:bottom-[120px] md:left-10 md:w-16 md:h-16"
  />

  <img
    src="/assets/rock.png"
    alt="Rock"
    class="absolute bottom-[35px] right-4 w-10 h-10 md:bottom-[110px] md:right-20 md:w-14 md:h-14"
  />

  <!-- Cloud Decors (using items from the pack if available, otherwise utilizing existing css clouds or just the bg) -->
</div>

<!-- Slot for the actual game content to sit 'inside' or 'on top' of this world -->
<div class="relative z-10 w-full h-full">
  <slot />
</div>
