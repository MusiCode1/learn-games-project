# Learn Booster Kit — יומן פיתוח

## 2026-05-17 00:10

### 5 themes נוספים מבוססי עיצוב משחקים קיימים

#### מה בוצע?

**5 קבצי CSS חדשים ב-`src/ui/theme/themes/`**:

- `find-letter.css` — navy #1e3a8a + כתום #f97316, Heebo, rounding 6/12/20px
- `wordys.css` — כתום-זהב #ea580c + yellow, Rubik, רדיוסים גדולים 12/20/32px, font-weight-bold 800
- `slate.css` — slate-900 + ירוק נאון #4ade80, system-ui, minimal shadows
- `read-faster.css` — oklch כחול-טורקיז + Frank Ruhl Libre/Rubik, 4/8/12px radius
- `portal.css` — navy #0f172a + rose-700, Heebo, קרם #f7f2e8, font-size-xl 3rem

**`src/styles.css`** — הוספת 5 @imports לפני tokens.css

#### החלטות ארכיטקטורה

- כל theme מכיל את **כל** ה-tokens לפי הרשימה המלאה מ-default/kids/minimal — ללא fallback שבור
- oklch ב-read-faster: browser support מלא בכרומיום/ספארי/פיירפוקס מודרניים

## 2026-05-17 00:06

### Shell components — HeaderBar, GameShell, StartScreen

#### מה בוצע?

**1. `src/ui/shell/HeaderBar.svelte`**

- `<header role="banner">` עם 3 slots: leftActions, centerInfo, rightActions
- `data-variant` לdefault/compact
- bg-surface-elevated, border-b, shadow-card

**2. `src/ui/shell/GameShell.svelte`**

- flex column, min-height: 100dvh
- header/footer shrink-0, `<main>` flex-1 overflow-hidden
- background: base/sunken

**3. `src/ui/shell/StartScreen.svelte`**

- מסך ממורכז עם title, subtitle, Button primary size=lg
- heroIllustration + secondaryActions slots אופציונליים

**4. 3 browser tests** ל-HeaderBar (TDD)

**5. exports** ב-src/index.ts

## 2026-05-17 00:05

### CooldownOverlay primitive + cooldown-math — TDD

#### מה בוצע?

**1. `src/ui/primitives/cooldown-math.ts`** — pure function

- `cooldownProgress(now, untilTs, durationMs)` → 0..1
- מגבלות: durationMs=0 → 1, חורג → clamp ל-[0,1]
- 5 טסטים (vitest node, TDD red→green)

**2. `src/ui/primitives/CooldownOverlay.svelte`**

- overlay `fixed inset-0` עם `bg-surface-overlay`
- טבעת SVG עם stroke-dashoffset ל-countdown אנימציה (קיבלנו מ-find-letter-game)
- `$effect` + `setInterval` 100ms לעדכון `now`
- `onComplete` callback כשנגמר
- משתמש ב-theme tokens (לא צבעים hardcoded)

**3. 3 browser tests** ב-kit-test-screen

**4. exports** ב-src/index.ts: CooldownOverlay + cooldownProgress

## 2026-05-17 00:04

### SegmentedControl + ScoreBadge + Card — TDD

#### מה בוצע?

**1. `src/ui/primitives/SegmentedControl.svelte`**

- `role="radiogroup"` + כפתורים עם `role="radio"` + `aria-checked`
- keyboard: ← → ↑ ↓ Home/End
- Generics TypeScript: `generics="T extends string"` עם $bindable value
- ביסוס על lotto SegmentedControl עם העברה ל-tokens

**2. `src/ui/primitives/ScoreBadge.svelte`**

- 3 variants: default/success/warning עם theme feedback colors
- `data-variant` attribute לבדיקה
- תמיכה ב-icon snippet ו-label optional

**3. `src/ui/primitives/Card.svelte`**

- 3 variants: elevated/flat/outlined
- 4 padding sizes, interactive mode
- כשיש `onclick` — מתרגם ל-`<button>`, אחרת `<div>`

**4. 9 browser tests** (3 לכל קומפוננטה)

#### החלטות ארכיטקטורה

- **Generics ב-Svelte 5**: `<script lang="ts" generics="T extends string">` מאפשר type safety לvalues
- **role="radio" vs button**: לSC, כל אפשרות מקבלת role=radio עם aria-checked, role=radiogroup על ה-container

## 2026-05-17 00:03

### Button + IconButton primitives — TDD

#### מה בוצע?

**1. `src/ui/primitives/Button.svelte`**

- 4 variants: primary/secondary/ghost/danger עם Tailwind theme colors
- 3 sizes: sm/md/lg עם min-height לנגישות מגע
- `rounded-pill`, `focus-visible:shadow-focus`, `disabled` מוחלט עם pointer-events-none
- `data-variant` attribute לבדיקה ב-tests

**2. `src/ui/primitives/IconButton.svelte`**

- 3 variants: solid/subtle/ghost
- 3 sizes: sm/md/lg — ממדים שונים בהתאם ל-showLabel
- `sizeClass` כ-`$derived` (reactive ל-showLabel)
- `aria-label` חובה לנגישות

**3. `apps/kit-test-screen/src/lib/primitives/Button.svelte.test.ts`** — 5 browser tests

**4. `apps/kit-test-screen/src/lib/primitives/IconButton.svelte.test.ts`** — 4 browser tests

**5. `packages/learn-booster-kit/package.json`** — תיקון exports

- `"./ui/*": "./src/ui/*.svelte"` → `"./ui/*": "./src/ui/*"` כדי שTypeScript יפתור `learn-booster-kit/ui/primitives/Button.svelte` נכון

#### החלטות ארכיטקטורה

- **$derived לsizeClass**: מכיוון ש-`showLabel` הוא prop reactive, חישוב `sizeClass` חייב להיות ב-`$derived` ולא בקבוע
- **createRawSnippet בטסטים**: ב-vitest-browser-svelte v2 עם Svelte 5, snippets מועברות דרך `createRawSnippet` ולא כ-plain functions

## 2026-05-17 00:02

### Icons primitives — 5 אייקוני Lucide-style

#### מה בוצע?

**5 קבצי Svelte ב-`src/ui/primitives/icons/`**: SpeakerIcon, RefreshIcon, SettingsIcon, CheckIcon, XIcon

- SVG paths בסגנון Lucide עם props: `size` ו-`class`
- `aria-hidden="true"` לנגישות (נגיש דרך `aria-label` של הצרכן)
- `export` ב-`src/index.ts`

#### החלטות ארכיטקטורה

- **ללא תלות חיצונית**: SVG paths ידניים מ-Lucide — אין צורך ב-`lucide-svelte` כחבילה
- **`currentColor`**: הצבע מגיע מ-CSS context, לא hardcoded

## 2026-05-17 00:01

### Animation helpers — useShake ו-usePop עם TDD

שני hooks שמאפשרים trigger-based animations בקומפוננטות Svelte 5 ללא ניהול ידני של setTimeout.

#### מה בוצע?

**1. `src/ui/animations/use-shake.svelte.ts`** — useShake hook

- מחזיר `{ active, trigger() }` — `active` הופך true ל-durationMs (ברירת מחדל: 500ms) ואז false
- `queueMicrotask` מאפס את האנימציה גם ב-retriggering (אפקט reflow)

**2. `src/ui/animations/use-pop.svelte.ts`** — usePop hook

- זהה ל-useShake, ברירת מחדל durationMs=600

**3. `test/ui/animations/use-shake.spec.ts`** — 4 טסטים

- starts inactive, becomes active after microtask, returns to inactive after durationMs, re-triggering resets timer

**4. `test/ui/animations/use-pop.spec.ts`** — 4 טסטים

- כולל בדיקת ברירת המחדל 600ms

**5. `src/index.ts`** — export של useShake ו-usePop

#### החלטות ארכיטקטורה

- **`.svelte.ts` extension**: הכרחי ל-$state מחוץ לקומפוננטה — ה-Svelte plugin מזהה ומחדיר runes
- **queueMicrotask לא fake**: vi.useFakeTimers() לא משפיע על queueMicrotask, לכן הטסטים משתמשים ב-`await Promise.resolve()` לflush

## 2026-05-17 00:00

### הוספת theme system — tokens, 3 ערכות נושא, animations

תשתית עיצוב משותפת לפלטפורמה: CSS custom properties סמנטיות ו-Tailwind 4 `@theme` block לתמיכה ב-runtime theme switching.

#### מה בוצע?

**1. `src/ui/theme/themes/default.css`** — ערכת "Trust" (ברירת מחדל תחת `:root`)

- כל 24 ה-tokens: surfaces, brand, text, feedback, radius, shadows, typography

**2. `src/ui/theme/themes/kids.css`** — ערכת ילדים

- צבעים עזים (violet/amber), עיגולים גדולים (radius-md=16px), פונט Varela Round

**3. `src/ui/theme/themes/minimal.css`** — ערכה מינימלית

- שחור-לבן, עיגולים קטנים (radius-md=4px), ללא צל, IBM Plex Sans Hebrew

**4. `src/ui/theme/tokens.css`** — `@theme` block

- מגדיר mapping: `--color-brand-primary: var(--theme-brand-primary)` וכו'
- Tailwind 4 מייצר `bg-brand-primary`, `text-feedback-error`, `rounded-md`, `shadow-card`, `font-display` וכו'

**5. `src/ui/theme/animations.css`** — 3 keyframes + utility classes

- `lbk-anim-shake`, `lbk-anim-pop`, `lbk-anim-fade-in` עם תחילית `lbk-` למניעת התנגשות

**6. `src/styles.css`** — entry point

- @import של כל קבצי ה-theme לפי הסדר הנכון (default קודם, אחר כך overrides)

#### החלטות ארכיטקטורה

- **CSS variables ב-@theme**: Tailwind 4 עם `var(--theme-*)` ב-@theme מאפשר runtime theme switching דרך `data-theme` attribute — הtheme משתנה ב-JS ו-CSS נפתר אוטומטית
- **תחילית `lbk-`**: כל class names של הקיט מקבלות תחילית למניעת conflicts עם אפליקציות צרכניות

#### מעקפים ופתרונות

- אין — CSS only, אין build issues

## 2026-05-16 16:40

### `neverthrow` כסטנדרט פלטפורמה ל-Result + `updateGameSettings` מחזיר Result

יישום ראשון של עקרון התכנות הפונקציונלי שהוסכם ב-`docs/functional-programming.md`: שגיאות נצפות ב-types-level דרך `Result<T, E>`, לא ב-`try/catch`. הקיט מאמץ את **`neverthrow`** כסטנדרט הפלטפורמה ומייצא אותה מחדש, כך שמשחקים לא צריכים להתקין אותה בעצמם.

#### מה בוצע?

**1. `neverthrow@^8.2.0` נוסף כ-dependency ב-`packages/learn-booster-kit/package.json`**

**2. `src/lib/result.ts` (חדש)** — re-export של neverthrow + `ValidationError`

- `export { ok, err, okAsync, errAsync, Result, ResultAsync, Ok, Err, fromThrowable, fromPromise, fromSafePromise, fromAsyncThrowable, safeTry } from "neverthrow"`
- `export interface ValidationError { kind: "validation"; summary: string }` — שגיאה משותפת לכל הפלטפורמה
- בלי טסטים (neverthrow כבר נבדק טוב ע"י המתחזקים)

**3. `updateGameSettings` — מעבר ל-Result**

- חתימה: `Promise<Config>` (זורק) → `Promise<Result<Config, ValidationError>>`
- במקום `throw new Error(...)` → `return err<ValidationError>({ kind: 'validation', summary })`
- בסוף → `return ok(appConfig)`
- 3 טסטים חדשים ב-`test/game-settings.spec.ts` — `isOk()`/`isErr()` narrowing + `.match()` בסגנון FP

**4. `src/index.ts` — חשיפת ה-API**

- `export * from "./lib/result"` — כל ה-API של neverthrow + `ValidationError`
- צרכנים מייבאים מ-`learn-booster-kit`, לא מ-`neverthrow` ישירות

#### החלטות ארכיטקטורה

- **`neverthrow` ולא native discriminated union**: לאחר דיון, נבחר `neverthrow` כסטנדרט פלטפורמה. הסיבות:
  - **סטנדרט תעשייתי** — סוכני AI ותורמים עתידיים מזהים את ה-API מיד (`.isOk()`, `.match()`, `.andThen()`)
  - **עקביות עם voice-acp** — אם הוא משתמש ב-`neverthrow`, learn-games-project לא צריך mental model שני
  - **`ResultAsync` ל-chaining async** — pattern עתידי כשנגיע ל-flows מסובכים
  - **`eslint-plugin-neverthrow`** — אפשר להוסיף בעתיד להכרחת טיפול ב-results
- **Cost מוערך כסביר**: ~12KB bundle, learning curve מתון, class-based serialization לא רלוונטי לקיט שלנו.
- **Re-export דרך הקיט (אופציה א)**: משחקים לא מתקינים `neverthrow` בעצמם — הקיט מספק. אם משחק צריך משהו שלא מיוצא, הוא יכול להתקין `neverthrow` לבד.
- **`ValidationError` משותף ב-`result.ts` ולא בכל מודול**: כל הפלטפורמה משתמשת באותו shape של שגיאת validation. ספציפיים יכולים להרחיב עם discriminated union (למשל `kind: 'storage' | 'network'` בעתיד).
- **read-faster לא הוגר עדיין**: יש לו native implementation ב-`apps/read-faster/src/lib/utils/result.ts`. ההגירה אופציונאלית — אם נגיע לעבוד שם, נגר. נכון לעכשיו הוא legacy ב-FP terms.

#### תוצאה

- בדיקות: 162 → 165 passed (16 קבצי spec, 3 חדשים ב-`game-settings.spec.ts`)
- `bun run --filter learn-booster-kit check`: 0 errors / 0 warnings
- צרכני `updateGameSettings`: עדיין אפס (ה-API נוצר ב-`d7abe95`) — אין breaking change בפועל

---

## 2026-05-16 03:50

### `gameSettings` — תמיכה בהגדרות-משחק בפרופיל + תיקון 3 טסטים שבורים

הרחבת מערכת הפרופילים כך שפרופיל ייתפוס גם הגדרות ספציפיות-למשחק (לא רק הגדרות-קיט כמו `booster` ו-`video`). זוהי תשתית לחיבור `SettingsStore` של כל משחק למערכת הפרופילים — תוכנית הצעד הבא בפלטפורמיזציה.

#### מה בוצע?

**1. הרחבת `ConfigSchemaV1` — שדה `gameSettings`**

- הוספת `"gameSettings?": type({ "[string]": "unknown" })` ב-`schemas.ts`
- שדה אופציונאלי (`?`) → תאימות לאחור: פרופילים ישנים שנשמרו לפני התוספת לא יישברו ב-validation
- ערך-ברירת-מחדל ריק (`gameSettings: {}`) ב-`default-config.ts`
- הקיט לא מאמת את התוכן (`unknown`). כל משחק אחראי על schema של עצמו

**2. API חדש ב-`config-manager.ts`**

| פונקציה | חתימה | תיאור |
|---------|--------|--------|
| `getGameSettings<T>` | `(gameId: string) => T \| undefined` | קריאה מ-`appConfig.gameSettings[gameId]` |
| `updateGameSettings<T>` | `(gameId: string, settings: T) => Promise<Config>` | **החלפה מלאה** (לא deep-merge) של הגדרות-משחק. שאר המשחקים נשמרים |
| `subscribeGameSettings<T>` | `(gameId: string, cb) => () => void` | רישום לשינויים. callback ראשון נקרא עם הערך הנוכחי |

**3. תיקון 3 טסטים שבורים**

- `profile-manager.ts:cloneProfile` — לא מציב יותר `tags: undefined` ו-`color: undefined` שהיו נדחים ב-ArkType validation. רק שדות שמוגדרים בפועל נכללים → export/import עם פרופילים partial עובד.
- `get-app-list.spec.ts` — ה-mock objects שולחים את כל 5 השדות של `AppListItemSchema` (`icon/label/package/version/versionCode`), ולא רק `packageName, label` שגוי.

**4. `_resetProfilesStateForTesting`**

- הוספת פונקציה (test-only, `_` prefix) שמאפסת module-level state ב-`profile-manager` (`state`, `isInitialized`, `listeners`)
- בלי זה, test הבא רואה את הפרופיל מה-test הקודם ונכשל (ה-state הוא singleton ב-module)

**5. 17 טסטים חדשים ב-`test/game-settings.spec.ts`**

- `getGameSettings`: `undefined`, set/get, generic type
- `updateGameSettings`: שמירה, אי-דריסה בין משחקים, החלפה מלאה (לא merge), persistence
- `subscribeGameSettings`: initial value, change, no-emit לשינויי משחקים אחרים, unsubscribe
- integration: ההגדרות נשמרות בפרופיל ולא במפתח `localStorage` נפרד

#### החלטות ארכיטקטורה

- **`gameSettings` ב-Config (לא API נפרד)**: שמרנו את ההגדרות-משחק כחלק מ-`Config` כדי שיתסנכרנו אוטומטית עם הפרופיל הפעיל (`saveActiveProfileConfig`). החלפת פרופיל = החלפת **כל** ההגדרות (kit + game) יחד. זה ה-mental model הנכון של "פרופיל = הגדרות מלאות לתלמיד".

- **החלפה מלאה ולא deep-merge**: ה-`updateGameSettings` עוקף את ה-`deepMerge` של `updateConfig`. הסיבה: אם משחק משנה את ה-schema שלו (מסיר שדה ישן), `deepMerge` ישאיר את השדה הישן. החלפה מלאה תפעיל את ה-schema-migration של המשחק כפי שהמשחק עצמו מצפה.

- **`unknown` ולא generic-typed schema**: הקיט לא יודע על שום משחק ספציפי, אז הוא לא יכול לאמת את התוכן. כל משחק מאמת אצלו (ArkType / Zod / וכו'). ה-cost של "אובדן typing" מבוטל ע"י ה-generic `<T>` של ה-helpers.

#### תוצאה

- בדיקות: 148 → 162 passed (16 קבצי spec, 17 חדשים עוברים)
- `bun run --filter learn-booster-kit check`: 0/0
- ה-API מוכן לשלב הבא — חילוץ `BaseSettingsStore` שישתמש ב-`getGameSettings`/`updateGameSettings`/`subscribeGameSettings`

---

## 2026-05-16 02:30

### תיקון type-safety של הקיט — global window + import של schema types

תיקון 12 שגיאות `svelte-check` שצצו כשמשחק (find-letter-game) הריץ check על קבצי הקיט בהקשר tsconfig מחמיר (`strict` + `isolatedModules` + `verbatimModuleSyntax`). הקיט עצמו עבר check כי ה-tsconfig שלו פחות מחמיר, אבל הצרכנים שלו לא.

#### מה בוצע?

**1. `types.ts` — import + export של schema types**

- היה: `export type { Config, VideoItem, ... } from "./schemas"` — מייצא, אבל לא יוצר binding מקומי
- `types.ts` עצמו השתמש ב-`Config` ו-`VideoItem` ב-`VideoDialogProps`, `VideoConfig`, `AppConfig`, `ConfigOverrides`, `VideoList` → 5 שגיאות "Cannot find name"
- תיקון: `import type { ... } from "./schemas"` + `export type { ... }` בנפרד

**2. `types.ts` — `declare global` ל-Window**

- הוספת `declare global { interface Window { ... } }` עם:
  - `config?: unknown` — legacy gingim config שה-`config-manager` קורא לזיהוי `OldConfig`
  - `GingimBoosterTools?` — debug hooks שה-`booster-service` רושם לחלון
- ההצהרה ב-`types.ts` ולא ב-`vite-env.d.ts` כי `types.ts` מיובא ע"י כל צרכן (דרך re-exports מ-`index.ts`), ואילו `vite-env.d.ts` הוא ambient-only שלא בהכרח נכלל ב-tsconfig של הצרכן

**3. `booster-service.ts` — type annotation ל-options**

- היה: `(options) => this.rewardWatchdog.watchStateUntilReturn(options)` — `implicitly any`
- תיקון: `(options?: WatchStateWatchOptions) => ...` + `import type { WatchStateWatchOptions } from './watchdog/reward-watchdog'`

**4. `types.ts` — `getRemainingSeconds: () => number | null`**

- ההצהרה בקיט הייתה `() => number`, אבל המימוש ב-`reward-watchdog.ts` מחזיר `number | null`. תוקן ל-`number | null`.

#### החלטות ארכיטקטורה

- **`declare global` ב-`types.ts` ולא ב-`global.d.ts` נפרד**: צרכני הקיט (8 משחקים) לא תמיד כוללים את ה-`*.d.ts` של הקיט ב-tsconfig שלהם. `types.ts` הוא מודול שמיובא בכל מקום (דרך `index.ts`), ולכן ה-`declare global` שבו חל אוטומטית. שיטה זו מועדפת בקיטים שמשרתים צרכנים עם tsconfig שונים.

- **לא תוקנו שגיאות `FullyKiosk` באותו קומיט**: המשחקים `passcode`, `sort-cards`, `train-addition`, `jigsaw-v2` עדיין מקבלים 5-7 שגיאות מ-`fully-kiosk-js` — methods חסרים (`getBooleanSetting`, `getFileList`, `getStringRawSetting`, `readFile`) ו-`Subsequent property declarations must have the same type`. אלו בעיות בחבילה אחרת ובאקראיים פנימיים, לא קשור לקיט. ייפתר בקומיט נפרד אם נחליט.

#### תוצאה

| משחק | לפני | אחרי |
|------|------|------|
| `learn-booster-kit` (עצמו) | 0/0 | 0/0 |
| `find-letter-game` | 12 errors | 0 errors, 10 warnings |
| `lotto-game` | 0 errors | 0 errors |
| `wordys-game` | 0 errors | 0 errors |
| `kit-test-screen` | 0 errors | 0 errors |
| `passcode/sort-cards/train-addition/jigsaw-v2` | 6-7 errors | 6-7 errors (לא תוקן — `FullyKiosk`) |

---

## 2026-03-18 16:30

### הטמעת ArkType — runtime validation לכל נקודות כניסת הנתונים

הוספת ספריית ArkType 2.x כשכבת validation runtime לכל הנתונים החיצוניים שנכנסים למערכת: localStorage, BroadcastChannel, import.meta.env, Fully Kiosk API, וקלט משתמש מהטופס.

#### מה בוצע?

**1. תשתית schemas מרכזית**

- נוצר `src/schemas.ts` — קובץ schemas מרכזי עם כל הטיפוסים: `ConfigSchemaV1`, `ProfileSchema`, `ProfilesStateSchema`, `ProfilesExportPayloadSchema`, `OldConfigSchema`, `FullyItemSchema`, `AppListItemSchema`, `VideoItemSchema`
- כל הטיפוסים המתאימים ב-`src/types.ts` הוחלפו ב-re-exports מ-schemas (מקור אמת אחד)
- הותקן `arktype@2.2.0` כ-dependency

**2. גרסאות סכמת Config (Schema Versioning)**

- `ConfigSchemaV1` — הגרסה הנוכחית
- `CONFIG_SCHEMA_VERSION`, `CONFIG_SCHEMA_REGISTRY` — מאפשרים migration עתידי בין גרסאות
- `_configSchemaVersion` נשמר ב-localStorage עם כל שמירה
- טעינה מ-localStorage בוחרת schema מה-registry לפי גרסה

**3. Validation בטעינה מ-localStorage**

- `loadConfigFromStorage()` — `ConfigSchema.partial()` עם version-aware loading
- `loadFromStorage()` בprofiles — `ProfilesStateSchema` + fallback ל-`normalizeState()`
- `loadOverlaySettings()` — `OverlayTimerSettingsSchema` עם constraints מספריים
- `importProfiles()` — `ProfilesExportPayloadSchema` + שינוי signature ל-`unknown`

**4. Validation בשמירה (form inputs)**

- `updateConfig()` — `ConfigSchema` מאמת config מלא לפני שמירה, זורק שגיאה אם לא תקין
- `SettingsForm.svelte` כבר עוטף ב-try-catch → מציג שגיאה למשתמש

**5. Validation ל-BroadcastChannel**

- `listenForCommands()` — `TimerCommandSchema` מאמת פקודות נכנסות
- `overlay-settings` — `OverlayTimerSettingsSchema` מחליף `validate()` ידני

**6. ריכוז משתני סביבה**

- נוצר `src/lib/config/env.ts` — ArkType validation לכל `VITE_*` vars
- עודכן `src/vite-env.d.ts` עם `ImportMetaEnv` interface
- כל 5 הקבצים הצורכים עודכנו לייבא מ-`env.ts` במקום `import.meta.env` ישירות
- אזהרות מפורשות למשתנים קריטיים חסרים
- `getFilesFromGDrive()` — early return אם API key חסר (מונע קריאות רשת מיותרות)

**7. OldConfig migration**

- `OldConfigSchema` + `migrateOldConfig()` ב-`config-manager.ts`
- `initializeConfig()` בודק `window.config` ומבצע migration אם מזהה פורמט ישן

**8. Fully Kiosk API validation**

- `getFileList()` — `FullyItemSchema.array()` על JSON.parse result
- `getAppsList()` + `getExampleAppList()` — `AppListItemSchema.array()` על API responses

**9. בדיקות (42 tests)**

- `test/schemas.spec.ts` — בדיקות per-version לכל schema
- כולל: ConfigSchemaV1, CONFIG_SCHEMA_REGISTRY, ProfileSchema, ProfilesStateSchema, ProfilesExportPayloadSchema, OldConfigSchema, OverlayTimerSettingsSchema, TimerCommandSchema, FullyItemSchema, AppListItemSchema

#### החלטות ארכיטקטורה

- **Schema-first לנתונים חיצוניים, interfaces לטיפוסי runtime**: טיפוסים שמכילים פונקציות, Svelte stores, DOM elements (כמו `VideoController`, `TimerController`) נשארו כ-interfaces ב-`types.ts` — ArkType לא מאמת פונקציות
- **קובץ schemas מרכזי vs. ליד כל type**: נבחר קובץ מרכזי `src/schemas.ts` כי הטיפוסים מתייחסים זה לזה (`Profile` מכיל `Config`, `ProfilesState` מכיל `Profile`)
- **Validation ב-`updateConfig()` ולא בטופס**: נקודת חנק אחת שמגנה על כל הצרכנים (טופס, קוד חיצוני, אוטומציה)
- **`normalizeState()` נשמרת**: ArkType הוא שכבה ראשונה; `normalizeState` מטפלת ב-corrupted/partial data כ-best-effort fallback
- **`FullyItem` — schema בלי re-export**: הטיפוס מגיע מ-`fully-kiosk-js`, ה-schema משמש רק ל-runtime validation

#### מעקפים ופתרונות

- **`ConfigSchema.partial()` בטעינה**: localStorage שומר partial overrides (לא config מלא). `partial()` הופך כל שדה ל-optional, ו-`deepMerge` עם `defaultConfig` ממלא חסרים
- **clamp נשמר ב-`saveOverlaySettings()`**: ArkType דוחה ערכים מחוץ לתחום (לא מעגן אותם). ה-clamp הידני נשאר בצד השמירה כדי לוודא שערכים תמיד בתחום
- **`_configSchemaVersion` optional**: נתונים ישנים ב-localStorage אין להם שדה זה — ברירת מחדל 1 לתאימות לאחור
