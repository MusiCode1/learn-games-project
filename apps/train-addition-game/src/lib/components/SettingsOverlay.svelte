<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import BoosterSettings from "./admin/BoosterSettings.svelte";

  let { onClose } = $props<{ onClose: () => void }>();
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  transition:fade
  onclick={onClose}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === "Escape" && onClose()}
>
  <div
    class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
    transition:scale={{ duration: 300, start: 0.95 }}
    onclick={(e) => e.stopPropagation()}
    role="document"
  >
    <!-- כותרת -->
    <div
      class="flex items-center justify-between bg-slate-100 px-6 py-4 border-b border-slate-200"
    >
      <h2 class="text-xl font-bold text-slate-800">הגדרות</h2>
      <button
        onclick={onClose}
        class="rounded-full p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        aria-label="סגור"
      >
        <svg
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- תוכן -->
    <div class="max-h-[70vh] overflow-y-auto px-6 py-6">
      <div class="space-y-8">
        <!-- ניתן להוסיף כאן הגדרות נוספות בעתיד -->

        <!-- הגדרות חיזוקים -->
        <section>
          <h3 class="mb-4 text-lg font-bold text-slate-700 border-b pb-2">
            חיזוקים והפתעות
          </h3>
          <BoosterSettings />
        </section>
      </div>
    </div>

    <!-- כפתורים למטה (אופציונלי) -->
    <div class="bg-slate-50 px-6 py-4 flex justify-end">
      <button
        onclick={onClose}
        class="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
      >
        סיום
      </button>
    </div>
  </div>
</div>
