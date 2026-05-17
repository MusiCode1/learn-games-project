<script lang="ts">
	import {
		Button,
		IconButton,
		SegmentedControl,
		ScoreBadge,
		Card,
		CooldownOverlay,
		HeaderBar,
		StartScreen,
		SpeakerIcon,
		RefreshIcon,
		SettingsIcon,
		CheckIcon,
		XIcon,
		useShake,
		usePop
	} from 'learn-booster-kit';

	// --- State for interactive examples ---
	let segmentedValue = $state<'2x3' | '3x3' | '3x4' | '4x4'>('3x3');
	let score = $state(7);
	let cooldownUntil = $state(0);
	const shake = useShake();
	const pop = usePop();

	function startCooldown() {
		cooldownUntil = Date.now() + 3000;
	}
</script>

<main class="showcase">
	<header class="page-header">
		<h1>Component System — Showcase</h1>
		<p>החלף theme בתפריט העליון כדי לראות איך כל קומפוננטה מתאימה.</p>
	</header>

	<!-- Section: Color Tokens -->
	<section>
		<h2>Color Tokens</h2>
		<div class="swatch-grid">
			<div class="swatch" style="background: var(--theme-surface-base)">surface-base</div>
			<div class="swatch" style="background: var(--theme-surface-elevated)">surface-elevated</div>
			<div class="swatch" style="background: var(--theme-surface-sunken)">surface-sunken</div>
			<div class="swatch text-on-brand" style="background: var(--theme-brand-primary)">
				brand-primary
			</div>
			<div class="swatch text-on-brand" style="background: var(--theme-brand-secondary)">
				brand-secondary
			</div>
			<div class="swatch text-on-feedback" style="background: var(--theme-feedback-success)">
				success
			</div>
			<div class="swatch text-on-feedback" style="background: var(--theme-feedback-error)">
				error
			</div>
			<div class="swatch text-on-feedback" style="background: var(--theme-feedback-warning)">
				warning
			</div>
		</div>
	</section>

	<!-- Section: Button -->
	<section>
		<h2>Button</h2>
		<div class="row">
			<Button variant="primary">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="danger">Danger</Button>
			<Button variant="primary" disabled>Disabled</Button>
		</div>
		<h3>Sizes</h3>
		<div class="row align-end">
			<Button size="sm">Small</Button>
			<Button size="md">Medium</Button>
			<Button size="lg">Large</Button>
		</div>
		<h3>Color secondary</h3>
		<div class="row">
			<Button color="secondary">Primary + Secondary</Button>
			<Button variant="ghost" color="secondary">Ghost + Secondary</Button>
			<IconButton label="השמע שוב" variant="solid" color="secondary" showLabel onclick={() => {}}>
				{#snippet icon()}<SpeakerIcon />{/snippet}
			</IconButton>
		</div>
	</section>

	<!-- Section: IconButton -->
	<section>
		<h2>IconButton</h2>
		<div class="row">
			<IconButton label="השמע שוב" onclick={() => alert('speak')}>
				{#snippet icon()}<SpeakerIcon />{/snippet}
			</IconButton>
			<IconButton label="רענן" variant="solid" onclick={() => alert('refresh')}>
				{#snippet icon()}<RefreshIcon />{/snippet}
			</IconButton>
			<IconButton label="הגדרות" variant="ghost" onclick={() => alert('settings')}>
				{#snippet icon()}<SettingsIcon />{/snippet}
			</IconButton>
			<IconButton label="השמע שוב" showLabel onclick={() => alert('speak')}>
				{#snippet icon()}<SpeakerIcon />{/snippet}
			</IconButton>
		</div>
	</section>

	<!-- Section: SegmentedControl -->
	<section>
		<h2>SegmentedControl</h2>
		<SegmentedControl
			options={[
				{ value: '2x3', label: '2x3' },
				{ value: '3x3', label: '3x3' },
				{ value: '3x4', label: '3x4' },
				{ value: '4x4', label: '4x4' }
			]}
			bind:value={segmentedValue}
			aria-label="גודל לוח"
		/>
		<p>נבחר: <strong>{segmentedValue}</strong></p>
	</section>

	<!-- Section: ScoreBadge -->
	<section>
		<h2>ScoreBadge</h2>
		<div class="row">
			<ScoreBadge label="ניקוד" value={score} />
			<ScoreBadge label="הצלחות" value={42} variant="success">
				{#snippet icon()}<CheckIcon size={16} />{/snippet}
			</ScoreBadge>
			<ScoreBadge label="טעויות" value={3} variant="warning">
				{#snippet icon()}<XIcon size={16} />{/snippet}
			</ScoreBadge>
			<Button size="sm" onclick={() => score++}>+1</Button>
		</div>
	</section>

	<!-- Section: Card -->
	<section>
		<h2>Card</h2>
		<div class="row">
			<Card variant="elevated">
				<p>Elevated card</p>
			</Card>
			<Card variant="flat">
				<p>Flat card</p>
			</Card>
			<Card variant="outlined">
				<p>Outlined card</p>
			</Card>
			<Card interactive onclick={() => alert('clicked!')}>
				<p>Interactive (click me)</p>
			</Card>
			<Card variant="framed">
				<p>Framed (אם theme=find-letter — מסגרת כתומה)</p>
			</Card>
			<Card variant="ribbon">
				<p>Ribbon (secondary color)</p>
			</Card>
			<Card variant="ribbon" ribbonColor="#3b82f6">
				<p>Ribbon (custom blue)</p>
			</Card>
		</div>
	</section>

	<!-- Section: Animations -->
	<section>
		<h2>Animations</h2>
		<div class="row">
			<div class:lbk-anim-shake={shake.active} class="anim-box">Shake target</div>
			<Button onclick={() => shake.trigger()}>Trigger shake</Button>
		</div>
		<div class="row">
			<div class:lbk-anim-pop={pop.active} class="anim-box">Pop target</div>
			<Button onclick={() => pop.trigger()}>Trigger pop</Button>
		</div>
	</section>

	<!-- Section: CooldownOverlay -->
	<section>
		<h2>CooldownOverlay</h2>
		<Button onclick={startCooldown}>Start 3s cooldown</Button>
		<CooldownOverlay
			untilTs={cooldownUntil}
			durationMs={3000}
			message="נסה שוב..."
			onComplete={() => (cooldownUntil = 0)}
		/>
	</section>

	<!-- Section: HeaderBar -->
	<section>
		<h2>HeaderBar</h2>
		<HeaderBar>
			{#snippet leftActions()}
				<IconButton label="השמע שוב" showLabel onclick={() => {}}>
					{#snippet icon()}<SpeakerIcon />{/snippet}
				</IconButton>
				<Button variant="secondary" size="sm">משחק חדש</Button>
			{/snippet}
			{#snippet centerInfo()}
				<h3 style="margin: 0">משחק לדוגמה</h3>
			{/snippet}
			{#snippet rightActions()}
				<ScoreBadge label="ניקוד" value={score} />
				<IconButton label="הגדרות" variant="ghost" onclick={() => {}}>
					{#snippet icon()}<SettingsIcon />{/snippet}
				</IconButton>
			{/snippet}
		</HeaderBar>
	</section>

	<!-- Section: StartScreen (preview) -->
	<section>
		<h2>StartScreen (preview)</h2>
		<div class="preview">
			<StartScreen
				title="ברוכים הבאים"
				subtitle="משחק לדוגמה להוכחת המנגנון"
				primaryAction={{ label: 'התחל לשחק', onclick: () => alert('start!') }}
			/>
		</div>
	</section>
</main>

<style>
	.showcase {
		min-height: 100vh;
		background: var(--theme-surface-base);
		color: var(--theme-text-primary);
		font-family: var(--theme-font-body);
		padding: 2rem;
		direction: rtl;
	}
	.page-header {
		margin-bottom: 2rem;
	}
	.page-header h1 {
		font-family: var(--theme-font-display);
		font-size: var(--theme-font-size-xl);
		margin: 0;
	}
	section {
		background: var(--theme-surface-elevated);
		border: 1px solid var(--theme-border-subtle);
		border-radius: var(--theme-radius-lg);
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: var(--theme-shadow-card);
	}
	section h2 {
		margin: 0 0 1rem;
		font-family: var(--theme-font-display);
		font-size: var(--theme-font-size-lg);
	}
	section h3 {
		margin: 0.75rem 0 0.5rem;
		font-size: var(--theme-font-size-md);
	}
	.row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.row.align-end {
		align-items: flex-end;
	}
	.swatch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
	}
	.swatch {
		padding: 1.25rem 0.75rem;
		border-radius: var(--theme-radius-md);
		border: 1px solid var(--theme-border-subtle);
		font-size: 0.85rem;
		text-align: center;
		font-family: monospace;
	}
	.text-on-brand {
		color: var(--theme-text-on-brand);
	}
	.text-on-feedback {
		color: var(--theme-text-on-feedback);
	}
	.anim-box {
		padding: 1rem 1.5rem;
		background: var(--theme-surface-sunken);
		border-radius: var(--theme-radius-md);
	}
	.preview {
		height: 400px;
		border: 2px dashed var(--theme-border-subtle);
		border-radius: var(--theme-radius-md);
		overflow: hidden;
		position: relative;
	}
</style>
