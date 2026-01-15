<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { DriveItem } from './types';

	let { item, selected = false, activationMode = 'double' } = $props();
	const dispatch = createEventDispatcher<{ select: DriveItem; activate: DriveItem }>();
	let previewSlots = $derived(
		item.kind === 'folder' ? Array.from({ length: 4 }, (_, index) => item.preview_urls?.[index] ?? '') : []
	);

	function handleClick() {
		dispatch('select', item);
		if (activationMode === 'single') {
			dispatch('activate', item);
		}
	}

	function handleDblClick() {
		if (activationMode === 'double') {
			dispatch('activate', item);
		}
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			dispatch('activate', item);
		}
	}
</script>

<button
	class:selected={selected}
	class="card"
	data-kind={item.kind}
	type="button"
	aria-pressed={selected}
	onclick={handleClick}
	ondblclick={handleDblClick}
	onkeydown={handleKey}
>
	<div class="thumb">
		{#if item.kind === 'folder'}
			<div class="collage" aria-hidden="true">
				{#each previewSlots as slot, index (index)}
					{#if slot}
						<img src={slot} alt="" loading="lazy" />
					{:else}
						<div class="collage-empty"></div>
					{/if}
				{/each}
			</div>
		{:else}
			<img src={item.thumbnail_url} alt={item.name} loading="lazy" />
		{/if}
		{#if item.kind === 'folder'}
			<span class="badge">תיקייה</span>
		{/if}
	</div>
	<span class="name">{item.name}</span>
</button>

<style>
	.card {
		appearance: none;
		border: none;
		padding: 0;
		background: transparent;
		text-align: right;
		display: grid;
		gap: 10px;
		cursor: pointer;
		color: inherit;
		transition: transform 0.2s ease, filter 0.2s ease;
	}

	.card:hover {
		transform: translateY(-4px);
	}

	.card:focus-visible {
		outline: 3px solid var(--focus);
		outline-offset: 6px;
		border-radius: 22px;
	}

	.thumb {
		background: var(--panel-strong);
		border-radius: 22px;
		box-shadow: 0 12px 24px rgba(43, 29, 23, 0.14);
		position: relative;
		overflow: hidden;
		border: 2px solid rgba(43, 29, 23, 0.06);
		aspect-ratio: 4 / 3;
		display: grid;
		place-items: center;
	}

	.card[data-kind='folder'] .thumb {
		border-color: rgba(56, 90, 111, 0.35);
		box-shadow: 0 14px 26px rgba(56, 90, 111, 0.18);
	}

	.card.selected .thumb {
		box-shadow:
			0 16px 30px rgba(43, 29, 23, 0.22),
			0 0 0 4px rgba(47, 125, 90, 0.4);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.02);
		transition: transform 0.3s ease;
	}

	.card:hover img {
		transform: scale(1.06);
	}

	.collage {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 4px;
		background: #f1e6da;
		padding: 6px;
		box-sizing: border-box;
	}

	.collage img {
		border-radius: 14px;
		transform: none;
	}

	.collage-empty {
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.4);
		border: 1px dashed rgba(56, 90, 111, 0.3);
	}

	.badge {
		position: absolute;
		inset-inline-start: 14px;
		top: 14px;
		background: rgba(56, 90, 111, 0.9);
		color: #f5f8fb;
		padding: 6px 12px;
		border-radius: 999px;
		font-weight: 700;
		font-size: 0.85rem;
	}

	.name {
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--ink);
	}

	@media (max-width: 600px) {
		.name {
			font-size: 1rem;
		}
	}
</style>
