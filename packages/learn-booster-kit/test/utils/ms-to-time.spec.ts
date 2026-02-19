import { describe, it, expect } from 'vitest';
import { msToTime } from '../../src/lib/utils/ms-to-time';

describe('msToTime', () => {
  it('0 -> "00:00"', () => {
    expect(msToTime(0)).toBe('00:00');
  });

  it('61000ms -> "01:01"', () => {
    expect(msToTime(61_000)).toBe('01:01');
  });

  it('3599000ms -> "59:59"', () => {
    expect(msToTime(3_599_000)).toBe('59:59');
  });

  it('60000ms -> "01:00"', () => {
    expect(msToTime(60_000)).toBe('01:00');
  });

  it('מחזיר אפסים מובילים', () => {
    expect(msToTime(5_000)).toBe('00:05');
  });

  it('ערכים שליליים - מחזיר מחרוזת עם ערכים שליליים (ללא clamp)', () => {
    // הפונקציה לא מגינה על ערכים שליליים - זו ההתנהגות הנוכחית
    const result = msToTime(-1000);
    expect(typeof result).toBe('string');
    expect(result).toBe('-1:-1');
  });
});
