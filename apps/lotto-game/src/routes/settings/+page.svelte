<script lang="ts">
	import SettingsControls from './_components/SettingsControls.svelte';
	import { goto } from '$app/navigation';
</script>

<div class="settings-page" dir="rtl">
	<div class="settings-inner">
		<!-- Header -->
		<div class="header">
			<h1 class="title">הגדרות משחק</h1>
			<button onclick={() => goto('/')} class="back-button">
				חזרה למשחק
			</button>
		</div>

		<SettingsControls />
	</div>
</div>

<style type="text/postcss">
	@reference "tailwindcss";

	.settings-page {
		/* Layout */
		@apply w-full flex-1 h-full;
		@apply overflow-y-auto;
		@apply font-sans;

		/* Spacing */
		@apply p-4 md:p-8;

		/* Visual */
		@apply bg-slate-50;
	}

	.settings-inner {
		/* Layout */
		@apply max-w-2xl mx-auto;
		@apply flex flex-col;

		/* Spacing */
		@apply gap-6;
	}

	.header {
		/* Layout */
		@apply flex items-center justify-between;
		@apply sticky top-0;
		@apply z-10;

		/* Spacing */
		@apply py-4;

		/* Visual */
		@apply bg-slate-50/90 backdrop-blur-sm;
	}

	.title {
		/* Visual */
		@apply text-3xl font-bold text-slate-800;
	}

	.back-button {
		/* Spacing */
		@apply px-5 py-2.5;

		/* Visual */
		@apply bg-green-600 text-white font-bold rounded-xl;
		@apply shadow-lg;

		/* Interactive */
		@apply hover:bg-green-700 hover:shadow-green-500/20;
		@apply transition-colors active:scale-95;
	}
</style>
