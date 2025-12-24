<script lang="ts">
	import { LETTERS, SHAPES, type ContentType, type ColorMode } from '$lib/utils/gameLogic';
	import ShapeSvg from './ShapeSvg.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onSave: (settings: {
			pairCount: number;
			contentType: ContentType;
			selectedLetters: string[];
			selectedShapes: string[];
			colorMode: ColorMode;
			loopMode: 'finite' | 'infinite';
			totalRounds: number;
		}) => void;
		initialPairCount: number;
		initialContentType: ContentType;
		initialSelectedLetters: string[];
		initialSelectedShapes: string[];
		initialColorMode: ColorMode;
		initialLoopMode: 'finite' | 'infinite';
		initialTotalRounds: number;
	}

	let { 
		isOpen, 
		onClose, 
		onSave, 
		initialPairCount,
		initialContentType = 'letters',
		initialSelectedLetters,
		initialSelectedShapes = SHAPES.map(s => s.id),
		initialColorMode = 'random',
		initialLoopMode = 'finite', 
		initialTotalRounds = 1 
	}: Props = $props();

	// מצב מקומי
	// svelte-ignore state_referenced_locally
	let pairCount = $state(initialPairCount);
	// svelte-ignore state_referenced_locally
	let contentType = $state<ContentType>(initialContentType);
	// svelte-ignore state_referenced_locally
	let selectedLetters = $state(initialSelectedLetters);
	// svelte-ignore state_referenced_locally
	let selectedShapes = $state(initialSelectedShapes);
	// svelte-ignore state_referenced_locally
	let colorMode = $state<ColorMode>(initialColorMode);
	// svelte-ignore state_referenced_locally
	let loopMode = $state(initialLoopMode);
	// svelte-ignore state_referenced_locally
	let totalRounds = $state(initialTotalRounds);

	// איפוס מצב כשהמודל נפתח
	$effect(() => {
		if (isOpen) {
			pairCount = initialPairCount;
			contentType = initialContentType;
			selectedLetters = initialSelectedLetters;
			selectedShapes = initialSelectedShapes;
			colorMode = initialColorMode;
			loopMode = initialLoopMode;
			totalRounds = initialTotalRounds;
		}
	});

	// ===== פונקציות לאותיות =====
	function handleLetterToggle(letter: string) {
		if (selectedLetters.includes(letter)) {
			selectedLetters = selectedLetters.filter(l => l !== letter);
		} else {
			selectedLetters = [...selectedLetters, letter];
		}
	}

	function handleSelectAllLetters() {
		selectedLetters = [...LETTERS];
	}

	function handleDeselectAllLetters() {
		selectedLetters = [];
	}

	// ===== פונקציות לצורות =====
	function handleShapeToggle(shapeId: string) {
		if (selectedShapes.includes(shapeId)) {
			selectedShapes = selectedShapes.filter(s => s !== shapeId);
		} else {
			selectedShapes = [...selectedShapes, shapeId];
		}
	}

	function handleSelectAllShapes() {
		selectedShapes = SHAPES.map(s => s.id);
	}

	function handleDeselectAllShapes() {
		selectedShapes = [];
	}

	// ===== שמירה =====
	function handleSave() {
		if (contentType === 'letters' && selectedLetters.length < 2) {
			alert('יש לבחור לפחות 2 אותיות');
			return;
		}
		if (contentType === 'shapes' && selectedShapes.length < 2) {
			alert('יש לבחור לפחות 2 צורות');
			return;
		}
		onSave({
			pairCount,
			contentType,
			selectedLetters,
			selectedShapes,
			colorMode,
			loopMode,
			totalRounds
		});
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
			<!-- Header -->
			<div class="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
				<h2 class="text-2xl font-bold">הגדרות משחק</h2>
				<button onclick={onClose} class="text-white/80 hover:text-white text-2xl">&times;</button>
			</div>

			<!-- Content -->
			<div class="p-6 overflow-y-auto flex-grow space-y-8">
				
				<!-- סוג תוכן -->
				<section>
					<h3 class="text-lg font-bold text-gray-800 mb-4">סוג תוכן</h3>
					<div class="flex gap-4">
						<button
							onclick={() => contentType = 'letters'}
							class="flex-1 py-4 rounded-xl font-bold text-lg transition-all {contentType === 'letters' 
								? 'bg-indigo-600 text-white shadow-lg scale-105' 
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
						>
							🔤 אותיות
						</button>
						<button
							onclick={() => contentType = 'shapes'}
							class="flex-1 py-4 rounded-xl font-bold text-lg transition-all {contentType === 'shapes' 
								? 'bg-indigo-600 text-white shadow-lg scale-105' 
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
						>
							🔷 צורות
						</button>
					</div>
				</section>

				<!-- מספר זוגות -->
				<section>
					<h3 class="text-lg font-bold text-gray-800 mb-4">מספר זוגות ({pairCount})</h3>
					<div class="flex items-center gap-4">
						<input
							type="range"
							min="2"
							max="20"
							bind:value={pairCount}
							class="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
						/>
						<span class="font-bold text-indigo-600 min-w-[2rem] text-center">{pairCount}</span>
					</div>
					<p class="text-sm text-gray-500 mt-2">
						{#if contentType === 'letters'}
							מספר הזוגות במשחק. אם נבחרו פחות אותיות, הן יחזרו על עצמן.
						{:else}
							מספר הזוגות במשחק. אם נבחרו פחות צורות, הן יחזרו על עצמן.
						{/if}
					</p>
				</section>

				<!-- הגדרות חזרות -->
				<section>
					<h3 class="text-lg font-bold text-gray-800 mb-4">חזרות משחק</h3>
					<div class="space-y-4">
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								id="infiniteLoop"
								checked={loopMode === 'infinite'}
								onchange={(e) => loopMode = e.currentTarget.checked ? 'infinite' : 'finite'}
								class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
							/>
							<label for="infiniteLoop" class="text-gray-700 font-medium cursor-pointer">
								משחק ללא הגבלה (אינסופי)
							</label>
						</div>

						<div class="transition-opacity {loopMode === 'infinite' ? 'opacity-50 pointer-events-none' : 'opacity-100'}">
							<label for="totalRounds" class="block text-gray-700 font-medium mb-2">מספר סבבים:</label>
							<div class="flex items-center gap-4">
								<input
									type="range"
									id="totalRounds"
									min="1"
									max="10"
									bind:value={totalRounds}
									class="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
								/>
								<span class="font-bold text-indigo-600 min-w-[2rem] text-center">{totalRounds}</span>
							</div>
						</div>
					</div>
				</section>

				<!-- בחירת אותיות (מוצג רק במצב אותיות) -->
				{#if contentType === 'letters'}
					<section>
						<div class="flex justify-between items-center mb-4">
							<h3 class="text-lg font-bold text-gray-800">בחירת אותיות ({selectedLetters.length})</h3>
							<div class="space-x-2 space-x-reverse text-sm">
								<button
									onclick={handleSelectAllLetters}
									class="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50"
								>
									בחר הכל
								</button>
								<span class="text-gray-300">|</span>
								<button
									onclick={handleDeselectAllLetters}
									class="text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-100"
								>
									נקה הכל
								</button>
							</div>
						</div>

						<div class="grid grid-cols-6 sm:grid-cols-8 gap-2">
							{#each LETTERS as letter}
								{@const isSelected = selectedLetters.includes(letter)}
								<button
									onclick={() => handleLetterToggle(letter)}
									class="
										aspect-square rounded-lg font-bold text-lg flex items-center justify-center transition-all
										{isSelected
											? 'bg-indigo-600 text-white shadow-md scale-105'
											: 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
									"
								>
									{letter}
								</button>
							{/each}
						</div>
					</section>
				{/if}

				<!-- בחירת צורות (מוצג רק במצב צורות) -->
				{#if contentType === 'shapes'}
					<!-- מצב צבעים -->
					<section>
						<h3 class="text-lg font-bold text-gray-800 mb-4">מצב צבעים</h3>
						<div class="flex gap-4">
							<button
								onclick={() => colorMode = 'random'}
								class="flex-1 py-3 rounded-xl font-bold transition-all {colorMode === 'random' 
									? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg scale-105' 
									: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
							>
								🌈 צבע רנדומלי לכל זוג
							</button>
							<button
								onclick={() => colorMode = 'uniform'}
								class="flex-1 py-3 rounded-xl font-bold transition-all {colorMode === 'uniform' 
									? 'bg-blue-500 text-white shadow-lg scale-105' 
									: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
							>
								🔵 צבע אחיד
							</button>
						</div>
					</section>

					<!-- בחירת צורות -->
					<section>
						<div class="flex justify-between items-center mb-4">
							<h3 class="text-lg font-bold text-gray-800">בחירת צורות ({selectedShapes.length})</h3>
							<div class="space-x-2 space-x-reverse text-sm">
								<button
									onclick={handleSelectAllShapes}
									class="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50"
								>
									בחר הכל
								</button>
								<span class="text-gray-300">|</span>
								<button
									onclick={handleDeselectAllShapes}
									class="text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-100"
								>
									נקה הכל
								</button>
							</div>
						</div>

						<div class="grid grid-cols-5 gap-3">
							{#each SHAPES as shape}
								{@const isSelected = selectedShapes.includes(shape.id)}
								<button
									onclick={() => handleShapeToggle(shape.id)}
									class="
										flex flex-col items-center gap-2 p-3 rounded-xl transition-all
										{isSelected
											? 'bg-indigo-100 border-2 border-indigo-600 shadow-md scale-105'
											: 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'}
									"
								>
									<div class="w-12 h-12 flex items-center justify-center">
										<ShapeSvg shapeId={shape.id} color={isSelected ? '#4F46E5' : '#9CA3AF'} />
									</div>
									<span class="text-xs font-medium {isSelected ? 'text-indigo-700' : 'text-gray-500'}">
										{shape.name}
									</span>
								</button>
							{/each}
						</div>
					</section>
				{/if}
			</div>

			<!-- Footer -->
			<div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
				<button
					onclick={onClose}
					class="px-6 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-200 transition-colors"
				>
					ביטול
				</button>
				<button
					onclick={handleSave}
					class="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
				>
					שמור והתחל מחדש
				</button>
			</div>
		</div>
	</div>
{/if}
