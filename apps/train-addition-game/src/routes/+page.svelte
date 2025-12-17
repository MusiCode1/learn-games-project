<!--
	דף ראשי - משחק רכבת החיבור עם אנימציות וטרנזישנים
-->
<script lang="ts">
	import '../app.css';
	import HeaderBar from '$lib/components/HeaderBar.svelte';
	import InstructionPanel from '$lib/components/InstructionPanel.svelte';
	import TrainTrackArea from '$lib/components/TrainTrackArea.svelte';
	import DepotArea from '$lib/components/DepotArea.svelte';
	import AnswerPanel from '$lib/components/AnswerPanel.svelte';
	import FeedbackOverlay from '$lib/components/FeedbackOverlay.svelte';
	import AssistOverlay from '$lib/components/AssistOverlay.svelte';
	import { gameState } from '$lib/stores/game-state.svelte';

	// מעבר אוטומטי לסיבוב הבא
	$effect(() => {
		if (gameState.state === 'NEXT_ROUND') {
			gameState.startRound();
		}
	});
</script>

<svelte:head>
	<title>משחק רכבת החיבור</title>
	<meta name="description" content="משחק לתרגול חיבור בשיטת המשך רצף" />
</svelte:head>

<div class="flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500">
	<!-- עננים מונפשים ברקע -->
	<div class="clouds">
		<div class="cloud cloud-1"></div>
		<div class="cloud cloud-2"></div>
		<div class="cloud cloud-3"></div>
	</div>

	<!-- בר עליון -->
	<HeaderBar />

	<!-- תוכן ראשי -->
	<main class="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 p-4">
		{#if gameState.state === 'INIT'}
			<!-- מסך התחלה -->
			<div class="animate-fade-in text-center">
				<h1 class="mb-6 animate-bounce text-5xl font-bold text-white drop-shadow-lg md:text-6xl">
					🚂 רכבת החיבור
				</h1>
				<p class="mb-8 text-xl text-white/90 md:text-2xl">בנה את הרכבת וגלה כמה קרונות יש!</p>

				<button
					onclick={() => gameState.startRound()}
					class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-400 to-green-600 px-14 py-5 text-3xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-400/50 active:scale-95"
				>
					<span class="relative z-10 flex items-center gap-3">
						🎮 התחל לשחק
					</span>
					<!-- אפקט ברק -->
					<span class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full"></span>
				</button>
			</div>
		{:else}
			<!-- משחק פעיל עם טרנזישנים -->
			<div class="animate-slide-up">
				<InstructionPanel />
			</div>

			<div class="animate-slide-up animation-delay-100 w-full max-w-4xl">
				<TrainTrackArea />
			</div>

			{#if gameState.state === 'BUILD_A' || gameState.state === 'ADD_B'}
				<div class="animate-slide-up animation-delay-200">
					<DepotArea />
				</div>
			{/if}

			<div class="animate-slide-up animation-delay-300">
				<AnswerPanel />
			</div>
		{/if}
	</main>

	<!-- Overlays -->
	<FeedbackOverlay />
	<AssistOverlay />
</div>

<style>
	/* אנימציית כניסה */
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.6s ease-out;
	}

	/* אנימציית החלקה מלמטה */
	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slide-up {
		animation: slide-up 0.5s ease-out both;
	}

	.animation-delay-100 {
		animation-delay: 0.1s;
	}
	.animation-delay-200 {
		animation-delay: 0.2s;
	}
	.animation-delay-300 {
		animation-delay: 0.3s;
	}

	/* עננים מונפשים */
	.clouds {
		position: fixed;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.cloud {
		position: absolute;
		background: white;
		border-radius: 100px;
		opacity: 0.6;
	}

	.cloud::before,
	.cloud::after {
		content: '';
		position: absolute;
		background: white;
		border-radius: 50%;
	}

	.cloud-1 {
		width: 120px;
		height: 40px;
		top: 15%;
		animation: float-cloud 25s linear infinite;
	}

	.cloud-1::before {
		width: 50px;
		height: 50px;
		top: -25px;
		left: 15px;
	}

	.cloud-1::after {
		width: 40px;
		height: 40px;
		top: -20px;
		left: 55px;
	}

	.cloud-2 {
		width: 150px;
		height: 50px;
		top: 30%;
		animation: float-cloud 30s linear infinite;
		animation-delay: -10s;
	}

	.cloud-2::before {
		width: 60px;
		height: 60px;
		top: -30px;
		left: 20px;
	}

	.cloud-2::after {
		width: 50px;
		height: 50px;
		top: -25px;
		left: 70px;
	}

	.cloud-3 {
		width: 100px;
		height: 35px;
		top: 8%;
		animation: float-cloud 20s linear infinite;
		animation-delay: -5s;
	}

	.cloud-3::before {
		width: 40px;
		height: 40px;
		top: -20px;
		left: 10px;
	}

	.cloud-3::after {
		width: 35px;
		height: 35px;
		top: -18px;
		left: 45px;
	}

	@keyframes float-cloud {
		from {
			left: -200px;
		}
		to {
			left: 110%;
		}
	}
</style>
