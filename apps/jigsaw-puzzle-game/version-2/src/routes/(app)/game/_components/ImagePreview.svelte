<!--
  תמונת עזר קטנה — ניתנת לגרירה לכל מקום בשוליים (snap לצלע הקרובה ביותר)
-->
<script lang="ts">
  import { gameState } from "$lib/stores/game-state.svelte";
  import { settings } from "$lib/stores/settings.svelte";

  type Edge = 'top' | 'bottom' | 'left' | 'right';
  interface EdgePosition { edge: Edge; offset: number; }

  const EDGE_KEY  = "jigsaw-preview-edge-position";
  const ELEM      = 80;  // גודל האלמנט בפיקסלים (collapsed)
  const HEADER_H  = 72;  // גובה ה-header בפיקסלים (py-3 + button p-2 + icon h-6 + shadow-md)
  const MARGIN    = 16;  // מרווח מהקצה בפיקסלים

  const DEFAULT_POSITION: EdgePosition = { edge: 'bottom', offset: MARGIN };

  function loadPosition(): EdgePosition {
    if (typeof localStorage === 'undefined') return DEFAULT_POSITION;
    try {
      const raw = localStorage.getItem(EDGE_KEY);
      if (!raw) return DEFAULT_POSITION;
      const p = JSON.parse(raw);
      if (
        (p.edge === 'top' || p.edge === 'bottom' || p.edge === 'left' || p.edge === 'right') &&
        typeof p.offset === 'number'
      ) {
        return { edge: p.edge, offset: p.offset };
      }
    } catch { /* ignore */ }
    return DEFAULT_POSITION;
  }

  function positionStyle(pos: EdgePosition): string {
    switch (pos.edge) {
      case 'top':    return `top:${HEADER_H}px; left:${pos.offset}px;`;
      case 'bottom': return `bottom:${MARGIN}px; left:${pos.offset}px;`;
      case 'left':   return `left:${MARGIN}px; top:${pos.offset}px;`;
      case 'right':  return `right:${MARGIN}px; top:${pos.offset}px;`;
    }
  }

  let position    = $state<EdgePosition>(loadPosition());
  let expanded    = $state(false);
  let isPointerDown = false;
  let isDragging  = $state(false);
  let dragX       = $state(0);
  let dragY       = $state(0);
  let startX      = 0;
  let startY      = 0;
  let didDrag     = false;

  function handlePointerDown(e: PointerEvent) {
    isPointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
    dragX  = e.clientX;
    dragY  = e.clientY;
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isPointerDown) return;
    if (!isDragging && (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8)) {
      isDragging = true;
    }
    if (isDragging) {
      dragX = e.clientX;
      dragY = e.clientY;
    }
  }

  function handlePointerUp(e: PointerEvent) {
    isPointerDown = false;
    if (!isDragging) return;
    isDragging = false;
    didDrag = true;
    setTimeout(() => { didDrag = false; }, 10);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const x = e.clientX;
    const y = e.clientY;

    const dTop    = y;
    const dBottom = H - y;
    const dLeft   = x;
    const dRight  = W - x;
    const minDist = Math.min(dTop, dBottom, dLeft, dRight);

    let newPos: EdgePosition;
    const clampH = (v: number) => Math.max(MARGIN, Math.min(v, W - ELEM - MARGIN));
    const clampV = (v: number) => Math.max(HEADER_H + MARGIN, Math.min(v, H - ELEM - MARGIN));

    if (minDist === dTop) {
      newPos = { edge: 'top',    offset: clampH(x - ELEM / 2) };
    } else if (minDist === dBottom) {
      newPos = { edge: 'bottom', offset: clampH(x - ELEM / 2) };
    } else if (minDist === dLeft) {
      newPos = { edge: 'left',   offset: clampV(y - ELEM / 2) };
    } else {
      newPos = { edge: 'right',  offset: clampV(y - ELEM / 2) };
    }

    position = newPos;
    localStorage.setItem(EDGE_KEY, JSON.stringify(newPos));
  }

  function handleClick() {
    if (didDrag) return;
    expanded = !expanded;
  }
</script>

{#if settings.showReferenceImage && gameState.currentImage && gameState.phase === "PLAYING"}
  <button
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={() => { isPointerDown = false; isDragging = false; }}
    onclick={handleClick}
    style={isDragging
      ? `left:${dragX - 40}px; top:${dragY - 40}px; transition:none;`
      : positionStyle(position)}
    class="fixed z-30 rounded-xl bg-white/90 p-1 shadow-lg border-2 border-slate-300 touch-none select-none
      {isDragging
        ? 'w-20 h-20 cursor-grabbing opacity-70 scale-95'
        : `${expanded ? 'w-56 h-44' : 'w-20 h-20'} cursor-grab hover:scale-105 transition-all duration-300`}"
    aria-label={expanded ? "הקטן תמונת עזר" : "הגדל תמונת עזר"}
  >
    <img
      src={gameState.currentImage.src}
      alt="תמונת עזר"
      class="w-full h-full object-cover rounded-lg pointer-events-none select-none"
    />
  </button>
{/if}
