<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../primitives/Button.svelte';

	interface PrimaryAction {
		label: string;
		onclick: () => void;
	}

	interface Props {
		title: string;
		subtitle?: string;
		primaryAction: PrimaryAction;
		secondaryActions?: Snippet;
		heroIllustration?: Snippet;
	}

	let { title, subtitle, primaryAction, secondaryActions, heroIllustration }: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center min-h-screen gap-8 px-6 text-center bg-surface-base"
>
	{#if heroIllustration}
		<div class="mb-2">
			{@render heroIllustration()}
		</div>
	{/if}

	<div class="flex flex-col items-center gap-4">
		<h1
			class="font-display font-bold text-text-primary m-0"
			style="font-size: var(--theme-font-size-xl)"
		>
			{title}
		</h1>
		{#if subtitle}
			<p class="text-text-secondary m-0" style="font-size: var(--theme-font-size-lg)">
				{subtitle}
			</p>
		{/if}
	</div>

	<div class="flex flex-col items-center gap-4 w-full max-w-xs">
		<Button variant="primary" size="lg" onclick={primaryAction.onclick} class="w-full">
			{primaryAction.label}
		</Button>
		{#if secondaryActions}
			{@render secondaryActions()}
		{/if}
	</div>
</div>
