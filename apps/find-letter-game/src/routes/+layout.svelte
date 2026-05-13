<script lang="ts">
	import './app.css';
	import { onMount } from 'svelte';
	import { language } from '$lib/services/language';
	import { settings } from '$lib/stores/settings.svelte';
	import { boosterService, BoosterContainer } from 'learn-booster-kit';

	let { children } = $props();

	onMount(() => {
		// אתחול שירות החיזוקים — טוען config מהשרת ומכין את התשתית
		if (settings.boosterEnabled) {
			boosterService.init().catch((err) => console.error('[booster] init failed:', err));
		}
	});
</script>

<svelte:head>
	<title>{language.pageTitle}</title>
</svelte:head>

<div
	class="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50"
>
	{@render children()}
</div>

<!-- Container לחיזוקים — מציג סרטונים/אנימציות מעל המסך כשצריך -->
<div class="relative z-[9999] pointer-events-none">
	<BoosterContainer />
</div>
