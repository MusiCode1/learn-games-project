<script lang="ts">
	import {
		GameShell,
		HeaderBar,
		Card,
		Button,
		IconButton,
		SegmentedControl,
		ScoreBadge,
		CooldownOverlay,
		SpeakerIcon,
		SettingsIcon,
		CheckIcon,
		XIcon
	} from 'learn-booster-kit';

	const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל'];
	type GridSize = '2x3' | '3x3' | '3x4';

	let score = $state(0);
	let wrongCount = $state(0);
	let targetLetter = $state<string>('א');
	let gridSize = $state<GridSize>('3x3');
	let grid = $state<string[]>([]);
	let cooldownUntil = $state(0);
	let shakeIndex = $state<number | null>(null);
	let popIndex = $state<number | null>(null);

	function gridCount(g: GridSize): number {
		if (g === '2x3') return 6;
		if (g === '3x4') return 12;
		return 9; // 3x3
	}

	function generateRound() {
		const count = gridCount(gridSize);
		const target = LETTERS[Math.floor(Math.random() * LETTERS.length)];
		targetLetter = target;

		const distractors: string[] = [];
		const pool = LETTERS.filter((l) => l !== target);
		while (distractors.length < count - 1) {
			const pick = pool[Math.floor(Math.random() * pool.length)];
			if (!distractors.includes(pick)) distractors.push(pick);
		}

		const newGrid = [...distractors, target];
		// Fisher-Yates shuffle
		for (let i = newGrid.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newGrid[i], newGrid[j]] = [newGrid[j], newGrid[i]];
		}

		grid = newGrid;
		shakeIndex = null;
		popIndex = null;
	}

	function onCardClick(letter: string, index: number) {
		if (Date.now() < cooldownUntil) return;
		if (letter === targetLetter) {
			popIndex = index;
			setTimeout(() => {
				score++;
				generateRound();
				popIndex = null;
			}, 600);
		} else {
			shakeIndex = index;
			wrongCount++;
			cooldownUntil = Date.now() + 2500;
			setTimeout(() => {
				shakeIndex = null;
			}, 500);
		}
	}

	function resetGame() {
		score = 0;
		wrongCount = 0;
		cooldownUntil = 0;
		generateRound();
	}

	// Init on mount + regenerate on gridSize change (gridCount(gridSize) tracks it)
	$effect(() => {
		generateRound();
	});
</script>

<GameShell>
	{#snippet header()}
		<HeaderBar>
			{#snippet leftActions()}
				<IconButton
					label="השמע שוב"
					showLabel
					variant="solid"
					onclick={() => alert(`מצא את האות ${targetLetter}`)}
				>
					{#snippet icon()}<SpeakerIcon />{/snippet}
				</IconButton>
				<Button variant="secondary" size="sm" onclick={resetGame}>משחק חדש</Button>
			{/snippet}
			{#snippet centerInfo()}
				<h2 class="title">מצא את האות {targetLetter}</h2>
			{/snippet}
			{#snippet rightActions()}
				<SegmentedControl
					options={[
						{ value: '2x3', label: '2×3' },
						{ value: '3x3', label: '3×3' },
						{ value: '3x4', label: '3×4' }
					]}
					bind:value={gridSize}
					aria-label="גודל לוח"
				/>
				<ScoreBadge label="ניקוד" value={score} variant="success">
					{#snippet icon()}<CheckIcon size={16} />{/snippet}
				</ScoreBadge>
				<ScoreBadge label="טעויות" value={wrongCount} variant="warning">
					{#snippet icon()}<XIcon size={16} />{/snippet}
				</ScoreBadge>
				<IconButton label="הגדרות" variant="ghost" onclick={() => alert('settings')}>
					{#snippet icon()}<SettingsIcon />{/snippet}
				</IconButton>
			{/snippet}
		</HeaderBar>
	{/snippet}

	<div class="game-area">
		<div class="prompt">
			<p class="prompt-label">מצא את האות</p>
			<div class="big-letter">{targetLetter}</div>
		</div>

		<div class="grid" data-grid={gridSize}>
			{#each grid as letter, i (i)}
				<Card interactive onclick={() => onCardClick(letter, i)}>
					<div
						class="letter-card"
						class:lbk-anim-shake={shakeIndex === i}
						class:lbk-anim-pop={popIndex === i}
					>
						{letter}
					</div>
				</Card>
			{/each}
		</div>
	</div>

	<CooldownOverlay untilTs={cooldownUntil} durationMs={2500} message="נסה שוב..." />
</GameShell>

<style>
	.title {
		margin: 0;
		font-family: var(--theme-font-display);
		font-size: var(--theme-font-size-lg);
		color: var(--theme-text-primary);
	}
	.game-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		padding: 2rem;
		height: 100%;
	}
	.prompt {
		text-align: center;
	}
	.prompt-label {
		font-size: var(--theme-font-size-md);
		color: var(--theme-text-secondary);
		margin: 0 0 0.5rem;
	}
	.big-letter {
		font-family: var(--theme-font-display);
		font-size: 5rem;
		font-weight: var(--theme-font-weight-bold);
		color: var(--theme-brand-primary);
		line-height: 1;
	}
	.grid {
		display: grid;
		gap: 1rem;
	}
	.grid[data-grid='2x3'] {
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
	}
	.grid[data-grid='3x3'] {
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}
	.grid[data-grid='3x4'] {
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}
	.letter-card {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--theme-font-display);
		font-size: 4rem;
		font-weight: var(--theme-font-weight-bold);
		color: var(--theme-text-primary);
		min-width: var(--theme-touch-min);
		min-height: var(--theme-touch-min);
	}
</style>
