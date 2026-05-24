<script lang="ts">
	import { AVAILABLE_GAMES } from '$lib/defaults';
	import { language } from '$lib/services/language';

	const gamesCount = AVAILABLE_GAMES.length;
</script>

<svelte:head>
	<title>{language.pageTitle}</title>
	<meta name="description" content={language.heroDescription} />
</svelte:head>

<main class="min-h-screen overflow-hidden bg-[#f7f2e8] text-slate-950">
	<section class="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
		<div class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_70%_0%,rgba(245,158,11,0.28),transparent_38%),radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.20),transparent_34%)]"></div>

		<header class="relative grid gap-5 rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
			<div class="space-y-4">
				<p class="w-fit rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">
					{language.heroEyebrow}
				</p>
				<div class="max-w-3xl space-y-3">
					<h1 class="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
						{language.heroTitle}
					</h1>
					<p class="text-lg leading-8 text-slate-700 sm:text-xl">
						{language.heroDescription}
					</p>
				</div>
			</div>

			<div class="flex h-32 w-full items-center justify-center rounded-[1.5rem] bg-slate-950 text-white shadow-inner sm:w-48">
				<div class="text-center">
					<div class="text-5xl font-black leading-none">{gamesCount}</div>
					<div class="mt-2 text-sm font-bold text-amber-100">{language.gamesCountLabel}</div>
				</div>
			</div>
		</header>

		<div class="relative mt-6 grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each AVAILABLE_GAMES as game}
				{@const gameText = language.games[game.id]}
				<article class={`game-card game-card--${game.accent}`}>
					<div class="flex items-start justify-between gap-4">
						<div class="game-icon" aria-hidden="true">{game.icon}</div>
						<span class="status-pill">{language.statuses[game.status]}</span>
					</div>

					<div class="mt-7 space-y-3">
						<div class="space-y-2">
							<p class="text-sm font-black tracking-wide text-slate-500">
								{language.categories[game.category]}
							</p>
							<h2 class="text-3xl font-black tracking-tight text-slate-950">{gameText.title}</h2>
						</div>
						<p class="min-h-20 text-lg leading-8 text-slate-700">{gameText.description}</p>
					</div>

					<div class="mt-7 space-y-4">
						<div class="rounded-2xl bg-white/70 p-4 text-sm text-slate-600">
							<div class="font-bold text-slate-500">{language.appPathLabel}</div>
							<code class="mt-1 block text-left text-slate-900" dir="ltr">{game.appPath}</code>
						</div>

						<div class={game.devHref ? 'grid grid-cols-2 gap-2' : ''}>
							<a
								class="open-link"
								href={game.href}
								target="_blank"
								rel="noreferrer"
								aria-label={`${language.openGameLabel}: ${gameText.title}`}
							>
								<span>{language.openGameLabel}</span>
								<span aria-hidden="true">↗</span>
								<span class="sr-only">{language.newTabLabel}</span>
							</a>

							{#if game.devHref}
								<a
									class="open-link open-link--dev"
									href={game.devHref}
									target="_blank"
									rel="noreferrer"
									aria-label={`${language.openDevLabel}: ${gameText.title}`}
								>
									<span>{language.openDevLabel}</span>
									<span aria-hidden="true">↗</span>
									<span class="sr-only">{language.newTabLabel}</span>
								</a>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>

		<footer class="relative py-6 text-center text-sm font-semibold text-slate-500">
			{language.footerNote}
		</footer>
	</section>
</main>

<style>
	.game-card {
		--card-accent: #0f172a;
		position: relative;
		display: flex;
		min-height: 27rem;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.86);
		border-radius: 2rem;
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.74)),
			radial-gradient(circle at 12% 14%, color-mix(in srgb, var(--card-accent) 22%, transparent), transparent 32%);
		padding: 1.5rem;
		box-shadow: 0 24px 70px rgba(15, 23, 42, 0.09);
		transition:
			transform 180ms ease,
			box-shadow 180ms ease,
			border-color 180ms ease;
	}

	.game-card::before {
		content: '';
		position: absolute;
		inset: auto -18% -34% 22%;
		height: 12rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--card-accent) 16%, transparent);
		filter: blur(12px);
	}

	.game-card:hover {
		transform: translateY(-0.25rem);
		border-color: color-mix(in srgb, var(--card-accent) 32%, white);
		box-shadow: 0 30px 90px rgba(15, 23, 42, 0.14);
	}

	.game-card--rose {
		--card-accent: #e11d48;
	}

	.game-card--sky {
		--card-accent: #0284c7;
	}

	.game-card--emerald {
		--card-accent: #059669;
	}

	.game-card--amber {
		--card-accent: #d97706;
	}

	.game-card--violet {
		--card-accent: #7c3aed;
	}

	.game-card--teal {
		--card-accent: #0d9488;
	}

	.game-card--indigo {
		--card-accent: #4f46e5;
	}

	.game-icon {
		display: grid;
		min-width: 4.5rem;
		height: 4.5rem;
		place-items: center;
		border-radius: 1.4rem;
		background: var(--card-accent);
		color: white;
		font-size: 1.35rem;
		font-weight: 950;
		letter-spacing: -0.04em;
		box-shadow: 0 16px 36px color-mix(in srgb, var(--card-accent) 28%, transparent);
	}

	.status-pill {
		border-radius: 999px;
		background: color-mix(in srgb, var(--card-accent) 10%, white);
		padding: 0.55rem 0.85rem;
		color: color-mix(in srgb, var(--card-accent) 72%, #0f172a);
		font-size: 0.875rem;
		font-weight: 900;
	}

	.open-link {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-radius: 1.25rem;
		background: #0f172a;
		padding: 1rem 1.1rem;
		color: white;
		font-size: 1.05rem;
		font-weight: 950;
		text-decoration: none;
		transition:
			background 160ms ease,
			transform 160ms ease;
	}

	.open-link:hover,
	.open-link:focus-visible {
		background: var(--card-accent);
		transform: translateY(-0.125rem);
		outline: none;
	}

	.open-link:focus-visible {
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--card-accent) 26%, transparent);
	}

	.open-link--dev {
		background: transparent;
		border: 2px solid color-mix(in srgb, var(--card-accent) 38%, transparent);
		color: color-mix(in srgb, var(--card-accent) 80%, #0f172a);
		font-weight: 800;
	}

	.open-link--dev:hover,
	.open-link--dev:focus-visible {
		background: color-mix(in srgb, var(--card-accent) 12%, transparent);
		border-color: var(--card-accent);
	}

	@media (max-width: 640px) {
		.game-card {
			min-height: auto;
			border-radius: 1.5rem;
			padding: 1.15rem;
		}
	}
</style>
