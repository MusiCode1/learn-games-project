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
	import { boosterService, AdminGate } from 'learn-booster-kit';
	import { settings } from '$lib/stores/settings.svelte';
	import { contentRegistry } from '$lib/content/registry';
	import Confetti from './_components/Confetti.svelte';
	import Board from './_components/Board.svelte';
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
	let isRewardPending = $state(false);

	// כותרת דינמית לפי סוג התוכן
	const provider = $derived(contentRegistry.get(settings.contentProviderId));
	const gameTitle = $derived(`משחק לוטו ${provider.displayName}`);

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
		// שליפת ה-provider והגדרות
		const currentProvider = contentRegistry.get(settings.contentProviderId);
		const providerSettings = settings.getCurrentProviderSettings();
		
		// שליפת רשימת ה-IDs של הפריטים שנבחרו
		let selectedItemIds: string[] = [];
		if (settings.contentProviderId === 'letters') {
			selectedItemIds = (providerSettings as any).selectedLetters || [];
		} else if (settings.contentProviderId === 'shapes') {
			selectedItemIds = (providerSettings as any).selectedShapes || [];
		}
		
		const newCards = generateCards({
			pairCount: settings.pairCount,
			provider: currentProvider,
			selectedItemIds,
			settings: providerSettings
		});
		
		cards = newCards;
		selectedCards = [];
		matches = 0;
		isLocked = false;
		won = false;
		showRewardButton = false;
		isRewardPending = false;
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

			// השתמש בפונקציית ההשוואה מה-provider
			const currentProvider = contentRegistry.get(settings.contentProviderId);
			if (contentMatches(firstCard, secondCard, currentProvider)) {
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
		if (isRewardPending) return; // מניעת לחיצות כפולות
		isRewardPending = true;
		boosterService.triggerReward();
		winsCount = 0;
		showRewardButton = false;
		
		// לאחר קבלת הפרס, האם להמשיך סבב?
		// כרגע נשאיר את המשתמש במסך הניצחון ללא טיימר, הוא יצטרך ללחוץ "משחק חדש" או "סבב הבא"
		// או שנתחיל טיימר? בדרך כלל חוזרים מהבוסטר וצריך ללחוץ ידנית.
		// נוסיף כפתור "המשך" שמופיע אחרי הפרס
	}
</script>

<div class="game-page">
	{#if won}
		<Confetti />
	{/if}

	<!-- Header Bar -->
	<header class="header">
		<button onclick={() => startNewGame(1)} class="title-button">
			<h1 class="title">{gameTitle}</h1>
		</button>

		<div class="header-stats">
			<div class="stat-badge pairs">
				<span class="stat-label">זוגות:</span>
				<span class="stat-value">{matches}/{settings.pairCount}</span>
			</div>

			{#if settings.loopMode === 'finite' && settings.totalRounds > 1}
				<div class="stat-badge rounds">
					<span class="stat-label">סבב:</span>
					<span class="stat-value">{currentRound}/{settings.totalRounds}</span>
				</div>
			{/if}

			{#if settings.loopMode === 'infinite'}
				<div class="stat-badge rounds">
					<span class="stat-label">סבב:</span>
					<span class="stat-value">{currentRound}</span>
				</div>
			{/if}

			<AdminGate onUnlock={() => goto('/settings')}>
				<button class="settings-button" title="הגדרות">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="icon"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				</button>
			</AdminGate>
		</div>
	</header>

	<!-- Main Game Area -->
	<main class="game-container">
		<Board {cards} onCardClick={handleCardClick} {isLocked} />
	</main>

	{#if won}
		<div class="modal-overlay" transition:fade>
			<div class="modal-content" transition:scale>
				<img src={winnerLogo} alt="Winner" class="winner-logo" />
				<h2 class="winner-title">כל הכבוד!</h2>
				<p class="winner-text">מצאת את כל הזוגות!</p>

				{#if showRewardButton}
					<!-- כפתור פרס גדול -->
					<button
						onclick={handleManualRewardClick}
						disabled={isRewardPending}
						class="reward-button"
						class:disabled={isRewardPending}
					>
						<span>🎁</span>
						<span>קבל הפתעה!</span>
					</button>
					<div class="skip-wrapper">
						<button onclick={() => startNewGame(currentRound + 1)} class="skip-button">
							דלג והמשך לסבב הבא
						</button>
					</div>
				{:else if nextRoundTimer !== null}
					<div class="timer-section">
						<p class="timer-label">הסבב הבא מתחיל בעוד:</p>
						<div class="timer-value">{nextRoundTimer}</div>
						<button onclick={() => (nextRoundTimer = 1)} class="timer-skip">
							דלג והתחל מיד
						</button>
					</div>
				{:else}
					<button onclick={() => startNewGame(1)} class="play-again-button">
						שחק שוב
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	@reference "tailwindcss";

	/* Page Container */
	.game-page {
		/* Layout */
		@apply flex flex-col h-screen;
		@apply overflow-hidden;

		/* Visual */
		@apply bg-gradient-to-br from-indigo-100 to-purple-100;
	}

	/* Header */
	.header {
		/* Layout */
		@apply flex justify-between items-center;
		@apply shrink-0 z-10;

		/* Spacing */
		@apply p-4;

		/* Visual */
		@apply bg-white shadow-md;
	}

	.title-button {
		/* Spacing */
		@apply px-4 py-2;

		/* Visual */
		@apply bg-indigo-50 rounded-lg;
		@apply border border-indigo-100;

		/* Interactive */
		@apply cursor-pointer;
	}

	.title {
		/* Visual */
		@apply text-2xl font-bold text-indigo-800 font-sans;
	}

	.header-stats {
		/* Layout */
		@apply flex items-center;

		/* Spacing */
		@apply gap-4;
	}

	.stat-badge {
		/* Spacing */
		@apply px-4 py-2;

		/* Visual */
		@apply rounded-lg border;
	}

	.stat-badge.pairs {
		/* Visual */
		@apply bg-indigo-50 border-indigo-100;
	}

	.stat-badge.rounds {
		/* Visual */
		@apply bg-purple-50 border-purple-100;
	}

	.stat-label {
		/* Spacing */
		@apply ml-2;

		/* Visual */
		@apply text-gray-600;
	}

	.stat-value {
		/* Visual */
		@apply font-bold text-xl;
	}

	.stat-badge.pairs .stat-value {
		/* Visual */
		@apply text-indigo-600;
	}

	.stat-badge.rounds .stat-value {
		/* Visual */
		@apply text-purple-600;
	}

	.settings-button {
		/* Spacing */
		@apply p-2;

		/* Visual */
		@apply bg-gray-100 text-indigo-600;
		@apply rounded-full shadow-sm;

		/* Interactive */
		@apply hover:bg-gray-200 hover:scale-105;
		@apply active:scale-95 transition-all;
	}

	.icon {
		/* Layout */
		@apply h-6 w-6;
	}

	/* Main Game Area */
	.game-container {
		/* CSS property for container queries */
		container-type: size;
		
		/* Layout */
		@apply flex items-center justify-center;
		@apply flex-1 overflow-hidden;
	}

	/* Modal */
	.modal-overlay {
		/* Layout */
		@apply fixed inset-0 flex items-center justify-center;
		@apply z-50;

		/* Visual */
		@apply bg-black/50;
	}

	.modal-content {
		/* Layout */
		@apply relative z-50;
		@apply max-w-md w-full;
		@apply flex flex-col items-center;

		/* Spacing */
		@apply p-8 mx-4;

		/* Visual */
		@apply bg-white rounded-2xl shadow-2xl;
		@apply text-center;
	}

	.winner-logo {
		/* Layout */
		@apply w-32 h-32 mx-auto;

		/* Spacing */
		@apply mb-4;

		/* Visual */
		@apply object-contain drop-shadow-lg;
	}

	.winner-title {
		/* Spacing */
		@apply mb-4;

		/* Visual */
		@apply text-5xl font-bold text-green-500;
	}

	.winner-text {
		/* Spacing */
		@apply mb-8;

		/* Visual */
		@apply text-2xl text-gray-600;
	}

	/* Reward Button */
	.reward-button {
		/* Layout */
		@apply w-full flex items-center justify-center;

		/* Spacing */
		@apply gap-3 px-8 py-6;

		/* Visual */
		@apply bg-gradient-to-r from-yellow-400 to-orange-500;
		@apply text-white text-2xl font-black;
		@apply rounded-2xl shadow-xl;

		/* Interactive */
		@apply hover:from-yellow-500 hover:to-orange-600;
		@apply hover:scale-105 active:scale-95;
		@apply transition-transform;
		@apply animate-bounce;
	}

	.reward-button.disabled {
		/* Visual */
		@apply opacity-50;

		/* Interactive */
		@apply cursor-not-allowed scale-100;
		@apply animate-none;
	}

	.skip-wrapper {
		/* Spacing */
		@apply mt-4;
	}

	.skip-button {
		/* Visual */
		@apply text-gray-400 text-sm underline;

		/* Interactive */
		@apply hover:text-gray-600;
	}

	/* Timer Section */
	.timer-section {
		/* Spacing */
		@apply mb-6;
	}

	.timer-label {
		/* Spacing */
		@apply mb-2;

		/* Visual */
		@apply text-lg text-indigo-600 font-bold;
	}

	.timer-value {
		/* Visual */
		@apply text-4xl font-mono font-bold text-indigo-800;
	}

	.timer-skip {
		/* Spacing */
		@apply mt-4;

		/* Visual */
		@apply text-sm text-gray-500 underline;

		/* Interactive */
		@apply hover:text-indigo-600;
	}

	/* Play Again Button */
	.play-again-button {
		/* Layout */
		@apply w-full;

		/* Spacing */
		@apply px-8 py-4;

		/* Visual */
		@apply bg-green-500 text-white;
		@apply rounded-xl text-xl font-bold;
		@apply shadow-lg;

		/* Interactive */
		@apply hover:bg-green-600 hover:scale-105;
		@apply transition-transform;
	}
</style>
