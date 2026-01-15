<script lang="ts">
  import { fade, fly } from "svelte/transition";

  interface Props {
    onUnlock: () => void;
    children: any;
  }

  let { onUnlock, children }: Props = $props();

  let clickCount = $state(0);
  let lastClickTime = $state(0);
  let showTooltip = $state(false);
  let feedbackState = $state<"idle" | "waiting" | "ready" | "error">("idle");

  let tooltipTimeout: ReturnType<typeof setTimeout>;
  let resetTimeout: ReturnType<typeof setTimeout>;
  let readyTimeout: ReturnType<typeof setTimeout>;

  // Configuration
  const WAIT_MIN = 800; // Minimum wait after first click
  const WAIT_MAX = 2000; // Maximum wait after first click
  const DOUBLE_CLICK_MAX = 500; // Max time between 2nd and 3rd click

  function handleClick() {
    const now = Date.now();
    const timeSinceLast = now - lastClickTime;

    // Clear existing reset timer to prevent state reset during active sequence
    clearTimeout(resetTimeout);

    if (clickCount === 0) {
      // First Click
      startSequence();
    } else if (clickCount === 1) {
      // Second Click (should be after wait)
      if (timeSinceLast > WAIT_MIN && timeSinceLast < WAIT_MAX) {
        clickCount = 2;
        feedbackState = "ready"; // Still ready for the quick follow-up
      } else {
        // Failed rhythm
        handleError(timeSinceLast >= WAIT_MAX);
      }
    } else if (clickCount === 2) {
      // Third Click (should be fast - double click)
      if (timeSinceLast < DOUBLE_CLICK_MAX) {
        // Success!
        onUnlock();
        resetState();
        showTooltip = false;
      } else {
        // Too slow for double click
        handleError(true);
      }
    }

    lastClickTime = now;

    // Reset state if no activity for a while
    resetTimeout = setTimeout(() => {
      resetState();
    }, WAIT_MAX + 500);
  }

  function startSequence() {
    clickCount = 1;
    showTooltip = true;
    feedbackState = "waiting";

    // Schedule "Ready" state
    clearTimeout(readyTimeout);
    readyTimeout = setTimeout(() => {
      if (clickCount === 1) {
        feedbackState = "ready";
      }
    }, WAIT_MIN);

    // Hide tooltip after 4 seconds
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      showTooltip = false;
    }, 4000);
  }

  function handleError(restart: boolean) {
    feedbackState = "error";
    setTimeout(() => {
      if (restart) {
        startSequence(); // Treat as new first click if it was a slow miss
      } else {
        resetState();
      }
    }, 300);
  }

  function resetState() {
    clickCount = 0;
    feedbackState = "idle";
    clearTimeout(readyTimeout);
  }
</script>

<div class="relative inline-block">
  <!-- Tooltip -->
  {#if showTooltip}
    <div
      transition:fade={{ duration: 200 }}
      class="absolute top-full mt-2 left-0 w-48 bg-slate-800 text-white text-xs p-2 rounded-lg shadow-lg z-50 text-center pointer-events-none"
    >
      <div class="absolute -top-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
      <p>כדי להיכנס: לחץ פעם אחת, המתן שניה, ואז לחץ פעמיים</p>
    </div>
  {/if}

  <!-- The Button Wrapper with Feedback Ring -->
  <div
    onclick={handleClick}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Enter" && handleClick()}
    class="rounded-full transition-all duration-300"
    class:ring-2={feedbackState !== "idle"}
    class:ring-yellow-400={feedbackState === "waiting"}
    class:ring-green-400={feedbackState === "ready"}
    class:ring-red-500={feedbackState === "error"}
  >
    {@render children()}
  </div>
</div>
