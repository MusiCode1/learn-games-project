<script lang="ts">
	import BaseCard from './BaseCard.svelte';

	interface Props {
		word: string;
		direction: 'next' | 'prev' | null;
		lastDirection: 'next' | 'prev';
		hideAfterSeconds: number;
		isVisible: boolean;
		onClick: () => void;
	}

	let { word, direction, lastDirection, hideAfterSeconds, isVisible, onClick }: Props = $props();
</script>

<BaseCard {onClick}>
	<div
		class="font-secondary relative z-10 text-center text-[60px] leading-normal text-[var(--color-text-primary)] transition-opacity duration-300 {isVisible
			? 'opacity-100'
			: 'opacity-0'}"
	>
		{word}
	</div>
</BaseCard>
