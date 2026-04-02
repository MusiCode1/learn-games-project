<script lang="ts">
	import { playError, playSuccess, speak } from '$lib/utils/sound';
	import { settings } from '$lib/stores/settings.svelte';

	interface Props {
		targetWord: string;
		onSuccess: () => void;
		value?: string;
	}

	let { targetWord, onSuccess, value = $bindable('') }: Props = $props();
	let isError = $state(false);
	let shakeTrigger = $state(0);
	let inputRef: HTMLInputElement | undefined = $state();

	$effect(() => {
		inputRef?.focus();
	});

	let previousValue = '';

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		value = input.value;
	}

	/** מצב מתחילים: חסימת תווים שגויים ממקלדת פיזית */
	function handleBeforeInput(e: InputEvent) {
		if (!settings.beginnerMode) return;
		if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') return;
		const newChar = e.data;
		if (!newChar) return;
		const nextExpected = targetWord[value.length];
		if (newChar !== nextExpected) {
			e.preventDefault();
			playError();
		}
	}

	/** הקראת אות ממקלדת פיזית */
	function handleKeydown(e: KeyboardEvent) {
		if (settings.speakLetters && e.key.length === 1) {
			speak(e.key, true);
		}
	}

	$effect(() => {
		if (value === previousValue) return;

		const isDeletion = value.length < previousValue.length;
		previousValue = value;

		if (targetWord.startsWith(value)) {
			isError = false;

			// מצב מתחילים: צליל הצלחה על כל אות נכונה (לא על סיום מילה)
			if (settings.beginnerMode && !isDeletion && value.length > 0 && value !== targetWord) {
				playSuccess();
			}

			if (value === targetWord && value.length > 0) {
				onSuccess();
			}
		} else {
			if (settings.errorFeedback && !isDeletion && value.length > 0) {
				playError();
			}
			isError = true;
			shakeTrigger++;
		}
	});
</script>

<div class="flex justify-center p-4">
	{#key shakeTrigger}
		<input
			bind:this={inputRef}
			type="text"
			inputmode={settings.virtualKeyboardMode !== 'none' ? 'none' : 'text'}
			class="w-full text-center text-4xl p-4 rounded-xl border-4 outline-none transition-all duration-200
            {isError
				? 'border-red-500 bg-red-50 animate-shake'
				: 'border-blue-400 focus:border-blue-600 bg-white'}"
			placeholder="הקלד את המילה..."
			{value}
			oninput={handleInput}
			onbeforeinput={handleBeforeInput}
			onkeydown={handleKeydown}
			dir="rtl"
			style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
		/>
	{/key}
</div>

<style type="text/postcss">
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
