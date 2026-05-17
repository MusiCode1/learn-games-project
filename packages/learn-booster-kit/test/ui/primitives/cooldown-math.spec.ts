import { describe, it, expect } from 'vitest';
import { cooldownProgress } from '../../../src/ui/primitives/cooldown-math';

describe('cooldownProgress', () => {
	it('מחזיר 0 בתחילת ה-cooldown', () => {
		const now = 1000;
		const untilTs = 2000; // 1000ms מאוחר יותר
		const durationMs = 1000;
		expect(cooldownProgress(now, untilTs, durationMs)).toBe(0);
	});

	it('מחזיר 1 כשה-cooldown הסתיים', () => {
		const now = 2000;
		const untilTs = 1500; // כבר עבר
		const durationMs = 1000;
		expect(cooldownProgress(now, untilTs, durationMs)).toBe(1);
	});

	it('מחזיר 0.5 באמצע ה-cooldown', () => {
		const now = 1500;
		const untilTs = 2000;
		const durationMs = 1000;
		expect(cooldownProgress(now, untilTs, durationMs)).toBe(0.5);
	});

	it('מטפל ב-durationMs=0 ללא חלוקה באפס', () => {
		expect(cooldownProgress(1000, 2000, 0)).toBe(1);
	});

	it('מגביל ל-[0, 1] — לא חורג', () => {
		// now לפני ה-cooldown (משחה את durationMs בהרבה)
		expect(cooldownProgress(0, 5000, 1000)).toBe(0);
		// now אחרי ה-cooldown בהרבה
		expect(cooldownProgress(9000, 1000, 1000)).toBe(1);
	});
});
