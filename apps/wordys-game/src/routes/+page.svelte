<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let showSplash = $state(true);

	function startApp() {
		goto('/select');
	}
</script>

<div
	class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-br from-orange-400 to-yellow-300 p-6 text-center"
>
	<div
		class="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12"
		in:fly={{ y: 50, duration: 800, delay: 200 }}
	>
		<h1
			class="text-6xl md:text-8xl font-black text-orange-600 mb-4 tracking-tight drop-shadow-sm animate-bounce-slow"
		>
			Wordy's
		</h1>
		<h2 class="text-2xl md:text-3xl font-bold text-slate-700 mb-8">וורדי'ס - תרגול הקלדת מילים</h2>
		<p class="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium">
			מטרת המשחק היא ללמד ילדים עם צרכים מיוחדים להקליד מילים בשיטה גלובלית, שבה התלמיד לומד את
			תבנית המילה כדי לתקשר את צרכיו.
		</p>

		<button
			onclick={startApp}
			class="px-10 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-black rounded-2xl shadow-lg hover:shadow-green-300/50 transform hover:-translate-y-1 transition-all duration-300 animate-pulse-slow"
		>
			התחל
		</button>
	</div>
</div>

<style>
	.animate-bounce-slow {
		animation: bounce 3s infinite;
	}
	.animate-pulse-slow {
		animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	@keyframes bounce {
		0%,
		100% {
			transform: translateY(-5%);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
		}
		50% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
		}
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.9;
		}
	}
</style>
