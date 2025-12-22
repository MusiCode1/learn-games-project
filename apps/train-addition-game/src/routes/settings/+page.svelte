<script lang="ts">
  import SettingsControls from "$lib/components/admin/SettingsControls.svelte";
  import { goto } from "$app/navigation";
</script>

<!-- רקע כללי של הדף -->
<div
  class="w-full flex-1 h-full overflow-y-auto bg-slate-100 p-4 md:p-8 font-sans"
  dir="rtl"
>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div
      class="flex items-center justify-between sticky top-0 bg-slate-100/90 backdrop-blur-sm z-10 py-4"
    >
      <h1 class="text-3xl font-bold text-slate-800">הגדרות</h1>
      <button
        onclick={() => goto("/game")}
        class="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-green-500/20 active:scale-95"
      >
        חזרה למשחק
      </button>
    </div>

    <!-- Controls -->
    <SettingsControls />
  </div>
</div>
