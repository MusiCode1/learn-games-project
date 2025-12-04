<script lang="ts">
	import { settings } from '$lib/stores/settings.svelte';
	import { version } from '../../../../package.json';
</script>

<div class="space-y-6" dir="rtl">
	<!-- Version Display -->
	<div class="text-center text-xs text-slate-400 font-mono">
		v{version}
	</div>
	<!-- Setting: Show Word -->
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<div class="font-bold text-slate-800">הצג מילה</div>
			<div class="text-sm text-slate-500">האם להציג את המילה המלאה על המסך</div>
		</div>
		<button
			dir="ltr"
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			class:bg-blue-600={settings.showWord}
			class:bg-slate-200={!settings.showWord}
			onclick={() => (settings.showWord = !settings.showWord)}
		>
			<span
				class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm"
				class:left-1={!settings.showWord}
				class:left-6={settings.showWord}
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
			dir="ltr"
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			class:bg-blue-600={settings.highlightCurrentChar}
			class:bg-slate-200={!settings.highlightCurrentChar}
			onclick={() => (settings.highlightCurrentChar = !settings.highlightCurrentChar)}
		>
			<span
				class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm"
				class:left-1={!settings.highlightCurrentChar}
				class:left-6={settings.highlightCurrentChar}
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
			dir="ltr"
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			class:bg-blue-600={settings.errorFeedback}
			class:bg-slate-200={!settings.errorFeedback}
			onclick={() => (settings.errorFeedback = !settings.errorFeedback)}
		>
			<span
				class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm"
				class:left-1={!settings.errorFeedback}
				class:left-6={settings.errorFeedback}
			/>
		</button>
	</div>
</div>
