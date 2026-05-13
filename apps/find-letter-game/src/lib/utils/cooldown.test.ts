import { computeCooldownView } from './cooldown';

test('מחזיר remainingMs נכון כש-cooldown פעיל', () => {
	const v = computeCooldownView(1000, 600, 1000);
	expect(v.remainingMs).toBe(400);
	expect(v.isActive).toBe(true);
});

test('מחזיר isActive=false ו-remainingMs=0 כשהזמן עבר', () => {
	const v = computeCooldownView(1000, 1000, 1000);
	expect(v.isActive).toBe(false);
	expect(v.remainingMs).toBe(0);
});

test('remainingMs לא שלילי כשהשעון עבר את untilTs', () => {
	const v = computeCooldownView(500, 2000, 1000);
	expect(v.remainingMs).toBe(0);
	expect(v.isActive).toBe(false);
});

test.each([
	[399, 1],
	[1000, 1],
	[1001, 2],
	[0, 0],
])('remainingSec הוא ceil — remainingMs=%ims → %i שניות', (ms, expected) => {
	const now = 5000;
	const v = computeCooldownView(now + ms, now, 2000);
	expect(v.remainingSec).toBe(expected);
});

test('progress יורד מ-1 ל-0 לאורך durationMs', () => {
	expect(computeCooldownView(1000, 0, 1000).progress).toBeCloseTo(1);
	expect(computeCooldownView(1000, 500, 1000).progress).toBeCloseTo(0.5);
	expect(computeCooldownView(1000, 1000, 1000).progress).toBeCloseTo(0);
});

test('לא קורס כש-durationMs הוא 0', () => {
	const v = computeCooldownView(0, 0, 0);
	expect(v.isActive).toBe(false);
	expect(v.progress).toBe(0);
	expect(v.remainingMs).toBe(0);
});
