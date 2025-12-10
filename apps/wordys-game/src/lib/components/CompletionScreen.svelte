<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { playSuccess } from '$lib/utils/sound';

	let { onReplay, onExit, onReward, rewardEnabled } = $props<{
		onReplay: () => void;
		onExit: () => void;
		onReward?: () => void;
		rewardEnabled?: boolean;
	}>();

	onMount(() => {
		playSuccess();
	});
</script>

<div
	class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-6 text-center"
	in:fade
>
	<div
		class="flex flex-col items-center gap-8 max-w-lg w-full"
		in:scale={{ duration: 500, start: 0.8 }}
	>
		<!-- Animated Trophy/Star -->
		<div class="text-9xl animate-bounce-slow filter drop-shadow-xl">🏆</div>

		<h2 class="text-5xl md:text-7xl font-black text-orange-500 drop-shadow-sm">כל הכבוד!</h2>

		<p class="text-2xl text-slate-600 font-medium">סיימת את כל הקלפים בקופסה זו.</p>

		<div class="flex flex-col sm:flex-row gap-4 w-full mt-8">
			<button
				onclick={onReplay}
				class="flex-1 py-4 px-6 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-green-200 transition-all transform hover:-translate-y-1"
			>
				🔄 שחק שוב
			</button>

			<button
				onclick={onExit}
				class="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-1"
			>
				➡️ חזור למדף
			</button>
		</div>
		{#if rewardEnabled && onReward}
			<div class="w-full mt-2">
				<button
					onclick={onReward}
					class="w-full py-4 px-6 bg-purple-500 hover:bg-purple-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-purple-200 transition-all transform hover:-translate-y-1 animate-pulse"
				>
					🎁 המשך להפתעה
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.animate-bounce-slow {
		animation: bounce 3s infinite;
	}
	@keyframes bounce {
		0%,
		100% {
			transform: translateY(-10%);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
		}
		50% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
		}
	}
</style>
