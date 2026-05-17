# Sonnet Pitfalls — find-letter-game

> ‏מסמך מצטבר של מוקשים ו-anti-patterns ספציפיים שצריכים להופיע **בכל brief** שמועבר ל-Sonnet executor בפרויקט הזה.
>
> ‏מקור הרציונל: [`~/.agents/skills/planner-executor-research/`](file:///home/user/.agents/skills/planner-executor-research/) — מסקנות מ-Slice 9 של voice-acp.
>
> ‏עדכון: כל פעם ש-verifier-slice מוצא באג שלא תועד פה — מוסיפים. גדל עם הזמן.

---

## 1. מוקשי `$state` ו-Svelte 5

### 1.1 `$state.snapshot` לא מכבד `toJSON` על object literal

‏Sonnet נוטה "לתקן" קוד שעובד עם הצעות אלגנטיות. ‏ב-`stores/settings.svelte.ts` ‏הוא עלול להחליף את ‏`dataSnapshot()` ‏ב-`$state.snapshot()` ‏או להוסיף `toJSON` למתודה ב-`$state({...})`.

‏**שניהם שוברים:** ‏`$state.snapshot` ‏על object עם `toJSON` נכשל ב-`state_snapshot_uncloneable`; ‏ה-snap החוזר מכיל פונקציה ‏ש-`structuredClone` ‏של `cloneConfig` ב-kit לא יכול לשכפל → `DataCloneError`.

‏**הכלל:** ‏`dataSnapshot()` ‏בונה plain object ידנית מ-`DATA_KEYS`. ‏לא לגעת.

### 1.2 `$effect` שקורא וכותב לאותו `$state` = infinite loop

‏אם Sonnet כותב `$effect(() => { settings.x = computeX() })` ‏שגם קורא ‏את `settings.y` המקושר ל-`x` — לולאה אינסופית.

‏**הכלל:** ‏עוטפים writes ב-`untrack()` מ-`svelte`.

---

## 2. מוקשי מחיקה / refactor

### 2.1 מחיקה חלקית של `utils/letters.ts`

‏בפאזה 1 (refactor) המאגר עובר ל-`data/letters.ts`. ‏Sonnet נוטה ל-refactor במקום rebuild: ‏ישאיר חצאי-מבנים, ייצר imports שבורים, או יישאיר `LetterCard` ישן ‏ש-`pickBoard` ‏מצפה לו.

‏**הכלל:** ‏לכל מחיקה — file:line קונקרטי ‏ב-brief, ‏ו-`grep -r "LetterCard"` ‏בסוף הפאזה.

### 2.2 שמירת backward-compat דרך shims, לא דרך duplications

‏אם נדרש לשמור על API ישן (למשל `getLettersByIds`), ‏זה shim שקורא ל-API החדש. ‏לא להחזיק שני מאגרים מקבילים.

---

## 3. מוקשי TTS

### 3.1 ייצור batch בלי האזנה ידנית

‏Sonnet נוטה לייצר 26 קבצי MP3 ברצף, ‏לבדוק שכולם נוצרו בלי שגיאות, ‏ולסיים. ‏ה-test runner ירוק, אבל הקבצים בפועל באיכות גרועה (פוסט-תהליך eleven_v3 משתנה).

‏**הכלל:** ‏ב-brief מצוין במפורש: ‏"אחרי ייצור MP3, ‏האזן ידנית לכל קובץ דרך linux-gui-browser (או הצג URL למשתמש), ‏רק אז סמן את ה-pair כ-ready". ‏ה-verifier-slice יבדוק שהיתה האזנה (לפי תיעוד ב-walkthrough).

### 3.2 גרוניות (א, ע) + עיצור — לא ב-`speak: letter + שווא`

‏ה-`speakSuffix` הסטנדרטי (`letter + שווא נח`) ‏לא ייצר את הצליל הרצוי לאות גרונית. ‏צריך אחת מ-3 דרכים (תעתיק לטיני, audio tags, קובץ ידני). ‏לא לקבל את הברירת מחדל ‏עבור `<a, none>` ו-`<aa, none>` ‏בלי בדיקה.

### 3.3 קמץ ≠ פתח **בכרטיס**, ≡ פתח **ב-MP3**

‏שני pairs נפרדים. ‏אותו `speak`, ‏אותו קובץ MP3. ‏Sonnet עלול לאחד אותם לכרטיס יחיד או ליצור שני קבצי MP3 זהים. ‏לתעד במפורש.

### 3.4 שורוק (`וּ`) — unicode מורכב

‏הוא מורכב מ-`U+05D5` (ו') + `U+05BC` (דגש). ‏על אות שאינה ו, ה-`display` הוא `letter + ו + dagesh`. ‏Sonnet עלול להניח שזה combining mark יחיד. ‏לתעד את המבנה ‏ב-brief.

---

## 4. מוקשי צנרת בין-stores / modules

### 4.1 Settings → Game State — לא לשכוח לחדש deck

‏כש-`selectedVowels` משתנה ב-settings, ‏ה-deck של game-state חייב להיבנות מחדש. ‏Sonnet עלול ליצור `$effect` ב-settings בלי לעדכן את game-state.

‏**הכלל:** ‏לתעד ב-Data Flow Bridges table ‏את המנגנון — ‏אם זה `$effect` ב-game-state ‏שמאזין ל-settings, ‏או callback מפורש.

### 4.2 Migration v3→v4 — לבדוק עם localStorage אמיתי

‏Sonnet יכתוב migration ‏ו-unit test על JSON. ‏לא יבדוק עם localStorage של גרסה ישנה אמיתית. ‏אם migration שוגה — משתמשים קיימים יאבדו settings.

‏**הכלל:** ‏ה-verifier-phase אחרי migration ‏יעמיד localStorage עם payload v3 ‏ויבדוק שהמשחק עולה עם `selectedVowels = ['patah']`.

### 4.3 `null` כ-placeholder לערך שיתמלא מאוחר

‏Anti-pattern קלאסי. ‏אם `vowel` של pair לא זמין עדיין — ‏לא להעביר `null`, ‏אלא להחזיר מוקדם ‏(`if (!vowel) return;`).

---

## 5. מוקשי UI

### 5.1 CSS = שטח מת

‏Sonnet כותב CSS ועובר הלאה ‏בלי לפתוח דפדפן. ‏לכל phase שמשפיע על UI — ‏חובה screenshot ‏(במסגרת DoD ויזואלי).

### 5.2 Mobile + Desktop

‏לבדוק את שני viewports. ‏Sonnet נוטה לבדוק רק את אחד מהם ‏(לרוב mobile).

### 5.3 RTL + מיקום `dir`

‏הפרויקט RTL. ‏fieldset חדש של ניקוד חייב לשמור על כיוון. ‏אם Sonnet משתמש ב-`margin-left`/`margin-right` (physical) ‏במקום `ms-*`/`me-*` (logical) — ‏ייתפס.

---

## 6. מוקשי integrasion ספציפיים לפרויקט

### 6.1 Tailwind `@source` ל-kit

‏אם Sonnet מוסיף קומפוננטות מ-`learn-booster-kit` ‏ולא מוסיף `@source "../../../../packages/learn-booster-kit"` ‏ב-`app.css` — ‏הסטיילים יילקחו ככלום.

### 6.2 `boosterService.init()` חייב לרוץ פעם אחת

‏בכל קומפוננטה שצורכת config — ‏`await boosterService.init()` ‏לפני שימוש. ‏זה idempotent.

### 6.3 `fully-kiosk-js` כבר מצהיר על `Window.fully`

‏אם Sonnet מוסיף `declare global` ב-`tts.ts` — duplicate. ‏השתמש ב-cast מקומי.

---

## 7. תזכורת DoD ויזואלי

‏בכל brief, ה-DoD חייב לכלול:

‏- ‏`bun run check` ירוק
‏- ‏`bun test` ירוק
‏- ‏Screenshot של כל UI flow קריטי ב-`/tmp/find-letter-<phase>/<flow>.png`
‏- ‏Mobile (390×844) + desktop (1280×800) שניהם
‏- ‏Manual e2e walkthrough תועד ב-walkthrough.md
‏- ‏אם פאזה כוללת migration — בדיקה עם localStorage של גרסה ישנה
‏- ‏אם פאזה כוללת TTS — האזנה ידנית לכל קובץ MP3 חדש
‏- ‏ב-refactor "ניטרלי למשתמש" — ‏screenshots לפני/אחרי שדורשים זהות visuelle

## 8. Per-Phase Testing Strategy

‏כל sub-phase ב-brief חייב להכיל ערך `Testing:` ‏מפורש. ‏ה-executor מכבד את הבחירה ולא חולק. ‏ערכים אפשריים:

| ערך | מתי |
|-----|-----|
| `tdd` | ‏Logic חדש, ‏state machine, ‏schema, ‏protocol |
| `integration` | ‏Wiring, refactor, ‏glue code |
| `manual` | UI, CSS, UX flows |
| `none` | docs, config, pure rename |

‏אם הplanner שכח לציין — ‏ה-executor יקבע default לפי תוכן ה-phase. ‏אבל **‏עדיף לציין במפורש** ‏כדי למנוע ויכוח באמצע.

‏אם executor לא מסכים — `STATUS: BLOCKED` ‏עם הסבר, ‏לא סטייה.

---

*‏עדכון אחרון: 2026-05-17. ‏מתעדכן בכל פעם ש-verifier מוצא דפוס חדש.*
