<script lang="ts">
	import { settings } from '$lib/stores/settings.svelte';
	import {
		boosterService,
		type Config,
		updateConfig as updateBoosterConfig,
		getAppsList as getAppsListFromFully,
		type AppListItem,
		isFullyKiosk
	} from 'learn-booster-kit';
	import { onMount, onDestroy } from 'svelte';

	let config = $state<Config>();
	let unsubscribeConfig: () => void;
	let appList = $state<AppListItem[]>([]);
	let loadingApps = $state(false);

	// Subscribe to booster configuration
	onMount(async () => {
		await boosterService.init();
		unsubscribeConfig = boosterService.config.subscribe((v) => {
			config = v;
		});

		// Load apps if needed
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

	// Helper to update config
	async function updateConfig(newConfig: Config) {
		try {
			// Optimistic update
			config = newConfig;
			// Persist
			config = await updateBoosterConfig(newConfig);
		} catch (e) {
			console.error('Failed to update config', e);
			// Revert or show error could go here
		}
	}

	function updateRewardType(type: 'video' | 'app' | 'site') {
		if (!config) return;
		const newConfig = { ...config, rewardType: type };
		updateConfig(newConfig);
	}

	function updateVideoSource(source: 'local' | 'google-drive' | 'youtube') {
		if (!config) return;
		const newConfig = {
			...config,
			video: { ...config.video, source }
		};
		updateConfig(newConfig);
	}

	function updateBoosterUrl(url: string) {
		if (!config) return;
		const newConfig = {
			...config,
			booster: { ...config.booster, siteUrl: url }
		};
		updateConfig(newConfig);
	}

	function updateAppPackage(packageName: string) {
		if (!config) return;
		const newConfig = {
			...config,
			app: { ...config.app, packageName }
		};
		updateConfig(newConfig);
	}

	function updateNumberField(field: 'turnsPerReward' | 'rewardDisplayDurationMs', value: number) {
		if (!config) return;
		const newConfig = { ...config, [field]: value };
		updateConfig(newConfig);
	}
</script>

<div class="space-y-6" dir="rtl">
	<!-- Setting: Word Display Mode -->
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<div class="font-bold text-slate-800">מצב תצוגת מילה</div>
			<div class="text-sm text-slate-500">בחר כיצד תוצג המילה לתלמיד</div>
		</div>
		<select
			bind:value={settings.wordDisplayMode}
			aria-label="מצב תצוגת מילה"
			class="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
		>
			<option value="hidden">מוסתר</option>
			<option value="letters">אותיות נפרדות</option>
			<option value="word">מילה שלמה</option>
		</select>
	</div>

	<!-- Setting: Highlight Current Character -->
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<div class="font-bold text-slate-800">הדגשת אות נוכחית</div>
			<div class="text-sm text-slate-500">סימון האות שצריך להקליד כעת</div>
		</div>
		<button
			dir="ltr"
			aria-label="הדגשת אות נוכחית"
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			class:bg-blue-600={settings.highlightCurrentChar}
			class:bg-slate-200={!settings.highlightCurrentChar}
			onclick={() => (settings.highlightCurrentChar = !settings.highlightCurrentChar)}
		>
			<span
				class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm"
				class:left-1={!settings.highlightCurrentChar}
				class:left-6={settings.highlightCurrentChar}
			></span>
		</button>
	</div>

	<!-- Setting: Error Feedback -->
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<div class="font-bold text-slate-800">חיווי שגיאה</div>
			<div class="text-sm text-slate-500">רעידה וצבע אדום בעת טעות</div>
		</div>
		<button
			dir="ltr"
			aria-label="חיווי שגיאה"
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			class:bg-blue-600={settings.errorFeedback}
			class:bg-slate-200={!settings.errorFeedback}
			onclick={() => (settings.errorFeedback = !settings.errorFeedback)}
		>
			<span
				class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm"
				class:left-1={!settings.errorFeedback}
				class:left-6={settings.errorFeedback}
			></span>
		</button>
	</div>

	<!-- Setting: Card Repetitions -->
	<div class="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
		<div class="space-y-1">
			<div class="font-bold text-slate-800">חזרות לכרטיס</div>
			<div class="text-sm text-slate-500">כמה פעמים כל כרטיס יופיע במשחק</div>
		</div>
		<select
			bind:value={settings.cardRepetitions}
			aria-label="חזרות לכרטיס"
			class="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
		>
			<option value={1}>1</option>
			<option value={2}>2</option>
			<option value={3}>3</option>
			<option value={5}>5</option>
			<option value={10}>10</option>
			<option value={0}>♾️ ללא הגבלה</option>
		</select>
	</div>

	<!-- Setting: Virtual Keyboard Mode -->
	<div class="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
		<div class="space-y-1">
			<div class="font-bold text-slate-800">מקלדת וירטואלית</div>
			<div class="text-sm text-slate-500">הצג מקלדת על המסך</div>
		</div>
		<select
			bind:value={settings.virtualKeyboardMode}
			aria-label="מקלדת וירטואלית"
			class="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
		>
			<option value="none">ללא</option>
			<option value="full">מלאה</option>
			<option value="focused">ממוקדת (רק אותיות רלוונטיות)</option>
		</select>
	</div>

	<!-- Booster Settings Section -->
	<div class="border-t border-slate-100 pt-2 mt-4">
		<!-- Main Toggle for Booster -->
		<div class="flex items-center justify-between py-4">
			<div class="space-y-1">
				<div class="font-bold text-slate-800">חיזוקים (Gingim Booster)</div>
				<div class="text-sm text-slate-500">הפעלת מנגנון חיזוקים לאחר הצלחה</div>
			</div>
			<button
				dir="ltr"
				aria-label="הפעלת חיזוקים"
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				class:bg-blue-600={settings.boosterEnabled}
				class:bg-slate-200={!settings.boosterEnabled}
				onclick={() => {
					settings.boosterEnabled = !settings.boosterEnabled;
					// Force init if enabling
					if (settings.boosterEnabled) boosterService.init();
				}}
			>
				<span
					class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm"
					class:left-1={!settings.boosterEnabled}
					class:left-6={settings.boosterEnabled}
				></span>
			</button>
		</div>

		{#if settings.boosterEnabled && config}
			<!-- Sub-setting: Auto Loop -->
			<div class="flex items-center justify-between py-2 pr-4 border-t border-slate-100/50">
				<div class="space-y-1">
					<div class="font-medium text-slate-700">לולאה אוטומטית</div>
					<div class="text-xs text-slate-500">הפעלת מחזק וחזרה אוטומטית למשימה</div>
				</div>
				<button
					dir="ltr"
					aria-label="לולאה אוטומטית"
					class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					class:bg-blue-600={settings.autoBoosterLoop}
					class:bg-slate-200={!settings.autoBoosterLoop}
					onclick={() => (settings.autoBoosterLoop = !settings.autoBoosterLoop)}
				>
					<span
						class="absolute top-1 inline-block h-3 w-3 rounded-full bg-white transition-all duration-200 shadow-sm"
						class:left-1={!settings.autoBoosterLoop}
						class:left-5={settings.autoBoosterLoop}
					></span>
				</button>
			</div>

			<!-- Reward Type -->
			<div class="flex items-center justify-between py-2 pr-4 border-t border-slate-100/50">
				<div class="space-y-1">
					<label for="reward-type-select" class="font-medium text-slate-700">סוג פרס</label>
					<div class="text-xs text-slate-500">מה יוצג כחיזוק לתלמיד</div>
				</div>
				<select
					id="reward-type-select"
					value={config.rewardType}
					onchange={(e) => updateRewardType(e.currentTarget.value as any)}
					class="px-2 py-1 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
				>
					<option value="video">וידאו</option>
					<option value="app">אפליקציה</option>
					<option value="site">אתר</option>
				</select>
			</div>

			<!-- Turns per Reward -->
			<div class="flex items-center justify-between py-2 pr-4 border-t border-slate-100/50">
				<div class="space-y-1">
					<label for="turns-input" class="font-medium text-slate-700">תורות לחיזוק</label>
					<div class="text-xs text-slate-500">כל כמה הצלחות יופיע החיזוק</div>
				</div>
				<input
					id="turns-input"
					type="number"
					min="1"
					value={config.turnsPerReward}
					onchange={(e) => updateNumberField('turnsPerReward', parseInt(e.currentTarget.value))}
					class="w-16 px-2 py-1 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-center"
				/>
			</div>

			<!-- Display Duration -->
			<div class="flex items-center justify-between py-2 pr-4 border-t border-slate-100/50">
				<div class="space-y-1">
					<label for="duration-input" class="font-medium text-slate-700">משך החיזוק (שניות)</label>
					<div class="text-xs text-slate-500">כמה זמן יוצג החיזוק</div>
				</div>
				<input
					id="duration-input"
					type="number"
					min="1"
					value={Math.floor(config.rewardDisplayDurationMs / 1000)}
					onchange={(e) =>
						updateNumberField('rewardDisplayDurationMs', parseInt(e.currentTarget.value) * 1000)}
					class="w-16 px-2 py-1 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-center"
				/>
			</div>

			<!-- Specific Settings -->
			<div class="mt-2 pr-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
				{#if config.rewardType === 'video'}
					<div class="space-y-3">
						<div class="space-y-1">
							<label for="video-source-select" class="text-sm font-medium text-slate-700"
								>מקור הווידאו</label
							>
							<select
								id="video-source-select"
								value={config.video.source}
								onchange={(e) => updateVideoSource(e.currentTarget.value as any)}
								class="w-full px-2 py-1.5 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="local">תיקייה מקומית (Fully Kiosk)</option>
								<option value="google-drive">גוגל דרייב</option>
							</select>
						</div>

						{#if config.video.source === 'google-drive'}
							<div class="space-y-1">
								<label for="gdrive-folder-input" class="text-sm font-medium text-slate-700"
									>קישור לתיקייה</label
								>
								<input
									id="gdrive-folder-input"
									type="text"
									value={config.video.googleDriveFolderUrl || ''}
									onchange={(e) => {
										const newConfig = {
											...config!,
											video: { ...config!.video, googleDriveFolderUrl: e.currentTarget.value }
										};
										updateConfig(newConfig);
									}}
									placeholder="הדבק קישור לתיקיית דרייב..."
									dir="ltr"
									class="w-full px-2 py-1.5 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						{/if}
					</div>
				{:else if config.rewardType === 'site'}
					<div class="space-y-2">
						<label for="site-url-input" class="text-sm font-medium text-slate-700">כתובת האתר</label
						>
						<input
							id="site-url-input"
							type="url"
							value={config.booster.siteUrl}
							onchange={(e) => updateBoosterUrl(e.currentTarget.value)}
							placeholder="https://example.com"
							dir="ltr"
							class="w-full px-2 py-1.5 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				{:else if config.rewardType === 'app'}
					<div class="space-y-2">
						<label for="app-selection" class="text-sm font-medium text-slate-700"
							>בחירת אפליקציה</label
						>
						{#if loadingApps}
							<div class="text-xs text-slate-500">טוען רשימת אפליקציות...</div>
						{:else if appList.length > 0}
							<select
								id="app-selection"
								value={config.app.packageName}
								onchange={(e) => updateAppPackage(e.currentTarget.value)}
								class="w-full px-2 py-1.5 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">בחר אפליקציה...</option>
								{#each appList as app}
									<option value={app.package}>{app.label}</option>
								{/each}
							</select>
						{:else}
							<div class="text-xs text-orange-500">לא נמצאו אפליקציות (האם Fully Kiosk פעיל?)</div>
							<input
								id="app-selection"
								type="text"
								value={config.app.packageName}
								onchange={(e) => updateAppPackage(e.currentTarget.value)}
								placeholder="שם חבילה (למשל com.example.app)"
								dir="ltr"
								class="w-full px-2 py-1.5 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
							/>
						{/if}
					</div>
				{/if}
			</div>
		{:else if settings.boosterEnabled}
			<div class="text-center text-gray-400 text-sm py-4">טוען הגדרות...</div>
		{/if}
	</div>
</div>
