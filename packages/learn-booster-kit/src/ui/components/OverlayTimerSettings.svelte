<!--
  הגדרות טיימר אוברליי — toggle הפעלה/כיבוי + בחירת מיקום וגודל בגרירה.
  קומפוננטה עצמאית לשיבוץ בדף הגדרות.
-->
<script lang="ts">
  import {
    loadOverlaySettings,
    saveOverlaySettings,
    MIN_SIZE_PX,
    MAX_SIZE_PX,
    type OverlayTimerSettings,
  } from '../../lib/overlay/overlay-settings';

  let settings = $state<OverlayTimerSettings>(loadOverlaySettings());
  let isPickerOpen = $state(false);
  let pickerPos = $state({ xPercent: 0, yPercent: 0 });
  let pickerSize = $state(140);
  let isDragging = $state(false);
  let containerEl = $state<HTMLDivElement | undefined>();

  // SVG constants
  const RADIUS = 45;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const DEMO_PROGRESS = 75;
  const DEMO_DASHARRAY = `${(DEMO_PROGRESS / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;

  const SIZE_STEP = 10;
  const svgSize = $derived(pickerSize - 12);
  const fontSize = $derived(Math.max(1.2, pickerSize / 56));

  function adjustSize(delta: number) {
    pickerSize = clamp(pickerSize + delta, MIN_SIZE_PX, MAX_SIZE_PX);
  }

  function toggleEnabled() {
    settings = { ...settings, enabled: !settings.enabled };
    saveOverlaySettings(settings);
  }

  function openPicker() {
    const loaded = loadOverlaySettings();
    pickerPos = { xPercent: loaded.xPercent, yPercent: loaded.yPercent };
    pickerSize = loaded.sizePx;
    isPickerOpen = true;
  }

  function savePicker() {
    settings = {
      ...settings,
      xPercent: pickerPos.xPercent,
      yPercent: pickerPos.yPercent,
      sizePx: pickerSize,
    };
    saveOverlaySettings(settings);
    isPickerOpen = false;
  }

  function cancelPicker() {
    isPickerOpen = false;
  }

  function clamp(v: number, min: number, max: number) {
    return Math.min(max, Math.max(min, v));
  }

  function updatePosition(clientX: number, clientY: number) {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    pickerPos = {
      xPercent: clamp(((clientX - rect.left) / rect.width) * 100, 2, 98),
      yPercent: clamp(((clientY - rect.top) / rect.height) * 100, 5, 95),
    };
  }

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX, e.clientY);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.clientX, e.clientY);
  }

  function handlePointerUp() {
    isDragging = false;
  }
</script>

<div class="space-y-3">
  <!-- Toggle הפעלה/כיבוי -->
  <label class="flex items-center justify-between">
    <div>
      <span class="text-base font-bold text-slate-700">הצגת טיימר באוברליי</span>
      <p class="text-sm text-slate-500">טיימר ספירה לאחור מעל האפליקציה החיצונית</p>
    </div>
    <input
      type="checkbox"
      checked={settings.enabled}
      onchange={toggleEnabled}
      class="h-6 w-6 accent-amber-500"
    />
  </label>

  <!-- כפתור פתיחת עורך מיקום וגודל -->
  <button
    onclick={openPicker}
    disabled={!settings.enabled}
    class="w-full rounded-lg px-4 py-3 text-base transition-colors
           flex items-center justify-center gap-2 touch-manipulation
           {settings.enabled
             ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
             : 'bg-slate-50 text-slate-400 cursor-not-allowed'}"
  >
    <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
    <span>מיקום וגודל הטיימר</span>
  </button>
</div>

<!-- Full-screen position & size picker -->
{#if isPickerOpen}
  <div
    class="fixed inset-0 z-[9999] bg-black/50"
    bind:this={containerEl}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    role="dialog"
    aria-label="בחירת מיקום וגודל טיימר"
    tabindex="-1"
    style="touch-action: none;"
  >
    <!-- רפליקת טיימר -->
    <div
      class="timer-preview"
      class:dragging={isDragging}
      style:left="{pickerPos.xPercent}%"
      style:top="{pickerPos.yPercent}%"
      style:width="{pickerSize}px"
      style:height="{pickerSize}px"
    >
      <svg viewBox="0 0 100 100" class="timer-preview-svg"
        style:width="{svgSize}px" style:height="{svgSize}px"
      >
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"
        />
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none" stroke="#22c55e" stroke-width="8"
          stroke-linecap="round"
          stroke-dasharray={DEMO_DASHARRAY}
          class="progress-arc"
        />
      </svg>
      <span class="timer-preview-text" style:font-size="{fontSize}rem">30</span>
    </div>

    <!-- בלון צף — שליש תחתון, מרכז -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="floating-panel"
      onpointerdown={(e) => e.stopPropagation()}
      onpointermove={(e) => e.stopPropagation()}
      onpointerup={(e) => e.stopPropagation()}
    >
      <p class="text-white/70 text-xs text-center mb-2">גררו את הטיימר למיקום הרצוי</p>

      <!-- גודל: -/+ -->
      <div class="flex items-center justify-center gap-2 mb-3">
        <button
          onclick={() => adjustSize(-SIZE_STEP)}
          disabled={pickerSize <= MIN_SIZE_PX}
          class="size-btn" aria-label="הקטן"
        >−</button>
        <span class="text-white text-xs w-8 text-center">{pickerSize}</span>
        <button
          onclick={() => adjustSize(SIZE_STEP)}
          disabled={pickerSize >= MAX_SIZE_PX}
          class="size-btn" aria-label="הגדל"
        >+</button>
      </div>

      <!-- כפתורי פעולה -->
      <div class="flex justify-center gap-2">
        <button onclick={cancelPicker} class="action-btn action-cancel">ביטול</button>
        <button onclick={savePicker} class="action-btn action-save">שמור</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .timer-preview {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transition: box-shadow 0.15s ease, width 0.15s ease, height 0.15s ease;
  }

  .timer-preview.dragging {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  .timer-preview-svg {
    position: absolute;
    transform: rotate(-90deg);
    transition: width 0.15s ease, height 0.15s ease;
  }

  .progress-arc {
    transition: stroke 0.5s ease;
  }

  .timer-preview-text {
    font-weight: 700;
    color: #22c55e;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    z-index: 1;
    transition: font-size 0.15s ease;
  }

  .floating-panel {
    position: absolute;
    bottom: 15%;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 18px;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    pointer-events: auto;
    -webkit-user-select: none;
    user-select: none;
  }

  .size-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
    touch-action: manipulation;
  }

  .size-btn:active {
    background: rgba(255, 255, 255, 0.25);
  }

  .size-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .action-btn {
    padding: 6px 16px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
    touch-action: manipulation;
  }

  .action-cancel {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
  .action-cancel:active {
    background: rgba(255, 255, 255, 0.08);
  }

  .action-save {
    background: #16a34a;
    color: white;
  }
  .action-save:active {
    background: #15803d;
  }
</style>
