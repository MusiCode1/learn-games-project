<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { BoosterContainer, boosterService } from 'learn-booster-kit';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		boosterService.init().catch((err: unknown) => {
			console.error('Failed to init booster service:', err);
		});
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<BoosterContainer />
