<script lang="ts">
	interface Props {
		show: boolean;
	}

	let { show }: Props = $props();
</script>

{#if show}
	<div class="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
		<div
			class="bg-green-500 text-white text-6xl font-bold px-12 py-8 rounded-3xl shadow-2xl animate-bounce-in"
		>
			כל הכבוד! 🎉
		</div>
	</div>
{/if}

<style>
	@keyframes bounce-in {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.2);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
	.animate-bounce-in {
		animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}
</style>
