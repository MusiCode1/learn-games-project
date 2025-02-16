<script lang="ts">
interface Props {
  word: string;
  direction: 'next' | 'prev' | null;
}

let { word, direction }: Props = $props();
</script>

<div
  class="w-[300px] h-[200px] border-2 rounded-2xl shadow-lg bg-white flex items-center justify-center
    hover:-translate-y-1 hover:shadow-xl transition-[var(--transition-all)]
    animate-[var(--animate-fade-in-down)] select-none mx-auto {
    direction === 'next' ? 'translate-x-[-100%]' : 
    direction === 'prev' ? 'translate-x-[100%]' : ''
  }"
>
  <div class="font-['Frank_Ruhl_Libre'] text-[60px] text-center leading-normal relative z-10 text-[var(--color-text-primary)]">
    {word}
  </div>
</div>
