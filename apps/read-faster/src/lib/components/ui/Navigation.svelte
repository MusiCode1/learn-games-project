<script lang="ts">
	interface Props {
		onNext: () => void;
		onPrev: () => void;
		isFirstWord: boolean;
		isLastWord: boolean;
	}

	let { onNext, onPrev, isFirstWord, isLastWord }: Props = $props();
</script>

<div class="my-4 flex justify-center gap-8">
	<button
		class="from-primary to-secondary hover:shadow-primary/20 flex items-center gap-2 rounded-full bg-linear-to-r/oklch p-4 text-white shadow-lg transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
		onclick={onPrev}
		disabled={isFirstWord}
		aria-label="מילה קודמת"
	>
		<svg class="h-6 w-6" viewBox="0 0 24 24">
			<path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
		</svg>
		<span>הקודם</span>
	</button>

	<button
		class="from-primary to-secondary hover:shadow-primary/20 flex items-center gap-2 rounded-full bg-linear-to-r/oklch p-4 text-white shadow-lg transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
		onclick={onNext}
		disabled={isLastWord}
		aria-label="מילה הבאה"
	>
		<span>הבא</span>
		<svg class="h-6 w-6" viewBox="0 0 24 24">
			<path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
		</svg>
	</button>
</div>
