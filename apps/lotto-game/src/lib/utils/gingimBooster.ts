import { boosterService } from 'learn-booster-kit';

export function initBooster() {
	if (typeof window === 'undefined') return;

	try {
		boosterService.init().catch((err: any) => console.error('Failed to init booster:', err));
	} catch (e) {
		console.error('Error initializing booster service:', e);
	}
}

export async function triggerReward() {
	try {
		await boosterService.triggerReward();
	} catch (e) {
		console.error('Error triggering reward:', e);
	}
}

export function cleanupBooster() {
	// BoosterService is a singleton and manages its own state
}
