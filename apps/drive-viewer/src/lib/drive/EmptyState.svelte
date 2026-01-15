<script lang="ts">
	let { title = 'אין כאן פריטים', description = 'אפשר לחזור לתיקייה הקודמת.' } = $props();
</script>

<div class="state" role="status">
	<div class="badge" aria-hidden="true">0</div>
	<h2>{title}</h2>
	<p>{description}</p>
</div>

<style>
	.state {
		display: grid;
		place-items: center;
		text-align: center;
		padding: 48px 32px;
		color: var(--ink);
		gap: 12px;
	}

	.badge {
		width: 120px;
		height: 120px;
		border-radius: 30%;
		background: #fff3e2;
		display: grid;
		place-items: center;
		font-size: 2.4rem;
		font-weight: 700;
		color: var(--accent);
		box-shadow: var(--shadow);
	}

	h2 {
		margin: 0;
		font-size: 1.6rem;
	}

	p {
		margin: 0;
		color: var(--ink-muted);
		font-size: 1rem;
	}
</style>
