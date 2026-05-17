# יומן פיתוח (Walkthrough)

מסמך זה מתעד שינויים **חוצי פרויקטים** ותשתית כללית במונוריפו.

לתיעוד ספציפי של כל פרויקט, ראה את קובץ `docs/walkthrough.md` בתוך תיקיית הפרויקט.

---

## 2026-05-17 12:30

### Pilot מיגרציה ראשון: find-letter-game משתמש ב-configManager של הקיט

POC להוכחה שהמכניזם של `gameSettings` בפרופיל (שבנה הסוכן המקביל
בקיט) עובד בפועל על משחק חי. הניסוי בוצע על branch ניסיוני
(`experiment/find-letter-config-manager`) ומוזג ל-dev אחרי בדיקה
ידנית מקיפה בדפדפן.

#### מה בוצע?

**1. הרחבת ה-API של הקיט — namespace `configManager`** (1 שורה, additive)

ב-`packages/learn-booster-kit/src/index.ts` נוסף:
```ts
export * as configManager from './lib/config/config-manager';
```

מאפשר ל-consumers לייבא `configManager.X()` במקום named imports
בודדים. ה-flat exports הקיימים נשמרו ל-tree-shaking.

**2. מיגרציית `SettingsStore` של find-letter ל-configManager**

הקובץ `apps/find-letter-game/src/lib/stores/settings.svelte.ts` עבר
שכתוב משמעותי:

- `class SettingsStore` הוסר → `export const settings = $state({...})`
- מקור-אמת יחיד: `makeDefaults()` + `type = ReturnType<typeof makeDefaults>`
- Derivations (`totalCellsInGrid` וכו') נשארות כ-reactive getters
- Echo cancellation דרך `JSON.stringify` compare (אין flag stateful)
- Fast-path: קריאה ישירה מ-`learn-booster-profiles:v1` ב-localStorage,
  כדי שה-settings יופיעו מיד בלי להמתין ל-`boosterService.init` (שטוען
  Google Drive — איטי)
- מיגרציה חד-פעמית מהמפתח legacy `find-letter-game-settings`
- Filter ל-intermediate notifications מהקיט (cache stale)
- **אפס שינוי בקומפוננטות צרכניות** — אותו API ל-`settings.gridSize` וכו'

**3. 6 regression tests חדשים**

`settings.regression.test.ts` מגן מ-3 הבאגים שזוהו בבדיקה:
- toJSON בתוך $state יוצר state_snapshot_uncloneable
- DataCloneError ב-cloneConfig של הקיט מונע sync לפרופיל
- selectedLetterIds כ-proxy שובר structuredClone

**4. מסמכים תכנוניים**

- `docs/find-letter-config-migration.md` — ה-spec ההיסטורי של הניסוי
- `docs/component-system-spec.md` — spec של מערכת הקומפוננטות
  המשותפת (4 חלקים, 30 קומיטים, נכתב ע"י Opus ובוצע ע"י Sonnet
  במהלך אותו סשן)

#### החלטות ארכיטקטורה

- **Adapter pattern, לא Reactive Wrapper בקיט** (אופציה A מתוך 2-3
  שנשקלו): נשאר ה-SettingsStore כ-reactive layer ב-find-letter,
  רק ה-storage backend עבר ל-configManager. הקיט לא ידע על Svelte
  reactivity, וכל משחק עתידי שירצה adapter יעתיק את הקובץ הזה
  ויתאים. אם נמיגר 3+ משחקים — אז שווה להוציא ל-factory בקיט.

- **`learn-booster-profiles:v1` הוא ה-source of truth, לא
  `learn-booster-config`**: ה-cache של הקיט עלול להיות stale
  (מ-buggy $effect שרץ לפני init). הfilter בקובץ שלנו מסתמך על
  הפרופיל הישיר.

- **$state אובייקט יחיד עם getters, לא class עם 9 שדות**: דרישה
  של המשתמש לאיחוד ה-DRY (9 שדות פעם אחת ב-`makeDefaults()`,
  לא 5×9=45). ה-API לצרכן זהה לחלוטין ל-class הישן.

#### מעקפים ופתרונות

- **`$state.snapshot()` לא מכבד `toJSON` ב-object literal**: נכתב
  ב-learnings.md הגלובלי. הפתרון: helper `dataSnapshot()` עצמאי
  שבונה plain object מ-DATA_KEYS.

- **`subscribeGameSettings` יורה סינכרונית מיד עם הרישום**: יוצר
  אתגר ל-init order. הפתרון: ב-callback עם `s === undefined`,
  לאתחל את `lastSyncedJson` ל-snapshot של ה-state הנוכחי, כך
  שה-$effect הראשון יראה "אותו דבר" וידלג.

#### מצב אחרי merge ל-dev

- 3 קומיטים נוספו לdev (`d192770`, `1ebc02f`, `8d6cce4`)
- branch ניסיוני נמחק לאחר merge מוצלח
- production build נבדק בדפדפן (`musicode-find-letter-exp.nue.tuns.sh`)
- אם יש להגר משחקים נוספים — הקובץ של find-letter הוא ה-template

---

## 2026-05-16 16:30

### כללי קוד מאוחדים — `AGENTS.md` + `coding-conventions.md` + `functional-programming.md`

איחוד כללי הקוד למסמכים מרכזיים בעקבות זיהוי פיזור: היו כללים ב-`GEMINI.md` של ה-root, ב-`AGENTS.md` של חלק מה-apps (wordys-game היחיד מפורט, השאר רק Svelte MCP), וב-`apps/read-faster/ללא כותרת.md` (שכלל את החלק המפורט ביותר על FP ו-Result type).

#### מה בוצע?

**1. `AGENTS.md` בשורש (חדש)** — entry point רזה

- תקציר של הכללים הקריטיים (שפה, stack, FP, תהליך עבודה, files)
- 7 "חוקי זהב" חיוביים (החזר Result, השתמש ב-language.ts, וכו')
- הפניות ל-5 מסמכי תיעוד עיקריים
- מבנה הפרויקט בקיצור

**2. `docs/coding-conventions.md` (חדש)** — 11 פרקים על קוד

- שפה ותקשורת (עברית למשתמש, אנגלית לשמות)
- Stack (SvelteKit 5, Tailwind 4, Bun, ArkType)
- TypeScript + Svelte 5 (runes, snippets, onclick, $bindable)
- שמות קבצים (PascalCase / kebab-case / `.svelte.ts`)
- מבנה תיקיות עם co-location
- **תיעוד פר-app** — מסומן כ"בתהליך" (~5/12 apps מכילים `AGENTS.md` עדיין)
- תהליך עבודה עם **3 מודלי אישור לקומיטים**:
  - מודל א — Per-commit (ברירת מחדל)
  - מודל ב — Batch approval (כמה קומיטים יחד עם אישור גלובלי)
  - מודל ג — Session-level autonomous (לסשנים ללא השגחה, ברשות מפורשת)
- בדיקות (עברית מומלץ, אנגלית מקובל, עקביות בקובץ)

**3. `docs/functional-programming.md` (חדש)** — כללי FP

- "Functional Core, Imperative Shell" כעיקרון מנחה
- מה כן: pure functions בלוגיקה (migrate, validate, shuffle, score)
- מה לא: FP אגרסיבי ב-UI / על Svelte runes
- `Result<T, E>` במקום `throw` ב-public API
- ❌ לא Effect.ts / fp-ts / monads
- Composition over inheritance
- Checklist לפני כל פונקציה חדשה
- מצב הפרויקט נכון לעכשיו + יעדי המרה

**4. מחיקת `GEMINI.md` בשורש**

- הוסר. הוא הכיל "Project Rules for Wordy's Game" שעלו עכשיו כפילות עם `AGENTS.md` החדש.
- Gemini CLI יקרא `AGENTS.md` אם `GEMINI.md` לא קיים.

#### החלטות ארכיטקטורה

- **מבנה היברידי: AGENTS.md רזה + מסמכים מפורטים**: בחירה בין מסמך-יחיד גדול לבין AGENTS.md + מסמכים מודולריים. בחרנו במודולרי כי כל מסמך מתחזק את עצמו בקצב משלו (game-design-rules ו-functional-programming השונים בעולמם), וה-AGENTS.md משמש כ-index.

- **FP חכם ולא קנאי**: לא Effect.ts/fp-ts. בעיקר Result type ו-pure helpers. Svelte 5 runes נשארים native (mutable). ה-tradeoff: לא port-able ל-Go (לא יעד פה), אבל גם לא נלחמים ב-framework.

- **ArkType ולא Zod**: הקיט כבר משתמש ב-ArkType. read-faster המליץ Zod, אבל הוא חריג. במונוריפו — ArkType סטנדרט.

- **אסור `&&` באופן מלא**: סתירה בין `GEMINI.md` הישן (התיר `&&`) לבין סקיל `commit` (אסר). הכרענו ל"אסור" כי הוא מאפשר בדיקת פלט בין פקודות.

- **3 מודלי אישור**: per-commit לעבודה בליווי, batch לעבודה רציפה, autonomous לריצות לילה. המודלים נבחרים לפי הסכמה גלובלית בתחילת הסשן, לא פר-קומיט.

#### מעקפים ופתרונות

- **שמות טסטים מעורבים**: סקרנו את כל קבצי הטסט וגילינו שלא כל הטסטים בעברית. במקום לכפות אחידות מלאה, הכלל הוא "עברית מומלצת + עקביות בתוך הקובץ".

---

## 2026-05-16 01:22

### תיעוד פלטפורמיזציה — קביעת תוכנית ארוכת-טווח לאיחוד 12 המשחקים

נקבעו מסמכי ההפניה לתהליך איחוד פלטפורמת המשחקים: כללי עיצוב משותפים, ותוכנית רב-שלבית לפלטפורמיזציה הדרגתית בהשראת Bitsboard.

#### מה בוצע?

**1. `docs/game-design-rules.md` (חדש, 362 שורות)**

- מסמך כללי-עיצוב לכל המשחקים הלימודיים
- 10 סעיפים: booster, AdminGate, sounds, cooldown, TTS, settings, persistence, accessibility, language, debugging
- מקור-אמת לכל משחק חדש או רפקטור משחק קיים

**2. `docs/platform-plan.md` (חדש, 418 שורות)**

- תוכנית 6 שלבים לאיחוד הפלטפורמה: חילוץ קוד משותף → Themes → הפרדת תוכן → Providers → Backend → איחוד דומיין
- ארבע החלטות אסטרטגיות: Composition (Shell משותף → איחוד עתידי), Content (היברידי בסגנון Bitsboard), הגירה (Strangler לפי שכבה), היקף (טכני עכשיו)
- מפת 12 ה-apps עם קטגוריזציה (חלוצים / מועמדים / מקובעים בריאים / חריגים / תשתית)
- סקירת פטרני ContentProvider (Provider של lotto + Data Pack של sort-cards)
- הצעת הרחבה ל-`SelectionAxis` לתמיכה במכפלה קרטזית (עיצור × ניקוד) — מבחן הקצה שיוודא שהמנגנון מספיק לכל משחק עתידי

#### החלטות ארכיטקטורה

- **שני מסמכים נפרדים**: `game-design-rules` הוא ספסיפיקציה ("איך משחק *צריך* להיראות"), `platform-plan` הוא ROADMAP ("איך מגיעים לשם"). הפרדה מאפשרת לעדכן כל אחד בקצב משלו.
- **תיעוד פלטפורמה במונוריפו ולא בקיט**: התוכנית רוחבית ל-12 ה-apps + 2 ה-packages, לא ספציפית ל-`learn-booster-kit`. מקומה הטבעי ב-`docs/` של השורש.

---

## 2026-04-03 22:00

### סקריפט יצירת אודיו עם ElevenLabs V3

סקריפט כללי חדש (shared) ליצירת קבצי אודיו בעברית באמצעות ElevenLabs V3 API — חלופה ל-Gemini TTS הקיים.

#### מה בוצע?

**1. סקריפט ראשי — `scripts/generate-audio-elevenlabs.ts`**

- שימוש במודל `eleven_v3` בלבד — הדור האחרון של ElevenLabs, תומך 70+ שפות כולל עברית
- פלט MP3 באיכות `mp3_44100_128`
- קלט מקובץ JSON חיצוני (פורמט: `[{ filename, text }]`)
- CLI args: `--input`, `--output`, `--voice-id`, `--stability`, `--similarity`
- retry logic על שגיאות 429 (rate limit) ו-500 (שרת)
- דילוג אוטומטי על קבצים קיימים
- תיעוד מלא בעברית בגוף הסקריפט (JSDoc + inline)

**2. קובץ דוגמה — `scripts/example-phrases.json`**

- 5 משפטים לדוגמה בעברית מנוקדת

**3. משתנה סביבה**

- `ELEVENLABS_API_KEY` נוסף ל-`.env`

#### החלטות ארכיטקטורה

- **סקריפט כללי בשורש במקום בתוך אפליקציה**: הסקריפט ב-`scripts/` ברמת המונוריפו כי הוא לא שייך לאפליקציה ספציפית — כל אפליקציה יכולה להכין קובץ JSON משלה ולהשתמש בו
- **קובץ JSON חיצוני במקום מערך בתוך הקוד**: מאפשר שימוש חוזר ללא שינוי הסקריפט
- **ElevenLabs V3 במקום Gemini TTS**: איכות דיבור גבוהה יותר עם טווח רגשי רחב והבנה הקשרית

---

## 2026-03-04 19:00

### learn-booster-kit — תיקון pointer-events במודל ובקונטיינר

תיקון שני באגים ב-CSS של learn-booster-kit שגרמו לקליקים לא מכוונים על אלמנטים מאחורי מודל שקוף.

#### מה בוצע?

**1. תיקון selector ב-BoosterContainer.svelte**

- בעיה: `:global(#learn-booster-root > .fixed)` לא תפס אלמנטים nested, רק ילדים ישירים
- תיקון: הסרת `>` — `:global(#learn-booster-root .fixed)` כדי לתפוס כל צאצא עם `.fixed`

**2. תיקון pointer-events ב-Modal.svelte**

- בעיה: מודל שקוף (`opacity: 0`) עדיין תפס קליקים, חסם אינטראקציה עם רכיבים מאחוריו
- תיקון: `pointer-events: none` במצב נסתר, `pointer-events: auto` במצב `.visible`

---

## 2026-02-26 12:00

### הגדרות טיימר אוברליי — הפעלה/כיבוי + מיקום וגודל בגרירה

הוספת ממשק הגדרות לטיימר ה-Web Overlay, המאפשר למורה להפעיל/לכבות את הטיימר, לבחור את מיקומו על המסך בגרירה, ולשנות את גודלו.

#### מה בוצע?

**1. אחסון הגדרות אוברליי (חדש)**

- מודול `overlay-settings.ts` — אחסון `enabled`, `xPercent`, `yPercent`, `sizePx` ב-localStorage
- סנכרון אוטומטי לאוברליי דרך אירוע `StorageEvent` (same origin, different browsing context)
- ברירות מחדל: מופעל, שמאל-אמצע (6%, 50%), גודל 140px

**2. קומפוננטת הגדרות `OverlayTimerSettings.svelte` (חדשה)**

- Toggle הפעלה/כיבוי הצגת הטיימר
- כפתור "מיקום וגודל הטיימר" — פותח מסך גרירה full-screen עם רפליקת טיימר
- בלון צף קומפקטי בשליש התחתון עם כפתורי +/- לגודל (80-220px) וכפתורי שמור/ביטול
- גרירה באמצעות Pointer Events API (תומך טאצ' ומאוס)

**3. עדכון OverlayTimerPage.svelte**

- מיקום מוחלט מבוסס אחוזים (`position: absolute` + `transform: translate(-50%, -50%)`) במקום flex
- גודל דינמי — SVG ופונט מותאמים ל-`sizePx`
- בדיקת `enabled` — הטיימר מוצג רק כש-`timer.isActive && overlaySettings.enabled`
- האזנה ל-`storage` event לעדכון בזמן אמת מדף ההגדרות

**4. עדכון booster-service.ts**

- בדיקת `loadOverlaySettings().enabled` לפני הגדרת Web Overlay ב-Fully ולפני שליחת פקודות start/stop

**5. שילוב בהגדרות**

- הוספת `<OverlayTimerSettings />` ב-`SettingsForm.svelte` (learn-booster-kit) — כל אפליקציה שמשתמשת בטופס מקבלת אוטומטית
- הוספת `<OverlayTimerSettings />` בהגדרות sort-cards-game

#### החלטות ארכיטקטורה

- **localStorage ולא Config**: הגדרות תצוגה ספציפיות למכשיר, לא הגדרות פדגוגיות. החלפת פרופיל לא צריכה להשפיע.
- **StorageEvent ולא BroadcastChannel**: אין צורך להרחיב את הפרוטוקול הקיים — `StorageEvent` מספיק לסנכרון חד-כיווני של הגדרות.
- **Pointer Events API**: עובד בטאצ' ומאוס, כולל `setPointerCapture` לגרירה חלקה.

#### מעקפים ופתרונות

- **לחיצה על כפתורים מזיזה טיימר**: הוספת `stopPropagation()` על כל pointer events בפאנל הצף, כדי שלחיצה על כפתורי +/- או "שמור" לא תזיז את הטיימר.
- **בלון צף קומפקטי**: עיצוב הפאנל כבלון קטן ב-`bottom: 15%` עם כפתורי +/- במקום slider, כדי לא לחסום את אזור הגרירה.

---

## 2026-02-22 02:45

### עדכון קבצי בדיקות learn-booster-kit לאחר רפקטורינג מבנה src

עדכון `test/src.ts` וכל קבצי ה-spec כדי שיתאימו למבנה הקבצים החדש שנוצר ברפקטורינג קודם (ארגון מחדש לתת-תיקיות `config/`, `video/`, `fully-kiosk/`), ועדכון מפתחות localStorage שהשתנו מ-`gingim-booster-*` ל-`learn-booster-*`.

#### מה בוצע?

**1. test/src.ts — מקור אמת יחיד לנתיבי ייבוא בבדיקות**

- עודכנו כל הנתיבים לאחר הרפקטורינג:
  - `../src/lib/sleep` ← `../src/lib/utils/sleep`
  - `../src/lib/config-manager` ← `../src/lib/config/config-manager`
  - `../src/lib/default-config` ← `../src/lib/config/default-config`
  - `../src/lib/profile-manager` ← `../src/lib/config/profile-manager`
  - `../src/lib/video-loader` ← `../src/lib/video/video-loader`
  - `../src/lib/get-app-list` ← `../src/lib/fully-kiosk/get-app-list`

**2. קבצי spec — תיקון נתיבי vi.doMock ו-dynamic imports**

- `test/get-app-list.spec.ts`: עודכנו מסכות ל-`fully-kiosk/fully-kiosk`, `config/config-manager`, ויבוא דינמי ל-`fully-kiosk/get-app-list`.
- `test/video-loader.spec.ts`: עודכנו מסכות ל-`video/google-drive-video`, `fully-kiosk/fully-kiosk`, ויבוא דינמי ל-`video/video-loader`.
- `test/profile-manager.spec.ts` + `test/profile-manager.migration.spec.ts`: תוקנו ייבואים ל-`config/default-config` ו-`config/profile-manager`.

**3. עדכון מפתחות localStorage בבדיקות**

- `config-manager.spec.ts`: המפתח `gingim-booster-config` ← `learn-booster-config`.
- `config-manager.migration.spec.ts`: עודכנו הבדיקות מ"לפני רפקטורינג" ל"אחרי רפקטורינג" — הבדיקות כעת מוודאות שמירה תחת המפתח החדש ו-null תחת הישן.
- `profile-manager.spec.ts` + `profile-manager.migration.spec.ts`: המפתח `gingim-booster-profiles:v1` ← `learn-booster-profiles:v1`.

#### תוצאה

14/14 קבצי בדיקות עוברים, 106 בדיקות עוברות, 9 todo.

---

## 2026-02-21 00:00

### ייצוא CSS מ-learn-booster-kit — הסרת @source עם path יחסי

הפיכת `learn-booster-kit` לpackage שמייצא את ה-CSS שלו עצמו, כך שאפליקציות צורכות לא צריכות לדעת על מבנה הקבצים הפנימי.

#### מה בוצע?

**1. learn-booster-kit — הוספת CSS export**

- נוצר `src/styles.css` עם `@source '.'` — מורה ל-Tailwind לסרוק את כל `src/`.
- נוסף export רשמי בpackage.json: `"./styles": "./src/styles.css"`.

**2. כל האפליקציות הצורכות**

- הוחלף `@source '../../../../packages/learn-booster-kit'` ב-`@import 'learn-booster-kit/styles'` בכל `layout.css`.
- `kit-test-screen`: עודכן גם ה-alias ב-`vite.config.ts` מ-`src/index.ts` ל-`src/` (ספרייה), כדי ש-`learn-booster-kit/styles` יפנה ל-`src/styles.css` דרך ה-alias.

#### החלטות ארכיטקטורה

- `**@import 'package/styles'` במקום `@source '../node_modules/package'`\*\*: זהו הפטרן המוצהר של Tailwind CSS 4 לספריות — הספרייה מייצאת קובץ CSS עם `@source`, הצרכן עושה `@import`. הفائدה: הצרכן לא צריך לדעת מה מבנה הקבצים הפנימי של הpackage.
- `**@source '.'` ולא נתיב ספציפי\*\*: סורק את כל `src/`, כולל קבצים עתידיים, ללא צורך לעדכן את הconfigs.

---

## 2026-02-19 18:26

### הקשחת lifecycle ב-learn-booster-kit ושיפור ברירת מחדל לווידאו

בוצעו שינויים בספרייה המשותפת `learn-booster-kit` כדי למנוע שימוש בשירות לפני אתחול, לשפר אבחון תקלות בזרימות תגמול, ולעדכן ברירת מחדל למקור וידאו מבוסס Google Drive.

#### מה בוצע?

**1. BoosterService - הקשחת אתחול וניהול מצב**

- נוספה אכיפת אתחול (`ensureInitialized`) לפני גישה ל-`config`, `timer`, `isRewardActive` ולפני רישום controls.
- `init()` מחזיר מופע מאותחל מסוג `BoosterServiceInitialized`.
- התווסף ייצוא type ציבורי `BoosterServiceInitialized` דרך `src/index.ts`.
- נוסף `activeRewardSessionId` כדי לשייך פעולות async לסשן reward ספציפי ולהקטין זליגת מצב בין סשנים.

**2. אבחון Timeout בזרימות Reward**

- נוספה תשתית `startRewardWatchdog` עם payload אבחוני (טיימר, סטטוס מודאל, סימני stall וסיבת חשד).
- חיבור watchdog לזרימות `video`, `site`, `app` עם ניקוי subscriptions/timeout בסיום.
- הורחב watcher של Fully עם `getStatus()` לטובת דיווח מדויק יותר ב-timeout.

**3. ברירות מחדל קונפיגורציה**

- עודכנה ברירת המחדל `video.source` מ-`local` ל-`google-drive` בקובץ `default-config`.

#### החלטות ארכיטקטורה

- **Guard ברמת Service במקום להסתמך על סדר קריאות חיצוני**: נבחרה אכיפה פנימית בשירות כדי למנוע שימוש שגוי גם אם צרכן ספרייה לא ממתין נכון ל-`init`.
- **Watchdog תצפיתי ולא מנגנון ביטול כפוי**: נבחר logging אבחוני במקום force-close, כדי להימנע מהחמרת תקלות UX ולתת שקיפות לצווארי בקבוק אמיתיים בזמן ריצה.

## 2026-02-11 13:00 - עדכוני TTS ו-Kiosk (Train Game)

נוספה תמיכה ב-Fully Kiosk Browser עבור Text-to-Speech ואפשרות לשינוי נוסח השאלה.

### 🚀 מה בוצע

1. **Fully Kiosk Polyfill**:

- נוסף ממשק `FullyKiosk` ומימוש ב-`tts.ts`.
  - המערכת מזהה אוטומטית אם היא רצה ב-Fully Kiosk ומשתמשת במנוע ה-TTS המובנה שלו (אמין יותר בקיוסק).

2. **שאלה ומשוב מפורטים**:

- נוספה הגדרה חדשה: `detailedQuestion`.
  - **משוב הצלחה מפורט**: "נכון! 3 ועוד 3 שווה 6! כל הכבוד!".
  - **חזרה על השאלה בעת טעות**: אם "שאלה מפורטת" פעילה, לאחר טעות המערכת תשאל שוב "כמה זה X ועוד Y?" כדי לחזק את הלמידה.
  - **מקור אמת יחיד (`VOICE_ASSETS`)**: כל קבצי הקול והטקסטים אוחדו לאובייקט אחד ב-`tts.ts`, המאפשר ניהול קל ושימוש ב-TTS כגיבוי לכל חלק חסר.

3. **ממשק משתמש**:

- נוסף מתג (Toggle) בהגדרות לשליטה על "שאלה מפורטת".

---

## 2025-12-24 19:33 - עדכון Workflow לתיעוד פיתוח

עודכנו קבצי ה-workflows של תהליך התיעוד עם הנחיות מפורטות יותר.

### 🛠️ מה בוצע

**1. עדכון `update_walkthrough.md`:**

- **מיקום תיעוד**: הוספת הבהרה - שינויים ספציפיים לפרויקט יתועדו בתוך תיקיית הפרויקט, שינויים חוצי-פרויקטים יתועדו בתיקייה הראשית.
- **הדגשת שעה**: הוספת הערה שחובה לציין תאריך **ושעה** מלאים.
- **קטגוריות חדשות**:
  - **החלטות ארכיטקטורה** - תיעוד למה נבחרה גישה מסוימת על פני אחרות.
  - **מעקפים (Workarounds)** - תיעוד פתרונות לבעיות ספציפיות עם הסבר.

**2. עדכון `commit.md`:**

- הוסרה כפילות תיעוד ה-walkthrough והוחלפה בהפניה ל-workflow הייעודי.

#### החלטות ארכיטקטורה

- **הפרדת תיעוד לפי פרויקט**: החלטה לכתוב תיעוד ספציפי בתוך כל פרויקט (ולא בתיקייה מרכזית) כדי לשמור על קשר הדוק בין הקוד לתיעוד שלו.

---

## 24/12/2025 18:50 - סידור מבנה קומפוננטות (Co-location)

בוצע ארגון מחדש של מבנה הקומפוננטות בכל הפרויקטים בהתאם לעיקרון **Co-location** - מיקום קומפוננטות ייחודיות לדף בתוך תיקיית `_components` ליד ה-Route שלהן.

### 🚀 מה בוצע

1. **הגדרת סטנדרט**:

- נוצר מסמך [docs/component_structure.md](file:///d:/UserProjects/ThzoharHalev/learn-games-project/docs/component_structure.md) המתעד את האפשרויות והסטנדרט שנבחר.

2. **train-addition-game**:

- 8 קומפוננטות הועברו ל-`src/routes/game/_components`
  - `SettingsControls` הועבר ל-`src/routes/settings/_components`
  - נשאר רק `HeaderBar` ב-`src/lib/components` (משותף)

3. **wordys-game**:

- 8 קומפוננטות הועברו ל-`src/routes/(no-settings)/game/[shelfId]/[boxId]/_components`
  - `SettingsControls` הועבר ל-`src/routes/admin/settings/_components`
  - `src/lib/components` נמחק (ריק)

### 📚 הנחיות להמשך

- קומפוננטות בשימוש יחיד: למקם בתיקיית `_components` של ה-Route.
- קומפוננטות משותפות: למקם ב-`src/lib/components`.

---

## 18/12/2025 - העברת רכיבים משותפים לספרייה (Refactor)

### 📦 העברת רכיבים ל-Share Library

הועברו הרכיבים `ProgressWidget` ו-`AdminGate` מתוך `apps/wordys-game` לספרייה המשותפת `packages/learn-booster-kit`.
המטרה היא לאפשר שימוש חוזר ברכיבים אלו בכל אפליקציות הפרויקט.

### 🛠️ שינויים שבוצעו

1. **learn-booster-kit**:

- הוספו הרכיבים `src/ui/ProgressWidget.svelte` ו-`src/ui/AdminGate.svelte`.
- עודכן `src/index.ts` לייצוא הרכיבים החדשים.

2. **wordys-game**:

- הוחלפו הייבואים המקומיים בייבוא מהספרייה המשותפת.

3. **train-addition-game**:

- עודכנו הרכיבים לשימוש ברכיבים המשותפים.

---

## 13/12/2025 - תיקון לולאת בנייה (Build Loop Fix)

תוקנה בעיה שגרמה ללולאה אינסופית בעת הרצת `bun run build`.

### 🐛 הבעיה

שימוש בפקודות `npm run ... --workspaces` בתוך סביבת Bun גרם לרקורסיה אינסופית.

### 🛠️ התיקון

- עודכנו סקריפטים ב-`package.json` הראשי לשימוש בפקודה `bun run --filter '*' ...`.

---

## 13/12/2025 - עדכון נהלי פרויקט ותצורה

עודכנו חוקי הפרויקט (`GEMINI.md`) והגדרות התצורה כדי ליישר קו עם סטנדרטים חדשים של עבודה ושפה.

### 📜 מה בוצע

1. **עדכון נהלי פרויקט (`GEMINI.md`)**:

- **שפה**: הוגדר כי שדות ממשק המשימה יהיו בעברית בלבד.
  - **קוד**: הוסף סעיף המגדיר כי הערות ייכתבו בעברית, שמות באנגלית.

2. **תצורה**:

- עודכן `.gitignore` כך שיתעלם מקבצי לוג.

---

## 13/12/2025 - הגירה למונוריפו (Monorepo)

הושלם בהצלחה תהליך איחוד הפרויקטים למבנה מונו-ריפו (Monorepo).

### 🚀 מה בוצע

1. **יצירת מבנה**: הפרויקט אורגן מחדש עם תיקיות `apps/` ו-`packages/`.
2. **מיזוג היסטוריה**: השתמשנו ב-`git-filter-repo` לשכתוב ההיסטוריה.
3. **גיבוי**: נוצר ענף `original-state-backup`.

### 📂 סטטוס נוכחי

- **ענף ראשי**: `main` (מכיל את המונוריפו המאוחד).
- **גיבוי**: `original-state-backup`.
