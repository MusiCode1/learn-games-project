<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<section class="home">
	<div class="home-card">
		<p class="eyebrow">צפייה פשוטה ובטוחה</p>
		<h1>ספריית הסרטים שלי</h1>
		<p class="subtitle">כניסה מהירה לגריד סרטונים גדול וברור, מותאם ללמידה.</p>
		<button class="start" type="button" onclick={() => goto('/drive')}>
			כניסה לספרייה
		</button>
	</div>
</section>

<style type="text/postcss">
	.home {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 24px;
	}

	.home-card {
		max-width: 520px;
		width: min(90vw, 520px);
		background: var(--panel);
		border-radius: 28px;
		box-shadow: var(--shadow);
		padding: 40px 36px;
		text-align: center;
		border: 2px solid rgba(210, 105, 60, 0.12);
	}

	.eyebrow {
		margin: 0 0 10px;
		color: var(--ink-muted);
		font-size: 0.95rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0 0 12px;
		font-size: clamp(2rem, 4vw, 2.6rem);
	}

	.subtitle {
		margin: 0 0 28px;
		color: var(--ink-muted);
		font-size: 1.05rem;
		line-height: 1.6;
	}

	.start {
		width: 100%;
		padding: 18px 28px;
		font-size: 1.2rem;
		border: none;
		border-radius: 18px;
		background: linear-gradient(135deg, var(--accent), var(--accent-strong));
		color: #fff4ea;
		box-shadow: 0 12px 24px rgba(210, 105, 60, 0.3);
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.start:focus-visible {
		outline: 3px solid var(--focus);
		outline-offset: 4px;
	}

	.start:hover {
		transform: translateY(-2px);
		box-shadow: 0 16px 28px rgba(210, 105, 60, 0.35);
	}
</style>
