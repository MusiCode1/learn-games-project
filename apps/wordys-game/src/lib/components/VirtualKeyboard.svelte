<script lang="ts">
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
		['.', 'ץ', 'ת', 'צ', 'מ', 'נ', 'ה', 'ב', 'ס', 'ז']
	];

	function isKeyVisible(key: string): boolean {
		if (mode === 'full') return true;
		if (mode === 'focused') {
			return targetWord.includes(key);
		}
		return false;
	}
</script>

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
					<div class="relative w-[8%] h-12 sm:h-14 md:h-16 shrink-0 [container-type:inline-size]">
						<button
							onclick={onDelete}
							class="absolute inset-0 w-full h-full bg-slate-200 rounded-lg shadow-sm border border-slate-400 border-b-4 border-b-slate-500 active:border-b active:translate-y-1 hover:bg-slate-300 active:bg-slate-400
									   flex items-center justify-center transition-all group"
							aria-label="מחק"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-slate-600 group-hover:text-red-500 transition-colors"
							>
								<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
								<line x1="18" y1="9" x2="12" y2="15"></line>
								<line x1="12" y1="9" x2="18" y2="15"></line>
							</svg>
						</button>
					</div>
				{/if}

				{#each row as key}
					<!-- Key Container: Uniform Size -->
					<div class="relative w-[8%] h-12 sm:h-14 md:h-16 shrink-0 [container-type:inline-size]">
						{#if isKeyVisible(key)}
							<button
								onclick={() => onKeyPress(key)}
								class="absolute inset-0 w-full h-full bg-white rounded-lg
								shadow-sm border border-slate-300 border-b-4 border-b-slate-400
								active:border-b active:translate-y-1 hover:bg-slate-50 active:bg-slate-100
								text-[50cqw] font-medium text-slate-800 transition-all flex items-center
								justify-center p-0 leading-none"
							>
								{key}
							</button>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
