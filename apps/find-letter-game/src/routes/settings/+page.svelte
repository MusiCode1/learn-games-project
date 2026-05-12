<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		boosterService,
		type Config,
		updateConfig as updateBoosterConfig,
		Settings as BoosterSettings
	} from 'learn-booster-kit';
	import { language } from '$lib/services/language';
	import { settings, type GridSize } from '$lib/stores/settings.svelte';
	import {
		ttsSettings,
		PROVIDER_DEFAULTS,
		type TtsProviderId
	} from '$lib/stores/tts-settings.svelte';
	import { fetchVoices, MODELS_BY_PROVIDER, type Voice } from '$lib/utils/voices';
	import { speak } from '$lib/utils/tts';
	import LetterSelectionGrid from '../_components/LetterSelectionGrid.svelte';

	const sizes: GridSize[] = ['2x3', '3x3', '3x4', '4x4'];

	// === Booster config ===
	let config = $state<Config>();
	let unsubscribeConfig: (() => void) | undefined;

	// === Voices ===
	let voices = $state<Voice[]>([]);
	let loadingVoices = $state(false);

	onMount(async () => {
		// אתחול booster רק אם מופעל
		if (settings.boosterEnabled) {
			try {
				await boosterService.init();
				unsubscribeConfig = boosterService.config.subscribe((v) => {
					config = v;
				});
			} catch (e) {
				console.error('[settings] booster init failed:', e);
			}
		}
		await loadVoicesForCurrentProvider();
	});

	onDestroy(() => unsubscribeConfig?.());

	async function loadVoicesForCurrentProvider() {
		loadingVoices = true;
		try {
			voices = await fetchVoices(ttsSettings.provider);
		} finally {
			loadingVoices = false;
		}
	}

	function changeProvider(provider: TtsProviderId) {
		ttsSettings.setProvider(provider);
		loadVoicesForCurrentProvider();
	}

	function changeVoice(voiceId: string) {
		ttsSettings.voiceId = voiceId;
	}

	function changeModel(modelId: string) {
		ttsSettings.modelId = modelId;
	}

	async function testVoice() {
		await speak(language.ttsTestText);
	}

	// === Booster: handlers שדרושים ל-<Settings> של ה-kit ===
	async function updateConfig(newConfig: Config) {
		try {
			config = newConfig;
			config = await updateBoosterConfig(newConfig);
		} catch (e) {
			console.error('[settings] failed to update booster config:', e);
		}
	}

	function handleShowVideo() {
		// ה-kit קורא לזה כדי לבדוק וידאו — אנחנו רק מפעילים reward
		boosterService.triggerReward();
	}

	const currentModels = $derived(MODELS_BY_PROVIDER[ttsSettings.provider] ?? []);
</script>

<svelte:head>
	<title>{language.settingsPageTitle} — {language.gameTitle}</title>
</svelte:head>

<div class="settings-page" dir="rtl">
	<div class="settings-inner">
		<!-- Header -->
		<header class="page-header">
			<h1 class="page-title">{language.settingsPageTitle}</h1>
			<button class="back-btn" onclick={() => goto('/')}>
				← {language.backToGame}
			</button>
		</header>

		<!-- Section: הגדרות משחק -->
		<section class="card">
			<h2 class="card-title">{language.gameSettingsHeader}</h2>

			<div class="field">
				<label class="field-label" for="grid-size">{language.settingGridSize}</label>
				<div class="size-picker" role="radiogroup">
					{#each sizes as size}
						<button
							class="size-btn"
							class:active={settings.gridSize === size}
							onclick={() => (settings.gridSize = size)}
							aria-pressed={settings.gridSize === size}
						>
							{size}
						</button>
					{/each}
				</div>
			</div>

			<div class="field">
				<label class="field-label" for="qpb">{language.settingQuestionsPerBoard}</label>
				<div class="range-row">
					<input
						id="qpb"
						type="range"
						min="0"
						max={settings.totalCellsInGrid}
						step="1"
						bind:value={settings.questionsPerBoard}
					/>
					<span class="range-value">
						{settings.questionsPerBoard === 0
							? `הכל (${settings.totalCellsInGrid})`
							: settings.questionsPerBoard}
					</span>
				</div>
				<span class="toggle-hint">{language.settingQuestionsPerBoardHint}</span>
			</div>

			<div class="field">
				<label class="field-label" for="bps">{language.settingBoardsPerSet}</label>
				<div class="range-row">
					<input
						id="bps"
						type="range"
						min="1"
						max="10"
						step="1"
						bind:value={settings.boardsPerSet}
					/>
					<span class="range-value">{settings.boardsPerSet}</span>
				</div>
				<span class="toggle-hint">{language.settingBoardsPerSetHint}</span>
			</div>

			<div class="field summary">
				<span class="summary-label">{language.settingsSummary}:</span>
				<span class="summary-value">{settings.totalQuestionsPerSet}</span>
				<span class="summary-detail">
					({settings.boardsPerSet} × {settings.effectiveQuestionsPerBoard})
				</span>
			</div>

			<div class="field">
				<label class="toggle">
					<input type="checkbox" bind:checked={settings.voiceEnabled} />
					<div class="toggle-text">
						<span class="toggle-label">{language.settingVoiceEnabled}</span>
						<span class="toggle-hint">{language.settingVoiceEnabledHint}</span>
					</div>
				</label>
			</div>

			<div class="field">
				<label class="toggle">
					<input type="checkbox" bind:checked={settings.autoSpeakOnNewRound} />
					<div class="toggle-text">
						<span class="toggle-label">{language.settingAutoSpeak}</span>
						<span class="toggle-hint">{language.settingAutoSpeakHint}</span>
					</div>
				</label>
			</div>

			<div class="field">
				<label class="toggle">
					<input type="checkbox" bind:checked={settings.avoidSimilar} />
					<div class="toggle-text">
						<span class="toggle-label">{language.settingAvoidSimilar}</span>
						<span class="toggle-hint">{language.settingAvoidSimilarHint}</span>
					</div>
				</label>
			</div>

			<div class="field">
				<label class="field-label" for="cooldown">{language.settingCooldown}</label>
				<div class="range-row">
					<input
						id="cooldown"
						type="range"
						min="0"
						max="5000"
						step="500"
						bind:value={settings.cooldownMs}
					/>
					<span class="range-value">{(settings.cooldownMs / 1000).toFixed(1)}s</span>
				</div>
				<span class="toggle-hint">{language.settingCooldownHint}</span>
			</div>

			<div class="field">
				<label class="toggle">
					<input type="checkbox" bind:checked={settings.boosterEnabled} />
					<div class="toggle-text">
						<span class="toggle-label">{language.settingBoosterEnabled}</span>
						<span class="toggle-hint">{language.settingBoosterEnabledHint}</span>
					</div>
				</label>
			</div>
		</section>

		<!-- Section: בחירת אותיות -->
		<section class="card">
			<h2 class="card-title">{language.letterSelectionHeader}</h2>
			<p class="muted small">{language.letterSelectionHint}</p>
			<LetterSelectionGrid
				selectedIds={settings.selectedLetterIds}
				onChange={(next) => (settings.selectedLetterIds = next)}
			/>
		</section>

		<!-- Section: הגדרות TTS -->
		<section class="card">
			<h2 class="card-title">{language.ttsSettingsHeader}</h2>

			<div class="field">
				<label class="field-label" for="tts-provider">{language.ttsProviderLabel}</label>
				<select
					id="tts-provider"
					class="select"
					value={ttsSettings.provider}
					onchange={(e) => changeProvider((e.currentTarget as HTMLSelectElement).value as TtsProviderId)}
				>
					<option value="elevenlabs">ElevenLabs</option>
					<option value="gemini">Gemini</option>
				</select>
			</div>

			<div class="field">
				<label class="field-label" for="tts-voice">{language.ttsVoiceLabel}</label>
				{#if loadingVoices}
					<div class="loading">{language.ttsLoadingVoices}</div>
				{:else}
					<select
						id="tts-voice"
						class="select"
						value={ttsSettings.voiceId}
						onchange={(e) => changeVoice((e.currentTarget as HTMLSelectElement).value)}
					>
						{#if voices.length === 0}
							<option value={ttsSettings.voiceId}>{ttsSettings.voiceId}</option>
						{:else}
							{#each voices as v}
								<option value={v.id}>{v.name}</option>
							{/each}
						{/if}
					</select>
				{/if}
			</div>

			<div class="field">
				<label class="field-label" for="tts-model">{language.ttsModelLabel}</label>
				<select
					id="tts-model"
					class="select"
					value={ttsSettings.modelId}
					onchange={(e) => changeModel((e.currentTarget as HTMLSelectElement).value)}
				>
					{#each currentModels as m}
						<option value={m.id}>{m.label}</option>
					{/each}
					{#if !currentModels.find((m) => m.id === ttsSettings.modelId)}
						<option value={ttsSettings.modelId}>{ttsSettings.modelId}</option>
					{/if}
				</select>
			</div>

			<button class="test-btn" onclick={testVoice}>🔊 {language.ttsTestLabel}</button>
		</section>

		<!-- Section: הגדרות חיזוקים -->
		<section class="card">
			<h2 class="card-title">{language.boosterSettingsHeader}</h2>

			{#if !settings.boosterEnabled}
				<p class="muted">{language.boosterDisabledNote}</p>
			{:else if config}
				<!-- BoosterSettings מטפל בעצמו בתצוגה ובעדכון של config -->
				<div class="booster-wrap">
					<BoosterSettings {config} handleShowVideo={handleShowVideo as never} />
				</div>
			{:else}
				<div class="loading">טוען…</div>
			{/if}
		</section>
	</div>
</div>

<style>
	.settings-page {
		min-height: 100vh;
		background: linear-gradient(to bottom right, #fef3c7, #ffffff, #fed7aa);
		padding: 1.5rem 1rem;
		overflow-y: auto;
	}

	.settings-inner {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 900;
		color: #1e3a8a;
		margin: 0;
	}

	.back-btn {
		background: #16a34a;
		color: white;
		font-weight: 700;
		padding: 0.6rem 1.2rem;
		border-radius: 999px;
		box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
		transition: background 120ms ease;
	}

	.back-btn:hover {
		background: #15803d;
	}

	.card {
		background: white;
		border-radius: 1rem;
		padding: 1.25rem 1.5rem;
		box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
		border: 1px solid #e5e7eb;
	}

	.card-title {
		font-size: 1.25rem;
		font-weight: 800;
		color: #0f172a;
		margin: 0 0 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #fed7aa;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.field:last-child {
		margin-bottom: 0;
	}

	.field-label {
		font-weight: 700;
		color: #334155;
		font-size: 0.95rem;
	}

	.select {
		padding: 0.6rem 0.9rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.6rem;
		background: white;
		font-size: 1rem;
		font-family: inherit;
		color: #0f172a;
	}

	.size-picker {
		display: inline-flex;
		gap: 0.25rem;
		padding: 0.25rem;
		background: #f1f5f9;
		border-radius: 999px;
		width: fit-content;
	}

	.size-btn {
		font-weight: 700;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		font-size: 0.9rem;
		color: #475569;
	}

	.size-btn.active {
		background: white;
		color: #0f172a;
		box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
	}

	.toggle {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: background 120ms ease;
	}

	.toggle:hover {
		background: #f8fafc;
	}

	.toggle input[type='checkbox'] {
		width: 22px;
		height: 22px;
		margin-top: 0.15rem;
		accent-color: #f97316;
		cursor: pointer;
	}

	.toggle-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.toggle-label {
		font-weight: 700;
		color: #0f172a;
	}

	.toggle-hint {
		font-size: 0.85rem;
		color: #64748b;
	}

	.test-btn {
		margin-top: 0.5rem;
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: white;
		font-weight: 800;
		padding: 0.7rem 1.3rem;
		border-radius: 999px;
		box-shadow: 0 6px 16px rgba(249, 115, 22, 0.3);
	}

	.test-btn:hover {
		filter: brightness(1.05);
	}

	.muted {
		color: #64748b;
		font-style: italic;
		margin: 0;
	}

	.muted.small {
		font-size: 0.85rem;
		margin-bottom: 0.75rem;
	}

	.range-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.range-row input[type='range'] {
		flex: 1;
		accent-color: #f97316;
	}

	.summary {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: #fef3c7;
		border: 1px solid #fde68a;
		border-radius: 0.5rem;
		margin-top: 0.5rem;
	}

	.summary-label {
		font-weight: 700;
		color: #92400e;
	}

	.summary-value {
		font-size: 1.5rem;
		font-weight: 900;
		color: #b45309;
	}

	.summary-detail {
		color: #92400e;
		font-size: 0.95rem;
	}

	.range-value {
		font-weight: 800;
		color: #0f172a;
		min-width: 3rem;
		text-align: center;
		background: #f1f5f9;
		padding: 0.3rem 0.6rem;
		border-radius: 999px;
		font-variant-numeric: tabular-nums;
	}

	.loading {
		color: #64748b;
		padding: 0.5rem;
	}

	.booster-wrap {
		/* ה-Settings של booster-kit מגיע עם רוחב max-w-xl. מאפשרים לו למלא */
		display: block;
	}

	.booster-wrap :global(#container) {
		max-width: 100% !important;
		box-shadow: none !important;
	}

	/* מסתירים את ההגדרה "כמה תורות עד למחזק" של booster-kit —
	 * אנחנו לא משתמשים ב-turnsPerReward שלו; המשחק מנהל את הסבב
	 * דרך boardsPerSet × questionsPerBoard המקומיים.
	 * ה-wrapper השלם (label + input + help text) מוסתר ע"י :has. */
	.booster-wrap :global(div:has(> #turnsPerVideo)) {
		display: none;
	}
</style>
