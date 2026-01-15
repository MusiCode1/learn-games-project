<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { BoosterContainer, boosterService } from 'learn-booster-kit';
	import { settings } from '$lib/stores/settings.svelte';
	import { onMount } from 'svelte';
	// ייבוא providers - מבצע רישום אוטומטי
	import '$lib/content';

	let { children } = $props();

	onMount(() => {
		if (settings.boosterEnabled) {
			boosterService.init();
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}

<BoosterContainer />
