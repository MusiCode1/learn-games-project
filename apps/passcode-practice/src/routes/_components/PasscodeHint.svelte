<!--
  כרטיס רמז — מציג את הסיסמא בבירור מעל הלוח
  מוצג רק כאשר settings.showHint === true
-->
<script lang="ts">
  import { settings } from "$lib/stores/settings.svelte";
</script>

{#if settings.showHint && settings.isPasscodeValid}
  <div
    class="rounded-2xl bg-white/15 px-8 py-4 shadow-lg backdrop-blur-sm
           ring-1 ring-white/30 text-center"
    aria-label="הסיסמא לתרגול"
  >
    <p class="mb-2 text-xs font-medium uppercase tracking-wider text-white/60">
      הסיסמא לתרגול
    </p>
    <div class="flex justify-center gap-3" dir="ltr">
      {#each settings.passcode.split("") as digit}
        <span class="text-5xl font-bold text-white drop-shadow-sm">
          {digit}
        </span>
      {/each}
    </div>
  </div>
{/if}
