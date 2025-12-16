<script lang="ts">
	import backspace from '$lib/assets/backspace.svg';
	interface Props {
		onKeyPress: (char: string) => void;
		onDelete: () => void;
		targetWord?: string;
		mode: 'full' | 'focused';
	}

	let { onKeyPress, onDelete, targetWord = '', mode }: Props = $props();

	// Standard Hebrew Layout (Reversed for correct RTL visual mapping)
	// Right-to-Left visualization:
	// Row 1: Backspace, ', /, ק, ר, א, ט, ו, ן, ם, פ
	// Row 2: ש, ד, ג, כ, ע, י, ח, ל, ך, ף
	// Row 3: ז, ס, ב, ה, נ, מ, צ, ת, ץ

	// Since we are using flex-row in RTL dir:
	// First item appears on the Right. Last item on the Left.
	// We want standard mapping: Left side QWERTY area = ' / q r ...
	// Right side P area = p m n ...
	// So 'p' should be first in the array (Rightmost).
	// 'q' should be last in the array (Leftmost).

	// Let's re-verify standard Hebrew keyboard.
	// Q W E R T Y U I O P
	// / ' ק ר א ט ו ן ם פ
	//
	// So 'פ' is on P (Right). 'ק' is on E (Left).
	// So in our array for RTL:
	// Index 0 (Rightmost): 'פ'
	// Index End (Leftmost): '/' or 'q'

	const rows = [
		// Top Row: P -> Q (Standard: ' is on W, / is on Q - we remove /)
		['פ', 'ם', 'ן', 'ו', 'ט', 'א', 'ר', 'ק', "'"],
		// Middle Row: Enter -> A (Standard: , is on ' key right of ;)
		[',', 'ף', 'ך', 'ל', 'ח', 'י', 'ע', 'כ', 'ג', 'ד', 'ש'],
		// Bottom Row: Shift -> Z (Standard: . is on / key right of .)
		/* ... existing rows ... */
		['.', 'ץ', 'ת', 'צ', 'מ', 'נ', 'ה', 'ב', 'ס', 'ז'],
		['', ' ', '']
	];

	function isKeyVisible(key: string): boolean {
		if (key === '') return true; // Always show empty spacer keys
		if (mode === 'full') return true;
		if (mode === 'focused') {
			return targetWord.includes(key);
		}
		return false;
	}
</script>

<!-- Removed unnecessary padding/margins -->
<!-- Removed unnecessary padding/margins -->
<!-- Removed unnecessary padding/margins -->
<div
	class="w-full bg-slate-200 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] select-none z-50"
	dir="rtl"
>
	<div class="flex flex-col gap-2 w-full max-w-full px-2">
		{#each rows as row, i}
			<div class="flex justify-center gap-1.5 w-full">
				<!-- Row 1: Backspace on Right (Beginning of RTL row) -->
				{#if i === 0}
					<div class="key-wrapper">
						<button onclick={onDelete} class="key-base key-delete" aria-label="מחק">
							<img
								src={backspace}
								alt="מחק"
								class="text-slate-600 group-hover:text-red-500 transition-colors"
							/>
						</button>
					</div>
				{/if}

				{#each row as key}
					{@const visible = isKeyVisible(key)}
					{@const isSpace = key === ' '}
					{@const isEmpty = key === ''}
					<!-- Key Container: Uniform Size -->
					<div class="key-wrapper {isSpace ? 'is-space' : 'max-w-20'}">
						<button
							onclick={() => !isEmpty && visible && onKeyPress(key)}
							disabled={!visible || isEmpty}
							class="key-base key-char {visible ? 'is-visible' : 'is-hidden'} {isEmpty
								? 'cursor-default! active:translate-y-0! active:border-b-4!'
								: ''}"
							aria-label={isSpace ? 'רווח' : key}
							aria-hidden={isEmpty}
						>
							{isSpace ? '' : key}
						</button>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	@reference 'tailwindcss';

	.key-wrapper {
		@apply @container relative h-12 w-[8%] shrink-0 sm:h-14 md:h-16;
	}

	.key-wrapper.is-space {
		@apply w-[40%] max-w-xs;
	}

	.key-base {
		@apply absolute inset-0 flex h-full w-full items-center justify-center rounded-lg border border-b-4 shadow-sm transition-all;
	}

	.key-delete {
		@apply border-slate-400 border-b-slate-500 bg-slate-200 hover:bg-slate-300 active:translate-y-1 active:border-b active:bg-slate-400;
	}

	.key-char {
		@apply p-0 text-[4.5cqh] leading-none font-medium;
	}

	.key-char.is-visible {
		@apply border-slate-300 border-b-slate-400 bg-white text-slate-800 hover:bg-slate-50 active:translate-y-1 active:border-b active:bg-slate-100;
	}

	.key-char.is-hidden {
		@apply cursor-default border-slate-300 border-b-slate-400 bg-slate-50 text-transparent;
	}
</style>
