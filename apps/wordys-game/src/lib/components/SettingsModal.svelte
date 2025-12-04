<script lang="ts">
	import { settings } from '$lib/stores/settings.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
		>
			<!-- Header -->
			<div class="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
				<h2 class="text-xl font-bold text-slate-800">הגדרות משחק</h2>
				<button
					onclick={onClose}
					class="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Body -->
			<div class="p-6 space-y-6" dir="rtl">
				<!-- Setting: Show Word -->
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<div class="font-bold text-slate-800">הצג מילה</div>
						<div class="text-sm text-slate-500">האם להציג את המילה המלאה על המסך</div>
					</div>
					<button
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						class:bg-blue-600={settings.showWord}
						class:bg-slate-200={!settings.showWord}
						onclick={() => (settings.showWord = !settings.showWord)}
					>
						<span
							class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
							class:translate-x-1={!settings.showWord}
							class:translate-x-6={settings.showWord}
						/>
					</button>
				</div>

				<!-- Setting: Highlight Current Character -->
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<div class="font-bold text-slate-800">הדגשת אות נוכחית</div>
						<div class="text-sm text-slate-500">סימון האות שצריך להקליד כעת</div>
					</div>
					<button
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						class:bg-blue-600={settings.highlightCurrentChar}
						class:bg-slate-200={!settings.highlightCurrentChar}
						onclick={() => (settings.highlightCurrentChar = !settings.highlightCurrentChar)}
					>
						<span
							class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
							class:translate-x-1={!settings.highlightCurrentChar}
							class:translate-x-6={settings.highlightCurrentChar}
						/>
					</button>
				</div>

				<!-- Setting: Error Feedback -->
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<div class="font-bold text-slate-800">חיווי שגיאה</div>
						<div class="text-sm text-slate-500">רעידה וצבע אדום בעת טעות</div>
					</div>
					<button
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						class:bg-blue-600={settings.errorFeedback}
						class:bg-slate-200={!settings.errorFeedback}
						onclick={() => (settings.errorFeedback = !settings.errorFeedback)}
					>
						<span
							class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
							class:translate-x-1={!settings.errorFeedback}
							class:translate-x-6={settings.errorFeedback}
						/>
					</button>
				</div>
			</div>

			<!-- Footer -->
			<div class="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
				<button
					onclick={onClose}
					class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-bold"
				>
					סגור
				</button>
			</div>
		</div>
	</div>
{/if}
