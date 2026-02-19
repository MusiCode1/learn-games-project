import { describe, it, expect } from 'vitest';
import { utils } from '../src';

const { shuffleArray } = utils;

describe('shuffleArray', () => {
  it('מחזיר מערך עם אותם אלמנטים', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual([...input].sort());
  });

  it('לא משנה את המערך המקורי', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffleArray(input);
    expect(input).toEqual(copy);
  });

  it('מחזיר מערך ריק על קלט ריק', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('מחזיר עותק עם אותו אלמנט עבור מערך עם אלמנט יחיד', () => {
    const result = shuffleArray(['only']);
    expect(result).toEqual(['only']);
  });

  it('מערבב את המערך (סטטיסטית - על מערך גדול צפוי סדר שונה)', () => {
    const input = Array.from({ length: 20 }, (_, i) => i);
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(shuffleArray(input).join(','));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
