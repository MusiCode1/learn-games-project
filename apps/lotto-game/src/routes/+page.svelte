<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { 
		generateCards, 
		contentMatches,
		type Card as CardType
	} from '$lib/utils/gameLogic';
	import { playSuccess, playError, playWin } from '$lib/utils/sound';
	import { boosterService } from 'learn-booster-kit';
	import { settings } from '$lib/stores/settings.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import Board from '$lib/components/Board.svelte';
	import winnerLogo from '$lib/assets/winner_logo.png';

	// מצב המשחק
	let cards = $state<CardType[]>([]);
	let selectedCards = $state<number[]>([]); // אינדקסים של כרטיסים נבחרים
	let matches = $state(0);
	let isLocked = $state(false);
	let won = $state(false);
	let currentRound = $state(1);
	let nextRoundTimer = $state<number | null>(null);

	let showRewardButton = $state(false);

	// כותרת דינמית לפי סוג התוכן
	const gameTitle = $derived(settings.contentType === 'letters' ? 'משחק לוטו אותיות' : 'משחק לוטו צורות');

	onMount(() => {
		// בוסטר מותחל ב-layout
		startNewGame();
	});

	// Timer Effect
	$effect(() => {
		let interval: ReturnType<typeof setInterval>;
		if (nextRoundTimer !== null && nextRoundTimer > 0) {
			interval = setInterval(() => {
				nextRoundTimer = (nextRoundTimer as number) - 1;
				if (nextRoundTimer <= 0) {
					clearInterval(interval);
					// התחלת סבב הבא
					startNewGame(currentRound + 1);
					nextRoundTimer = null;
				}
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	});

	function startNewGame(round = 1) {
		const newCards = generateCards({
			pairCount: settings.pairCount,
			contentType: settings.contentType,
			selectedLetters: settings.selectedLetters,
			selectedShapes: settings.selectedShapes,
			colorMode: settings.colorMode
		});
		
		cards = newCards;
		selectedCards = [];
		matches = 0;
		isLocked = false;
		won = false;
		showRewardButton = false;
		currentRound = round;
		nextRoundTimer = null;
	}

	function handleCardClick(id: number) {
		if (isLocked) return;

		const clickedCardIndex = cards.findIndex(c => c.id === id);
		if (clickedCardIndex === -1) return;

		const clickedCard = cards[clickedCardIndex];

		// התעלם אם כבר מותאם או נבחר
		if (clickedCard.isMatched || clickedCard.isSelected) {
			if (clickedCard.isSelected && settings.enableDeselect) {
				// ביטול בחירה (רק אם מותר)
				cards[clickedCardIndex].isSelected = false;
				selectedCards = selectedCards.filter(index => index !== clickedCardIndex);
			}
			return;
		}

		// בחירת הכרטיס
		cards[clickedCardIndex].isSelected = true;
		selectedCards = [...selectedCards, clickedCardIndex];

		// בדיקת התאמה
		if (selectedCards.length === 2) {
			isLocked = true;

			const firstIndex = selectedCards[0];
			const secondIndex = selectedCards[1];
			const firstCard = cards[firstIndex];
			const secondCard = cards[secondIndex];

			// השתמש בפונקציית ההשוואה המתאימה לשני סוגי התוכן
			if (contentMatches(firstCard.content, secondCard.content)) {
				// התאמה!
				playSuccess();
				setTimeout(() => {
					cards[firstIndex].isMatched = true;
					cards[secondIndex].isMatched = true;
					cards[firstIndex].isSelected = false;
					cards[secondIndex].isSelected = false;

					matches += 1;
					selectedCards = [];
					isLocked = false;

					if (matches === settings.pairCount) {
						handleWin();
					}
				}, 500);
			} else {
				// אין התאמה
				playError();
				cards[firstIndex].isError = true;
				cards[secondIndex].isError = true;

				setTimeout(() => {
					cards[firstIndex].isSelected = false;
					cards[secondIndex].isSelected = false;
					cards[firstIndex].isError = false;
					cards[secondIndex].isError = false;
					
					selectedCards = [];
					isLocked = false;
				}, 1000);
			}
		}
	}

	// חיבור ל-store של הקונפיגורציה
	const configStore = boosterService.config;
	let winsCount = $state(0);

	function handleWin() {
		won = true;
		playWin();
		
		winsCount++;
		// מקור האמת החדש לתדירות - Settings
		const turnsTarget = settings.totalRounds || 1;

		let rewardTriggered = false;

		if (settings.boosterEnabled && winsCount >= turnsTarget) {
			if (settings.autoBooster) {
				// הפעלה אוטומטית
				boosterService.triggerReward();
				winsCount = 0;
				rewardTriggered = true;
			} else {
				// הפעלה ידנית - הצגת כפתור
				showRewardButton = true;
				rewardTriggered = true; // טכנית עצרנו להפסקת פרס
			}
		}

		// לוגיקת לולאה
		// אם יש כפתור פרס, לא מפעילים טיימר אוטומטי
		if (!showRewardButton) {
			const hasNextRound = settings.loopMode === 'infinite' || currentRound < settings.totalRounds;
			if (hasNextRound) {
				nextRoundTimer = 5;
			}
		}
	}

	function handleManualRewardClick() {
		boosterService.triggerReward();
		winsCount = 0;
		showRewardButton = false;
		
		// לאחר קבלת הפרס, האם להמשיך סבב?
		// כרגע נשאיר את המשתמש במסך הניצחון ללא טיימר, הוא יצטרך ללחוץ "משחק חדש" או "סבב הבא"
		// או שנתחיל טיימר? בדרך כלל חוזרים מהבוסטר וצריך ללחוץ ידנית.
		// נוסיף כפתור "המשך" שמופיע אחרי הפרס
	}
</script>

<div class="flex flex-col h-screen bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
	{#if won}
		<Confetti />
	{/if}

	<!-- Header Bar -->
	<header class="bg-white shadow-md p-4 flex justify-between items-center z-10 shrink-0">
		<h1 class="text-2xl font-bold text-indigo-800 font-sans">{gameTitle}</h1>

		<div class="flex items-center gap-4">
			<div class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
				<span class="text-gray-600 ml-2">זוגות:</span>
				<span class="font-bold text-indigo-600 text-xl">{matches}/{settings.pairCount}</span>
			</div>
			
			{#if settings.loopMode === 'finite' && settings.totalRounds > 1}
				<div class="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
					<span class="text-gray-600 ml-2">סבב:</span>
					<span class="font-bold text-purple-600 text-xl">{currentRound}/{settings.totalRounds}</span>
				</div>
			{/if}

			{#if settings.loopMode === 'infinite'}
				 <div class="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
					<span class="text-gray-600 ml-2">סבב:</span>
					<span class="font-bold text-purple-600 text-xl">{currentRound}</span>
				</div>
			{/if}

			<button
				onclick={() => goto('/settings')}
				class="bg-gray-100 hover:bg-gray-200 text-indigo-600 p-2 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
				title="הגדרות"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</button>
			<button
				onclick={() => startNewGame(1)}
				class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 font-bold"
			>
				משחק חדש
			</button>
		</div>
	</header>

	<!-- Main Game Area -->
	<main class="game-container">
		<Board
			{cards}
			onCardClick={handleCardClick}
			{isLocked}
		/>
	</main>

	{#if won}
		<div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50" transition:fade>
			<div class="bg-white p-8 rounded-2xl shadow-2xl text-center relative z-50 max-w-md w-full mx-4" transition:scale>
				<img src={winnerLogo} alt="Winner" class="w-32 h-32 mx-auto mb-4 object-contain drop-shadow-lg" />
				<h2 class="text-5xl font-bold text-green-500 mb-4">כל הכבוד!</h2>
				<p class="text-2xl text-gray-600 mb-8">מצאת את כל הזוגות!</p>

				{#if showRewardButton}
					<!-- כפתור פרס גדול -->
					<button
						onclick={handleManualRewardClick}
						class="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-8 py-6 rounded-2xl text-2xl font-black shadow-xl transition-transform hover:scale-105 active:scale-95 w-full flex items-center justify-center gap-3 animate-bounce"
					>
						<span>🎁</span>
						<span>קבל הפתעה!</span>
					</button> 
					<div class="mt-4">
						<button
							onclick={() => startNewGame(currentRound + 1)}
							class="text-gray-400 hover:text-gray-600 underline text-sm"
						>
							דלג והמשך לסבב הבא
						</button>
					</div>
				{:else if nextRoundTimer !== null}
					<div class="mb-6">
						<p class="text-lg text-indigo-600 font-bold mb-2">הסבב הבא מתחיל בעוד:</p>
						<div class="text-4xl font-mono font-bold text-indigo-800">{nextRoundTimer}</div>
						<button
							onclick={() => nextRoundTimer = 1}
							class="mt-4 text-sm text-gray-500 hover:text-indigo-600 underline"
						>
							דלג והתחל מיד
						</button>
					</div>
				{:else}
					<button
						onclick={() => startNewGame(1)}
						class="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg transition-transform hover:scale-105 w-full"
					>
						שחק שוב
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
