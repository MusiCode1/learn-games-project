# מיגרציית SettingsStore של find-letter ל-configManager

> ניסוי POC. מעביר את ה-storage backend של ה-settings מ-localStorage ישיר
> אל מערכת הפרופילים של הקיט (`configManager`), בלי לשנות את ה-API
> שצרכני settings רואים.

נכתב: 2026-05-17. גרסה אבולוציונית — אחרי דיון מפורט שהוביל לפתרון של
`$state` יחיד + factory + `ReturnType<typeof>` + `toJSON()` filter.

---

## 0. הגדרת branch

```bash
git checkout -b experiment/find-letter-config-manager
```

כל הקומיטים בעבודה זו על הbranch הזה. **לא לדחוף ל-main**. המפעיל יסקור,
בדוק, ויחליט אם למזג ידנית.

## 0.5. שינוי מקדים בקיט — חשיפת `configManager` כ-namespace

המפרט המקורי הניח שיש `configManager` namespace ב-API של הקיט. בפועל
הוא קיים רק ב-test aggregator (`packages/learn-booster-kit/test/src.ts`)
ולא ב-public API.

לפני המיגרציה של find-letter — קומיט קטן בקיט:

**קובץ:** `packages/learn-booster-kit/src/index.ts`

**שינוי:** הוסף שורה אחת. **לא למחוק** את ה-`export * from "./lib/config"` הקיים — הוא נשאר ל-tree-shaking. השורה החדשה מוסיפה namespace **בנוסף**, לא במקום:

```ts
// קיים — נשאר
export * from "./lib/config";

// חדש — הוסף בהמשך, אחרי שאר ה-exports של config:
export * as configManager from "./lib/config/config-manager";
```

זה מאפשר את שני הסגנונות:

```ts
// קיים, עובד
import { getGameSettings } from 'learn-booster-kit';

// חדש, עובד גם
import { configManager } from 'learn-booster-kit';
configManager.getGameSettings(...);
```

### בדיקה

`bun run --filter learn-booster-kit check` חייב לעבור.

### קומיט

**קומיט 1** (בקיט, על אותו branch ניסיוני):

```
feat(kit): חשיפת configManager כ-namespace (additive)

מאפשר ל-consumers לייבא configManager.X() במקום named imports
בודדים. ה-flat exports הקיימים נשמרים ל-tree-shaking.
```

`git add packages/learn-booster-kit/src/index.ts` בלבד.
walkthrough של הקיט: עדכן entry קצר.

**אחרי שזה קומוט — ממשיכים לסעיפים 1-7 (find-letter עצמו).**

---

## 1. מטרה ולא-מטרות

### מטרה

ש-find-letter ישתמש ב-`configManager.getGameSettings()` / `updateGameSettings()`
/ `subscribeGameSettings()` במקום לקרוא/לכתוב ישירות ל-localStorage. נטו:
ההגדרות נשמרות תחת הפרופיל הפעיל, ומתחלפות אוטומטית בעת החלפת פרופיל.

### לא-מטרה

- **לא** לשנות את ה-API לקומפוננטות צרכניות. `settings.gridSize`,
  `settings.totalCellsInGrid`, `settings.cooldownMs = 3000` — כולם
  ממשיכים לעבוד בדיוק כמו היום.
- **לא** ליצור Reactive Wrapper גנרי בקיט. זה משחק יחיד, POC.
- **לא** לגעת בקיט (`packages/learn-booster-kit/`). שינויים רק ב-find-letter.
- **לא** לגעת במשחקים אחרים.

---

## 2. הקובץ היחיד שמשתנה

`apps/find-letter-game/src/lib/stores/settings.svelte.ts` — החלפה מלאה.

תחליף את כל התוכן הקיים בקוד הבא:

```ts
// apps/find-letter-game/src/lib/stores/settings.svelte.ts

import { configManager } from 'learn-booster-kit';
import { DEFAULT_LETTER_IDS } from '../utils/letters';
import { migrateSettings } from './settings-migration';

const LEGACY_KEY = 'find-letter-game-settings';
const GAME_ID = 'find-letter-game';

export type GridSize = '2x3' | '3x3' | '3x4' | '4x4';

// =============================================================
// Single source of truth — defaults factory; type derived from it
// =============================================================
function makeDefaults() {
	return {
		gridSize: '3x4' as GridSize,
		autoSpeakOnNewRound: true,
		voiceEnabled: true,
		boosterEnabled: true,
		selectedLetterIds: [...DEFAULT_LETTER_IDS] as string[],
		avoidSimilar: true,
		cooldownMs: 2000,
		questionsPerBoard: 0,
		boardsPerSet: 1,
	};
}

export type FindLetterSettings = ReturnType<typeof makeDefaults>;
const DATA_KEYS = Object.keys(makeDefaults()) as (keyof FindLetterSettings)[];

// =============================================================
// Pure helpers
// =============================================================
export function gridDims(size: GridSize) {
	const [rows, cols] = size.split('x').map(Number);
	return { rows, cols };
}
export function gridCellCount(size: GridSize) {
	const { rows, cols } = gridDims(size);
	return rows * cols;
}
export function gridColumns(size: GridSize) {
	return gridDims(size).cols;
}
export function gridRows(size: GridSize) {
	return gridDims(size).rows;
}

// =============================================================
// The reactive store — data + reactive derivations + toJSON filter
// =============================================================
export const settings = $state({
	...makeDefaults(),

	// Reactive derivations — accessible as settings.x
	get totalCellsInGrid(): number {
		return gridCellCount(this.gridSize);
	},
	get effectiveQuestionsPerBoard(): number {
		const total = this.totalCellsInGrid;
		const r = this.questionsPerBoard;
		return !r || r <= 0 ? total : Math.min(r, total);
	},
	get totalQuestionsPerSet(): number {
		return this.effectiveQuestionsPerBoard * Math.max(1, this.boardsPerSet);
	},

	// Filters snapshot — getters excluded, only data fields
	toJSON(): FindLetterSettings {
		const out = {} as FindLetterSettings;
		for (const k of DATA_KEYS) (out as Record<string, unknown>)[k] = this[k];
		return out;
	},
});

export function resetSettings(): void {
	Object.assign(settings, makeDefaults());
}

// Backwards-compat — קוד legacy אולי מייבא את זה
export const DEFAULT_SETTINGS = makeDefaults();

// =============================================================
// Sync with configManager (browser-only)
// =============================================================
if (typeof window !== 'undefined') {
	let lastSyncedJson = '';

	// 1. Legacy migration (one-time)
	try {
		const legacy = window.localStorage.getItem(LEGACY_KEY);
		if (legacy) {
			Object.assign(settings, migrateSettings(JSON.parse(legacy)));
			window.localStorage.removeItem(LEGACY_KEY);
		}
	} catch (e) {
		console.error('[find-letter] legacy migration failed', e);
	}

	// 2. Initial load from active profile
	const saved = configManager.getGameSettings<FindLetterSettings>(GAME_ID);
	if (saved) {
		Object.assign(settings, saved);
		lastSyncedJson = JSON.stringify(saved);
	}

	$effect.root(() => {
		// 3. local change → configManager
		$effect(() => {
			const snap = $state.snapshot(settings); // uses toJSON internally
			const json = JSON.stringify(snap);
			if (json === lastSyncedJson) return;
			lastSyncedJson = json;
			void configManager.updateGameSettings(GAME_ID, snap);
		});

		// 4. configManager → local (profile switch / late init)
		return configManager.subscribeGameSettings<FindLetterSettings>(GAME_ID, (s) => {
			if (!s) return;
			const json = JSON.stringify(s);
			if (json === lastSyncedJson) return;
			lastSyncedJson = json;
			Object.assign(settings, s);
		});
	});
}
```

### הערות חשובות לפני שמתחיל לכתוב

- **תכתיב את כל הקובץ מחדש**, אל תערוך incrementally. השינוי מקיף.
- **שמור את הexport `DEFAULT_SETTINGS`** (גם בקוד הישן יש). קוד צרכן
  אולי משתמש בו.
- ה-derivations (`totalCellsInGrid`, `effectiveQuestionsPerBoard`,
  `totalQuestionsPerSet`) **חייבים להישאר על `settings`**, כי
  קומפוננטות צורכות אותן כ-`settings.totalCellsInGrid`.

---

## 3. קומפוננטות צרכניות — אפס שינויים

ה-API למפתח הצרכן זהה לחלוטין:

```svelte
<script>
	import { settings } from '$lib/stores/settings.svelte';
</script>

<input bind:value={settings.cooldownMs} />
<p>{settings.totalCellsInGrid}</p>
{#if settings.boosterEnabled}...{/if}
```

לא נוגעים בקובץ קומפוננטה אחד. אם תוך הרצת `bun run check` יצוצו שגיאות
TypeScript בצרכנים — זה אומר שמשהו בקוד החדש לא תואם ל-API הישן.
**לא לתקן את הצרכנים** — תקן את `settings.svelte.ts` עד שהcheck עובר
בלי שינוי בצרכנים.

---

## 4. בדיקת `boosterService.init()` כבר נקרא

ה-`configManager` חייב להיות מאותחל לפני שה-`getGameSettings` יחזיר ערכים
שמורים. ב-find-letter, `boosterService.init()` נקרא ב-`+layout.svelte`
(`onMount`).

**הזרימה תקינה גם בלי init מוקדם:**
1. `settings.svelte.ts` נטען → `$state` עם defaults.
2. `getGameSettings` מחזיר `undefined` (config עוד לא אותחל).
3. `subscribeGameSettings` נרשם, יורה מיד עם `undefined` → דילוג.
4. Layout נטען → `boosterService.init()` → `notifyConfigListeners()`.
5. ה-subscribe callback יורה שוב עם הערך האמיתי → `Object.assign`.

אין צורך לשנות שום דבר ב-layout או init flow.

---

## 5. בדיקות (TDD-light)

### 5.1 הטסטים הקיימים חייבים לעבור

```bash
bun run --filter find-letter-game test
```

הטסטים הקיימים: `letters.test.ts`, `smoke.test.ts`, `cooldown.test.ts`,
`settings-migration.test.ts`. אף אחד מהם לא תלוי ב-implementation של
ה-store עצמו — הם בודקים pure functions ב-utils. **כולם חייבים לעבור
ללא שינוי בקבצי טסט**.

### 5.2 בדיקת compilation

```bash
bun run --filter find-letter-game check
```

חייב לעבור עם 0 errors. אם יש warnings על `unused`, התעלם.

### 5.3 בדיקה ידנית (תפעיל המפעיל)

לא מוסיף טסטי אינטגרציה חדשים בניסוי הזה — המפעיל יבדוק ידנית:

1. הרצת `bun run --filter find-letter-game dev`
2. שינוי gridSize → רענון דף → gridSize נשמר ✓
3. בדיקה ב-DevTools → Application → Local Storage:
   - `find-letter-game-settings` ← לא קיים (נמחק לאחר מיגרציה ראשונה)
   - `learn-booster-profiles:v1` ← קיים, מכיל `gameSettings['find-letter-game']`

---

## 6. קומיט עיקרי (קומיט 2)

`feat(find-letter): מיגרציית SettingsStore ל-configManager של הקיט`

מסמך הקומיט:
```
פירוט:
- Replace class SettingsStore + localStorage with $state object + configManager
- Single source of truth via makeDefaults() + ReturnType<typeof makeDefaults>
- Reactive derivations preserved as getters on settings (same API)
- Echo cancellation via JSON.stringify compare (no flags)
- One-time migration from legacy 'find-letter-game-settings' key
- Zero changes to consuming components
```

`git add` רק את:
- `apps/find-letter-game/src/lib/stores/settings.svelte.ts`
- `apps/find-letter-game/docs/walkthrough.md` (לעדכן)

**לא לכלול** את `docs/find-letter-config-migration.md` (זה המסמך הזה, נכתב ע"י המפעיל).

---

## 7. Walkthrough

עדכן `apps/find-letter-game/docs/walkthrough.md` עם entry חדש:

```markdown
## 2026-05-17 HH:MM

### מיגרציה: SettingsStore → configManager (POC)

החלפת ה-storage backend של ה-settings מ-localStorage ישיר למערכת
הפרופילים של הקיט (`learn-booster-kit/configManager`).

#### מה השתנה?

- `class SettingsStore` הוסר → `export const settings = $state({...})`
- מקור-אמת יחיד: `makeDefaults()` + `type FindLetterSettings = ReturnType<typeof makeDefaults>`
- derivations (`totalCellsInGrid` וכו') נשארות על `settings` כ-reactive getters
- echo cancellation עם JSON.stringify compare (לא flag)
- מיגרציה חד-פעמית מהמפתח legacy `find-letter-game-settings`

#### השלכות חיוביות

- settings נשמרות תחת הפרופיל הפעיל
- החלפת פרופיל מחליפה אוטומטית את כל ה-settings
- בעתיד: אם יהיה backend sync, find-letter יקבל אותו "חינם"

#### מה לא השתנה?

- ה-API של `settings` לצרכנים (אפס שינויים בקומפוננטות)
- ה-migration logic מ-v1/v2/v3 (`migrateSettings` נשאר)
- שמות שדות, defaults, derivations

#### בדיקות

- כל הטסטים הקיימים עוברים (`bun run --filter find-letter-game test`)
- `bun run check` עובר
- ניסוי בעבודה ידנית של המפעיל לפני merge
```

---

## 8. הוראות סופיות לסונט

1. **branch חדש**: `git checkout -b experiment/find-letter-config-manager` לפני שמתחיל לכתוב.
2. **קרא קובץ מקור**: `apps/find-letter-game/src/lib/stores/settings.svelte.ts` הקיים, ראה
   את ה-class ו-API שלו. וודא שה-API החדש מספק את כל מה שהוא חשף.
3. **כתוב את הקובץ החדש** לפי סעיף 2 לעיל.
4. **הרץ check**: `bun run --filter find-letter-game check`. אם נכשל — תקן את הקובץ עד שעובר.
5. **הרץ tests**: `bun run --filter find-letter-game test`. אם נכשל — תקן עד שעובר.
6. **עדכן walkthrough**: לפי סעיף 7.
7. **קומיט**: לפי סעיף 6 (`git add` סלקטיבי).
8. **אישור**: autonomous (לא לבקש פר-קומיט).

⚠️ **אל תיגע ב-main**. **אל תדחוף ל-remote**. רק קומיט מקומי על ה-branch הניסיוני.

⚠️ **אם משהו במהלך הדרך לא מתאים בדיוק למפרט** (לדוגמה: צרכן משתמש ב-prop
לא צפוי, או הtypecheck נכשל באופן לא ברור) — עצור, אל תאלתר. דווח למפעיל
מה ה-blocker.

בהצלחה.

---

# נספח: תיקון באגים שזוהו בבדיקה

> נכתב 2026-05-17 אחרי שהמיגרציה הראשונית קומיטה ונבדקה בדפדפן.
> נמצאו 2 באגים — באג #1 חמור, באג #2 UX. שניהם דורשים תיקון.

## באג 1 (CRITICAL): `$state.snapshot` כושל עם toJSON

### מה קרה

הקוד הנוכחי מגדיר `toJSON()` בתוך ה-`$state({...})` object literal. ה-snapshot כושל:

```
[svelte] state_snapshot_uncloneable - <value>.toJSON
DataCloneError: Failed to execute 'structuredClone' ... toJSON() {...} could not be cloned.
```

המסמכים של Svelte 5 טוענים ש-`$state.snapshot` מכבד toJSON. בפועל, כשהוא מוגדר בתוך object literal של $state, ה-snapshot מנסה לעשות structuredClone של האובייקט (כולל המתודה), ונכשל. ה-snap המוחזר מכיל את ה-toJSON המקורי.

ה-snap מועבר ל-`updateGameSettings` → `syncActiveProfileSnapshot` → `cloneConfig` → `structuredClone` של appConfig → נופל ב-`DataCloneError` (לא נתפס!) → הפרופיל **לא מתעדכן**.

תוצאה: שינויי המשתמש לא נשמרים בפרופיל. בריענון — defaults.

### הפתרון

1. **מחק** את `toJSON()` מתוך `$state({...})`. כן השאר את 3 ה-getters (`totalCellsInGrid`, `effectiveQuestionsPerBoard`, `totalQuestionsPerSet`).

2. **הוסף** helper פרטי `dataSnapshot()` שבונה plain object מ-DATA_KEYS:

```ts
function dataSnapshot(): FindLetterSettings {
  const out: Record<string, unknown> = {};
  for (const k of DATA_KEYS) {
    const v = settings[k];
    // Deep-copy arrays — לפרק את ה-$state proxy
    out[k] = Array.isArray(v) ? [...v] : v;
  }
  return out as FindLetterSettings;
}
```

3. **החלף** ב-$effect את `$state.snapshot(settings)` ב-`dataSnapshot()`:

```ts
$effect(() => {
  if (!isReady) return;                              // ← ראה באג 2
  const snap = dataSnapshot();                       // ← במקום $state.snapshot
  const json = JSON.stringify(snap);
  if (json === lastSyncedJson) return;
  lastSyncedJson = json;
  void updateGameSettings(GAME_ID, snap);
});
```

## באג 2: ה-$effect הראשון רץ לפני init

### מה קרה

ה-`$effect` של ה-store רץ כשהמודול נטען — לפני `boosterService.init()`. ב-console נראה:

```
config-manager.ts:363 Unable to sync active profile config: 
  Error: Profile manager was not initialized. Call initializeProfiles() first.
```

זה נתפס ב-try/catch בקיט אז לא קורס, אבל זה גורם ל:
- `learn-booster-config` להידרס ב-defaults
- warnings בקונסולה
- כתיבות מיותרות

### הפתרון: דגל `isReady`

```ts
let lastSyncedJson = '';
let isReady = false;        // ← חדש

// ...

$effect.root(() => {
  // local change → kit (רק אחרי init)
  $effect(() => {
    if (!isReady) return;   // ← דלג עד שsubscribe fire פעם ראשונה
    const snap = dataSnapshot();
    const json = JSON.stringify(snap);
    if (json === lastSyncedJson) return;
    lastSyncedJson = json;
    void updateGameSettings(GAME_ID, snap);
  });

  // kit → local
  return subscribeGameSettings<FindLetterSettings>(GAME_ID, (s) => {
    isReady = true;          // ← כל fire = init בוצע (אפילו עם s=undefined)
    if (!s) return;
    const json = JSON.stringify(s);
    if (json === lastSyncedJson) return;
    lastSyncedJson = json;
    Object.assign(settings, s);
  });
});
```

`subscribeGameSettings` יורה מיד עם הרישום (אפילו עם `undefined` לפני init), ושוב כל פעם שמשתנה. ה-`isReady = true` יידלק כבר ב-fire הראשון.

עד ש-isReady=true, ה-$effect הראשון מדלג. אחרי init, ה-callback יורה שוב עם הערך האמיתי מהפרופיל.

## סדר ביצוע

קומיט יחיד נוסף:

```
fix(find-letter): תיקון 2 באגים במיגרציית SettingsStore — toJSON cloning + isReady

- מחיקת toJSON מתוך $state — היה גורם ל-state_snapshot_uncloneable
  ול-DataCloneError ב-cloneConfig של הקיט, ובכך מונע סנכרון לפרופיל.
- helper dataSnapshot() חדש שבונה plain object מ-DATA_KEYS, כולל
  deep-copy של arrays לפרק את ה-$state proxy.
- דגל isReady שמונע $effect ראשון לפני boosterService.init() (חסך
  warnings ב-cosnsole ודריסת learn-booster-config).
```

`git add` רק את `apps/find-letter-game/src/lib/stores/settings.svelte.ts` ואת `apps/find-letter-game/docs/walkthrough.md`.

ב-walkthrough — entry חדש שמסביר את 2 הבאגים והתיקון.

## הוראות לסונט

- ⚠️ branch ניסיוני: `experiment/find-letter-config-manager` כבר קיים, אתה כבר עליו. **לא ליצור branch חדש**.
- אישור: autonomous.
- בדיקות: `bun run --filter find-letter-game test` + `check` חייבים לעבור.
- אחרי הקומיט — דווח, המפעיל יבדוק בדפדפן.
