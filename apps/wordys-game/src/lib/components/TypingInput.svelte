<script lang="ts">
	import { playError } from '$lib/utils/sound';
	import { settings } from '$lib/stores/settings.svelte';

	interface Props {
		targetWord: string;
		onSuccess: () => void;
		value?: string;
	}

	let { targetWord, onSuccess, value = $bindable('') }: Props = $props();
	let isError = $state(false);
	let shakeTrigger = $state(0); // Counter to force re-render of shake animation
	let inputRef: HTMLInputElement | undefined = $state();

	$effect(() => {
		inputRef?.focus();
	});

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const currentVal = input.value;
		const isDeletion = currentVal.length < value.length;
		value = currentVal;

		// Check if the current input matches the beginning of the target word
		if (targetWord.startsWith(currentVal)) {
			isError = false;

			// Check for complete match
			if (value === targetWord) {
				onSuccess();
			}
		} else {
			// Error!
			// Always play sound and trigger shake on error, even if already in error state
			// BUT skip if user is deleting (correcting)
			if (settings.errorFeedback && !isDeletion) {
				playError();
			}
			isError = true;
			shakeTrigger++; // Increment to trigger animation replay
		}
	}
</script>

<div class="flex justify-center p-4">
	{#key shakeTrigger}
		<input
			bind:this={inputRef}
			type="text"
			class="w-full max-w-md text-center text-4xl p-4 rounded-xl border-4 outline-none transition-all duration-200
            {isError
				? 'border-red-500 bg-red-50 animate-shake'
				: 'border-blue-400 focus:border-blue-600 bg-white'}"
			placeholder="הקלד את המילה..."
			{value}
			oninput={handleInput}
			dir="rtl"
		/>
	{/key}
</div>

<style>
	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		75% {
			transform: translateX(5px);
		}
	}
	.animate-shake {
		animation: shake 0.2s ease-in-out; /* Faster shake */
	}
</style>
