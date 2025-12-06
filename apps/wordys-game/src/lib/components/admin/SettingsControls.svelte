<script lang="ts">
	import { settings } from '$lib/stores/settings.svelte';
	import { page } from '$app/stores';
</script>

<div class="space-y-6" dir="rtl">
	<!-- Version Display -->
	<!-- <div class="text-center text-xs text-slate-400 font-mono">
		v{$page.data.version}
	</div> -->

	<!-- Setting: Show Word -->
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<div class="font-bold text-slate-800">הצג מילה</div>
			<div class="text-sm text-slate-500">האם להציג את המילה המלאה על המסך</div>
		</div>
		<button
			dir="ltr"
			aria-label="הצג מילה"
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
			aria-label="הדגשת אות נוכחית"
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
			aria-label="חיווי שגיאה"
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

	<!-- Setting: Card Repetitions -->
	<div class="flex items-center justify-between border-t pt-4 mt-4">
		<div class="space-y-1">
			<div class="font-bold text-slate-800">חזרות לכרטיס</div>
			<div class="text-sm text-slate-500">כמה פעמים כל כרטיס יופיע במשחק</div>
		</div>
		<select
			bind:value={settings.cardRepetitions}
			class="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
		>
			<option value={1}>1</option>
			<option value={2}>2</option>
			<option value={3}>3</option>
			<option value={5}>5</option>
			<option value={10}>10</option>
			<option value={0}>♾️ ללא הגבלה</option>
		</select>
	</div>

	<!-- Setting: Virtual Keyboard Mode -->
	<div class="flex items-center justify-between border-t pt-4 mt-4">
		<div class="space-y-1">
			<div class="font-bold text-slate-800">מקלדת וירטואלית</div>
			<div class="text-sm text-slate-500">הצג מקלדת על המסך</div>
		</div>
		<select
			bind:value={settings.virtualKeyboardMode}
			class="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
		>
			<option value="none">ללא</option>
			<option value="full">מלאה</option>
			<option value="focused">ממוקדת (רק אותיות רלוונטיות)</option>
		</select>
	</div>
</div>
