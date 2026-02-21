<script lang="ts">
  import "./app.css";
  import { onDestroy } from "svelte";
  import { writable, derived } from "svelte/store";

  import Modal from "./components/Modal.svelte";
  import LoadingSpinner from "./components/LoadingSpinner.svelte";
  import { sleep } from "../lib/utils/sleep";
  import { addConfigListener, getAllConfig } from "../lib/config/config-manager";
  import { msToTime } from "../lib/utils/ms-to-time";

  import type { Config, TimerController } from "../types";
  import { log } from "../lib/logger.svelte";

  interface Props {
    config?: Config;
    timer: TimerController;
    onNewConfig: (newConfig: Config) => void;
  }

  let { config, timer }: Props = $props();

  let resolvedConfig = $state(config ?? getAllConfig());

  const unsubscribe = addConfigListener((newConfig) => {
    config = newConfig;
  });

  onDestroy(unsubscribe);

  $effect(() => {
    if (config) {
      resolvedConfig = config;
      log("config update in site booster.");
    }
  });

  let visible = $state(false);
  let modalVisible = $state(false);
  let cardVisible = $state(false);

  let iframeUrl = $state("");
  let iframeLoaded = $state(false);
  let iframeElement = $state<HTMLIFrameElement>();
  let lastUrl = "";
  let timeLeft = $state("00:00");
  timer.subscribe((time) => (timeLeft = time));

  const modalHasHidden = writable(false);

  /* 
     Optimization: We don't auto-load the URL from config to prevent unnecessary network requests.
     The URL is set explicitly via the controller (setUrl) when the reward is actually triggered.
  */
  // $effect(() => {
  //   const nextUrl = resolvedConfig.booster.siteUrl;
  //   if (nextUrl !== iframeUrl) {
  //     iframeUrl = nextUrl;
  //   }
  // });

  $effect(() => {
    if (iframeUrl !== lastUrl) {
      lastUrl = iframeUrl;
      iframeLoaded = false;
    }
  });

  const hostname = $derived.by(() => {
    if (!iframeUrl) return "";
    try {
      return new URL(iframeUrl).hostname;
    } catch {
      return "";
    }
  });

  function handleIframeLoad(ev: Event): void {
    iframeLoaded = true;

    const doc = iframeElement?.contentDocument;
    const win = iframeElement?.contentWindow;

    // Try to bind events if same-origin (will fail for cross-origin)
    try {
      // תחילת ניווט הבא (לפניunload):
      win?.addEventListener("beforeunload", () => {
        // timer.pause();
        const target = ev.target as HTMLIFrameElement;

        target.onload = (ev: Event) => {
          handleIframeLoad(ev);
        };
      });

      // אפשר גם לעקוב אחרי התקדמות:
      doc?.addEventListener("readystatechange", () => {
        if (doc.readyState === "interactive") timer.start();
        if (doc.readyState === "complete") ""; // timer.pause();
      });
    } catch (e) {
      log(
        "Cannot access iframe content (likely cross-origin). Navigation tracking disabled.",
      );
    }
  }

  async function showModal(): Promise<void> {
    modalHasHidden.set(false);
    visible = true;
    await sleep(10);
    modalVisible = true;
    await sleep(400);
    cardVisible = true;
    timer.start();
  }

  async function hideModal(): Promise<void> {
    timer.stop();
    cardVisible = false;
    await sleep(300);
    modalVisible = false;
    await sleep(300);
    visible = false;
    modalHasHidden.set(true);
  }

  async function toggle(): Promise<void> {
    if (visible) {
      await hideModal();
    } else {
      await showModal();
    }
  }

  function setSiteUrl(url: string): void {
    iframeUrl = url;
  }

  function requestClose(): void {
    hideModal();
  }

  export const boosterController = {
    show: showModal,
    hide: hideModal,
    toggle,
    setUrl: setSiteUrl,
    modalHasHidden,
    getIframe(): HTMLIFrameElement | undefined {
      return iframeElement;
    },
  };
</script>

<div id="booster-container" class:show={visible}>
  <main class="min-h-screen flex items-center justify-center">
    <Modal visible={modalVisible}>
      <section
        id="booster-card"
        class="w-[90vw] md:w-[80vw] max-w-5xl bg-white rounded-2xl border-2 border-gray-500 overflow-hidden shadow-xl"
        class:visible={cardVisible}
      >
        <header
          class="flex items-center justify-between gap-3 px-5 py-3
                 bg-gradient-to-r from-gray-500 to-gray-600
                 text-white border-b border-gray-500"
        >
          <div class="flex flex-row items-center gap-1">
            <h2 class="text-xl font-semibold">מחזק דף אינטרנט</h2>
            <h2 class="mx-2">•</h2>

            <h2>{timeLeft}</h2>
            <h2 class="mx-2">•</h2>

            {#if hostname}
              <h2>{hostname}</h2>
            {/if}
          </div>

          {#if resolvedConfig.system.enableHideModalButton}
            <button
              id="close-button"
              type="button"
              onclick={requestClose}
              class="border border-red-700 bg-red-400 rounded-full
              aspect-square h-4 w-4 cursor-pointer"
              aria-label="סגור את המחזק"
            ></button>
          {:else}
            <div
              id="close-button"
              class="border border-gray-600 bg-gray-500 rounded-full aspect-square h-4 cursor-pointer"
            ></div>
          {/if}
        </header>

        <div id="content" class="relative bg-gray-200">
          {#if iframeUrl}
            <div id="iframe-wrapper" class="relative w-full h-[80vh]">
              <iframe
                bind:this={iframeElement}
                src={iframeUrl || undefined}
                class="w-full h-full border-0 bg-white"
                allow="autoplay;"
                title={hostname || "Booster content"}
                onload={handleIframeLoad}
                name="booster-iframe"
                data-owner="booster-iframe"
              ></iframe>

              {#if !iframeLoaded}
                <LoadingSpinner message="טוען את האתר..." />
              {/if}
            </div>
          {:else}
            <div
              class="flex items-center justify-center h-[60vh] text-gray-600 text-lg"
            >
              לא הוגדרה כתובת מחזק
            </div>
          {/if}
        </div>
      </section>
    </Modal>
  </main>
</div>

<style type="text/postcss">
  @reference "tailwindcss";

  #booster-container {
    display: none;
  }

  #booster-container.show {
    display: block;
  }

  #booster-card {
    transform: scale(0.95);
    opacity: 0;
    transition:
      transform 0.4s ease,
      opacity 0.4s ease;
  }

  #booster-card.visible {
    transform: scale(1);
    opacity: 1;
  }
</style>
