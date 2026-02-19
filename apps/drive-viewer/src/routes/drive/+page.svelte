<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import BackButtonXL from '$lib/drive/BackButtonXL.svelte';
	import DriveItemCard from '$lib/drive/DriveItemCard.svelte';
	import LoadingState from '$lib/drive/LoadingState.svelte';
	import EmptyState from '$lib/drive/EmptyState.svelte';
	import ErrorState from '$lib/drive/ErrorState.svelte';
	import type { DriveItem } from '$lib/drive/types';

	let { data } = $props();

	let selectedId = $state<string | null>(null);
	let scrollHost: HTMLDivElement | null = null;

	let pathSegments = $derived(data.path ? data.path.split(',').filter(Boolean) : []);
	let activationMode = $derived(data.single ? 'single' : 'double');

	afterNavigate(() => {
		restoreScroll();
	});

	function persistScroll() {
		if (!scrollHost || typeof sessionStorage === 'undefined') return;
		const key = `drive-scroll:${data.path || 'root'}`;
		sessionStorage.setItem(key, String(scrollHost.scrollTop));
	}

	function restoreScroll() {
		if (!scrollHost || typeof sessionStorage === 'undefined') return;
		const key = `drive-scroll:${data.path || 'root'}`;
		const stored = sessionStorage.getItem(key);
		if (stored) {
			scrollHost.scrollTop = Number(stored);
		}
	}

	function captureScrollHost(node: HTMLDivElement) {
		scrollHost = node;
		restoreScroll();
		return {
			destroy() {
				if (scrollHost === node) scrollHost = null;
			}
		};
	}

	function goBack() {
		if (pathSegments.length === 0) {
			goto('/');
			return;
		}
		const next = pathSegments.slice(0, -1).join(',');
		const params = new URLSearchParams();
		if (next) params.set('path', next);
		if (data.single) params.set('single', '1');
		goto(params.toString() ? `/drive?${params.toString()}` : '/drive');
	}

	function openFolder(id: string) {
		const next = [...pathSegments, id].join(',');
		const params = new URLSearchParams();
		params.set('path', next);
		if (data.single) params.set('single', '1');
		goto(`/drive?${params.toString()}`);
	}

	function openVideo(item: DriveItem) {
		const params = new URLSearchParams();
		params.set('fileId', item.id);
		params.set('name', item.name);
		if (data.path) params.set('path', data.path);
		if (item.thumbnail_url) params.set('thumb', item.thumbnail_url);
		if (data.single) params.set('single', '1');
		goto(`/drive/player?${params.toString()}`);
	}

	function handleSelect(event: CustomEvent<DriveItem>) {
		selectedId = event.detail.id;
	}

	function handleActivate(event: CustomEvent<DriveItem>) {
		const item = event.detail;
		if (item.kind === 'folder') {
			openFolder(item.id);
		} else {
			openVideo(item);
		}
	}

	function retryLoad() {
		const params = new URLSearchParams();
		if (data.path) params.set('path', data.path);
		if (data.single) params.set('single', '1');
		goto(params.toString() ? `/drive?${params.toString()}` : '/drive');
	}
</script>

<div class="screen">
	<BackButtonXL
		label="חזרה"
		hint={pathSegments.length ? 'לתיקייה הקודמת' : 'למסך הבית'}
		on:click={goBack}
	/>

	<header class="header">
		<div>
			<p class="eyebrow">ספרייה חזותית</p>
			<h1>בחרו סרט או תיקייה</h1>
			<p class="subtitle">
				{activationMode === 'single' ? 'נגיעה אחת פותחת את הפריט.' : 'לחיצה כפולה לפתיחה.'}
			</p>
		</div>
		<div class="status" aria-live="polite">
			{#if selectedId}
				נבחר: {data.items.find((item: DriveItem) => item.id === selectedId)?.name}
			{:else}
				בחרו פריט כדי לשמוע משוב ברור
			{/if}
		</div>
	</header>

	{#if data.errorMessage}
		<ErrorState on:retry={retryLoad} />
	{:else if !data.items}
		<LoadingState />
	{:else if data.items.length === 0}
		<EmptyState description="אין כאן סרטים. אפשר לחזור צעד אחד אחורה." />
	{:else}
		<div class="grid" {@attach captureScrollHost} onscroll={persistScroll}>
			<div class="grid-inner">
				{#each data.items as item, index (item.id)}
					<div class="stagger" style={`--i: ${index}`}>
						<DriveItemCard
							{item}
							selected={selectedId === item.id}
							activationMode={activationMode}
							on:select={handleSelect}
							on:activate={handleActivate}
						/>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style type="text/postcss">
	.screen {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: 110px 32px 24px;
	}

	.header {
		display: flex;
		flex-wrap: wrap;
		gap: 18px;
		align-items: center;
		justify-content: space-between;
		background: var(--panel);
		padding: 22px 26px;
		border-radius: 24px;
		box-shadow: var(--shadow);
	}

	.eyebrow {
		margin: 0;
		color: var(--ink-muted);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-size: 0.85rem;
	}

	h1 {
		margin: 6px 0 4px;
		font-size: clamp(1.8rem, 3.2vw, 2.5rem);
	}

	.subtitle {
		margin: 0;
		color: var(--ink-muted);
		font-size: 1rem;
	}

	.status {
		background: #fff4e6;
		padding: 12px 18px;
		border-radius: 16px;
		color: var(--ink-muted);
		font-weight: 600;
		min-width: 220px;
		text-align: right;
	}

	.grid {
		flex: 1;
		overflow: auto;
		border-radius: 28px;
		background: rgba(255, 255, 255, 0.4);
		padding: 24px;
		box-shadow: inset 0 0 0 1px rgba(43, 29, 23, 0.08);
	}

	.grid-inner {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 22px;
		padding-bottom: 24px;
	}

	.stagger {
		animation: card-in 0.35s ease both;
		animation-delay: calc(var(--i) * 60ms);
	}

	@keyframes card-in {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 700px) {
		.screen {
			padding: 96px 18px 18px;
		}

		.header {
			padding: 18px;
		}

		.grid-inner {
			grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stagger {
			animation: none;
		}
	}
</style>
