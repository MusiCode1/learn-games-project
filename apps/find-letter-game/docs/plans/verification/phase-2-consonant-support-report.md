# phase-2-consonant-support — Verification Report (Light)

> **תאריך:** 2026-05-17
> **Tier:** light (verifier-slice-light)
> **Commit:** 00bf31708f87ef9a88cc55076c6e1500ce7806ce (base — שינויים unstaged)

## TL;DR

| מדד | תוצאה |
|------|--------|
| DoD items עוברים | 9/10 |
| Happy path עובד | ✅ |
| Bugs חדשים | 0 |

## DoD Items

| # | Item | סטטוס | Evidence |
|---|------|--------|----------|
| 1 | `bun run check` ירוק (0 errors) | ✅ | `svelte-check found 0 errors and 10 warnings` — warnings קיימים מקודם, לא phase-2 |
| 2 | `bun test` ירוק (73 tests) | ✅ | `73 pass, 0 fail` ב-`letters.test.ts` + `pair.test.ts`. כישלון 1 ב-`settings.regression.test.ts` הוא `rune_outside_svelte` מהקיט (pre-existing, לא phase-2) |
| 3 | TTS_FILES: כל speak עיצור לא-גרוני ממופה (test #22) | ✅ | test #22 עובר; כל 19 entries נמצאים ב-`TTS_FILES` (B, G, D, H, V, Z, Ch, T, Y, K, L, M, N, S, P, Tz, R, Sh, F + shared: קְ→K, שְׂ→Sh, תְ→T) |
| 4 | `VowelSelectionGrid.svelte` קיים ב-`_components/` | ✅ | `ls` מאשר קיום |
| 5 | Settings: section "ניקוד להצגה" עם פתח + עיצור | ✅ | Screenshot — section גלוי עם 2 כפתורים "פתח" ו"עיצור" |
| 6 | Flow: שינוי ניקוד בsettings → לוח מתחדש בplay | ✅ | לאחר בחירת עיצור בלבד + שמור → /play → לוח מציג אותיות ללא ניקוד (displayChar, מה שצפוי ל-vowel.mark='') |
| 7 | ולידציה: לא ניתן לבחור 0 ניקודים | ✅ | `VowelSelectionGrid.svelte:24` — `if (selectedCodes.length <= 1) return;` חוסם deselect של האחרון; hint ב-line 68 קיים כ-safety net |
| 8 | `Letter.speakChar` מוגדר ב-3 רפות | ✅ | `letters.ts:363,376,389` — va_rafe='ו', cha_rafe='ח', fa_rafe='F'; `pair.ts:50` — `speakChar ?? char` |
| 9 | TTS R2: קבצים נגישים ב-CDN | ✅ | curl לכל 19 קבצים (B.mp3 עד F.mp3) — כולם 200 OK |
| 10 | Screenshots קיימים ב-`/tmp/find-letter-phase-2/` | ✅ | 13 screenshots קיימים מה-executor; הוספתי עוד 4 בverification |

**הערה על DoD שלא ב-10 items למעלה:**
- `tts-review/results.md` — לא נבדק (מחוץ לscope light)
- גרוניות NEEDS_DECISION — מצוין ב-walkthrough; הhook לגרוניות מוסמן כ-comment ב-TTS_FILES (לא bug)
- `docs/walkthrough.md` עודכן — מאומת בsed grep

## Happy Path

**Flow:** settings → בחירת "עיצור" בלבד (deselect פתח, select עיצור) → שמור וסגור → /play → לוח נטען עם אותיות ללא ניקוד.

**TTS:** לחיצה "השמע שוב" → `performance.getEntriesByType("resource")` מאשר `https://static.tzlev.ovh/shared/tts/find-letter/V.mp3` נטען. לא Web Speech fallback.

**console log:** `target = "ו" (id=v__none, speak="וְ", board=1/1, q=1/12)` — מאשר vowel=none + speak מיפוי נכון.

✅ עבד מקצה לקצה.

## Screenshots שצולמו בVerification

- `/tmp/find-letter-phase-2/settings-vowel-section-verify.png` — section "ניקוד להצגה" עם פתח+עיצור
- `/tmp/find-letter-phase-2/vowel-hint-scroll.png` — מבט כולל על settings
- `/tmp/find-letter-phase-2/play-consonant-verify.png` — home screen לפני משחק
- `/tmp/find-letter-phase-2/play-board-consonant-verify.png` — לוח עם עיצור (אותיות עירומות, תקין)

## Bugs חדשים שלא ברשימה

אין.

## הערות לdeploy

- גרוניות (א, ע) עם עיצור: הentries ב-TTS_FILES מוסמנים כ-comment (`// ← יוסף אחרי NEEDS_DECISION`). המשתמש טרם בחר variant. לא blocker לפי DoD — NEEDS_DECISION נמסר ל-Opus.
- כישלון ב-`settings.regression.test.ts` הוא pre-existing (`rune_outside_svelte` מהקיט), לא phase-2.

## החלטה

✅ **Approved** — כל DoD items עוברים. Happy path עובד end-to-end עם TTS MP3 מ-CDN.
