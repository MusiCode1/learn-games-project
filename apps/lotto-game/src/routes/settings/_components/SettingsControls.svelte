<script lang="ts">
	import { slide } from 'svelte/transition';
	import { settings } from '$lib/stores/settings.svelte';
	import { contentRegistry } from '$lib/content/registry';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import {
		boosterService,
		type Config,
		updateConfig as updateBoosterConfig,
		getAppsList as getAppsListFromFully,
		type AppListItem,
		isFullyKiosk
	} from 'learn-booster-kit';
	import { onMount, onDestroy } from 'svelte';

	// === Booster State ===
	let config = $state<Config>();
	let unsubscribeConfig: () => void;
	let appList = $state<AppListItem[]>([]);
	let loadingApps = $state(false);

	onMount(async () => {
		if (settings.boosterEnabled) {
			await boosterService.init();
		}

		unsubscribeConfig = boosterService.config.subscribe((v) => {
			config = v;
		});

		if (isFullyKiosk()) {
			loadingApps = true;
			try {
				appList = await getAppsListFromFully();
			} catch (e) {
				console.error('Failed to load apps', e);
			} finally {
				loadingApps = false;
			}
		}
	});

	onDestroy(() => {
		if (unsubscribeConfig) unsubscribeConfig();
	});

	// Sync totalRounds to turnsPerReward
	$effect(() => {
		if (config && config.turnsPerReward !== settings.totalRounds) {
			updateNumberField('turnsPerReward', settings.totalRounds);
		}
	});

	async function updateConfig(newConfig: Config) {
		try {
			config = newConfig;
			config = await updateBoosterConfig(newConfig);
		} catch (e) {
			console.error('Failed to update config', e);
		}
	}

	function updateRewardType(type: 'video' | 'app' | 'site') {
		if (!config) return;
		const newConfig = { ...config, rewardType: type };
		updateConfig(newConfig);
	}

	function updateVideoSource(source: 'local' | 'google-drive' | 'youtube') {
		if (!config) return;
		const newConfig = { ...config, video: { ...config.video, source } };
		updateConfig(newConfig);
	}

	function updateBoosterUrl(url: string) {
		if (!config) return;
		const newConfig = { ...config, booster: { ...config.booster, siteUrl: url } };
		updateConfig(newConfig);
	}

	function updateAppPackage(packageName: string) {
		if (!config) return;
		const newConfig = { ...config, app: { ...config.app, packageName } };
		updateConfig(newConfig);
	}

	function updateNumberField(field: 'turnsPerReward' | 'rewardDisplayDurationMs', value: number) {
		if (!config) return;
		const newConfig = { ...config, [field]: value };
		updateConfig(newConfig);
	}

	function handleTestBooster() {
		boosterService.triggerReward();
	}

	// === Provider Logic ===
	const allProviders = $derived(contentRegistry.getAll());
	const currentProvider = $derived(contentRegistry.get(settings.contentProviderId));
	const currentSettings = $derived(settings.getCurrentProviderSettings());

	// רכיב הגדרות דינמי
	const SettingsComponent = $derived(currentProvider.settingsComponent);

	// === Generic Handler for Provider Settings ===
	function handleProviderSettingsUpdate(updatedSettings: Record<string, unknown>) {
		settings.updateProviderSettings(updatedSettings);
	}
</script>

<div class="settings-container" dir="rtl">
	<!-- 0. מצב משחק (Game Mode) -->
	<section class="section">
		<h2 class="section-title">
			<span>🎮</span> מצב משחק
		</h2>

		<div class="setting-group">
			<SegmentedControl
				options={[
					{ id: 'lotto', label: 'לוטו', icon: '🃏' },
					{ id: 'memory', label: 'זיכרון', icon: '🧠' }
				]}
				value={settings.gameMode}
				onchange={(id) => (settings.gameMode = id as 'lotto' | 'memory')}
			/>
		</div>

		<p class="mode-description">
			{#if settings.gameMode === 'memory'}
				הכרטיסים מתחילים הפוכים. לחץ על כרטיס כדי להפוך אותו וגלה את הזוגות!
			{:else}
				כל הכרטיסים גלויים. מצא את הזוגות התואמים!
			{/if}
		</p>
	</section>

	<!-- 1. בחירת תוכן (Content Selection) -->
	<section class="section">
		<h2 class="section-title">
			<span>🎨</span> בחירת תוכן
		</h2>

		<!-- סוג תוכן -->
		<div class="setting-group">
			<h3 class="setting-label">סוג תוכן</h3>
			<SegmentedControl
				options={allProviders.map((p) => ({ id: p.id, label: p.displayName, icon: p.icon }))}
				value={settings.contentProviderId}
				onchange={(id) => settings.setProvider(id)}
			/>
		</div>

		<!-- הגדרות ספציפיות לפי Provider - גנרי לחלוטין -->
		{#if SettingsComponent}
			{@const availableItems = currentProvider.getAvailableItems().map((item) => item.value)}
			{@const selectedItems = currentProvider.getSelectedItemIds(currentSettings)}
			<svelte:component
				this={SettingsComponent}
				{selectedItems}
				onUpdate={(items: string[]) => {
					const updated = currentProvider.updateSelectedItems(currentSettings, items) as Record<string, unknown>;
					settings.updateProviderSettings(updated);
				}}
				{availableItems}
				settings={currentSettings}
				onSettingsUpdate={handleProviderSettingsUpdate}
			/>
		{:else}
			<p class="no-settings">אין הגדרות זמינות לספק זה</p>
		{/if}
	</section>

	<!-- 2. הגדרות משחק (Game Settings) -->
	<section class="section">
		<h2 class="section-title">
			<span>⚙️</span> הגדרות משחק
		</h2>

		<div class="grid-2">
			<!-- מספר זוגות -->
			<div class="setting-group">
				<h3 class="setting-label">מספר זוגות ({settings.pairCount})</h3>
				<div class="range-control">
					<input
						type="range"
						min="2"
						max="20"
						bind:value={settings.pairCount}
						class="range-slider"
					/>
					<span class="range-value">{settings.pairCount}</span>
				</div>
			</div>

			<!-- אפשרויות משחק -->
			<div class="setting-group">
				{#if settings.gameMode !== 'memory'}
					<div class="checkbox-group">
						<input
							type="checkbox"
							id="enableDeselect"
							bind:checked={settings.enableDeselect}
							class="checkbox"
						/>
						<label for="enableDeselect" class="checkbox-label">
							אפשר ביטול בחירה (בלחיצה שנייה)
						</label>
					</div>
				{/if}
				<div class="checkbox-group">
					<input
						type="checkbox"
						id="hideMatchedCards"
						bind:checked={settings.hideMatchedCards}
						class="checkbox"
					/>
					<label for="hideMatchedCards" class="checkbox-label">
						הסתר כרטיסים שהותאמו
					</label>
				</div>
			</div>

			<!-- משך תצוגת משוב -->
			<div class="setting-group">
				<h3 class="setting-label">משך תצוגת משוב ({settings.feedbackDurationSec} שניות)</h3>
				<div class="range-control">
					<input
						type="range"
						min="1"
						max="5"
						step="0.5"
						bind:value={settings.feedbackDurationSec}
						class="range-slider"
					/>
					<span class="range-value">{settings.feedbackDurationSec}</span>
				</div>
				<p class="setting-hint">כמה זמן הכרטיסים נשארים גלויים אחרי לחיצה</p>
			</div>
		</div>
	</section>

	<!-- 3. מהלך משחק וחיזוקים (Game Flow & Rewards) -->
	<section class="section">
		<h2 class="section-title">
			<span>🎁</span> מהלך משחק וחיזוקים
		</h2>

		<div class="grid-2">
			<!-- מצב משחק -->
			<div class="setting-group">
				<h3 class="setting-label">מבנה המשחק</h3>
				<SegmentedControl
					options={[
						{ id: 'finite', label: 'מוגבל' },
						{ id: 'infinite', label: 'אינסופי' }
					]}
					value={settings.loopMode}
					onchange={(id) => (settings.loopMode = id as 'finite' | 'infinite')}
				/>

				<div class="setting-group">
					<label for="totalRounds" class="setting-label">
						{settings.loopMode === 'infinite'
							? 'כל כמה סבבים יופעל חיזוק:'
							: 'מספר סבבים למשחק:'}
					</label>
					<div class="range-control">
						<input
							type="range"
							id="totalRounds"
							min="1"
							max="10"
							bind:value={settings.totalRounds}
							class="range-slider"
						/>
						<span class="range-value">{settings.totalRounds}</span>
					</div>
				</div>

				<div class="checkbox-group">
					<input
						type="checkbox"
						id="autoNextRound"
						bind:checked={settings.autoNextRound}
						class="checkbox"
					/>
					<label for="autoNextRound" class="checkbox-label">
						מעבר אוטומטי לסבב הבא (ללא פופאפ)
					</label>
				</div>
			</div>

			<!-- הגדרות בוסטר -->
			<div class="setting-group">
				<div class="toggle-header">
					<h3 class="setting-label">מערכת חיזוקים</h3>
					<div class="toggle-wrapper">
						<span class="toggle-status">{settings.boosterEnabled ? 'פעיל' : 'כבוי'}</span>
						<button
							dir="ltr"
							title="Toggle booster"
							class="toggle-button"
							class:active={settings.boosterEnabled}
							onclick={() => {
								settings.boosterEnabled = !settings.boosterEnabled;
								if (settings.boosterEnabled) boosterService.init();
							}}
						>
							<span class="toggle-thumb" class:active={settings.boosterEnabled}></span>
						</button>
					</div>
				</div>

				{#if settings.boosterEnabled}
					<div transition:slide={{ duration: 200 }} class="booster-settings">
						<!-- Auto Start Toggle -->
						<div class="checkbox-group">
							<input
								type="checkbox"
								id="autoBooster"
								bind:checked={settings.autoBooster}
								class="checkbox"
							/>
							<label for="autoBooster" class="checkbox-label small">
								פתח חיזוק אוטומטית בסיום
							</label>
						</div>

						<!-- Test Button -->
						<button onclick={handleTestBooster} class="test-button">
							🎁 בדוק חיזוק כעת
						</button>

						{#if config}
							<div class="booster-config">
								<div class="setting-group">
									<label for="reward-type" class="setting-label small">סוג פרס</label>
									<select
										id="reward-type"
										value={config.rewardType}
										onchange={(e) => updateRewardType(e.currentTarget.value as any)}
										class="select"
									>
										<option value="video">וידאו</option>
										<option value="app">אפליקציה</option>
										<option value="site">אתר</option>
									</select>
								</div>

								<!-- Dynamic Settings based on type -->
								{#if config.rewardType === 'video'}
									<div class="setting-group">
										<label for="video-src" class="setting-label small">מקור</label>
										<select
											id="video-src"
											value={config.video.source}
											onchange={(e) => updateVideoSource(e.currentTarget.value as any)}
											class="select"
										>
											<option value="local">תיקייה מקומית</option>
											<option value="google-drive">גוגל דרייב</option>
										</select>
									</div>
									{#if config.video.source === 'google-drive'}
										<input
											type="text"
											value={config.video.googleDriveFolderUrl || ''}
											onchange={(e) => {
												const newConfig = {
													...config!,
													video: { ...config!.video, googleDriveFolderUrl: e.currentTarget.value }
												};
												updateConfig(newConfig);
											}}
											placeholder="URL תיקיית דרייב"
											class="input"
											dir="ltr"
										/>
									{/if}
								{:else if config.rewardType === 'site'}
									<input
										type="url"
										value={config.booster.siteUrl}
										onchange={(e) => updateBoosterUrl(e.currentTarget.value)}
										placeholder="כתובת אתר..."
										class="input"
										dir="ltr"
									/>
								{:else if config.rewardType === 'app'}
									{#if loadingApps}
										<div class="loading">טוען...</div>
									{:else if appList.length > 0}
										<select
											value={config.app.packageName}
											onchange={(e) => updateAppPackage(e.currentTarget.value)}
											class="select"
										>
											<option value="">בחר אפליקציה...</option>
											{#each appList as app}
												<option value={app.package}>{app.label}</option>
											{/each}
										</select>
									{:else}
										<input
											type="text"
											value={config.app.packageName}
											onchange={(e) => updateAppPackage(e.currentTarget.value)}
											placeholder="שם חבילה (Package Name)"
											class="input"
											dir="ltr"
										/>
									{/if}
								{/if}

								<div class="setting-group">
									<label for="duration" class="setting-label small">משך (שניות)</label>
									<input
										id="duration"
										type="number"
										min="1"
										value={Math.floor(config.rewardDisplayDurationMs / 1000)}
										onchange={(e) =>
											updateNumberField(
												'rewardDisplayDurationMs',
												parseInt(e.currentTarget.value) * 1000
											)}
										class="input number"
									/>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</section>
</div>

<style type="text/postcss">
	@reference "tailwindcss";

	/* Container */
	.settings-container {
		/* Layout */
		@apply flex flex-col;

		/* Spacing */
		@apply gap-6;

		/* Visual */
		@apply bg-transparent text-right;
	}

	/* Section */
	.section {
		/* Layout */
		@apply flex flex-col;

		/* Spacing */
		@apply p-6 gap-6;

		/* Visual */
		@apply bg-white rounded-2xl;
		@apply shadow-sm border border-slate-100;
	}

	.section-title {
		/* Layout */
		@apply flex items-center;

		/* Spacing */
		@apply gap-2 pb-2;

		/* Visual */
		@apply text-xl font-bold text-slate-800;
		@apply border-b border-slate-200;
	}

	/* Grid */
	.grid-2 {
		/* Layout */
		@apply grid grid-cols-1 md:grid-cols-2;

		/* Spacing */
		@apply gap-8;
	}

	/* Setting Group */
	.setting-group {
		/* Layout */
		@apply flex flex-col;

		/* Spacing */
		@apply gap-2;
	}

	.setting-label {
		/* Visual */
		@apply font-bold text-slate-700;
	}

	.setting-label.small {
		/* Visual */
		@apply text-sm font-medium text-slate-700;
	}

	/* Range Control */
	.range-control {
		/* Layout */
		@apply flex items-center;

		/* Spacing */
		@apply gap-4;
	}

	.range-slider {
		/* Layout */
		@apply w-full;

		/* Visual */
		@apply h-2 bg-indigo-200 rounded-lg;
		@apply appearance-none;
		@apply accent-indigo-600;

		/* Interactive */
		@apply cursor-pointer;
	}

	.range-value {
		/* Layout */
		@apply min-w-[2rem];

		/* Visual */
		@apply font-bold text-indigo-600 text-center;
	}

	/* Checkbox */
	.checkbox-group {
		/* Layout */
		@apply flex items-center;

		/* Spacing */
		@apply gap-3;
	}

	.checkbox {
		/* Layout */
		@apply w-5 h-5;

		/* Visual */
		@apply text-indigo-600 rounded;
		@apply focus:ring-indigo-500;
	}

	.checkbox-label {
		/* Visual */
		@apply text-slate-700 font-medium;
		@apply select-none;

		/* Interactive */
		@apply cursor-pointer;
	}

	.checkbox-label.small {
		/* Visual */
		@apply text-sm;
	}

	/* Toggle */
	.toggle-header {
		/* Layout */
		@apply flex items-center justify-between;
	}

	.toggle-wrapper {
		/* Layout */
		@apply flex items-center;

		/* Spacing */
		@apply gap-2;
	}

	.toggle-status {
		/* Visual */
		@apply text-sm text-slate-500;
	}

	.toggle-button {
		/* Layout */
		@apply relative inline-flex items-center;

		/* Spacing */
		@apply h-6 w-11;

		/* Visual */
		@apply rounded-full bg-slate-200;
		@apply border-0;

		/* Interactive */
		@apply transition-colors;
		@apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
	}

	.toggle-button.active {
		/* Visual */
		@apply bg-blue-600;
	}

	.toggle-thumb {
		/* Layout */
		@apply absolute top-1 inline-block;

		/* Spacing */
		@apply h-4 w-4;

		/* Visual */
		@apply rounded-full bg-white shadow-sm;

		/* Interactive */
		@apply transition-all duration-200;

		/* Position */
		left: 0.25rem;
	}

	.toggle-thumb.active {
		/* Position */
		left: 1.5rem;
	}

	/* Booster Settings */
	.booster-settings {
		/* Layout */
		@apply flex flex-col;

		/* Spacing */
		@apply gap-4 p-4;

		/* Visual */
		@apply bg-slate-50 rounded-xl;
		@apply border border-slate-200;
	}

	.test-button {
		/* Layout */
		@apply w-full;

		/* Spacing */
		@apply py-2;

		/* Visual */
		@apply bg-indigo-100 text-indigo-700 rounded-lg;
		@apply font-bold text-sm;

		/* Interactive */
		@apply hover:bg-indigo-200 transition-colors;
	}

	.booster-config {
		/* Layout */
		@apply flex flex-col;

		/* Spacing */
		@apply gap-3 pt-3 mt-2;

		/* Visual */
		@apply border-t border-slate-200;
	}

	/* Form Elements */
	.select,
	.input {
		/* Layout */
		@apply w-full;

		/* Spacing */
		@apply px-3 py-2;

		/* Visual */
		@apply text-sm bg-white rounded-lg;
		@apply border border-slate-200;
	}

	.input.number {
		/* Visual */
		@apply text-center;
	}

	.loading {
		/* Visual */
		@apply text-xs text-slate-500;
	}

	.no-settings {
		/* Visual */
		@apply text-slate-500 text-center;
	}

	.mode-description {
		/* Visual */
		@apply text-sm text-slate-500 text-center;
	}

	.setting-hint {
		/* Visual */
		@apply text-xs text-slate-400;
	}
</style>
