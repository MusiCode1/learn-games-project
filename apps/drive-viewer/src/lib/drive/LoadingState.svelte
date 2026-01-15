<div class="state" role="status" aria-live="polite">
	<div class="pulse" aria-hidden="true"></div>
	<p>טוען את הספרייה...</p>
</div>

<style>
	.state {
		display: grid;
		place-items: center;
		gap: 16px;
		padding: 48px 32px;
		text-align: center;
		color: var(--ink-muted);
	}

	.pulse {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: radial-gradient(circle at 30% 30%, #fff, #f0d7bb 60%, #e7c3a3 100%);
		box-shadow: inset 0 0 0 6px rgba(210, 105, 60, 0.1);
		animation: pulse 1.4s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(0.98);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.05);
			opacity: 1;
		}
	}
</style>
