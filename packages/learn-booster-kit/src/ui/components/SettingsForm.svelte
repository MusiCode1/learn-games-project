<script lang="ts">
    import type {
        AppListItem,
        Config,
        SettingsController,
        Profile,
    } from "../../types";

    import { onMount } from "svelte";
    import * as configManager from "../../lib/config/config-manager";
    import { log } from "../../lib/logger.svelte";
    import { isFullyKiosk } from "../../lib/fully-kiosk/fully-kiosk";
    import { msToTime } from "../../lib/utils/ms-to-time";
    import { getAppsList as getAppsListFromFully } from "../../lib/fully-kiosk/get-app-list";
    import {
        addProfilesListener,
        clearDirtyConfig,
        createProfile,
        deleteProfile as deleteStoredProfile,
        getProfilesState,
        markDirtyConfig,
        setActiveProfile,
        setProfilesUiEnabled,
    } from "../../lib/config/profile-manager";

    interface Props {
        config: Config;
        controller?: SettingsController;
        handleShowVideo: (newConfig: Config) => void;
        onClose?: () => void;
        embedded?: boolean;
    }

    let {
        config,
        controller = $bindable(),
        handleShowVideo,
        onClose,
        embedded = false,
    }: Props = $props();

    const msToSec = (n: number) => Math.floor(n / 1000);

    config = normalizeBoosterConfig(config);

    let newConfig = $state(normalizeBoosterConfig($state.snapshot(config)));

    let saveStatus = $state<"success" | "error" | null>(null);
    let saveStatusTimeoutHandle: NodeJS.Timeout;

    let videoDisplayTime = $state(msToSec(config.rewardDisplayDurationMs));

    let videoDisplayTimeInSec = $derived(videoDisplayTime * 1000);

    let profilesState = $state(getProfilesState());

    let selectedProfileId = $state(profilesState.activeProfileId ?? "");

    const isNotFullyKiosk = !isFullyKiosk();

    const disabledAppMode =
        config.environmentMode !== "development" && isNotFullyKiosk;

    $inspect("disabledAppMode:", disabledAppMode);

    const orderedProfiles = $derived(
        profilesState.order
            .map((id) => profilesState.profiles[id])
            .filter((profile): profile is Profile => Boolean(profile)),
    );

    const isProfilesUiEnabled = $derived(profilesState.uiEnabled);
    const hasUnsavedProfileChanges = $derived.by(() => {
        if (!profilesState.uiEnabled) return false;
        const dirty = profilesState.dirtyConfig;
        if (!dirty) return false;
        return !configsEqual(dirty, $state.snapshot(newConfig));
    });

    const selectedProfile = $derived(
        orderedProfiles.find((profile) => profile.id === selectedProfileId),
    );

    const canDeleteSelectedProfile = $derived(
        Boolean(
            selectedProfile &&
                orderedProfiles.length > 1 &&
                selectedProfile.id !== profilesState.activeProfileId,
        ),
    );

    function normalizeBoosterConfig(target: Config): Config {
        const booster = target.booster ?? { siteUrl: "" };
        const siteUrl =
            typeof booster.siteUrl === "string"
                ? booster.siteUrl
                : String(booster.siteUrl ?? "");

        return {
            ...target,
            booster: {
                siteUrl: siteUrl.trim(),
            },
        };
    }

    async function persistConfig(closeSettings = true) {
        try {
            newConfig.rewardDisplayDurationMs = videoDisplayTimeInSec;
            config = await configManager.updateConfig(
                $state.snapshot(newConfig),
            );
            config = normalizeBoosterConfig(config);
            saveStatus = "success";
        } catch (error) {
            console.error("שמירת הגדרות נכשלה:", error);
            saveStatus = "error";
        }

        if (saveStatusTimeoutHandle) clearTimeout(saveStatusTimeoutHandle);

        saveStatusTimeoutHandle = setTimeout(
            () => {
                if (saveStatus === "success" && closeSettings && onClose) {
                    onClose();
                }
                saveStatus = null;
            },
            closeSettings ? 1500 : 2000,
        );
    }

    const showVideo = () => {
        newConfig.rewardDisplayDurationMs = videoDisplayTimeInSec;

        log(newConfig);
        handleShowVideo(newConfig);
    };

    const handleClose = () => {
        newConfig = normalizeBoosterConfig(structuredClone(config));
        selectedProfileId = profilesState.activeProfileId ?? selectedProfileId;
        onClose?.();
    };

    onMount(() => {
        return () => {
            if (saveStatusTimeoutHandle) clearTimeout(saveStatusTimeoutHandle);
        };
    });

    onMount(() => {
        const removeListener = addProfilesListener((next) => {
            profilesState = next;
        });
        return () => {
            removeListener();
        };
    });

    $effect(() => {
        if (!selectedProfileId && orderedProfiles[0]) {
            selectedProfileId = orderedProfiles[0].id;
            return;
        }

        const exists = orderedProfiles.some(
            (profile) => profile.id === selectedProfileId,
        );
        if (!exists) {
            selectedProfileId =
                profilesState.activeProfileId ?? orderedProfiles[0]?.id ?? "";
        }
    });

    $effect(() => {
        if (!profilesState.uiEnabled) {
            if (profilesState.dirtyConfig) {
                clearDirtyConfig();
            }
            return;
        }

        const activeProfileId = profilesState.activeProfileId;
        if (!activeProfileId) return;

        const activeProfile = profilesState.profiles[activeProfileId];
        if (!activeProfile) return;

        const configSnapshot = structuredClone($state.snapshot(newConfig));
        const isSame = configsEqual(configSnapshot, activeProfile.config);

        if (isSame) {
            if (profilesState.dirtyConfig) {
                clearDirtyConfig();
            }
            return;
        }

        const existingDirty = profilesState.dirtyConfig;
        if (!existingDirty || !configsEqual(existingDirty, configSnapshot)) {
            markDirtyConfig(configSnapshot);
        }
    });

    // Auto-save effect for embedded mode
    $effect(() => {
        if (!embedded) return;

        // We track specific fields to avoid aggressive saving if needed,
        // but normally we just check if newConfig changed.
        // We use a derived or just the snapshot.
        const snapshot = $state.snapshot(newConfig);

        // Simple debounce logic is handled by persistConfig's setTimeout if we call it?
        // No, persistConfig has a timeout for clearing status, not for saving.
        // We need a separate debounce here.

        const timeout = setTimeout(() => {
            // Avoid saving if nothing changed from initial 'config'
            // BUT: config updates when we save.
            if (!configsEqual(snapshot, config)) {
                // Update the display time prop first
                newConfig.rewardDisplayDurationMs = videoDisplayTimeInSec;

                persistConfig(false).then(() => {
                    log("Auto-saved config");
                });
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeout);
    });

    const appListPromise = (async function () {
        return getAppsListFromFully().catch(() => {
            console.log("Fully Kiosk not detected - using generic app mode");
            return [];
        });
    })();

    const appItemPromise = $derived.by(async () => {
        const packageName = newConfig.app.packageName;
        const appList = await appListPromise;
        const appItem = appList.filter((v) => v.package === packageName)?.[0];
        return appItem as unknown as AppListItem | undefined;
    });

    const saveProfileWithoutClosing = async () => {
        await persistConfig(false);
        clearDirtyConfig();
    };

    function configsEqual(a?: Config | null, b?: Config | null): boolean {
        if (!a || !b) return false;
        try {
            return JSON.stringify(a) === JSON.stringify(b);
        } catch {
            return false;
        }
    }

    function confirmProfileSwitch(): boolean {
        if (!profilesState.dirtyConfig) return true;
        if (typeof window === "undefined") return true;
        return window.confirm(
            "בוצעו שינויים בפרופיל הפעיל שטרם נשמרו. להמשיך בכל זאת?",
        );
    }

    function snapshotCurrentConfig(): Config {
        return structuredClone($state.snapshot(newConfig));
    }

    async function applyProfileById(
        profileId: string,
        options: { skipConfirm?: boolean } = {},
    ) {
        if (!profileId) return;
        if (!options.skipConfirm && !confirmProfileSwitch()) {
            selectedProfileId = profilesState.activeProfileId ?? profileId;
            return;
        }

        try {
            const profile = setActiveProfile(profileId);
            config = normalizeBoosterConfig(
                await configManager.updateConfig(
                    structuredClone(profile.config),
                ),
            );
            newConfig = normalizeBoosterConfig(structuredClone(config));
            videoDisplayTime = msToSec(config.rewardDisplayDurationMs);
            saveStatus = null;
        } catch (error) {
            console.error("החלפת הפרופיל נכשלה:", error);
        }
    }

    const applySelectedProfile = async () => {
        if (!selectedProfileId) return;
        await applyProfileById(selectedProfileId);
    };

    const createNewProfileFromCurrent = async () => {
        if (typeof window === "undefined") return;
        const suggestedName = `פרופיל ${orderedProfiles.length + 1}`;
        const name = window
            .prompt("תנו שם לפרופיל החדש:", suggestedName)
            ?.trim();
        if (!name) return;

        try {
            const profile = createProfile({
                name,
                config: snapshotCurrentConfig(),
            });
            selectedProfileId = profile.id;
            await applyProfileById(profile.id, { skipConfirm: true });
        } catch (error) {
            console.error("יצירת הפרופיל נכשלה:", error);
        }
    };

    const deleteSelectedProfile = () => {
        const profile = selectedProfile;
        if (
            !profile ||
            profile.id === profilesState.activeProfileId ||
            orderedProfiles.length <= 1
        )
            return;

        if (
            typeof window !== "undefined" &&
            !window.confirm(`למחוק את "${profile.name}"? הפעולה אינה הפיכה.`)
        ) {
            return;
        }

        try {
            deleteStoredProfile(profile.id);
        } catch (error) {
            console.error("מחיקת הפרופיל נכשלה:", error);
        }
    };

    const onProfilesToggleChange = (event: Event) => {
        const target = event.currentTarget as HTMLInputElement | null;
        if (!target) return;
        try {
            setProfilesUiEnabled(target.checked);
        } catch (error) {
            console.error("עדכון מצב ניהול הפרופילים נכשל:", error);
        }
    };

    const onProfileSelectChange = (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement | null;
        if (!target) return;
        selectedProfileId = target.value;
    };
</script>

<div class="space-y-4 md:space-y-6">
    {#if !embedded}
        <h2 class="text-xl md:text-2xl font-bold text-right">הגדרות</h2>
    {/if}

    <div class="space-y-4 md:space-y-5">
        <!-- ניהול פרופילים -->
        <section class="settings-card space-y-4 text-right">
            <div class="flex gap-2 flex-row items-center justify-between">
                <div class="space-y-1">
                    <p class="font-medium text-base">ניהול פרופילים</p>
                    <p class="settings-help-text">
                        שמרו והחילו הגדרות שונות לכל תלמיד או תרחיש.
                    </p>
                </div>
                <label
                    class="inline-flex items-center gap-2 text-sm text-gray-700"
                >
                    <span>הצג פרופילים</span>
                    <input
                        type="checkbox"
                        class="!static h-[20px] w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={isProfilesUiEnabled}
                        onchange={onProfilesToggleChange}
                    />
                </label>
            </div>

            {#if isProfilesUiEnabled}
                <div class="space-y-3">
                    <div class="flex flex-col space-y-1">
                        <label
                            for="profileSelect"
                            class="font-medium text-base"
                        >
                            בחירת פרופיל:
                        </label>
                        <select
                            id="profileSelect"
                            bind:value={selectedProfileId}
                            onchange={onProfileSelectChange}
                            class="p-3 border rounded-lg text-right bg-white text-base w-full touch-manipulation"
                        >
                            {#each orderedProfiles as profile}
                                <option value={profile.id}>
                                    {profile.name}
                                    {profile.id ===
                                    profilesState.activeProfileId
                                        ? " (פעיל)"
                                        : ""}
                                </option>
                            {/each}
                        </select>
                        {#if orderedProfiles.length === 0}
                            <p class="settings-help-text">
                                עדיין אין פרופילים שמורים. צרו פרופיל חדש כדי
                                להתחיל.
                            </p>
                        {/if}
                    </div>

                    {#if hasUnsavedProfileChanges}
                        <div
                            class="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                        >
                            בוצעו שינויים בפרופיל הפעיל שטרם נשמרו. לחצו על
                            "שמור לפרופיל הנוכחי" או על "שמור" בתחתית המסך.
                        </div>
                    {/if}

                    <div class="flex flex-col gap-2 md:flex-row">
                        <button
                            onclick={applySelectedProfile}
                            class="flex-1 rounded-lg border px-4 py-2 text-base hover:bg-gray-50 transition-colors disabled:opacity-50"
                            disabled={!selectedProfileId ||
                                orderedProfiles.length === 0}
                        >
                            <span
                                class="flex items-center justify-center gap-2"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M5.5 12H3l4.5-4.5L12 12H9.5c0 3.03 2.47 5.5 5.5 5.5.97 0 1.87-.25 2.66-.69l1.52 1.52A7.95 7.95 0 0 1 15 19c-4.42 0-8-3.58-8-8Z"
                                        class="fill-current opacity-70"
                                    />
                                    <path
                                        d="M18.5 12H21l-4.5 4.5L12 12h2.5c0-3.03-2.47-5.5-5.5-5.5-.97 0-1.87.25-2.66.69L4.82 5.67A7.95 7.95 0 0 1 9 5c4.42 0 8 3.58 8 8Z"
                                        class="fill-current"
                                    />
                                </svg>
                                <span>החל פרופיל</span>
                            </span>
                        </button>
                        <button
                            onclick={saveProfileWithoutClosing}
                            class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-base text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                            disabled={!profilesState.activeProfileId}
                        >
                            <span
                                class="flex items-center justify-center gap-2"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M5 3h13l3 3v15H3V3h2Zm9 2H7v4h7V5Zm-5 6h6v8H9v-8Z"
                                        class="fill-current"
                                    />
                                </svg>
                                <span>שמור לפרופיל הנוכחי</span>
                            </span>
                        </button>
                    </div>

                    <div class="flex flex-col gap-2 md:flex-row">
                        <button
                            onclick={createNewProfileFromCurrent}
                            class="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-base hover:bg-gray-200 transition-colors"
                        >
                            <span
                                class="flex items-center justify-center gap-2"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M12 5v6h6v2h-6v6h-2v-6H4v-2h6V5h2Z"
                                        class="fill-current"
                                    />
                                </svg>
                                <span>פרופיל חדש</span>
                            </span>
                        </button>
                        <button
                            onclick={deleteSelectedProfile}
                            class="flex-1 rounded-lg border border-red-200 px-4 py-2 text-base text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            disabled={!canDeleteSelectedProfile}
                        >
                            <span
                                class="flex items-center justify-center gap-2"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M6 6h12l-1 15H7L6 6Zm5 2v10h2V8h-2Zm-5-4h4l1-1h4l1 1h4v2H3V4h3Z"
                                        class="fill-current"
                                    />
                                </svg>
                                <span>מחק פרופיל</span>
                            </span>
                        </button>
                    </div>
                </div>
            {/if}
        </section>

        <!-- סוג הפרס -->
        <section class="settings-card space-y-3 text-right">
            <div class="flex flex-col space-y-1 md:space-y-2">
                <label for="mode" class="font-medium text-base">סוג פרס:</label>
                <select
                    id="mode"
                    bind:value={newConfig.rewardType}
                    class="input"
                >
                    <option value="video">וידאו</option>
                    <option value="app" disabled={disabledAppMode}
                        >אפליקציה</option
                    >
                    <option value="site">אתר</option>
                </select>
            </div>
            <p class="settings-help-text">
                הגדירו אם הילדים מקבלים סרטון או גישה לאפליקציה לאחר הצלחה.
            </p>
        </section>

        <!-- הגדרות כלליות -->
        <section class="settings-card grid grid-cols-2 gap-4 text-right">
            <div class="flex flex-col space-y-1 md:space-y-2">
                <label for="displayTime" class="font-medium text-base"
                    >זמן הצגת מחזק (בשניות):</label
                >
                <input
                    id="displayTime"
                    type="number"
                    bind:value={videoDisplayTime}
                    min="1"
                    class="input"
                />
                <p class="settings-help-text">
                    קובע כמה זמן המחזק נשאר על המסך לפני שחוזרים למשחק.
                </p>
            </div>

            <div class="flex flex-col space-y-1 md:space-y-2">
                <label for="turnsPerVideo" class="font-medium text-base"
                    >כמה תורות עד למחזק:</label
                >
                <input
                    id="turnsPerVideo"
                    type="number"
                    bind:value={newConfig.turnsPerReward}
                    min="1"
                    class="input"
                />
                <p class="settings-help-text">
                    הגדירו כמה תורות או משימות נדרשות עד להפעלת המחזק הבא.
                </p>
            </div>
        </section>

        <!-- הגדרות מחזק אתר-->
        {#if newConfig.rewardType === "site"}
            <section class="settings-card space-y-3 text-right">
                <div class="flex flex-col space-y-1 md:space-y-2">
                    <label for="boosterUrl" class="font-medium text-base">
                        כתובת אתר המחזק:
                    </label>
                    <input
                        id="boosterUrl"
                        type="url"
                        bind:value={newConfig.booster.siteUrl}
                        placeholder="https://example.com"
                        dir="ltr"
                        inputmode="url"
                        class="input"
                    />
                </div>
                <p class="settings-help-text">
                    הזן כתובת אתר שהתלמידים יקבלו כמחזק לאחר הצלחה. ניתן להשאיר
                    ריק כדי לא להציג מחזק.
                </p>
            </section>
        {/if}

        <!-- הגדרות אפליקציה -->
        {#if newConfig.rewardType === "app"}
            <section class="settings-card space-y-4 text-right">
                <div class="flex flex-col space-y-1 md:space-y-2">
                    <label for="appName" class="font-medium text-base"
                        >שם האפליקציה:</label
                    >

                    <select
                        id="appName"
                        bind:value={newConfig.app.packageName}
                        class="p-3 border rounded-lg bg-white text-base w-full touch-manipulation"
                    >
                        {#await appListPromise}
                            <option>טוען את רשימת האפליקציות המותקנות...</option
                            >
                        {:then appList}
                            {#each appList as app}
                                <option
                                    dir="auto"
                                    value={app.package}
                                    class="text-center"
                                    style={`background-image:url('data:image/png;base64,${app.icon ?? ""}');background-repeat:no-repeat;background-position:right 0.75rem center;background-size:1.5rem;padding-inline-end:2.5rem;`}
                                >
                                    {app.label}
                                </option>
                            {:else}
                                <option selected disabled
                                    >לא נמצאו אפליקציות זמינות במכשיר</option
                                >
                            {/each}
                        {/await}
                    </select>
                    <p class="settings-help-text">
                        בחרו אפליקציה מותקנת שתיפתח כפרס לאחר שהילד משלים את
                        המשימה.
                    </p>
                </div>

                <div class="flex flex-col space-y-1 md:space-y-2">
                    <label for="appNameText" class="font-medium text-base"
                        >Package Name:</label
                    >
                    <input
                        id="appNameText"
                        type="text"
                        bind:value={newConfig.app.packageName}
                        class="input"
                        placeholder="com.example.app"
                    />
                    <p class="settings-help-text">
                        אם ברצונכם לקבוע אפליקציה שלא מופיעה ברשימה מסיבה כלשהי,
                        הזינו כאן את שאם האפליקציה המלא (מכונה לפעמים 'חתימת
                        אפליקציה') להפעלה מדויקת של האפליקציה דרך Fully Kiosk.
                        העתיקו אותו כפי שמופיע באנדרואיד.
                    </p>
                </div>

                {#await appItemPromise then item}
                    <div
                        class="flex flex-row-reverse items-center justify-between gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/70 p-3"
                    >
                        {#if item}
                            <div class="flex-1 text-right">
                                <p
                                    class="text-sm font-medium text-gray-800"
                                    dir="auto"
                                >
                                    {item.label}
                                </p>
                                <p class="settings-help-text">
                                    מאומת מול Fully Kiosk כדי לוודא שבחרתם את
                                    האפליקציה הנכונה.
                                </p>
                            </div>
                            <img
                                src={"data:image/png;base64," + item?.icon}
                                alt={item?.label + " icon"}
                                class="shrink-0 rounded-2xl border border-gray-200 bg-white
                object-contain p-1 w-20 h-20 md:w-24 md:h-24"
                            />
                        {:else}
                            <div class="flex-1 text-right">
                                <p
                                    class="text-sm font-medium text-gray-800"
                                    dir="auto"
                                >
                                    אפליקציה לא ידועה
                                </p>
                                <p class="settings-help-text">
                                    לא מצאנו את האפליקציה הזו ברשימת האפליקציות
                                    שמותקנות במכשיר.
                                </p>
                            </div>
                            <div
                                class="shrink-0 rounded-2xl border border-gray-200 bg-white p-1 w-20 h-20 md:w-24 md:h-24"
                                role="img"
                                aria-label="אפליקציה לא ידועה"
                            >
                                <svg
                                    viewBox="0 0 48 48"
                                    class="h-full w-full text-slate-400"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect
                                        width="48"
                                        height="48"
                                        rx="12"
                                        fill="#F1F5F9"
                                    />
                                    <path
                                        d="M24 30v-1.2c0-2.08 1.067-3.147 2.34-4.14C28.64 23.307 30 21.94 30 19.5 30 16.462 27.657 14 24 14c-2.77 0-4.91 1.357-5.86 3.59"
                                        stroke="currentColor"
                                        stroke-width="3"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <circle
                                        cx="24"
                                        cy="35"
                                        r="2"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                        {/if}
                    </div>
                {/await}
            </section>
        {/if}

        <!-- הגדרות וידאו -->
        {#if newConfig.rewardType === "video"}
            <section class="settings-card space-y-4 text-right">
                <div class="flex flex-col space-y-1 md:space-y-2">
                    <label for="videoSource" class="font-medium text-base"
                        >מקור הווידאו:</label
                    >
                    <select
                        id="videoSource"
                        bind:value={newConfig.video.source}
                        class="input"
                    >
                        <option value="local" disabled={isNotFullyKiosk}
                            >מקומי</option
                        >
                        <option value="google-drive">Google Drive</option>
                        <option value="youtube" disabled>YouTube</option>
                    </select>
                    <p class="settings-help-text">
                        בחרו מאיפה נטען את קבצי הווידאו – מקומי נתמך רק ב-Fully
                        Kiosk.
                    </p>
                </div>

                {#if newConfig.video.source === "google-drive"}
                    <div class="flex flex-col space-y-1 md:space-y-2">
                        <label for="folderId" class="font-medium text-base"
                            >קישור לתיקיית Google Drive:</label
                        >
                        <input
                            id="folderId"
                            type="text"
                            bind:value={newConfig.video.googleDriveFolderUrl}
                            class="input"
                            placeholder="הדביקו קישור שיתוף"
                        />
                        <p class="settings-help-text">
                            ודאו שהתיקייה משותפת או ציבורית כדי שהמערכת תוכל
                            להוריד את הסרטונים.
                        </p>
                    </div>
                {/if}

                <div
                    class="flex flex-col gap-2 rounded-lg bg-gray-50/80 p-3 text-right"
                >
                    <div
                        class="flex items-center justify-end gap-2 flex-row-reverse"
                    >
                        <label for="hideProgress" class="font-medium text-base">
                            הסתירו את פס ההתקדמות
                        </label>
                        <input
                            id="hideProgress"
                            type="checkbox"
                            bind:checked={newConfig.video.hideProgressBar}
                            class="!static w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                    <p class="settings-help-text">
                        שימושי כאשר התלמידים משחקים בפס ההתקדמות ו'תוקעים' אותו.
                    </p>
                </div>
            </section>
        {/if}

        <div
            id="show-example"
            class="flex flex-col space-y-1 md:space-y-2 text-right"
        >
            <button
                onclick={showVideo}
                class="w-full px-6 py-3 rounded-lg bg-gray-100 text-gray-800 text-base hover:bg-gray-200 transition-colors touch-manipulation"
            >
                הצגת דוגמה
            </button>
            <p class="settings-help-text">
                השתמשו בתצוגה מקדימה כדי לוודא שהפרס טעון ושזמן ההצגה מתאים.
            </p>
        </div>
    </div>
    <div
        dir="ltr"
        class="text-center settings-card text-slate-500
             flex flex-row justify-center items-center italic"
    >
        <p>Version: {config.appVersion}</p>
        <p class="mx-3">•</p>
        <p>Developed by MusiCode</p>
        <p class="mx-3">•</p>
        <p class="">2025</p>
    </div>

    {#if saveStatus}
        <div
            class="text-right text-sm"
            class:text-green-600={saveStatus === "success"}
            class:text-red-600={saveStatus === "error"}
        >
            {saveStatus === "success"
                ? "הגדרות נשמרו בהצלחה"
                : "אירעה שגיאה בשמירה"}
        </div>
    {/if}

    {#if !embedded}
        <div
            id="control-buttons"
            class="sticky bottom-0 left-0 right-0 -mx-4 bg-white/95 px-4 pb-1
    pt-4 md:-mx-6 md:px-6"
        >
            <div class="grid grid-cols-2 gap-3">
                <button
                    onclick={handleClose}
                    class="w-full px-6 py-3 rounded-lg border text-base hover:bg-gray-100 transition-colors touch-manipulation"
                >
                    סגור
                </button>
                <button
                    onclick={() => persistConfig(true)}
                    class="w-full px-6 py-3 rounded-lg bg-purple-600 text-white text-base hover:bg-purple-700 transition-colors touch-manipulation font-medium shadow-md shadow-purple-900/10"
                >
                    שמור וסגור
                </button>
            </div>
        </div>
    {/if}
</div>

<style type="text/postcss">
    @reference "tailwindcss";

    :global(.settings-card) {
        @apply rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all;
    }
    :global(.settings-help-text) {
        @apply text-xs leading-relaxed text-gray-500;
    }
    .input {
        @apply w-full rounded-lg border-gray-300 p-3 text-right shadow-sm focus:border-blue-500 focus:ring-blue-500;
    }
</style>
