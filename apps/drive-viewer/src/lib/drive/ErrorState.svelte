<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let {
		title = 'לא הצלחנו לטעון את הספרייה',
		description = 'בדקו חיבור לאינטרנט ונסו שוב.'
	} = $props();

	const dispatch = createEventDispatcher<{ retry: void }>();
</script>

<div class="state" role="alert">
	<div class="icon" aria-hidden="true">!</div>
	<h2>{title}</h2>
	<p>{description}</p>
	<button type="button" onclick={() => dispatch('retry')}>נסה שוב</button>
</div>

<style type="text/postcss">
	.state {
		display: grid;
		place-items: center;
		text-align: center;
		padding: 48px 32px;
		color: var(--ink);
		gap: 12px;
	}

	.icon {
		width: 120px;
		height: 120px;
		border-radius: 32px;
		background: #fff1e0;
		display: grid;
		place-items: center;
		font-size: 2.6rem;
		font-weight: 800;
		color: var(--accent-strong);
		box-shadow: var(--shadow);
	}

	h2 {
		margin: 0;
		font-size: 1.6rem;
	}

	p {
		margin: 0;
		color: var(--ink-muted);
	}

	button {
		margin-top: 8px;
		padding: 12px 22px;
		border-radius: 999px;
		border: none;
		background: var(--accent);
		color: #fff5ec;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 10px 20px rgba(210, 105, 60, 0.25);
	}

	button:focus-visible {
		outline: 3px solid var(--focus);
		outline-offset: 4px;
	}
</style>
