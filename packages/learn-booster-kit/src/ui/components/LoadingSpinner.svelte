<script lang="ts">
  interface Props {
    message?: string;
  }

  let { message = "טוען..." }: Props = $props();
</script>

<div class="absolute inset-0 flex items-center justify-center text-white">
  <div class="flex flex-col items-center gap-2">
    <div
      class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
    ></div>
    <span>{message}</span>
  </div>
</div>

<style type="text/postcss">
  @reference "tailwindcss";
</style>
