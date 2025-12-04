<script lang="ts">
	interface Props {
		targetWord: string;
		onSuccess: () => void;
	}

	let { targetWord, onSuccess }: Props = $props();

	let value = $state('');
	let isError = $state(false);
	let inputRef: HTMLInputElement | undefined = $state();

	$effect(() => {
		inputRef?.focus();
	});

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const currentVal = input.value;
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
			isError = true;
		}
	}
</script>

<div class="flex justify-center p-4">
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
		animation: shake 0.3s ease-in-out;
	}
</style>
