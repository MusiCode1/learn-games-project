<!--
  כרטיס גריר — תומך במגע ועכבר
-->
<script lang="ts">
  import type { ActiveCard } from "$lib/types";
  import { findBoxUnderPoint } from "$lib/utils/drag";
  import { gameState } from "$lib/stores/game-state.svelte";

  interface Props {
    card: ActiveCard;
    onHoverBox?: (categoryId: string | null) => void;
  }

  let { card, onHoverBox }: Props = $props();

  let cardEl: HTMLElement | undefined = $state();
  let isDragging = $state(false);
  let offsetX = $state(0);
  let offsetY = $state(0);
  let startX = 0;
  let startY = 0;
  let animateBack = $state(false);

  function onPointerDown(e: PointerEvent) {
    if (gameState.state !== "PLAYING") return;
    if (!cardEl) return;

    cardEl.setPointerCapture(e.pointerId);
    isDragging = true;
    animateBack = false;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = 0;
    offsetY = 0;
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;

    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;

    // בדיקה מעל איזה ארגז — צריך pointer-events: none זמני
    if (cardEl) {
      cardEl.style.pointerEvents = "none";
      const boxId = findBoxUnderPoint(e.clientX, e.clientY);
      cardEl.style.pointerEvents = "auto";
      onHoverBox?.(boxId);
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;

    if (cardEl) {
      cardEl.releasePointerCapture(e.pointerId);
      cardEl.style.pointerEvents = "none";
      const boxId = findBoxUnderPoint(e.clientX, e.clientY);
      cardEl.style.pointerEvents = "auto";
      onHoverBox?.(null);

      if (boxId) {
        gameState.submitCard(card.id, boxId);
      } else {
        // החזרה למקום עם אנימציה
        animateBack = true;
        offsetX = 0;
        offsetY = 0;
        setTimeout(() => {
          animateBack = false;
        }, 300);
      }
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={cardEl}
  class="draggable-card select-none cursor-grab rounded-2xl bg-white p-4 md:p-6 shadow-xl border-2 border-slate-200 text-center"
  class:dragging={isDragging}
  class:animate-back={animateBack}
  class:animate-bounce-in={!isDragging && !animateBack}
  style="
    transform: translate({offsetX}px, {offsetY}px) {isDragging ? 'scale(1.08) rotate(-2deg)' : ''};
    touch-action: none;
    z-index: {isDragging ? 100 : 1};
  "
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  role="button"
  tabindex="0"
>
  <!-- אמוג'י / תמונה / אות -->
  {#if card.image}
    <span class="card-image block text-5xl md:text-7xl mb-2">{card.image}</span>
  {/if}

  <!-- טקסט (רק אם יש תוכן) -->
  {#if card.content}
    <span class="block text-xl md:text-2xl font-bold text-slate-800">
      {card.content}
    </span>
  {/if}
</div>

<style>
  .draggable-card {
    transition: box-shadow 0.2s ease;
    will-change: transform;
  }

  .card-image {
    font-family: "Frank Ruhl Libre", "David", "Times New Roman", serif;
    font-weight: 900;
    line-height: 1.4;
  }

  .draggable-card.dragging {
    cursor: grabbing;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .draggable-card.animate-back {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3) translateY(40px);
    }
    50% {
      opacity: 1;
      transform: scale(1.05) translateY(-5px);
    }
    70% {
      transform: scale(0.97);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  .animate-bounce-in {
    animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
</style>
