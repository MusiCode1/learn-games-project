# תכנות פונקציונלי בפרויקט — Learn Games

> מסמך זה מגדיר **איך** ועד **כמה** ליישם תכנות פונקציונלי (FP) בפרויקט. הוא נכתב במכוון *לא* כ-manifesto פונקציונלי טהור — אלא כאסטרטגיה פרגמטית שמכבדת את העובדה שזה פרויקט UI שרץ על Cloudflare ולא backend שצריך לעבור ל-Go.
>
> לכללי קוד כלליים (TS, Svelte, naming) ראה [`coding-conventions.md`](./coding-conventions.md).

---

## 1. העיקרון המרכזי

**Functional Core, Imperative Shell**

- **Functional core** — לוגיקה עסקית, חישובים, transformations. *פונקציות טהורות בלי IO*.
- **Imperative shell** — UI, state stores (Svelte runes), DOM events, audio, network, localStorage. *Side effects מותרים פה, ורק פה.*

### מה זה אומר בפועל

```
┌─────────────────────────────────┐
│  IMPERATIVE SHELL               │
│  ├─ +page.svelte                │
│  ├─ settings.svelte.ts (store)  │
│  ├─ tts.ts (audio I/O)          │
│  └─ events / animations         │
│                                 │
│    ↕  function calls            │
│                                 │
│  FUNCTIONAL CORE                │
│  ├─ migrate(old, version)       │
│  ├─ validateSettings(data)      │
│  ├─ shuffle(arr, seed)          │
│  ├─ computeScore(state)         │
│  └─ generateDeck(provider)      │
└─────────────────────────────────┘
```

ה-shell **קורא** לפונקציות הטהורות ו**מחיל** את התוצאות על state ריאקטיבי. ה-core לא יודע על Svelte, על DOM, על localStorage.

---

## 2. מה כן — Pure functions

### 2.1 מתי הפונקציה טהורה?

- **אותו input** → **אותו output**, תמיד.
- **אין side effects**: אין I/O, אין `console.log`, אין mutation של ארגומנטים.
- **אין dependency** על זמן, רנדומיות, או state חיצוני (אלא אם הם פרמטרים).

### 2.2 דוגמאות שכבר קיימות בפרויקט

```ts
// ✅ packages/learn-booster-kit/src/lib/utils/shuffle-array.ts
export function shuffleArray<T>(arr: T[], seed: number): T[] { ... }

// ✅ apps/find-letter-game/src/lib/utils/cooldown.ts
export function computeCooldownView(now: number, untilTs: number, durationMs: number) { ... }

// ✅ apps/jigsaw-puzzle-game/version-2/src/lib/puzzle/adaptive-grid.ts
export function adaptGridToImage(input: AdaptGridInput): AdaptGridResult { ... }
```

### 2.3 איפה מצפים לכתוב pure

| נושא | דוגמה |
|------|--------|
| **Schema migrations** | `migrateSettings(old, fromV, toV)` |
| **Validation** | `validateSettings(data) → Result<T, ValidationError>` |
| **Shuffle / random** | `shuffleArray(arr, seed)` |
| **Scoring / computations** | `computeProgress(wins, target)` |
| **Content generation** | `generateDeck(provider, selectedIds, settings)` |
| **Cooldown logic** | `computeCooldownView(now, untilTs)` |
| **Adaptive layout** | `adaptGridToImage(target, ratio)` |

---

## 3. מה לא — Imperative shell

### 3.1 איפה mutation מותר ומומלץ

- **`$state` של Svelte 5** — runes הם Proxy שמתאמן עצמו ל-`state.x = 5`. להילחם בזה = boilerplate חסר תועלת.

```ts
// ✅ Svelte 5 native
class SettingsStore {
  cooldownMs = $state(3000);
  reset() {
    this.cooldownMs = 3000;  // ← mutation, זה ה-DX
  }
}

// ❌ FP אגרסיבי שלא מתאים לכאן
class SettingsStore {
  state = $state({ cooldownMs: 3000 });
  reset() {
    this.state = { ...this.state, cooldownMs: 3000 };  // boilerplate
  }
}
```

- **`$effect`** — Side effects framework. שם הוא עושה את עבודתו.
- **Event handlers** — `onclick`, `oninput`. Imperative by nature.
- **DOM/Audio/Canvas** — `audio.play()`, `canvas.drawImage(...)`. אין מה לטהר.
- **Network / localStorage / BroadcastChannel** — IO ב-shell.

### 3.2 אסור FP heavy

- ❌ **Effect.ts / fp-ts** — paradigm shift כבד, ROI נמוך, התראת קהילה.
- ❌ **Free monads / IO monads** — אובר-קיל. הפרויקט הוא UI.
- ❌ **Immutability על Svelte runes** — קונפליקט מפורש עם ה-framework.
- ❌ **Lazy evaluation / function composition עיוורת** — קוד שאי-אפשר לקרוא = בעיה.

---

## 4. Result<T, E> — טיפול בשגיאות

### 4.1 הכלל

**ב-public API שיכול לכשול — מחזירים `Result<T, E>`, לא זורקים.**

```ts
// ❌ אסור — exceptions ב-public API
export async function updateSettings(data: unknown): Promise<Config> {
  const result = ConfigSchema(data);
  if (result instanceof type.errors) {
    throw new Error(result.summary);  // ← זה גורם ל-call-site to wrap ב-try/catch
  }
  // ...
}

// ✅ נכון — Result מפורש
export async function updateSettings(data: unknown): Promise<Result<Config, ValidationError>> {
  const validated = ConfigSchema(data);
  if (validated instanceof type.errors) {
    return failure({ kind: 'validation', summary: validated.summary });
  }
  // ...
  return success(saved);
}
```

### 4.2 מתי כן זורקים

- **Programmer errors** (לא user errors) — `assertInitialized()`, `assert(arr.length > 0)`. אלו pre-conditions שלא אמורות לקרות בקוד תקין.
- **Svelte effects / lifecycle hooks** — אם זורק שם, ה-framework מטפל.
- **Pure helpers שמקבלים input מוגדר היטב** — אם ה-input חתום ע"י TypeScript, לא צריך Result.

### 4.3 ה-type עצמו

ה-Result type מוגדר ב-`packages/learn-booster-kit/src/lib/result.ts` (לכשייוצר):

```ts
export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

export function success<T, E = never>(value: T): Result<T, E> {
  return { success: true, value };
}

export function failure<E, T = never>(error: E): Result<T, E> {
  return { success: false, error };
}

export function match<T, E, R>(
  result: Result<T, E>,
  onSuccess: (value: T) => R,
  onFailure: (error: E) => R,
): R {
  return result.success ? onSuccess(result.value) : onFailure(result.error);
}
```

**בלי תלות חיצונית** (לא `neverthrow`) — type union פשוט. תואם ל-pattern שמיושם כבר ב-`apps/read-faster/src/lib/utils/result.ts`.

### 4.4 שימוש בצרכן

```ts
import { updateGameSettings, match } from 'learn-booster-kit';

const result = await updateGameSettings('find-letter-game', newSettings);

// אופציה א — explicit check
if (!result.success) {
  showError(result.error.summary);
  return;
}
const config = result.value;

// אופציה ב — pattern matching
match(result,
  (config) => showSuccess(),
  (err) => showError(err.summary),
);
```

---

## 5. Immutability — מאוזן

### 5.1 ב-core (pure functions)

- **תמיד** — אסור לשנות args. מחזירים אובייקט חדש.
- שימוש ב-`{ ...obj, x: 5 }` או `[...arr, item]` — לא `obj.x = 5` או `arr.push(item)`.

```ts
// ✅ pure
function setCooldown(state: SettingsData, ms: number): SettingsData {
  return { ...state, cooldownMs: ms };
}

// ❌ mutation של arg
function setCooldown(state: SettingsData, ms: number): void {
  state.cooldownMs = ms;  // ← אסור ב-pure
}
```

### 5.2 ב-shell (Svelte stores)

- **מותר ומומלץ** mutation ישיר על `$state`.
- ה-Proxy של Svelte מטפל ב-immutability ב-runtime (כל set יוצר signal חדש).

---

## 6. Composition over Inheritance

### 6.1 העדפה מובהקת

- **Factory functions** במקום class hierarchies שיורשות לוגיקה
- **Higher-order functions** שמקבלות פונקציות כפרמטרים
- **Object composition** במקום deep inheritance

```ts
// ✅ Composition
function createSettingsStore<T>(opts: { gameId, defaults, schemaVersion }) {
  const state = $state<T>(structuredClone(opts.defaults));
  return { state, reset: () => Object.assign(state, opts.defaults) };
}

// ❌ Inheritance (במקרה זה — מסורבל ל-`$state` generic)
abstract class BaseSettingsStore<T> { /* ... */ }
class FindLetterSettings extends BaseSettingsStore<...> { /* ... */ }
```

### 6.2 יוצא דופן: Class לקבוצת state

`SettingsStore` / `GameStateStore` של משחקים *הם* class — לא בגלל ירושה, אלא כי Svelte 5 runes יושבות נוח על class fields. זה לא inheritance.

---

## 7. צ'קליסט מהיר

לפני כתיבת פונקציה חדשה — שאל:

- [ ] האם הפונקציה מבצעת **חישוב/transformation בלי IO**? → ל-core (pure).
- [ ] האם היא נוגעת ב-`$state`, ב-DOM, ב-localStorage, ב-`fetch`? → ל-shell.
- [ ] **יכולה להיכשל** עם input תקין מבחינת TS? → מחזירה `Result<T, E>`.
- [ ] **יכולה להיכשל** רק עם input פגום (programmer error)? → זורקת.
- [ ] **מקבלת בחירה מ-API**? → factory function עדיפה על class hierarchy.

---

## 8. תכנון: היכן הפרויקט עומד עכשיו

המצב הנוכחי (2026-05-16):

| מקום | סטטוס FP |
|------|-----------|
| `packages/learn-booster-kit/lib/utils/*` | ✅ חלקי pure |
| `apps/find-letter-game/lib/utils/cooldown.ts` | ✅ pure |
| `apps/jigsaw-puzzle-game/version-2/lib/puzzle/adaptive-grid.ts` | ✅ pure |
| `apps/lotto-game/lib/utils/gameLogic.ts` | ✅ pure |
| `updateGameSettings` ב-קיט | ❌ זורק — צריך לעבור ל-Result |
| 8 משחקים: `SettingsStore` / `GameStateStore` | ⚠️ Svelte 5 native (OK) — לא ייכפו עליהם FP |

### יעדי המרה (לפי סדר עדיפות)

1. **`Result` type בקיט** + תיקון `updateGameSettings` (מיידי)
2. **`createSettingsStore` factory** שמחזיר Result מ-load/migrate (לפי `platform-plan.md`)
3. **Migration helpers ב-`lib/core/`** — pure functions ל-schema versioning
4. **Content provider validation** — Result-aware

---

## 9. הפניות

- [`coding-conventions.md`](./coding-conventions.md) — כללי קוד כלליים
- [`game-design-rules.md`](./game-design-rules.md) — game design (לא קוד)
- [`platform-plan.md`](./platform-plan.md) — roadmap לפלטפורמיזציה
- [`apps/read-faster/src/lib/utils/result.ts`](../apps/read-faster/src/lib/utils/result.ts) — Result type implementation עם match
