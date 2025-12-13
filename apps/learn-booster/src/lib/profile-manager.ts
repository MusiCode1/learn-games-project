import { getDefaultConfig } from "./default-config";

import type {
    Config, Profile,
    ProfilesExportPayload, ProfilesState
} from '../types';

const STORAGE_KEY = 'gingim-booster-profiles:v1';
const SCHEMA_VERSION = 1;
const DEFAULT_PROFILE_NAME = 'Default Profile';

type ProfilesListener = (state: ProfilesState) => void;

let state: ProfilesState = createEmptyState();
let isInitialized = false;
const listeners: ProfilesListener[] = [];

export async function initializeProfiles(initialConfig: Config): Promise<ProfilesState> {
    if (isInitialized) {
        return getProfilesState();
    }

    loadFromStorage();

    if (state.order.length === 0) {
        const defaultProfile = buildProfile({
            name: DEFAULT_PROFILE_NAME,
            config: initialConfig,
        });

        state.profiles[defaultProfile.id] = defaultProfile;
        state.order = [defaultProfile.id];
        state.activeProfileId = defaultProfile.id;
        persistState();
    }

    isInitialized = true;
    notifyListeners();
    return getProfilesState();
}

export function addProfilesListener(listener: ProfilesListener): () => void {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    };
}

export function getProfilesState(): ProfilesState {
    return cloneState(state);
}

export function getActiveProfile(): Profile | undefined {
    if (!state.activeProfileId) return undefined;
    const profile = state.profiles[state.activeProfileId];
    if (!profile) return undefined;
    return cloneProfile(profile);
}

export function setActiveProfile(profileId: string): Profile {
    assertInitialized();
    const profile = state.profiles[profileId];
    if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
    }

    state.activeProfileId = profileId;
    state.dirtyConfig = null;
    persistState();
    notifyListeners();
    return cloneProfile(profile);
}

export function createProfile(options: {
    name: string;
    config: Config;
    color?: string;
    tags?: string[];
}): Profile {
    assertInitialized();
    const profile = buildProfile(options);
    state.profiles[profile.id] = profile;
    state.order.push(profile.id);
    if (!state.activeProfileId) {
        state.activeProfileId = profile.id;
    }
    persistState();
    notifyListeners();
    return cloneProfile(profile);
}

export function updateProfile(profileId: string, updates: Partial<Omit<Profile, 'id' | 'config' | 'meta'>> & { config?: Config }): Profile {
    assertInitialized();
    const profile = state.profiles[profileId];
    if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
    }

    if (typeof updates.name === 'string') {
        profile.name = updates.name;
    }

    if ('color' in updates) {
        profile.color = updates.color;
    }

    if ('tags' in updates) {
        profile.tags = updates.tags ? [...updates.tags] : undefined;
    }

    if (updates.config) {
        profile.config = cloneConfig(updates.config);
    }

    profile.meta.updatedAt = Date.now();
    persistState();
    notifyListeners();
    return cloneProfile(profile);
}

export function deleteProfile(profileId: string): void {
    assertInitialized();
    if (!state.profiles[profileId]) {
        return;
    }

    if (state.activeProfileId === profileId) {
        throw new Error('Cannot delete the active profile. Switch profiles first.');
    }

    delete state.profiles[profileId];
    state.order = state.order.filter(id => id !== profileId);
    persistState();
    notifyListeners();
}

export function setProfilesOrder(order: string[]): void {
    assertInitialized();
    const filteredOrder = order.filter(id => state.profiles[id]);

    if (filteredOrder.length !== state.order.length) {
        // Keep any missing ids appended at the end to avoid accidental loss
        const missingIds = state.order.filter(id => !filteredOrder.includes(id));
        state.order = [...filteredOrder, ...missingIds];
    } else {
        state.order = filteredOrder;
    }

    persistState();
    notifyListeners();
}

export function setProfilesUiEnabled(enabled: boolean): void {
    assertInitialized();
    if (state.uiEnabled === enabled) return;
    state.uiEnabled = enabled;
    persistState();
    notifyListeners();
}

export function markDirtyConfig(config: Config): void {
    assertInitialized();
    state.dirtyConfig = cloneConfig(config);
    notifyListeners();
}

export function clearDirtyConfig(): void {
    assertInitialized();
    if (!state.dirtyConfig) return;
    state.dirtyConfig = null;
    notifyListeners();
}

export function saveActiveProfileConfig(config: Config): Profile {
    assertInitialized();
    if (!state.activeProfileId) {
        throw new Error('No active profile to update.');
    }

    const profile = state.profiles[state.activeProfileId];
    if (!profile) {
        throw new Error('Active profile is missing.');
    }

    profile.config = cloneConfig(config);
    profile.meta.updatedAt = Date.now();
    state.dirtyConfig = null;
    persistState();
    notifyListeners();
    return cloneProfile(profile);
}

export function exportProfiles(): ProfilesExportPayload {
    assertInitialized();
    const profiles = state.order
        .map(id => state.profiles[id])
        .filter((profile): profile is Profile => Boolean(profile))
        .map(profile => cloneProfile(profile));

    return {
        schemaVersion: SCHEMA_VERSION,
        profiles,
        activeProfileId: state.activeProfileId,
        uiEnabled: state.uiEnabled,
    };
}

export function importProfiles(payload: ProfilesExportPayload, options: { replace?: boolean } = {}): ProfilesState {
    assertInitialized();

    if (payload.schemaVersion !== SCHEMA_VERSION) {
        throw new Error(`Unsupported profiles schema version: ${payload.schemaVersion}`);
    }

    const nextState = options.replace ? createEmptyState() : cloneState(state);

    if (options.replace) {
        nextState.uiEnabled = payload.uiEnabled ?? false;
    } else {
        nextState.uiEnabled = payload.uiEnabled ?? nextState.uiEnabled;
    }

    const importedProfiles: Record<string, Profile> = {};
    const importedOrder: string[] = [];

    for (const profile of payload.profiles) {
        if (!profile || typeof profile !== 'object') continue;
        const normalized = buildProfile({
            id: profile.id,
            name: profile.name,
            color: profile.color,
            tags: profile.tags,
            config: profile.config,
            createdAt: profile.meta?.createdAt,
            updatedAt: profile.meta?.updatedAt,
        });

        importedProfiles[normalized.id] = normalized;
        importedOrder.push(normalized.id);
    }

    if (options.replace) {
        nextState.profiles = importedProfiles;
        nextState.order = importedOrder;
    } else {
        nextState.profiles = { ...nextState.profiles, ...importedProfiles };
        const existingIds = new Set(nextState.order);
        nextState.order = [
            ...nextState.order,
            ...importedOrder.filter(id => !existingIds.has(id)),
        ];
    }

    nextState.activeProfileId = (payload.activeProfileId && importedProfiles[payload.activeProfileId])
        ? payload.activeProfileId
        : nextState.order[0] ?? null;

    nextState.dirtyConfig = null;

    state = normalizeState(nextState);
    persistState();
    notifyListeners();

    return getProfilesState();
}

function notifyListeners(): void {
    const snapshot = getProfilesState();
    listeners.forEach(listener => listener(snapshot));
}

function persistState(): void {
    state = normalizeState(state);
    if (!isStorageAvailable()) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save profiles to storage:', error);
    }
}

function loadFromStorage(): void {
    if (!isStorageAvailable()) return;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as ProfilesState | null;
        if (!parsed) return;
        state = normalizeState(parsed);
    } catch (error) {
        console.error('Failed to load profiles from storage:', error);
        state = createEmptyState();
    }
}

function normalizeState(value: Partial<ProfilesState>): ProfilesState {
    const normalized: ProfilesState = {
        schemaVersion: SCHEMA_VERSION,
        profiles: {},
        order: [],
        activeProfileId: null,
        uiEnabled: Boolean(value.uiEnabled),
        dirtyConfig: null,
    };

    if (value.profiles && typeof value.profiles === 'object') {
        for (const [id, profile] of Object.entries(value.profiles)) {
            if (!profile) continue;
            normalized.profiles[id] = buildProfile({
                id: profile.id,
                name: profile.name ?? DEFAULT_PROFILE_NAME,
                color: profile.color,
                tags: profile.tags,
                config: profile.config ?? value.dirtyConfig ?? buildFallbackConfig(),
                createdAt: profile.meta?.createdAt,
                updatedAt: profile.meta?.updatedAt,
            });
        }
    }

    if (Array.isArray(value.order)) {
        normalized.order = value.order.filter(id => normalized.profiles[id]);
    }

    // Append any missing ids (in case order was not persisted)
    for (const id of Object.keys(normalized.profiles)) {
        if (!normalized.order.includes(id)) {
            normalized.order.push(id);
        }
    }

    if (normalized.order.length === 0) {
        normalized.activeProfileId = null;
    } else {
        const candidate = value.activeProfileId;
        normalized.activeProfileId = candidate && normalized.profiles[candidate]
            ? candidate
            : normalized.order[0];
    }

    return normalized;
}

function cloneState(value: ProfilesState): ProfilesState {
    return {
        schemaVersion: value.schemaVersion,
        profiles: Object.fromEntries(
            Object.entries(value.profiles).map(([id, profile]) => [id, cloneProfile(profile)]),
        ),
        order: [...value.order],
        activeProfileId: value.activeProfileId,
        uiEnabled: value.uiEnabled,
        dirtyConfig: value.dirtyConfig ? cloneConfig(value.dirtyConfig) : null,
    };
}

function buildProfile(options: {
    id?: string;
    name: string;
    config: Config;
    color?: string;
    tags?: string[];
    createdAt?: number;
    updatedAt?: number;
}): Profile {
    const createdAt = options.createdAt ?? Date.now();
    const updatedAt = options.updatedAt ?? createdAt;

    return {
        id: options.id ?? createProfileId(),
        name: options.name || DEFAULT_PROFILE_NAME,
        color: options.color,
        tags: options.tags ? [...options.tags] : undefined,
        config: cloneConfig(options.config),
        meta: {
            createdAt,
            updatedAt,
        },
    };
}

function cloneProfile(profile: Profile): Profile {
    return {
        ...profile,
        tags: profile.tags ? [...profile.tags] : undefined,
        config: cloneConfig(profile.config),
        meta: { ...profile.meta },
    };
}

function cloneConfig(config: Config): Config {
    return typeof structuredClone === 'function'
        ? structuredClone(config)
        : JSON.parse(JSON.stringify(config));
}

function buildFallbackConfig(): Config {
    return getDefaultConfig();
}

function assertInitialized(): void {
    if (!isInitialized) {
        throw new Error('Profile manager was not initialized. Call initializeProfiles() first.');
    }
}

function isStorageAvailable(): boolean {
    try {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
        return false;
    }
}

function createEmptyState(): ProfilesState {
    return {
        schemaVersion: SCHEMA_VERSION,
        profiles: {},
        order: [],
        activeProfileId: null,
        uiEnabled: false,
        dirtyConfig: null,
    };
}

function createProfileId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `profile-${Math.random().toString(36).slice(2, 11)}`;
}
