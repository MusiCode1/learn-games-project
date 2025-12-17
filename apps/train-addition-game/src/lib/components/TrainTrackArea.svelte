<!--
	אזור המסילה - מציג את כל הקרונות בשורה
	עם מספרים דינמיים מעל כל קבוצה (גם בזמן בנייה)
-->
<script lang="ts">
	import TrainCar from './TrainCar.svelte';
	import { gameState } from '$lib/stores/game-state.svelte';

	// מערך קרונות קבוצה A
	const carsA = $derived(Array(gameState.round.builtA).fill(null));

	// מערך קרונות קבוצה B
	const carsB = $derived(Array(gameState.round.addedB).fill(null));

	// האם להציג רווח בין הקבוצות
	const showGap = $derived(gameState.round.builtA > 0 && gameState.round.addedB > 0);

	// האם קרון הוא חדש (האחרון במערך)
	const isNewA = $derived((i: number) => i === gameState.round.builtA - 1 && gameState.state === 'BUILD_A');
	const isNewB = $derived((i: number) => i === gameState.round.addedB - 1 && gameState.state === 'ADD_B');

	// האם להציג את הקטר (תמיד כשהמשחק פעיל)
	const showLocomotive = $derived(
		gameState.state !== 'INIT' && gameState.state !== 'NEXT_ROUND'
	);

	// האם להציג את סימן החיבור (+)
	const showPlusSign = $derived(gameState.round.builtA > 0 && gameState.round.addedB > 0);
</script>

<div class="relative flex min-h-52 w-full flex-col items-center justify-center rounded-xl bg-gradient-to-b from-amber-100 to-amber-200 p-4 shadow-inner">
	<!-- מסילה -->
	<div class="absolute bottom-6 left-4 right-4 h-3 rounded-full bg-amber-800 shadow-md"></div>
	<div class="absolute bottom-7 left-8 right-8 h-1 bg-amber-600"></div>

	<!-- קרונות -->
	<div class="relative z-10 flex items-end gap-0" dir="ltr">
		<!-- קטר - מוצג תמיד כשהמשחק פעיל (קובץ SVG חיצוני) -->
		{#if showLocomotive}
			<div class="relative mr-1">
				<img
					src="/images/locomotive.svg"
					alt="קטר"
					class="h-16 w-16 md:h-20 md:w-20"
				/>
			</div>
		{/if}

		<!-- קבוצה A עם מספר דינמי מעל -->
		{#if carsA.length > 0}
			<div class="relative flex flex-col items-center">
				<!-- מספר מעל קבוצה A - מוצג תמיד (גם בזמן בנייה) -->
				<div class="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-3xl font-bold text-white shadow-lg ring-4 ring-green-300 md:h-16 md:w-16 md:text-4xl">
					{gameState.round.builtA}
				</div>

				<!-- קרונות קבוצה A -->
				<div class="flex">
					{#each carsA as _, i}
						<TrainCar group="a" isNew={isNewA(i)} />
					{/each}
				</div>
			</div>
		{/if}

		<!-- סימן חיבור (+) -->
		{#if showPlusSign}
			<div class="mx-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-3xl font-bold text-white shadow-lg md:h-14 md:w-14 md:text-4xl">
				+
			</div>
		{/if}

		<!-- קבוצה B עם מספר דינמי מעל -->
		{#if carsB.length > 0}
			<div class="relative flex flex-col items-center">
				<!-- מספר מעל קבוצה B - מוצג תמיד (גם בזמן בנייה) -->
				<div class="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-3xl font-bold text-white shadow-lg ring-4 ring-blue-300 md:h-16 md:w-16 md:text-4xl">
					{gameState.round.addedB}
				</div>

				<!-- קרונות קבוצה B -->
				<div class="flex">
					{#each carsB as _, i}
						<TrainCar group="b" isNew={isNewB(i)} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
