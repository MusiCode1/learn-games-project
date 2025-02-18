<script lang="ts">
interface Props {
word: string;
direction: 'next' | 'prev' | null;
lastDirection: 'next' | 'prev';
hideAfterSeconds: number;
isVisible: boolean;
onClick: () => void;
}

let { word, direction, lastDirection, hideAfterSeconds, isVisible, onClick }: Props = $props();

function handleClick(event: Event) {
onClick();
}
</script>

<button
	type="button"
	class="mx-auto flex h-[200px] w-[300px] cursor-pointer items-center justify-center rounded-2xl border-2
    bg-white shadow-lg transition-[var(--transition-all)]
    select-none hover:-translate-y-1 hover:shadow-xl"
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick(e)}
	aria-label="הצג מילה"
>
	<div
		class="relative z-10 text-center font-['Frank_Ruhl_Libre'] text-[60px] leading-normal text-[var(--color-text-primary)] transition-opacity duration-300 {isVisible
			? 'opacity-100'
			: 'opacity-0'}"
	>
		{word}
	</div>
</button>
