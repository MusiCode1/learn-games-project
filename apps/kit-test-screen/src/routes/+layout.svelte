<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { BoosterContainer, boosterService } from 'learn-booster-kit';
	import { onMount } from 'svelte';

	let { children } = $props();

	type Theme =
		| 'default'
		| 'kids'
		| 'minimal'
		| 'find-letter'
		| 'wordys'
		| 'slate'
		| 'read-faster'
		| 'portal';
	let theme = $state<Theme>('default');

	onMount(() => {
		boosterService.init().catch((err: unknown) => {
			console.error('Failed to init booster service:', err);
		});
	});

	$effect(() => {
		document.documentElement.dataset.theme = theme;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav class="topnav">
	<div class="links">
		<a href="/">Booster Test</a>
		<a href="/showcase">Showcase</a>
	</div>
	<div class="theme-switch">
		<span>Theme:</span>
		<select bind:value={theme}>
			<option value="default">Default (Trust)</option>
			<option value="kids">Kids</option>
			<option value="minimal">Minimal</option>
			<option value="find-letter">Find Letter</option>
			<option value="wordys">Wordy's</option>
			<option value="slate">Slate Dark</option>
			<option value="read-faster">Read Faster</option>
			<option value="portal">Portal</option>
		</select>
	</div>
</nav>

{@render children()}
<BoosterContainer />

<style>
	.topnav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--theme-surface-elevated, #fff);
		border-bottom: 1px solid var(--theme-border-subtle, #e2e8f0);
		font-family: var(--theme-font-body, system-ui, sans-serif);
	}
	.links {
		display: flex;
		gap: 1rem;
	}
	.links a {
		color: var(--theme-brand-primary, #1e40af);
		text-decoration: none;
		font-weight: 600;
	}
	.theme-switch {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.theme-switch select {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: 1px solid var(--theme-border-subtle, #e2e8f0);
	}
</style>
