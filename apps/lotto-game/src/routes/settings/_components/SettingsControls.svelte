<script lang="ts">
	import { slide } from 'svelte/transition';
	import { settings } from '$lib/stores/settings.svelte';
	import { LETTERS, SHAPES } from '$lib/utils/gameLogic';
	import ShapeSvg from '$lib/components/ShapeSvg.svelte';
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

	// === Game Logic Handlers ===
	function handleLetterToggle(letter: string) {
		if (settings.selectedLetters.includes(letter)) {
			settings.selectedLetters = settings.selectedLetters.filter((l) => l !== letter);
		} else {
			settings.selectedLetters = [...settings.selectedLetters, letter];
		}
	}

	function handleSelectAllLetters() {
		settings.selectedLetters = [...LETTERS];
	}

	function handleDeselectAllLetters() {
		settings.selectedLetters = [];
	}

	function handleShapeToggle(shapeId: string) {
		if (settings.selectedShapes.includes(shapeId)) {
			settings.selectedShapes = settings.selectedShapes.filter((s) => s !== shapeId);
		} else {
			settings.selectedShapes = [...settings.selectedShapes, shapeId];
		}
	}

	function handleSelectAllShapes() {
		settings.selectedShapes = SHAPES.map((s) => s.id);
	}

	function handleDeselectAllShapes() {
		settings.selectedShapes = [];
	}
</script>

<div class="space-y-6 text-right bg-transparent" dir="rtl">
	
	<!-- 1. כללי (General) -->
	<section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
		<h2 class="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
			<span>⚙️</span> הגדרות כלליות
		</h2>

		<!-- סוג תוכן -->
		<div class="space-y-2">
			<h3 class="font-bold text-slate-700">סוג תוכן</h3>
			<div class="flex gap-4">
				<button
					onclick={() => settings.contentType = 'letters'}
					class="flex-1 py-3 rounded-xl font-bold transition-all {settings.contentType === 'letters' 
						? 'bg-indigo-600 text-white shadow-lg scale-105' 
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					🔤 אותיות
				</button>
				<button
					onclick={() => settings.contentType = 'shapes'}
					class="flex-1 py-3 rounded-xl font-bold transition-all {settings.contentType === 'shapes' 
						? 'bg-indigo-600 text-white shadow-lg scale-105' 
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					🔷 צורות
				</button>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<!-- מספר זוגות -->
			<div class="space-y-2">
				<h3 class="font-bold text-slate-700">מספר זוגות ({settings.pairCount})</h3>
				<div class="flex items-center gap-4">
					<input
						type="range"
						min="2"
						max="20"
						bind:value={settings.pairCount}
						class="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
					/>
					<span class="font-bold text-indigo-600 min-w-[2rem] text-center">{settings.pairCount}</span>
				</div>
			</div>

			<!-- אפשרויות משחק -->
			<div class="space-y-4">
				<div class="flex items-center gap-3">
					<input
						type="checkbox"
						id="enableDeselect"
						bind:checked={settings.enableDeselect}
						class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
					/>
					<label for="enableDeselect" class="text-slate-700 font-medium cursor-pointer select-none">
						אפשר ביטול בחירה (בלחיצה שנייה)
					</label>
				</div>
			</div>
		</div>
	</section>

	<!-- 2. מהלך משחק וחיזוקים (Game Flow & Rewards) -->
	<section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
		<h2 class="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
			<span>🎁</span> מהלך משחק וחיזוקים
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<!-- מצב משחק -->
			<div class="space-y-4">
				<h3 class="font-bold text-slate-700">מבנה המשחק</h3>
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						id="infiniteLoop"
						checked={settings.loopMode === 'infinite'}
						onchange={(e) => settings.loopMode = e.currentTarget.checked ? 'infinite' : 'finite'}
						class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
					/>
					<label for="infiniteLoop" class="text-slate-700 font-medium cursor-pointer select-none">
						משחק ללא הגבלה (אינסופי)
					</label>
				</div>

				<div class="space-y-2">
					<label for="totalRounds" class="block text-slate-700 font-medium">
						{settings.loopMode === 'infinite' ? 'כל כמה סבבים יופעל חיזוק:' : 'מספר סבבים למשחק:'}
					</label>
					<div class="flex items-center gap-4">
						<input
							type="range"
							id="totalRounds"
							min="1"
							max="10"
							bind:value={settings.totalRounds}
							class="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
						/>
						<span class="font-bold text-indigo-600 min-w-[2rem] text-center">{settings.totalRounds}</span>
					</div>
				</div>
			</div>

			<!-- הגדרות בוסטר -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="font-bold text-slate-700">מערכת חיזוקים</h3>
					<div class="flex items-center gap-2">
						<span class="text-sm text-slate-500">{settings.boosterEnabled ? 'פעיל' : 'כבוי'}</span>
						<button
							dir="ltr"
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							class:bg-blue-600={settings.boosterEnabled}
							class:bg-slate-200={!settings.boosterEnabled}
							onclick={() => {
								settings.boosterEnabled = !settings.boosterEnabled;
								if (settings.boosterEnabled) boosterService.init();
							}}
						>
							<span class="absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm" class:left-1={!settings.boosterEnabled} class:left-6={settings.boosterEnabled}></span>
						</button>
					</div>
				</div>

				{#if settings.boosterEnabled}
					<div transition:slide={{ duration: 200 }} class="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
						<!-- Auto Start Toggle -->
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								id="autoBooster"
								bind:checked={settings.autoBooster}
								class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
							/>
							<label for="autoBooster" class="text-sm font-medium text-slate-700 cursor-pointer select-none">
								פתח חיזוק אוטומטית בסיום
							</label>
						</div>

						<!-- Test Button -->
						<button
							onclick={handleTestBooster}
							class="w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold hover:bg-indigo-200 transition-colors text-sm"
						>
							🎁 בדוק חיזוק כעת
						</button>

						{#if config}
							<div class="border-t border-slate-200 pt-3 mt-2 space-y-3">
								<div class="space-y-2">
									<label for="reward-type" class="block text-sm font-medium text-slate-700">סוג פרס</label>
									<select
										id="reward-type"
										value={config.rewardType}
										onchange={(e) => updateRewardType(e.currentTarget.value as any)}
										class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200"
									>
										<option value="video">וידאו</option>
										<option value="app">אפליקציה</option>
										<option value="site">אתר</option>
									</select>
								</div>

								<!-- Dynamic Settings based on type -->
								{#if config.rewardType === 'video'}
									<div class="space-y-2">
										<label for="video-src" class="block text-sm font-medium text-slate-700">מקור</label>
										<select
											id="video-src"
											value={config.video.source}
											onchange={(e) => updateVideoSource(e.currentTarget.value as any)}
											class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200"
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
                                                const newConfig = { ...config!, video: { ...config!.video, googleDriveFolderUrl: e.currentTarget.value } };
                                                updateConfig(newConfig);
                                            }}
                                            placeholder="URL תיקיית דרייב"
                                            class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200"
                                            dir="ltr"
                                        />
                                    {/if}
								{:else if config.rewardType === 'site'}
									<input
										type="url"
										value={config.booster.siteUrl}
										onchange={(e) => updateBoosterUrl(e.currentTarget.value)}
										placeholder="כתובת אתר..."
										class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200"
										dir="ltr"
									/>
								{:else if config.rewardType === 'app'}
									{#if loadingApps}
										<div class="text-xs text-slate-500">טוען...</div>
									{:else if appList.length > 0}
										<select
											value={config.app.packageName}
											onchange={(e) => updateAppPackage(e.currentTarget.value)}
											class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200"
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
											class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200"
											dir="ltr"
										/>
									{/if}
								{/if}

                                <div class="space-y-1">
                                    <label for="duration" class="block text-sm font-medium text-slate-700">משך (שניות)</label>
                                    <input
                                        id="duration"
                                        type="number"
                                        min="1"
                                        value={Math.floor(config.rewardDisplayDurationMs / 1000)}
                                        onchange={(e) => updateNumberField('rewardDisplayDurationMs', parseInt(e.currentTarget.value) * 1000)}
                                        class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 text-center"
                                    />
                                </div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- 3. תוכן (Content) -->
	<section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
		<h2 class="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
			<span>🎨</span> בחירת תוכן
		</h2>

		{#if settings.contentType === 'letters'}
			<div>
				<div class="flex justify-between items-center mb-4">
					<h3 class="font-bold text-slate-700">בחירת אותיות ({settings.selectedLetters.length})</h3>
					<div class="space-x-2 space-x-reverse text-sm">
						<button onclick={handleSelectAllLetters} class="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50">בחר הכל</button>
						<span class="text-slate-300">|</span>
						<button onclick={handleDeselectAllLetters} class="text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100">נקה הכל</button>
					</div>
				</div>

				<div class="grid grid-cols-6 sm:grid-cols-8 gap-2">
					{#each LETTERS as letter}
						{@const isSelected = settings.selectedLetters.includes(letter)}
						<button
							onclick={() => handleLetterToggle(letter)}
							class="aspect-square rounded-lg font-bold text-lg flex items-center justify-center transition-all {isSelected ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}"
						>
							{letter}
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<div class="space-y-6">
				<!-- מצב צבעים -->
				<div>
					<h3 class="font-bold text-slate-700 mb-4">מצב צבעים</h3>
					<div class="flex gap-4">
						<button
							onclick={() => settings.colorMode = 'random'}
							class="flex-1 py-3 rounded-xl font-bold transition-all {settings.colorMode === 'random' 
								? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg scale-105' 
								: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
						>
							🌈 צבע רנדומלי
						</button>
						<button
							onclick={() => settings.colorMode = 'uniform'}
							class="flex-1 py-3 rounded-xl font-bold transition-all {settings.colorMode === 'uniform' 
								? 'bg-blue-500 text-white shadow-lg scale-105' 
								: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
						>
							🔵 צבע אחיד
						</button>
					</div>
				</div>

				<!-- בחירת צורות -->
				<div>
					<div class="flex justify-between items-center mb-4">
						<h3 class="font-bold text-slate-700">בחירת צורות ({settings.selectedShapes.length})</h3>
						<div class="space-x-2 space-x-reverse text-sm">
							<button onclick={handleSelectAllShapes} class="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50">בחר הכל</button>
							<span class="text-slate-300">|</span>
							<button onclick={handleDeselectAllShapes} class="text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100">נקה הכל</button>
						</div>
					</div>

					<div class="grid grid-cols-5 gap-3">
						{#each SHAPES as shape}
							{@const isSelected = settings.selectedShapes.includes(shape.id)}
							<button
								onclick={() => handleShapeToggle(shape.id)}
								class="flex flex-col items-center gap-2 p-3 rounded-xl transition-all {isSelected ? 'bg-indigo-100 border-2 border-indigo-600 shadow-md scale-105' : 'bg-slate-100 border-2 border-transparent hover:bg-slate-200'}"
							>
								<div class="w-12 h-12 flex items-center justify-center">
									<ShapeSvg shapeId={shape.id} color={isSelected ? '#4F46E5' : '#9CA3AF'} />
								</div>
								<span class="text-xs font-medium {isSelected ? 'text-indigo-700' : 'text-slate-500'}">{shape.name}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</section>
</div>
