// @vitest-environment jsdom
/**
 * בדיקות מיגרציית localStorage — config-manager
 *
 * לפני רפקטורינג: המפתח הוא "gingim-booster-config"
 * אחרי שלב 7 ברפקטורינג: המפתח יהיה "learn-booster-config"
 *
 * הבדיקות הנוכחיות (it) מתארות את ההתנהגות לפני הרפקטורינג.
 * הבדיקות העתידיות (it.todo) מתארות את ההתנהגות הצפויה אחריו.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configManager } from './src';

const { saveConfigToStorage, loadConfigFromStorage } = configManager;

const OLD_KEY = 'gingim-booster-config';
const NEW_KEY = 'learn-booster-config';

beforeEach(() => {
  localStorage.clear();
});

describe('config-manager — מפתח localStorage נוכחי (אחרי רפקטורינג)', () => {
  it('שומר תחת המפתח החדש', () => {
    saveConfigToStorage();
    expect(localStorage.getItem(NEW_KEY)).not.toBeNull();
  });

  it('טוען מהמפתח החדש', () => {
    saveConfigToStorage();
    expect(loadConfigFromStorage()).toBe(true);
  });

  it('אין שמירה תחת המפתח הישן אחרי הרפקטורינג', () => {
    saveConfigToStorage();
    expect(localStorage.getItem(OLD_KEY)).toBeNull();
  });
});

describe('config-manager — מיגרציה (אחרי שלב 7 ברפקטורינג)', () => {
  it.todo('מפתח ישן קיים → מועתק למפתח חדש, הישן נמחק');
  it.todo('מפתח חדש כבר קיים → לא דורסים');
  it.todo('שני המפתחות קיימים → החדש גובר');
  it.todo('אף מפתח לא קיים → ברירת מחדל');
  it.todo('לאחר מיגרציה: שמירה הולכת למפתח החדש');
});
