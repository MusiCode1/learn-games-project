# Component System — מפרט יישום

> מסמך זה הוא **מפרט הנדסי** ליישום שכבת קומפוננטות העיצוב המשותפת של הפלטפורמה.
> הוא נכתב כדי לשמש סוכן AI (Sonnet) שמבצע את היישום עם TDD.
> כל מי שיממש את המפרט הזה — חייב לקרוא אותו במלואו לפני שכותב שורת קוד אחת.

נכתב: 2026-05-17. מבוסס על `docs/platform-plan.md` (שלב 0-2) + שיחת תכנון.

---

## 1. מטרה ו-Non-goals

### מטרה

לבנות תשתית עיצוב וקומפוננטות משותפת ב-`packages/learn-booster-kit`, ולהוכיח אותה בדף showcase ב-`apps/kit-test-screen`. **לא** למגר כעת את המשחקים — Pilot צמוד בלבד.

### Non-goals (לא בסקופ הזה)

- ❌ מיגרציה של `find-letter-game` או כל משחק אחר — זה שלב נפרד אחרי שה-showcase תקין.
- ❌ שינוי קומפוננטות קיימות בקיט (`SettingsForm`, `BoosterContainer`, `AdminGate`, וכו') — עליהן עובד **סוכן מקביל**.
- ❌ Backend, content abstraction, providers — לשלבים מאוחרים יותר.
- ❌ Effect.ts / fp-ts / monads — ראה `docs/functional-programming.md`.

### עקרונות מנחים

לפי `docs/coding-conventions.md` ו-`docs/functional-programming.md`:

- Svelte 5 runes בלבד (`$state`, `$derived`, `$effect`, `$props`, `$bindable`).
- Snippets במקום slots (`{#snippet}`, `{@render}`).
- `onclick` ולא `on:click`.
- TypeScript מלא — `lang="ts"`.
- שמות: PascalCase לקומפוננטות, kebab-case למודולים, `.svelte.ts` ל-runes מחוץ לקומפוננטה.
- **אסור hardcoded Hebrew בקוד** — כל מחרוזת UI ב-prop מהצרכן (לא במחרוזת מובנית בקיט).
- RTL מלא — לוגיקה כיוונית עם CSS logical properties (`margin-inline-start`, `padding-inline`, וכו').
- Pure functions בלוגיקה. `Result<T, E>` מ-`neverthrow` ב-public API שיכול להיכשל (לא רלוונטי כאן רוב הזמן — UI primitives).
- Composition over inheritance.

---

## 2. תיאום עם הסוכן המקביל

סוכן אחר עובד במקביל על **SettingsStore base class** ב-`packages/learn-booster-kit`. כדי למנוע התנגשות:

### תיקיות **שלך** (יישום זה)

```
packages/learn-booster-kit/src/ui/theme/
packages/learn-booster-kit/src/ui/animations/
packages/learn-booster-kit/src/ui/primitives/
packages/learn-booster-kit/src/ui/shell/
apps/kit-test-screen/src/routes/showcase/      (חדש)
apps/kit-test-screen/src/routes/+layout.svelte (יש לעדכן navigation)
```

### תיקיות **שלא לגעת בהן**

- `packages/learn-booster-kit/src/lib/config/` — שטח הסוכן השני (settings).
- `packages/learn-booster-kit/src/ui/components/Settings*.svelte` — שטח שלו.
- כל משחק תחת `apps/` חוץ מ-`kit-test-screen`.

### `src/index.ts` (exports)

יש לעדכן את `packages/learn-booster-kit/src/index.ts` בסוף הסקופ שלך — להוסיף exports חדשים. **אל תמחק** export קיים. אם יש merge conflict עם הסוכן השני, פנה למפעיל ב-progress note.

### `src/styles.css`

יש לעדכן — מצריך תיאום. הוסף `@import` חדשים ל-tokens/themes/animations, **אל תמחק** קיים.

---

## 3. ארכיטקטורת Theme — Tailwind 4 + CSS custom properties

### 3.1 העיקרון

Tailwind 4 מאפשר `@theme` block שמייצר utility classes מ-CSS variables. כדי לאפשר החלפת theme בזמן ריצה דרך `data-theme="..."`, נשתמש בטכניקה הזו:

```css
/* tokens.css */
@theme {
	--color-brand-primary: var(--theme-brand-primary);
	--color-feedback-error: var(--theme-feedback-error);
	--color-surface-base: var(--theme-surface-base);
	/* ... */
}
```

Tailwind ייצור utilities `bg-brand-primary`, `text-feedback-error`, וכו'. ה-`var(--theme-*)` נפתר ב-runtime לפי ה-theme הפעיל.

ערכי ברירת מחדל מוגדרים תחת `:root` (theme "default"). שאר ה-themes תחת `[data-theme="kids"]`, `[data-theme="minimal"]`.

### 3.2 מבנה קבצים

```
packages/learn-booster-kit/src/ui/theme/
├── tokens.css              ← @theme block (Tailwind 4) + ה-var() mappings הסמנטיים
├── animations.css          ← @keyframes + utility classes
└── themes/
    ├── default.css         ← "Trust" (ברירת מחדל ב-:root)
    ├── kids.css            ← [data-theme="kids"]
    └── minimal.css         ← [data-theme="minimal"]
```

### 3.3 רשימת Tokens מלאה

כל ה-tokens חייבים להיות **סמנטיים**. אסור לקרוא ל-token בשם של צבע (`--color-blue-500`) — רק לפי תפקיד (`--color-brand-primary`).

#### Surfaces & Backgrounds

| Token | Default ("Trust") | Kids | Minimal |
|-------|------|------|---------|
| `--theme-surface-base` | `#fafaf9` (stone-50) | `#fef3c7` (קרם רך) | `#ffffff` |
| `--theme-surface-elevated` | `#ffffff` | `#ffffff` | `#ffffff` |
| `--theme-surface-sunken` | `#f1f5f9` (slate-100) | `#fde68a` (amber-200) | `#fafafa` (neutral-50) |
| `--theme-surface-overlay` | `rgba(15, 23, 42, 0.55)` | `rgba(124, 58, 237, 0.5)` | `rgba(0, 0, 0, 0.7)` |
| `--theme-border-subtle` | `#e2e8f0` (slate-200) | `#fcd34d` (amber-300) | `#e5e5e5` (neutral-200) |
| `--theme-border-strong` | `#cbd5e1` (slate-300) | `#f59e0b` (amber-500) | `#a3a3a3` (neutral-400) |

#### Brand

| Token | Default | Kids | Minimal |
|-------|------|------|---------|
| `--theme-brand-primary` | `#1e40af` (blue-800) | `#7c3aed` (violet-600) | `#171717` (neutral-900) |
| `--theme-brand-primary-hover` | `#1e3a8a` (blue-900) | `#6d28d9` (violet-700) | `#000000` |
| `--theme-brand-secondary` | `#ea580c` (orange-600) | `#facc15` (yellow-400) | `#3b82f6` (blue-500) |
| `--theme-brand-secondary-hover` | `#c2410c` (orange-700) | `#eab308` (yellow-500) | `#2563eb` (blue-600) |

#### Text

| Token | Default | Kids | Minimal |
|-------|------|------|---------|
| `--theme-text-primary` | `#0f172a` (slate-900) | `#1e1b4b` (indigo-950) | `#171717` |
| `--theme-text-secondary` | `#475569` (slate-600) | `#5b21b6` (violet-800) | `#525252` (neutral-600) |
| `--theme-text-tertiary` | `#94a3b8` (slate-400) | `#a78bfa` (violet-400) | `#a3a3a3` |
| `--theme-text-on-brand` | `#ffffff` | `#1e1b4b` | `#ffffff` |
| `--theme-text-on-feedback` | `#ffffff` | `#ffffff` | `#ffffff` |

#### Feedback

| Token | Default | Kids | Minimal |
|-------|------|------|---------|
| `--theme-feedback-success` | `#16a34a` (green-600) | `#22c55e` (green-500) | `#16a34a` |
| `--theme-feedback-success-bg` | `#dcfce7` (green-100) | `#bbf7d0` (green-200) | `#f0fdf4` (green-50) |
| `--theme-feedback-error` | `#dc2626` (red-600) | `#f43f5e` (rose-500) | `#dc2626` |
| `--theme-feedback-error-bg` | `#fee2e2` (red-100) | `#ffe4e6` (rose-100) | `#fef2f2` (red-50) |
| `--theme-feedback-warning` | `#d97706` (amber-600) | `#f97316` (orange-500) | `#d97706` |
| `--theme-feedback-warning-bg` | `#fef3c7` (amber-100) | `#fed7aa` (orange-200) | `#fffbeb` (amber-50) |

#### Spacing & Sizing

| Token | Default | Kids | Minimal |
|-------|------|------|---------|
| `--theme-radius-sm` | `4px` | `8px` | `2px` |
| `--theme-radius-md` | `8px` | `16px` | `4px` |
| `--theme-radius-lg` | `16px` | `24px` | `8px` |
| `--theme-radius-pill` | `9999px` | `9999px` | `9999px` |
| `--theme-touch-min` | `70px` | `80px` | `70px` |

#### Shadows

| Token | Default | Kids | Minimal |
|-------|------|------|---------|
| `--theme-shadow-card` | `0 4px 12px rgba(15, 23, 42, 0.06)` | `0 8px 20px rgba(124, 58, 237, 0.15)` | `none` (border בלבד) |
| `--theme-shadow-elevated` | `0 8px 24px rgba(15, 23, 42, 0.12)` | `0 12px 32px rgba(124, 58, 237, 0.22)` | `0 1px 2px rgba(0,0,0,0.08)` |
| `--theme-shadow-focus` | `0 0 0 3px rgba(30, 64, 175, 0.4)` | `0 0 0 4px rgba(124, 58, 237, 0.4)` | `0 0 0 2px rgba(0, 0, 0, 0.8)` |

#### Typography

| Token | Default | Kids | Minimal |
|-------|------|------|---------|
| `--theme-font-display` | `"Heebo", system-ui, sans-serif` | `"Varela Round", "Heebo", system-ui, sans-serif` | `"IBM Plex Sans Hebrew", system-ui, sans-serif` |
| `--theme-font-body` | `"Heebo", system-ui, sans-serif` | `"Heebo", system-ui, sans-serif` | `"IBM Plex Sans Hebrew", system-ui, sans-serif` |
| `--theme-font-size-xs` | `0.75rem` | `0.875rem` | `0.75rem` |
| `--theme-font-size-sm` | `0.875rem` | `1rem` | `0.875rem` |
| `--theme-font-size-md` | `1rem` | `1.125rem` | `1rem` |
| `--theme-font-size-lg` | `1.25rem` | `1.5rem` | `1.125rem` |
| `--theme-font-size-xl` | `1.5rem` | `2rem` | `1.25rem` |
| `--theme-font-weight-regular` | `400` | `500` | `400` |
| `--theme-font-weight-bold` | `700` | `800` | `600` |

> **הערה לגבי fonts**: `Heebo` כבר מותקן ב-kit (`@fontsource/heebo`). את `Varela Round` ו-`IBM Plex Sans Hebrew` השאר ב-fallback chain — אל תוסיף תלות חדשה ל-`package.json`. אם הם לא קיימים אצל המשתמש, ייפול ל-`Heebo` או system-ui — זה בסדר ל-MVP.

### 3.4 Tailwind 4 — `@theme` block

ב-`tokens.css` יש להגדיר את ה-mapping:

```css
@theme {
	/* Surfaces */
	--color-surface-base: var(--theme-surface-base);
	--color-surface-elevated: var(--theme-surface-elevated);
	--color-surface-sunken: var(--theme-surface-sunken);
	--color-surface-overlay: var(--theme-surface-overlay);
	--color-border-subtle: var(--theme-border-subtle);
	--color-border-strong: var(--theme-border-strong);

	/* Brand */
	--color-brand-primary: var(--theme-brand-primary);
	--color-brand-primary-hover: var(--theme-brand-primary-hover);
	--color-brand-secondary: var(--theme-brand-secondary);
	--color-brand-secondary-hover: var(--theme-brand-secondary-hover);

	/* Text */
	--color-text-primary: var(--theme-text-primary);
	--color-text-secondary: var(--theme-text-secondary);
	--color-text-tertiary: var(--theme-text-tertiary);
	--color-text-on-brand: var(--theme-text-on-brand);
	--color-text-on-feedback: var(--theme-text-on-feedback);

	/* Feedback */
	--color-feedback-success: var(--theme-feedback-success);
	--color-feedback-success-bg: var(--theme-feedback-success-bg);
	--color-feedback-error: var(--theme-feedback-error);
	--color-feedback-error-bg: var(--theme-feedback-error-bg);
	--color-feedback-warning: var(--theme-feedback-warning);
	--color-feedback-warning-bg: var(--theme-feedback-warning-bg);

	/* Radius (Tailwind 4 reads --radius-*) */
	--radius-sm: var(--theme-radius-sm);
	--radius-md: var(--theme-radius-md);
	--radius-lg: var(--theme-radius-lg);
	--radius-pill: var(--theme-radius-pill);

	/* Shadows */
	--shadow-card: var(--theme-shadow-card);
	--shadow-elevated: var(--theme-shadow-elevated);
	--shadow-focus: var(--theme-shadow-focus);

	/* Fonts */
	--font-display: var(--theme-font-display);
	--font-body: var(--theme-font-body);
}
```

זה ייצור utility classes:
- `bg-brand-primary`, `text-feedback-error`, `border-border-subtle`, `bg-surface-elevated`
- `rounded-md`, `rounded-pill`
- `shadow-card`, `shadow-elevated`
- `font-display`, `font-body`

### 3.5 ה-themes — מבנה

`default.css`:
```css
:root,
[data-theme='default'] {
	--theme-surface-base: #fafaf9;
	--theme-brand-primary: #1e40af;
	/* ... כל ה-tokens */
}
```

`kids.css`:
```css
[data-theme='kids'] {
	--theme-surface-base: #fef3c7;
	--theme-brand-primary: #7c3aed;
	/* ... */
}
```

`minimal.css`:
```css
[data-theme='minimal'] {
	--theme-surface-base: #ffffff;
	--theme-brand-primary: #171717;
	/* ... */
}
```

### 3.6 `src/styles.css` — entry point

עדכן את הקובץ הזה:

```css
@source '.';

/* Theme tokens + themes */
@import './ui/theme/themes/default.css';
@import './ui/theme/themes/kids.css';
@import './ui/theme/themes/minimal.css';
@import './ui/theme/tokens.css';
@import './ui/theme/animations.css';
```

> **חשוב**: סדר ה-`@import` קובע — `default` הוא `:root` (ברירת מחדל), השאר רק overrides לתחתית tree.

### 3.7 Animations

`animations.css`:

```css
@keyframes lbk-shake {
	0%, 100% { transform: translateX(0); }
	20% { transform: translateX(-10px); }
	40% { transform: translateX(10px); }
	60% { transform: translateX(-7px); }
	80% { transform: translateX(7px); }
}

@keyframes lbk-pop {
	0% { transform: scale(1); }
	50% { transform: scale(1.12); }
	100% { transform: scale(1); }
}

@keyframes lbk-fade-in {
	from { opacity: 0; }
	to { opacity: 1; }
}

.lbk-anim-shake {
	animation: lbk-shake 0.5s ease-in-out;
}

.lbk-anim-pop {
	animation: lbk-pop 0.6s ease-out;
}

.lbk-anim-fade-in {
	animation: lbk-fade-in 0.2s ease-out;
}
```

> **תחילית `lbk-`** = "learn-booster-kit". מונע התנגשות עם class names של אפליקציות.

---

## 4. Animation helpers (Svelte 5 runes)

### 4.1 מטרה

לתת לקומפוננטה צרכנית דרך נוחה להפעיל אנימציה trigger-based בלי לנהל ידנית setTimeout.

### 4.2 `use-shake.svelte.ts`

מיקום: `packages/learn-booster-kit/src/ui/animations/use-shake.svelte.ts`

```ts
/**
 * Hook שמייצר state בוליאני שהופך true ל-durationMs ואז חוזר false.
 * משמש להפעלת class `lbk-anim-shake` באלמנט.
 *
 * @example
 * const shake = useShake();
 * <div class:lbk-anim-shake={shake.active}>...</div>
 * <button onclick={() => shake.trigger()}>Wrong!</button>
 */
export function useShake(durationMs = 500) {
	let active = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return {
		get active() {
			return active;
		},
		trigger() {
			if (timeoutId) clearTimeout(timeoutId);
			active = false;
			// Force reflow trick: set true on next tick to retrigger animation
			queueMicrotask(() => {
				active = true;
				timeoutId = setTimeout(() => {
					active = false;
					timeoutId = undefined;
				}, durationMs);
			});
		}
	};
}
```

### 4.3 `use-pop.svelte.ts`

זהה ל-`useShake` רק עם `durationMs = 600` והשם `active` נשאר.

### 4.4 טסטים (vitest, environment: node, ב-`packages/learn-booster-kit/test/`)

**TDD: כתוב טסט אדום ראשון.**

`test/ui/animations/use-shake.spec.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useShake } from '../../../src/ui/animations/use-shake.svelte';
import { flushSync } from 'svelte';

describe('useShake', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('starts inactive', () => {
		const shake = useShake();
		expect(shake.active).toBe(false);
	});

	it('becomes active after trigger and after microtask flushes', async () => {
		const shake = useShake(100);
		shake.trigger();
		await Promise.resolve(); // flush microtask
		expect(shake.active).toBe(true);
	});

	it('returns to inactive after durationMs', async () => {
		const shake = useShake(100);
		shake.trigger();
		await Promise.resolve();
		vi.advanceTimersByTime(101);
		expect(shake.active).toBe(false);
	});

	it('re-triggering during active resets the timer', async () => {
		const shake = useShake(100);
		shake.trigger();
		await Promise.resolve();
		vi.advanceTimersByTime(50);
		shake.trigger();
		await Promise.resolve();
		vi.advanceTimersByTime(80);
		expect(shake.active).toBe(true); // עדיין פעיל, כי טיימר אופס
		vi.advanceTimersByTime(30);
		expect(shake.active).toBe(false);
	});
});
```

> **הערה לסונט**: השימוש ב-`$state` מחוץ לקומפוננטה דורש את ה-runes plugin של svelte ב-vitest. וודא ש-`vite.config.ts` של הקיט עובד עם זה (ה-svelte plugin כבר מוגדר). אם vitest מתלונן על `$state` — צריך לוודא שהקובץ `.svelte.ts` ולא `.ts`, וזה מה שאני מבקש.

---

## 5. Primitives — מפרט מלא

לכל primitive: **API → התנהגות → טסטים → קבלה**.

### 5.1 `Button.svelte`

מיקום: `packages/learn-booster-kit/src/ui/primitives/Button.svelte`

#### Props

```ts
interface Props {
	variant?: 'primary' | 'secondary' | 'ghost' | 'danger';  // default: 'primary'
	size?: 'sm' | 'md' | 'lg';                                // default: 'md'
	disabled?: boolean;
	type?: 'button' | 'submit' | 'reset';                    // default: 'button'
	onclick?: (e: MouseEvent) => void;
	'aria-label'?: string;
	children: Snippet;
	class?: string;  // append-only
}
```

#### התנהגות

- `variant='primary'`: `bg-brand-primary text-text-on-brand hover:bg-brand-primary-hover`
- `variant='secondary'`: `bg-surface-sunken text-text-primary border border-border-subtle hover:bg-border-subtle`
- `variant='ghost'`: `bg-transparent text-text-primary hover:bg-surface-sunken`
- `variant='danger'`: `bg-feedback-error text-text-on-feedback hover:opacity-90`
- `size='sm'`: `px-3 py-1.5 text-sm` + `min-h-[44px]` (touch min)
- `size='md'`: `px-4 py-2 text-base` + `min-h-[52px]`
- `size='lg'`: `px-6 py-3 text-lg` + `min-h-[70px]` (משחק primary)
- `rounded-pill` תמיד.
- `focus-visible:shadow-focus focus-visible:outline-none`
- `disabled`: `opacity-50 cursor-not-allowed pointer-events-none`
- `font-weight: 700` (bold) — מותאם ל-`--theme-font-weight-bold`

#### טסטים (browser, ב-`apps/kit-test-screen/src/lib/primitives/Button.svelte.test.ts`)

```ts
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Button from 'learn-booster-kit/ui/primitives/Button.svelte';

describe('Button', () => {
	it('מציג את ה-children', async () => {
		const screen = render(Button, { children: () => 'לחץ עליי' });
		await expect.element(screen.getByRole('button')).toHaveTextContent('לחץ עליי');
	});

	it('קורא ל-onclick בלחיצה', async () => {
		const onclick = vi.fn();
		const screen = render(Button, { children: () => 'X', onclick });
		await screen.getByRole('button').click();
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('לא קורא ל-onclick כאשר disabled', async () => {
		const onclick = vi.fn();
		const screen = render(Button, { children: () => 'X', onclick, disabled: true });
		await screen.getByRole('button').click().catch(() => {});
		expect(onclick).not.toHaveBeenCalled();
	});

	it('משתמש בצבעי brand-primary כברירת מחדל', async () => {
		const screen = render(Button, { children: () => 'X' });
		const btn = screen.getByRole('button').element() as HTMLElement;
		const styles = window.getComputedStyle(btn);
		expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)'); // יש רקע
	});
});
```

> ה-imports `learn-booster-kit/ui/primitives/Button.svelte` עובדים בגלל ה-`exports` ב-`package.json` (`"./ui/*": "./src/ui/*.svelte"`). שים לב — זה pattern עם `*.svelte`, אז ייתכן שתצטרך להרחיב את ה-pattern. אם לא עובד: `import Button from '../../../packages/learn-booster-kit/src/ui/primitives/Button.svelte'` — alias נקבע ב-vite.config של kit-test-screen.

#### קבלה

- ✅ כל variant נראה שונה ב-default theme.
- ✅ החלפת theme ל-`kids` משנה צבעים ופונט.
- ✅ `disabled` מונע לחיצה.
- ✅ `focus-visible` מציג shadow.

---

### 5.2 `IconButton.svelte`

מיקום: `packages/learn-booster-kit/src/ui/primitives/IconButton.svelte`

#### Props

```ts
interface Props {
	icon: Snippet;                            // ה-SVG מגיע כ-snippet מהצרכן
	label: string;                            // aria-label (חובה לנגישות)
	variant?: 'solid' | 'subtle' | 'ghost';  // default: 'subtle'
	size?: 'sm' | 'md' | 'lg';                // default: 'md' (40x40)
	disabled?: boolean;
	onclick?: (e: MouseEvent) => void;
	showLabel?: boolean;                      // אם true — מציג גם טקסט; default: false
	class?: string;
}
```

#### התנהגות

- `variant='solid'`: `bg-brand-primary text-text-on-brand`
- `variant='subtle'`: `bg-surface-sunken text-text-secondary hover:text-text-primary`
- `variant='ghost'`: `bg-transparent text-text-secondary hover:bg-surface-sunken`
- `size='sm'`: `w-9 h-9` (36px)
- `size='md'`: `w-10 h-10` (40px)
- `size='lg'`: `w-[70px] h-[70px]` (touch min)
- `rounded-pill` תמיד.
- אם `showLabel=true`: רוחב גמיש, padding אופקי, אייקון + text inline-flex עם gap.

#### טסטים

```ts
describe('IconButton', () => {
	it('חייב label לנגישות', async () => {
		const screen = render(IconButton, {
			icon: () => '🔊',
			label: 'השמע שוב',
			onclick: () => {}
		});
		await expect.element(screen.getByRole('button')).toHaveAttribute('aria-label', 'השמע שוב');
	});

	it('לא מציג טקסט כברירת מחדל', async () => {
		const screen = render(IconButton, { icon: () => '🔊', label: 'X', onclick: () => {} });
		await expect.element(screen.getByRole('button')).not.toHaveTextContent('X');
	});

	it('מציג טקסט כש-showLabel=true', async () => {
		const screen = render(IconButton, {
			icon: () => '🔊',
			label: 'השמע שוב',
			showLabel: true,
			onclick: () => {}
		});
		await expect.element(screen.getByRole('button')).toHaveTextContent('השמע שוב');
	});
});
```

---

### 5.3 `SegmentedControl.svelte`

מיקום: `packages/learn-booster-kit/src/ui/primitives/SegmentedControl.svelte`

#### Props

```ts
interface Option<T extends string> {
	value: T;
	label: string;
}

interface Props<T extends string> {
	options: Option<T>[];
	value: T;        // $bindable
	disabled?: boolean;
	'aria-label'?: string;
	onchange?: (newValue: T) => void;
	class?: string;
}
```

#### התנהגות

- `role="radiogroup"`.
- כל כפתור `role="radio"` עם `aria-checked`.
- העכבר ולחיצה: מעדכן `value` דרך `$bindable` ומפעיל `onchange`.
- מקלדת: ↑ או ← בוחר את הקודם, ↓ או → את הבא, Home/End לקצה (RTL aware via direction).
- ה-pill פנימי שמסמן את הבחירה זז עם transition `transform 200ms ease`.
- מבוסס על העיצוב הקיים בלוטו (ראה `apps/lotto-game/src/lib/components/SegmentedControl.svelte`) — לקרוא ולהבין אותו, להעביר ל-tokens במקום צבעים hardcoded.

#### טסטים

```ts
describe('SegmentedControl', () => {
	const opts = [
		{ value: 'a', label: 'A' },
		{ value: 'b', label: 'B' },
		{ value: 'c', label: 'C' }
	];

	it('מסמן את הערך הנוכחי כ-aria-checked', async () => {
		const screen = render(SegmentedControl, { options: opts, value: 'b' });
		const radios = screen.getByRole('radio').all();
		await expect.element(radios[1]).toHaveAttribute('aria-checked', 'true');
		await expect.element(radios[0]).toHaveAttribute('aria-checked', 'false');
	});

	it('מעדכן value בלחיצה', async () => {
		let val = $state<'a' | 'b' | 'c'>('a');
		const screen = render(SegmentedControl, {
			options: opts,
			value: val,
			onchange: (v) => (val = v)
		});
		await screen.getByText('C').click();
		expect(val).toBe('c');
	});

	it('מפעיל onchange בלחיצה', async () => {
		const onchange = vi.fn();
		const screen = render(SegmentedControl, {
			options: opts,
			value: 'a',
			onchange
		});
		await screen.getByText('B').click();
		expect(onchange).toHaveBeenCalledWith('b');
	});
});
```

---

### 5.4 `ScoreBadge.svelte`

מיקום: `packages/learn-booster-kit/src/ui/primitives/ScoreBadge.svelte`

#### Props

```ts
interface Props {
	label?: string;        // למשל "ניקוד". default: undefined (אין label)
	value: number | string;
	variant?: 'default' | 'success' | 'warning';  // default: 'default'
	icon?: Snippet;
	class?: string;
}
```

#### התנהגות

- pill קומפקטי: `inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border`.
- `variant='default'`: `bg-surface-sunken text-text-primary border-border-subtle`.
- `variant='success'`: `bg-feedback-success-bg text-feedback-success border-transparent`.
- `variant='warning'`: `bg-feedback-warning-bg text-feedback-warning border-transparent`.
- `value` מודגש (`font-bold`), `label` רגיל קטן יותר.

#### טסטים

מינימליים — מציג value, מציג label אם יש, variant משנה צבע (קיים DOM).

---

### 5.5 `Card.svelte`

מיקום: `packages/learn-booster-kit/src/ui/primitives/Card.svelte`

#### Props

```ts
interface Props {
	variant?: 'elevated' | 'flat' | 'outlined';  // default: 'elevated'
	padding?: 'none' | 'sm' | 'md' | 'lg';        // default: 'md'
	interactive?: boolean;                        // hover effect + cursor: pointer
	onclick?: (e: MouseEvent) => void;
	class?: string;
	children: Snippet;
}
```

#### התנהגות

- `variant='elevated'`: `bg-surface-elevated shadow-card border border-border-subtle/50 rounded-lg`.
- `variant='flat'`: `bg-surface-base rounded-lg`.
- `variant='outlined'`: `bg-transparent border-2 border-border-strong rounded-lg`.
- padding: `none=0`, `sm=p-3`, `md=p-5`, `lg=p-8`.
- `interactive=true`: `cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-elevated`.
- אם `onclick` קיים — Card הופך ל-`<button>` עם `type="button"`. אחרת — `<div>`.

#### טסטים

- מציג children.
- `interactive=true` → cursor:pointer (DOM check).
- `onclick` קיים → role=button.

---

### 5.6 `CooldownOverlay.svelte`

מיקום: `packages/learn-booster-kit/src/ui/primitives/CooldownOverlay.svelte`

מבוסס על `apps/find-letter-game/src/routes/_components/CooldownOverlay.svelte` (יש לקרוא ולהעתיק את הלוגיקה). העברה ל-tokens.

#### Props

```ts
interface Props {
	untilTs: number;        // timestamp (ms) מתי ה-cooldown נגמר
	durationMs: number;     // משך מלא של ה-cooldown (לחישוב אחוז התקדמות)
	message?: string;       // ברירת מחדל: undefined → לא מציג טקסט.
	subMessage?: string;
	onComplete?: () => void;
}
```

#### התנהגות

- אם `untilTs <= Date.now()` — לא מציג כלום (החזר `null` / `{#if}` שמסתיר).
- אחרת — מציג overlay מרכזי (fixed inset-0) עם `bg-surface-overlay`.
- בתוך: עיגול שמראה את הזמן הנותר + אנימציית countdown (CSS `transform: rotate(...)` או pie chart).
- כל ~100ms מתעדכן (`setInterval` ב-`$effect`).
- כש-`untilTs <= now` — קורא `onComplete?.()` ומפסיק interval.

#### טסטים (vitest browser)

- מציג overlay כש-untilTs בעתיד.
- מסתיר כש-untilTs בעבר.
- קורא ל-onComplete כשמסתיים (עם fake timers).

#### טסטי לוגיקה (vitest node, ב-`packages/learn-booster-kit/test/ui/primitives/cooldown-math.spec.ts`)

הוצא את חישוב האחוז ל-pure function:

```ts
// packages/learn-booster-kit/src/ui/primitives/cooldown-math.ts
export function cooldownProgress(now: number, untilTs: number, durationMs: number): number {
	if (durationMs <= 0) return 1;
	const remaining = Math.max(0, untilTs - now);
	const elapsed = durationMs - remaining;
	return Math.min(1, Math.max(0, elapsed / durationMs));
}
```

טסטים: עוברת מ-0 ל-1, gracefully מטפלת ב-edge cases (durationMs=0, untilTs<now וכו').

---

### 5.7 Icons

מיקום: `packages/learn-booster-kit/src/ui/primitives/icons/`

קבצים:
- `SpeakerIcon.svelte`
- `RefreshIcon.svelte`
- `SettingsIcon.svelte`
- `CheckIcon.svelte`
- `XIcon.svelte`

כל אחד SVG פשוט עם:

```svelte
<script lang="ts">
	interface Props {
		size?: number | string;
		class?: string;
	}
	let { size = 24, class: className = '' }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2.2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	aria-hidden="true"
>
	<!-- SVG content per icon -->
</svg>
```

ה-SVG paths יכולים להגיע מ-Lucide (ראה את ה-SVG הקיים ב-find-letter HeaderBar — זה Lucide-style). אין צורך בתלות חדשה.

---

## 6. Shell components

### 6.1 `HeaderBar.svelte`

מיקום: `packages/learn-booster-kit/src/ui/shell/HeaderBar.svelte`

#### Props

```ts
interface Props {
	leftActions?: Snippet;
	centerInfo?: Snippet;
	rightActions?: Snippet;
	variant?: 'default' | 'compact';  // default: 'default'
	class?: string;
}
```

#### התנהגות

- `<header>` עם `display: flex; align-items: center; justify-content: space-between`.
- `bg-surface-elevated`, `border-b border-border-subtle`, `shadow-card`.
- variant `default`: `px-5 py-3`.
- variant `compact`: `px-3 py-2`.
- כל אחד מהאזורים (`left/center/right`) מקבל `display: flex; gap: 0.75rem; align-items: center`.
- `right` עם `justify-content: flex-end`.
- אם אזור חסר — לא מציג את ה-flex container שלו (אבל הפריסה נשארת — `<div>` ריק שמחזיק את ה-flex slot).

#### Snippet rendering

```svelte
<header class="..." data-variant={variant}>
	<div class="left">
		{#if leftActions}{@render leftActions()}{/if}
	</div>
	<div class="center">
		{#if centerInfo}{@render centerInfo()}{/if}
	</div>
	<div class="right">
		{#if rightActions}{@render rightActions()}{/if}
	</div>
</header>
```

#### טסטים (browser)

```ts
describe('HeaderBar', () => {
	it('מציג snippets בשלושת האזורים', async () => {
		const screen = render(HeaderBar, {
			leftActions: () => 'LEFT',
			centerInfo: () => 'CENTER',
			rightActions: () => 'RIGHT'
		});
		await expect.element(screen.getByText('LEFT')).toBeInTheDocument();
		await expect.element(screen.getByText('CENTER')).toBeInTheDocument();
		await expect.element(screen.getByText('RIGHT')).toBeInTheDocument();
	});

	it('פועל גם בלי snippets', async () => {
		const screen = render(HeaderBar, {});
		await expect.element(screen.container.querySelector('header')).toBeInTheDocument();
	});
});
```

---

### 6.2 `GameShell.svelte`

מיקום: `packages/learn-booster-kit/src/ui/shell/GameShell.svelte`

#### Props

```ts
interface Props {
	header?: Snippet;       // בדרך כלל <HeaderBar /> מהצרכן
	footer?: Snippet;
	background?: 'base' | 'sunken';  // default: 'base'
	children: Snippet;
}
```

#### התנהגות

- `<div>` flex column מלא מסך:
  - `min-height: 100dvh`
  - `bg-surface-base` או `bg-surface-sunken`
  - `font-body text-text-primary`
- `header` ב-`flex-shrink: 0`.
- `<main>` עם `flex: 1; overflow: hidden;` — מקבל את ה-children.
- `footer` ב-`flex-shrink: 0`.

---

### 6.3 `StartScreen.svelte`

מיקום: `packages/learn-booster-kit/src/ui/shell/StartScreen.svelte`

#### Props

```ts
interface Props {
	title: string;
	subtitle?: string;
	primaryAction: { label: string; onclick: () => void };
	secondaryActions?: Snippet;   // למשל כפתור הגדרות עם AdminGate
	heroIllustration?: Snippet;
}
```

#### התנהגות

- מסך ממורכז: flex column center.
- כותרת `font-display text-5xl font-bold` עם `color: var(--theme-text-primary)`.
- subtitle `text-lg text-text-secondary`.
- כפתור ראשי `<Button variant="primary" size="lg">`.
- secondaryActions למטה.
- heroIllustration למעלה (אופציונלי).

---

## 7. עדכון `src/index.ts`

הוסף בסוף הקובץ (לא מחיקה):

```ts
// === Theme tokens (CSS only — אין export TS) ===
// Themes loaded via ./styles import

// === Animations (helpers) ===
export { useShake } from './ui/animations/use-shake.svelte';
export { usePop } from './ui/animations/use-pop.svelte';

// === Primitives ===
export { default as Button } from './ui/primitives/Button.svelte';
export { default as IconButton } from './ui/primitives/IconButton.svelte';
export { default as SegmentedControl } from './ui/primitives/SegmentedControl.svelte';
export { default as ScoreBadge } from './ui/primitives/ScoreBadge.svelte';
export { default as Card } from './ui/primitives/Card.svelte';
export { default as CooldownOverlay } from './ui/primitives/CooldownOverlay.svelte';
export { cooldownProgress } from './ui/primitives/cooldown-math';

// === Icons ===
export { default as SpeakerIcon } from './ui/primitives/icons/SpeakerIcon.svelte';
export { default as RefreshIcon } from './ui/primitives/icons/RefreshIcon.svelte';
export { default as SettingsIcon } from './ui/primitives/icons/SettingsIcon.svelte';
export { default as CheckIcon } from './ui/primitives/icons/CheckIcon.svelte';
export { default as XIcon } from './ui/primitives/icons/XIcon.svelte';

// === Shell ===
export { default as HeaderBar } from './ui/shell/HeaderBar.svelte';
export { default as GameShell } from './ui/shell/GameShell.svelte';
export { default as StartScreen } from './ui/shell/StartScreen.svelte';
```

---

## 8. Showcase page — `apps/kit-test-screen`

### 8.1 מבנה

```
apps/kit-test-screen/src/routes/
├── +layout.svelte         ← עדכן: הוסף navigation + theme switcher
├── +page.svelte           ← נשאר כמו שהוא (booster test)
├── layout.css             ← נשאר
└── showcase/
    └── +page.svelte       ← דף showcase חדש
```

### 8.2 Theme switcher ב-layout

עדכן את `+layout.svelte`:

```svelte
<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { BoosterContainer, boosterService } from 'learn-booster-kit';
	import { onMount } from 'svelte';

	let { children } = $props();

	type Theme = 'default' | 'kids' | 'minimal';
	let theme = $state<Theme>('default');

	onMount(() => {
		boosterService.init().catch((err: unknown) => {
			console.error('Failed to init booster service:', err);
		});
	});

	$effect(() => {
		document.documentElement.dataset.theme = theme;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav class="topnav">
	<div class="links">
		<a href="/">Booster Test</a>
		<a href="/showcase">Showcase</a>
	</div>
	<div class="theme-switch">
		<span>Theme:</span>
		<select bind:value={theme}>
			<option value="default">Default (Trust)</option>
			<option value="kids">Kids</option>
			<option value="minimal">Minimal</option>
		</select>
	</div>
</nav>

{@render children()}
<BoosterContainer />

<style>
	.topnav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--theme-surface-elevated);
		border-bottom: 1px solid var(--theme-border-subtle);
		font-family: var(--theme-font-body);
	}
	.links {
		display: flex;
		gap: 1rem;
	}
	.links a {
		color: var(--theme-brand-primary);
		text-decoration: none;
		font-weight: 600;
	}
	.theme-switch {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.theme-switch select {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: 1px solid var(--theme-border-subtle);
	}
</style>
```

### 8.3 `showcase/+page.svelte` — תוכן

צריך להציג **כל** primitive ו-shell, בכל variant. מבנה מומלץ — accordion / sections:

```svelte
<script lang="ts">
	import {
		Button,
		IconButton,
		SegmentedControl,
		ScoreBadge,
		Card,
		CooldownOverlay,
		HeaderBar,
		GameShell,
		StartScreen,
		SpeakerIcon,
		RefreshIcon,
		SettingsIcon,
		CheckIcon,
		XIcon,
		useShake,
		usePop
	} from 'learn-booster-kit';

	// --- State for interactive examples ---
	let segmentedValue = $state<'2x3' | '3x3' | '3x4' | '4x4'>('3x3');
	let score = $state(7);
	let cooldownActive = $state(false);
	let cooldownUntil = $state(0);
	const shake = useShake();
	const pop = usePop();

	function startCooldown() {
		cooldownUntil = Date.now() + 3000;
		cooldownActive = true;
	}
</script>

<main class="showcase">
	<header class="page-header">
		<h1>Component System — Showcase</h1>
		<p>החלף theme בתפריט העליון כדי לראות איך כל קומפוננטה מתאימה.</p>
	</header>

	<!-- Section: Tokens preview -->
	<section>
		<h2>Color Tokens</h2>
		<div class="swatch-grid">
			<div class="swatch" style="background: var(--theme-surface-base)">surface-base</div>
			<div class="swatch" style="background: var(--theme-surface-elevated)">surface-elevated</div>
			<div class="swatch" style="background: var(--theme-surface-sunken)">surface-sunken</div>
			<div class="swatch text-on-brand" style="background: var(--theme-brand-primary)">brand-primary</div>
			<div class="swatch text-on-brand" style="background: var(--theme-brand-secondary)">brand-secondary</div>
			<div class="swatch text-on-feedback" style="background: var(--theme-feedback-success)">success</div>
			<div class="swatch text-on-feedback" style="background: var(--theme-feedback-error)">error</div>
			<div class="swatch text-on-feedback" style="background: var(--theme-feedback-warning)">warning</div>
		</div>
	</section>

	<!-- Section: Buttons -->
	<section>
		<h2>Button</h2>
		<div class="row">
			<Button variant="primary">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="danger">Danger</Button>
			<Button variant="primary" disabled>Disabled</Button>
		</div>
		<h3>Sizes</h3>
		<div class="row align-end">
			<Button size="sm">Small</Button>
			<Button size="md">Medium</Button>
			<Button size="lg">Large</Button>
		</div>
	</section>

	<!-- Section: IconButton -->
	<section>
		<h2>IconButton</h2>
		<div class="row">
			<IconButton label="השמע שוב" onclick={() => alert('speak')}>
				{#snippet icon()}<SpeakerIcon />{/snippet}
			</IconButton>
			<IconButton label="רענן" variant="solid" onclick={() => alert('refresh')}>
				{#snippet icon()}<RefreshIcon />{/snippet}
			</IconButton>
			<IconButton label="הגדרות" variant="ghost" onclick={() => alert('settings')}>
				{#snippet icon()}<SettingsIcon />{/snippet}
			</IconButton>
			<IconButton label="השמע שוב" showLabel onclick={() => alert('speak')}>
				{#snippet icon()}<SpeakerIcon />{/snippet}
			</IconButton>
		</div>
	</section>

	<!-- Section: SegmentedControl -->
	<section>
		<h2>SegmentedControl</h2>
		<SegmentedControl
			options={[
				{ value: '2x3', label: '2x3' },
				{ value: '3x3', label: '3x3' },
				{ value: '3x4', label: '3x4' },
				{ value: '4x4', label: '4x4' }
			]}
			bind:value={segmentedValue}
			aria-label="גודל לוח"
		/>
		<p>נבחר: <strong>{segmentedValue}</strong></p>
	</section>

	<!-- Section: ScoreBadge -->
	<section>
		<h2>ScoreBadge</h2>
		<div class="row">
			<ScoreBadge label="ניקוד" value={score} />
			<ScoreBadge label="הצלחות" value={42} variant="success">
				{#snippet icon()}<CheckIcon size={16} />{/snippet}
			</ScoreBadge>
			<ScoreBadge label="טעויות" value={3} variant="warning">
				{#snippet icon()}<XIcon size={16} />{/snippet}
			</ScoreBadge>
			<Button size="sm" onclick={() => score++}>+1</Button>
		</div>
	</section>

	<!-- Section: Card -->
	<section>
		<h2>Card</h2>
		<div class="row">
			<Card variant="elevated">
				<p>Elevated card</p>
			</Card>
			<Card variant="flat">
				<p>Flat card</p>
			</Card>
			<Card variant="outlined">
				<p>Outlined card</p>
			</Card>
			<Card interactive onclick={() => alert('clicked!')}>
				<p>Interactive (click me)</p>
			</Card>
		</div>
	</section>

	<!-- Section: Animations -->
	<section>
		<h2>Animations</h2>
		<div class="row">
			<div class:lbk-anim-shake={shake.active} class="anim-box">Shake target</div>
			<Button onclick={() => shake.trigger()}>Trigger shake</Button>
		</div>
		<div class="row">
			<div class:lbk-anim-pop={pop.active} class="anim-box">Pop target</div>
			<Button onclick={() => pop.trigger()}>Trigger pop</Button>
		</div>
	</section>

	<!-- Section: CooldownOverlay -->
	<section>
		<h2>CooldownOverlay</h2>
		<Button onclick={startCooldown}>Start 3s cooldown</Button>
		<CooldownOverlay
			untilTs={cooldownUntil}
			durationMs={3000}
			message="נסה שוב..."
			onComplete={() => (cooldownActive = false)}
		/>
	</section>

	<!-- Section: HeaderBar -->
	<section>
		<h2>HeaderBar</h2>
		<HeaderBar>
			{#snippet leftActions()}
				<IconButton label="השמע שוב" showLabel onclick={() => {}}>
					{#snippet icon()}<SpeakerIcon />{/snippet}
				</IconButton>
				<Button variant="secondary" size="sm">משחק חדש</Button>
			{/snippet}
			{#snippet centerInfo()}
				<h3 style="margin: 0">משחק לדוגמה</h3>
			{/snippet}
			{#snippet rightActions()}
				<ScoreBadge label="ניקוד" value={score} />
				<IconButton label="הגדרות" variant="ghost" onclick={() => {}}>
					{#snippet icon()}<SettingsIcon />{/snippet}
				</IconButton>
			{/snippet}
		</HeaderBar>
	</section>

	<!-- Section: StartScreen (in a bordered preview) -->
	<section>
		<h2>StartScreen (preview)</h2>
		<div class="preview">
			<StartScreen
				title="ברוכים הבאים"
				subtitle="משחק לדוגמה להוכחת המנגנון"
				primaryAction={{ label: 'התחל לשחק', onclick: () => alert('start!') }}
			/>
		</div>
	</section>
</main>

<style>
	.showcase {
		min-height: 100vh;
		background: var(--theme-surface-base);
		color: var(--theme-text-primary);
		font-family: var(--theme-font-body);
		padding: 2rem;
	}
	.page-header {
		margin-bottom: 2rem;
	}
	.page-header h1 {
		font-family: var(--theme-font-display);
		font-size: var(--theme-font-size-xl);
		margin: 0;
	}
	section {
		background: var(--theme-surface-elevated);
		border: 1px solid var(--theme-border-subtle);
		border-radius: var(--theme-radius-lg);
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: var(--theme-shadow-card);
	}
	section h2 {
		margin: 0 0 1rem;
		font-family: var(--theme-font-display);
		font-size: var(--theme-font-size-lg);
	}
	.row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.row.align-end {
		align-items: flex-end;
	}
	.swatch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
	}
	.swatch {
		padding: 1.25rem 0.75rem;
		border-radius: var(--theme-radius-md);
		border: 1px solid var(--theme-border-subtle);
		font-size: 0.85rem;
		text-align: center;
		font-family: monospace;
	}
	.text-on-brand {
		color: var(--theme-text-on-brand);
	}
	.text-on-feedback {
		color: var(--theme-text-on-feedback);
	}
	.anim-box {
		padding: 1rem 1.5rem;
		background: var(--theme-surface-sunken);
		border-radius: var(--theme-radius-md);
	}
	.preview {
		height: 400px;
		border: 2px dashed var(--theme-border-subtle);
		border-radius: var(--theme-radius-md);
		overflow: hidden;
		position: relative;
	}
</style>
```

### 8.4 קבלה (User Acceptance)

המשתמש (המפעיל) יבחן את הדף ידנית. הוא צריך לראות:
- ✅ כל primitive בכל variant.
- ✅ החלפת theme בתפריט משנה צבעים מיד בכל המסך.
- ✅ אנימציות עובדות בלחיצה.
- ✅ CooldownOverlay מופיע ל-3 שניות ואז נעלם.
- ✅ HeaderBar מציג את שלושת האזורים.

---

## 9. תהליך עבודה — TDD

### 9.1 סדר הקומיטים

לפי `docs/coding-conventions.md` — קומיט אחד = נושא אחד. הסדר:

1. **`feat(kit): הוספת theme tokens ו-3 ערכות נושא`**
   - `src/ui/theme/tokens.css`
   - `src/ui/theme/themes/{default,kids,minimal}.css`
   - `src/ui/theme/animations.css`
   - עדכון `src/styles.css`
   - walkthrough entry
   - **לא** מעדכן `src/index.ts` (אין מה לייצא עדיין)

2. **`feat(kit): animation helpers (useShake, usePop)`**
   - `src/ui/animations/use-shake.svelte.ts` + טסט
   - `src/ui/animations/use-pop.svelte.ts` + טסט
   - export ב-`src/index.ts`
   - walkthrough

3. **`feat(kit): icons primitives`**
   - 5 קבצי icon
   - export ב-`src/index.ts`
   - walkthrough

4. **`feat(kit): Button + IconButton primitives`**
   - `Button.svelte` + טסט browser ב-kit-test-screen
   - `IconButton.svelte` + טסט browser ב-kit-test-screen
   - export ב-`src/index.ts`
   - walkthrough

5. **`feat(kit): SegmentedControl + ScoreBadge + Card`**
   - שלושתם + טסטים
   - export ב-`src/index.ts`
   - walkthrough

6. **`feat(kit): CooldownOverlay primitive`**
   - `cooldown-math.ts` + טסט node ב-kit
   - `CooldownOverlay.svelte` + טסט browser
   - export ב-`src/index.ts`
   - walkthrough

7. **`feat(kit): shell components — HeaderBar, GameShell, StartScreen`**
   - שלושתם + טסטים ל-HeaderBar
   - export ב-`src/index.ts`
   - walkthrough

8. **`feat(kit-test-screen): showcase page לכל הקומפוננטות החדשות`**
   - `src/routes/showcase/+page.svelte`
   - עדכון `src/routes/+layout.svelte` (nav + theme switcher)
   - walkthrough של kit-test-screen

### 9.2 לולאת TDD לכל unit

לכל primitive / helper:

1. **Red** — כתוב טסט שמייצג את ה-API הרצוי. הרץ. וודא שהוא נכשל (קומפוננטה לא קיימת / לא עושה את הציפייה).
2. **Green** — כתוב את הקומפוננטה במינימום הדרוש כדי שהטסט יעבור. הרץ. וודא שעובר.
3. **Refactor** — נקה את הקוד אם צריך. הרץ שוב.
4. עבור ל-test הבא של אותה קומפוננטה.

לקומפוננטות שיש בהן רק התנהגות ויזואלית (Icons) — אין טסטים, רק קומפוננטה + showcase visual check.

### 9.3 הרצת בדיקות

לפני כל קומיט:

```bash
# טסטים של הקיט (logic)
bun run --filter learn-booster-kit test

# טסטים של kit-test-screen (components, browser)
bun run --filter kit-test-screen test:unit

# Type check של שניהם
bun run --filter learn-booster-kit check
bun run --filter kit-test-screen check
```

אם משהו נשבר — תקן לפני שעוברים הלאה.

> **חשוב**: אל תכתוב טסט אחד ענק שבודק 10 דברים. כל טסט בודק נקודה אחת.

### 9.4 הרצת ה-Showcase לבדיקה ויזואלית

```bash
bun run --filter kit-test-screen dev
```

ייפתח דפדפן ב-`http://localhost:5173/showcase`. בדוק ידנית את כל ה-sections, בכל ה-3 themes. הראה screenshot למפעיל בסיום.

---

## 10. אישור לקומיטים

על פי `docs/coding-conventions.md` סעיף 9.2, **לפני כל קומיט יש להציג למפעיל מה הולכים לקמט**, אלא אם המפעיל אמר אחרת בתחילת הסשן.

אם זו ריצת אוטונומית (Sonnet עובד לבד) — קומט באופן רציף לפי הסדר בסעיף 9.1, ותסכם בסוף.

הודעות קומיט: **בעברית**, בפורמט `(scope): כותרת` כאשר scope = `kit` או `kit-test-screen`.

---

## 11. עדכון Walkthrough

לפני **כל קומיט**, יש לעדכן את ה-walkthrough הרלוונטי:

- שינויים בקיט → `packages/learn-booster-kit/docs/walkthrough.md` (צור אם לא קיים — ראה sort-cards / lotto לדוגמה).
- שינויים ב-kit-test-screen → `apps/kit-test-screen/docs/walkthrough.md` (צור אם לא קיים).
- אם השינוי רוחבי וקשור לפלטפורמיזציה — גם `docs/walkthrough.md` בשורש.

מבנה כל entry:
```markdown
## YYYY-MM-DD HH:MM

### כותרת קצרה (תיאור הקומיט)

#### מה בוצע?
...

#### החלטות ארכיטקטורה
...

#### מעקפים ופתרונות
...
```

---

## 12. סיכום וצ'קליסט סופי

לפני שאתה אומר "סיימתי":

- [ ] כל ה-files הוזכרו בסעיף 3-7 נוצרו.
- [ ] כל ה-tests עוברים (`bun run --filter learn-booster-kit test` + `bun run --filter kit-test-screen test:unit`).
- [ ] `bun run --filter learn-booster-kit check` עובר ללא warnings.
- [ ] `bun run --filter kit-test-screen check` עובר.
- [ ] `bun run --filter kit-test-screen dev` עולה ו-`/showcase` מציג הכל כראוי.
- [ ] החלפת theme עובדת ומשנה צבעים בזמן ריצה.
- [ ] כל קומיט = נושא אחד, walkthrough מעודכן לפניו, הודעת קומיט בעברית.
- [ ] לא נגעת בקבצים מסעיף 2 ("לא לגעת").
- [ ] תיעוד ב-`docs/walkthrough.md` בשורש לפלטפורמיזציה הזו.

בהצלחה.

---

# חלק II — הרחבות (תוספת אחרי גל ראשון)

> נוסף 2026-05-17 אחרי שגל ה-8 קומיטים של חלק I הסתיים. מטרה: להוסיף
> themes שמייצגים את עיצובי המשחקים הקיימים בפלטפורמה, ולהוסיף 2 מסכי
> בחינה (welcome + game) שמדמים שימוש אמיתי ב-theme.
>
> חלק II מבוצע ב-3 קומיטים נוספים. אותם כללים כמו חלק I — TDD,
> walkthrough, קומיטים אטומיים, אישור autonomous.

## 13. Themes נוספים מבוססי משחקים קיימים

### 13.1 רקע

הקיט כולל כיום 3 themes גנריים: `default` (Trust), `kids`, `minimal`.
חסרים themes שמייצגים את העיצוב הקיים של 5 משפחות משחקים בפרויקט.
זאת כדי שכשמשחק קיים יעבור מיגרציה ל-kit, הוא יוכל להישאר עם הזהות
שלו פשוט ע"י `data-theme="..."`.

הטבלה הבאה היא **מפת המקור**:

| Theme | מבוסס על | אופי |
|-------|----------|------|
| `find-letter` | `apps/find-letter-game` | Navy + כתום עז, pills בולטים, חם |
| `wordys` | `apps/wordys-game` | כתום-זהב, Rubik, רדיוסים גדולים, ילדותי |
| `slate` | `sort-cards` / `train-addition` / `passcode` / `jigsaw-v2` | אפור-כהה, ירוק/צהוב feedback, פונקציונלי |
| `read-faster` | `apps/read-faster` | oklch כחול-טורקיז, Frank Ruhl Libre + Rubik, מינימליסטי-מודרני |
| `portal` | `apps/main` | קרם פרימיום, accents מובחנים, עיתונאי |

`drive-viewer` ו-`lotto` דולגו (חופפים מספיק ל-wordys ול-default בהתאמה).

### 13.2 מבנה קבצים

```
packages/learn-booster-kit/src/ui/theme/themes/
├── default.css       (קיים)
├── kids.css          (קיים)
├── minimal.css       (קיים)
├── find-letter.css   (חדש)
├── wordys.css        (חדש)
├── slate.css         (חדש)
├── read-faster.css   (חדש)
└── portal.css        (חדש)
```

לכל theme **חובה** להכיל את **כל** ה-tokens שמופיעים ב-default.css/kids.css/minimal.css.
טוקן חסר → ה-fallback ל-default (אם הוגדר ב-`:root`) → אם לא, השדה ריק
ויש בעיה ויזואלית. תמיד תעתיק את רשימת ה-tokens מ-kids.css כתבנית
ותחליף ערכים.

### 13.3 מיפוי tokens — `find-letter`

```
selector: [data-theme="find-letter"]
brand-primary: #1e3a8a       hover: #1e40af
brand-secondary: #f97316     hover: #ea580c
surface-base: #f8fafc        elevated: #ffffff    sunken: #eff6ff
surface-overlay: rgba(15,23,42,.55)
text-primary: #0f172a        secondary: #64748b   tertiary: #94a3b8   on-brand: #ffffff   on-feedback: #ffffff
feedback-success: #22c55e    success-bg: #dcfce7
feedback-error: #ef4444      error-bg: #fee2e2
feedback-warning: #ea580c    warning-bg: #fed7aa
border-subtle: #e2e8f0       strong: #cbd5e1
radius-sm: 6px               md: 12px           lg: 20px            pill: 9999px
shadow-card: 0 4px 12px rgba(15,23,42,.04)
shadow-elevated: 0 8px 22px rgba(249,115,22,.25)
shadow-focus: 0 0 0 3px rgba(249,115,22,.4)
touch-min: 70px
font-display + font-body: "Heebo", system-ui, sans-serif
font-size/weight: זהים ל-default
```

### 13.4 מיפוי tokens — `wordys`

```
selector: [data-theme="wordys"]
brand-primary: #ea580c       hover: #c2410c
brand-secondary: #facc15     hover: #eab308
surface-base: #fef3c7        elevated: #ffffff    sunken: #fde68a
surface-overlay: rgba(234,88,12,.5)
text-primary: #78350f        secondary: #92400e   tertiary: #b45309   on-brand: #ffffff   on-feedback: #ffffff
feedback-success: #22c55e    success-bg: #dcfce7
feedback-error: #ef4444      error-bg: #fee2e2
feedback-warning: #f97316    warning-bg: #fed7aa
border-subtle: #fcd34d       strong: #f59e0b
radius-sm: 12px              md: 20px           lg: 32px            pill: 9999px
shadow-card: 0 8px 20px rgba(234,88,12,.15)
shadow-elevated: 0 12px 32px rgba(34,197,94,.3)
shadow-focus: 0 0 0 4px rgba(250,204,21,.5)
touch-min: 80px
font-display + font-body: "Rubik", "Heebo", system-ui, sans-serif
font-size-lg: 1.75rem        font-size-xl: 2.5rem (אופי ילדותי)
font-weight-bold: 800
```

### 13.5 מיפוי tokens — `slate`

```
selector: [data-theme="slate"]
brand-primary: #1e293b       hover: #0f172a
brand-secondary: #4ade80     hover: #22c55e
surface-base: #f8fafc        elevated: #ffffff    sunken: #f1f5f9
surface-overlay: rgba(15,23,42,.6)
text-primary: #0f172a        secondary: #475569   tertiary: #94a3b8   on-brand: #ffffff   on-feedback: #ffffff
feedback-success: #22c55e    success-bg: #dcfce7
feedback-error: #ef4444      error-bg: #fee2e2
feedback-warning: #facc15    warning-bg: #fef9c3
border-subtle: #e2e8f0       strong: #94a3b8
radius-sm: 8px               md: 16px           lg: 24px            pill: 9999px
shadow-card: 0 4px 6px rgba(15,23,42,.05)
shadow-elevated: 0 10px 25px rgba(15,23,42,.15)
shadow-focus: 0 0 0 3px rgba(74,222,128,.4)
touch-min: 70px
font-display + font-body: system-ui, "Segoe UI", Tahoma, sans-serif
```

### 13.6 מיפוי tokens — `read-faster`

```
selector: [data-theme="read-faster"]
brand-primary: oklch(.55 .18 250)       hover: oklch(.45 .2 250)
brand-secondary: oklch(.75 .12 190)     hover: oklch(.65 .14 190)
surface-base: oklch(.98 0 0)            elevated: #ffffff        sunken: oklch(.96 .005 250)
surface-overlay: oklch(.2 0 0 / .55)
text-primary: oklch(.2 0 0)             secondary: oklch(.4 0 0)
text-tertiary: oklch(.6 0 0)            on-brand: oklch(.99 0 0)        on-feedback: oklch(.99 0 0)
feedback-success: oklch(.7 .15 160)     success-bg: oklch(.95 .05 160)
feedback-error: oklch(.6 .2 25)         error-bg: oklch(.95 .05 25)
feedback-warning: oklch(.75 .15 80)     warning-bg: oklch(.95 .05 80)
border-subtle: oklch(.92 0 0)           strong: oklch(.8 0 0)
radius-sm: 4px                          md: 8px                lg: 12px            pill: 9999px
shadow-card: 0 1px 3px rgba(0,0,0,.05)
shadow-elevated: 0 4px 12px rgba(0,0,0,.08)
shadow-focus: 0 0 0 2px oklch(.55 .18 250 / .4)
touch-min: 70px
font-display: "Frank Ruhl Libre", "Heebo", Georgia, serif
font-body: "Rubik", "Heebo", system-ui, sans-serif
```

### 13.7 מיפוי tokens — `portal`

```
selector: [data-theme="portal"]
brand-primary: #0f172a       hover: #1e293b
brand-secondary: #be185d     hover: #9f1239
surface-base: #f7f2e8        elevated: #ffffff    sunken: #fef3c7
surface-overlay: rgba(15,23,42,.5)
text-primary: #0f172a        secondary: #475569   tertiary: #94a3b8   on-brand: #f7f2e8   on-feedback: #ffffff
feedback-success: #16a34a    success-bg: #dcfce7
feedback-error: #b91c1c      error-bg: #fee2e2
feedback-warning: #d97706    warning-bg: #fef3c7
border-subtle: #e7d9c0       strong: #c4a878
radius-sm: 8px               md: 16px           lg: 32px            pill: 9999px
shadow-card: 0 24px 70px rgba(15,23,42,.09)
shadow-elevated: 0 24px 90px rgba(15,23,42,.14)
shadow-focus: 0 0 0 3px rgba(190,24,93,.3)
touch-min: 70px
font-display: "Heebo", "Frank Ruhl Libre", Georgia, serif
font-body: "Heebo", system-ui, sans-serif
font-size-xl: 3rem (פרימיום)
```

### 13.8 עדכוני styles.css

הוסף ב-`packages/learn-booster-kit/src/styles.css` את 5 ה-imports
**אחרי** `minimal.css` ו**לפני** `tokens.css`:

```css
@import './ui/theme/themes/find-letter.css';
@import './ui/theme/themes/wordys.css';
@import './ui/theme/themes/slate.css';
@import './ui/theme/themes/read-faster.css';
@import './ui/theme/themes/portal.css';
```

### 13.9 עדכון theme switcher

ב-`apps/kit-test-screen/src/routes/+layout.svelte`:
- הרחב את ה-Theme union:
  `type Theme = 'default' | 'kids' | 'minimal' | 'find-letter' | 'wordys' | 'slate' | 'read-faster' | 'portal';`
- הוסף `<option>` חדש לכל theme חדש בסדר הזה (default, kids, minimal,
  find-letter, wordys, slate, read-faster, portal).
- תוויות: "Find Letter", "Wordy's", "Slate Dark", "Read Faster", "Portal".

⚠️ **חובה לקרוא את הקובץ קודם** — הוא עודכן ידנית אחרי הריצה הקודמת
(אחרי e28d32c שמחק 54 שורות בטעות). אל תדרוס. עדכן רק את ה-Theme type
ואת רשימת ה-options ב-select. אם הקובץ במצב לא צפוי — עצור וזעוק.

### 13.10 בדיקות

- `bun run --filter learn-booster-kit check` — חייב לעבור.
- `bun run --filter kit-test-screen check` — חייב לעבור.
- Visual: החלפת theme בכל option משנה את כל הצבעים. הגדרת tokens חסרים
  תיצור fallback ל-default (ראה sec 13.2).

### 13.11 קומיט

`feat(kit): 5 themes נוספים מבוססי עיצוב משחקים קיימים`

---

## 14. מסך Welcome ב-showcase

### 14.1 מטרה

דף מסך-מלא שמשתמש ב-`GameShell` + `StartScreen` של הקיט, כדי לראות
איך כל theme נראה במסך פתיחה אמיתי של משחק (לא בתוך preview קטן).

### 14.2 מבנה קובץ

`apps/kit-test-screen/src/routes/showcase/welcome/+page.svelte`

### 14.3 תוכן

```svelte
<script lang="ts">
	import {
		GameShell,
		StartScreen,
		IconButton,
		SettingsIcon
	} from 'learn-booster-kit';
	import { goto } from '$app/navigation';
</script>

<GameShell background="base">
	<StartScreen
		title="ברוכים הבאים"
		subtitle="משחק לדוגמה להמחשת ערכת הנושא הנבחרת"
		primaryAction={{ label: 'התחל לשחק', onclick: () => goto('/showcase/game') }}
	>
		{#snippet heroIllustration()}
			<div class="hero">
				<span class="emoji">🎮</span>
			</div>
		{/snippet}
		{#snippet secondaryActions()}
			<div class="secondary">
				<IconButton label="הגדרות" showLabel variant="ghost" onclick={() => alert('settings')}>
					{#snippet icon()}<SettingsIcon />{/snippet}
				</IconButton>
				<a class="back-link" href="/showcase">← חזרה לקטלוג</a>
			</div>
		{/snippet}
	</StartScreen>
</GameShell>

<style>
	.hero {
		width: 200px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--theme-radius-lg);
		background: linear-gradient(
			135deg,
			var(--theme-brand-primary),
			var(--theme-brand-secondary)
		);
		box-shadow: var(--theme-shadow-elevated);
	}
	.emoji {
		font-size: 6rem;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
	}
	.secondary {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		margin-top: 1rem;
	}
	.back-link {
		color: var(--theme-text-secondary);
		text-decoration: none;
		font-size: var(--theme-font-size-sm);
	}
	.back-link:hover {
		color: var(--theme-brand-primary);
	}
</style>
```

### 14.4 עדכון nav

ב-`+layout.svelte`, הוסף קישור `Welcome` ב-`.links` אחרי `Showcase`:

```html
<a href="/showcase/welcome">Welcome</a>
```

### 14.5 קומיט

`feat(kit-test-screen): מסך ברוכים הבאים לבחינת themes`

---

## 15. מסך Game דמו ב-showcase

### 15.1 מטרה

דף מסך-מלא שמדמה משחק בפעולה — לראות את ה-theme בכל הקומפוננטות
ביחד ובאינטראקציה (HeaderBar + Card + ScoreBadge + SegmentedControl
+ shake/pop animations + CooldownOverlay).

הדף הוא **פסאודו-משחק** מסוג "מצא את האות" — אין לוגיקה אמיתית של
משחק לימודי, רק המחשה ויזואלית.

### 15.2 מבנה קובץ

`apps/kit-test-screen/src/routes/showcase/game/+page.svelte`

### 15.3 State

```ts
const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל'];
type GridSize = '2x3' | '3x3' | '3x4';

let score = $state(0);
let wrongCount = $state(0);
let targetLetter = $state<string>('א');
let gridSize = $state<GridSize>('3x3');
let grid = $state<string[]>([]);
let cooldownUntil = $state(0);
let shakeIndex = $state<number | null>(null);
let popIndex = $state<number | null>(null);
```

### 15.4 פונקציות

- `gridCount(g: GridSize): number` — מחזיר 6/9/12 לפי המחרוזת.
- `generateRound()`:
  - בוחר `targetLetter` אקראי.
  - בוחר `gridCount(gridSize) - 1` distractors אקראיים שונים.
  - מערבב + מציב את ה-target במיקום אקראי.
  - מאפס `shakeIndex` ו-`popIndex`.
- `onCardClick(letter: string, index: number)`:
  - אם `Date.now() < cooldownUntil` — return (cooldown פעיל).
  - אם `letter === targetLetter`:
    - `popIndex = index`.
    - `setTimeout(() => { score++; generateRound(); popIndex = null; }, 600)`.
  - אחרת:
    - `shakeIndex = index`.
    - `wrongCount++`.
    - `cooldownUntil = Date.now() + 2500`.
    - `setTimeout(() => { shakeIndex = null; }, 500)`.
- `resetGame()`: מאפס score/wrongCount, קורא generateRound.
- `$effect()`: בעת mount — קורא generateRound.
- `$effect()`: בעת שינוי `gridSize` — קורא generateRound.

### 15.5 JSX

```svelte
<GameShell>
	{#snippet header()}
		<HeaderBar>
			{#snippet leftActions()}
				<IconButton
					label="השמע שוב"
					showLabel
					variant="solid"
					onclick={() => alert(`מצא את האות ${targetLetter}`)}
				>
					{#snippet icon()}<SpeakerIcon />{/snippet}
				</IconButton>
				<Button variant="secondary" size="sm" onclick={resetGame}>משחק חדש</Button>
			{/snippet}
			{#snippet centerInfo()}
				<h2 class="title">מצא את האות {targetLetter}</h2>
			{/snippet}
			{#snippet rightActions()}
				<SegmentedControl
					options={[
						{ value: '2x3', label: '2×3' },
						{ value: '3x3', label: '3×3' },
						{ value: '3x4', label: '3×4' }
					]}
					bind:value={gridSize}
					aria-label="גודל לוח"
				/>
				<ScoreBadge label="ניקוד" value={score} variant="success">
					{#snippet icon()}<CheckIcon size={16} />{/snippet}
				</ScoreBadge>
				<ScoreBadge label="טעויות" value={wrongCount} variant="warning">
					{#snippet icon()}<XIcon size={16} />{/snippet}
				</ScoreBadge>
				<IconButton label="הגדרות" variant="ghost" onclick={() => alert('settings')}>
					{#snippet icon()}<SettingsIcon />{/snippet}
				</IconButton>
			{/snippet}
		</HeaderBar>
	{/snippet}

	<div class="game-area">
		<div class="prompt">
			<p class="prompt-label">מצא את האות</p>
			<div class="big-letter">{targetLetter}</div>
		</div>

		<div class="grid" data-grid={gridSize}>
			{#each grid as letter, i (i)}
				<Card interactive onclick={() => onCardClick(letter, i)}>
					<div
						class="letter-card"
						class:lbk-anim-shake={shakeIndex === i}
						class:lbk-anim-pop={popIndex === i}
					>
						{letter}
					</div>
				</Card>
			{/each}
		</div>
	</div>

	<CooldownOverlay
		untilTs={cooldownUntil}
		durationMs={2500}
		message="נסה שוב..."
	/>
</GameShell>

<style>
	.title {
		margin: 0;
		font-family: var(--theme-font-display);
		font-size: var(--theme-font-size-lg);
		color: var(--theme-text-primary);
	}
	.game-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		padding: 2rem;
		height: 100%;
	}
	.prompt {
		text-align: center;
	}
	.prompt-label {
		font-size: var(--theme-font-size-md);
		color: var(--theme-text-secondary);
		margin: 0 0 0.5rem;
	}
	.big-letter {
		font-family: var(--theme-font-display);
		font-size: 5rem;
		font-weight: var(--theme-font-weight-bold);
		color: var(--theme-brand-primary);
		line-height: 1;
	}
	.grid {
		display: grid;
		gap: 1rem;
	}
	.grid[data-grid='2x3'] {
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
	}
	.grid[data-grid='3x3'] {
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}
	.grid[data-grid='3x4'] {
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}
	.letter-card {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--theme-font-display);
		font-size: 4rem;
		font-weight: var(--theme-font-weight-bold);
		color: var(--theme-text-primary);
		min-width: var(--theme-touch-min);
		min-height: var(--theme-touch-min);
	}
</style>
```

### 15.6 Imports

```ts
import {
	GameShell,
	HeaderBar,
	Card,
	Button,
	IconButton,
	SegmentedControl,
	ScoreBadge,
	CooldownOverlay,
	SpeakerIcon,
	SettingsIcon,
	CheckIcon,
	XIcon
} from 'learn-booster-kit';
```

### 15.7 עדכון nav

ב-`+layout.svelte`, הוסף קישור `Game` ב-`.links` אחרי `Welcome`:

```html
<a href="/showcase/game">Game</a>
```

### 15.8 בדיקה ויזואלית

לכל theme — נווט ל-`/showcase/game` ובדוק:
- ✅ HeaderBar מציג את כל ה-controls.
- ✅ ה-grid מתאים ל-gridSize.
- ✅ לחיצה על תשובה נכונה → pop animation + score++ + round חדש.
- ✅ לחיצה על תשובה שגויה → shake animation + cooldown overlay 2.5s.
- ✅ "משחק חדש" מאפס.

### 15.9 קומיט

`feat(kit-test-screen): מסך משחק אינטראקטיבי לבחינת themes`

---

## 16. סדר ביצוע חלק II

1. **קומיט 9**: `feat(kit): 5 themes נוספים מבוססי עיצוב משחקים קיימים`
   - 5 קבצי themes/*.css
   - styles.css updated
   - +layout.svelte updated (Theme type + options)
   - walkthrough ב-kit + ב-kit-test-screen

2. **קומיט 10**: `feat(kit-test-screen): מסך ברוכים הבאים לבחינת themes`
   - showcase/welcome/+page.svelte
   - +layout.svelte (nav link)
   - walkthrough ב-kit-test-screen

3. **קומיט 11**: `feat(kit-test-screen): מסך משחק אינטראקטיבי לבחינת themes`
   - showcase/game/+page.svelte
   - +layout.svelte (nav link)
   - walkthrough ב-kit-test-screen

### 16.1 הוראות חוזרות

- אישור: autonomous (לא לבקש פר-קומיט).
- בדיקות לפני כל קומיט: `bun run --filter <pkg> check` חייב לעבור.
- walkthrough מתעדכן לפני כל קומיט.
- `git add` סלקטיבי, פקודות git בנפרד.
- הודעות קומיט בעברית.
- ⚠️ **קרא +layout.svelte קודם בכל קומיט** — הוא במצב לא-קמוט עם שינויים
  ידניים. סמן בעיניים שהם עדיין שם לפני שינוי נוסף.
- לא לגעת בקבצים שב-section 2.
- לא לגעת ב-`docs/component-system-spec.md` (זה המסמך הזה).

בהצלחה.

---

# חלק III — סגירת פערים מול המשחקים האמיתיים

> נוסף 2026-05-17 אחרי השוואה ויזואלית של הדמו (`/showcase/game`) מול 5
> המשחקים האמיתיים שעליהם מבוססים ה-themes. נמצאו פערים מהותיים שמונעים
> מה-themes להעביר נכון את ה-DNA המקורי.
>
> מתבצע ב-5 קומיטים. אותם כללים כמו חלקים I-II.

## 17. רקע — סיכום הפערים

### 17.1 משחקי המקור

| Theme | מקור | URL לבדיקה |
|-------|------|------------|
| `find-letter` | `find-letter-game` | `https://find-letter-game.pages.dev/` |
| `wordys` | `wordys-game` | `https://wordys-game.pages.dev/` |
| `slate` | `sort-cards-game` (משפחת 4) | `https://sort-cards-game.pages.dev/` |
| `read-faster` | `read-faster` | `https://read-faster.vercel.app/` |
| `portal` | `main` | `https://learn-games.pages.dev/` |

### 17.2 הפערים שזוהו

| Theme | פער | חומרה |
|-------|-----|--------|
| **find-letter** | כפתור "השמע שוב" כחול במקום כתום בולט עם צל כתום | P0 |
| **find-letter** | אין מסגרת כתומה (`#ff6a3d`) סביב ה-grid | P1 |
| **find-letter** | חסר subtitle "הקשיבו וגעו באות הנכונה" | P2 |
| **slate** | Header לבן במקום `slate-800` כהה עם טקסט לבן | **P0 — שובר את כל הזהות** |
| **slate** | רקע body אפור במקום קרם-צהוב | P1 |
| **read-faster** | Fonts serif (Frank Ruhl Libre) לא נטענים — נראה sans-serif | **P0** |
| **read-faster** | רדיוסים גדולים מדי, צללים בולטים — צריך מינימליסטי | P1 |
| **portal** | חסרים צללים רכים-גדולים, gradients ברקע | P1 |
| **wordys** | חסר accent ribbon תחתון בכרטיסים | P1 |
| **כל ה-themes** | אין subtitle בprompt | P2 |
| **כל ה-themes** | אין ProgressWidget mock בצד | P2 |

---

## 18. קומיט 12 — `feat(kit): prop color="secondary" ל-Button + IconButton`

### 18.1 מטרה

לאפשר ל-CTA במשחק (כמו "השמע שוב") להשתמש בצבע ה-secondary של ה-theme
במקום ה-primary. ב-find-letter — כתום במקום navy. ב-wordys — צהוב.
ב-portal — rose. וכו'.

### 18.2 שינוי ב-`Button.svelte`

הוסף prop:
```ts
interface Props {
	variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
	color?: 'primary' | 'secondary';  // ← חדש. default: 'primary'
	// ... שאר ה-props קיימים
}
```

כשcolor='secondary' ו-variant='primary':
- `bg-brand-secondary text-text-on-brand hover:bg-brand-secondary-hover`
- אם ה-theme מגדיר `shadow-elevated` — להחיל אותו (זה השדה שכבר נקבע פר theme עם הילה צבעונית).

כש-color='secondary' ו-variant='secondary':
- ignore color (variant=secondary הוא neutral surface, אין צבע מודגש).

כש-color='secondary' ו-variant='ghost':
- `text-brand-secondary hover:bg-surface-sunken`

כש-color='secondary' ו-variant='danger':
- ignore color (danger תמיד אדום).

### 18.3 שינוי ב-`IconButton.svelte`

אותו pattern בדיוק:
```ts
interface Props {
	variant?: 'solid' | 'subtle' | 'ghost';
	color?: 'primary' | 'secondary';  // ← חדש. default: 'primary'
	// ...
}
```

`variant='solid' color='secondary'`: `bg-brand-secondary text-text-on-brand`.
`variant='ghost' color='secondary'`: `text-brand-secondary`.

### 18.4 הוספת shadow ל-IconButton כש-solid

ב-IconButton, כש-variant='solid' עם color כלשהו, להוסיף `shadow-elevated`
(זה ה-token שכבר נקבע פר theme עם הילה צבעונית מתאימה — בfind-letter
זה כתום, ב-wordys זה ירוק, וכו').

### 18.5 טסטים

בקיט-test-screen, הוסף לטסטים הקיימים של Button + IconButton:

```ts
it('משתמש בצבע secondary כש-color="secondary"', async () => {
	const screen = render(Button, {
		children: () => 'X',
		color: 'secondary'
	});
	const btn = screen.getByRole('button').element() as HTMLElement;
	const styles = window.getComputedStyle(btn);
	// בדיקה שזה לא הצבע ה-primary
	expect(styles.backgroundColor).not.toBe('rgb(30, 64, 175)'); // brand-primary default
});
```

### 18.6 עדכון showcase

בדף `/showcase`, בסקציית Button — הוסף שורה:
```svelte
<div class="row">
	<Button color="secondary">Primary + Secondary</Button>
	<Button variant="ghost" color="secondary">Ghost + Secondary</Button>
	<IconButton label="X" variant="solid" color="secondary" icon={...}>X</IconButton>
</div>
```

### 18.7 walkthrough + קומיט

`feat(kit): prop color="secondary" ל-Button + IconButton`

---

## 19. קומיט 13 — `feat(kit): הוספת fonts — Rubik + Frank Ruhl Libre`

### 19.1 מטרה

ה-themes `wordys`, `read-faster`, ו-`portal` משתמשים ב-fonts שאינם זמינים
ב-system: `Rubik`, `Frank Ruhl Libre`. כעת ה-fallback ל-Heebo/system-ui
חוטף את ה-DNA. צריך להתקין את ה-fonts.

### 19.2 התקנה

הוסף ל-`packages/learn-booster-kit/package.json` (dependencies):
```json
"@fontsource/rubik": "^5.1.0",
"@fontsource/frank-ruhl-libre": "^5.1.0"
```

הרץ `bun install` ב-root של ה-monorepo (Bun workspaces יקח את זה).

### 19.3 import של ה-fonts

ב-`packages/learn-booster-kit/src/styles.css`, **לפני** כל ה-`@import './ui/theme/...'`:

```css
@source '.';

/* Fonts */
@import '@fontsource/heebo/400.css';
@import '@fontsource/heebo/600.css';
@import '@fontsource/heebo/700.css';
@import '@fontsource/heebo/800.css';
@import '@fontsource/heebo/900.css';
@import '@fontsource/rubik/400.css';
@import '@fontsource/rubik/500.css';
@import '@fontsource/rubik/700.css';
@import '@fontsource/rubik/800.css';
@import '@fontsource/rubik/900.css';
@import '@fontsource/frank-ruhl-libre/400.css';
@import '@fontsource/frank-ruhl-libre/700.css';
@import '@fontsource/frank-ruhl-libre/900.css';

/* Theme tokens + themes */
@import './ui/theme/themes/default.css';
...
```

(`Heebo` כבר היה — אם זה כבר מיובא במקום אחר, לוודא שלא יש כפילות.)

### 19.4 בדיקה

אחרי הקומיט, פתח `/showcase/game` עם theme=`read-faster` — האותיות
ב-grid צריכות להיראות serif חד-משמעי (גבוהות וצרות), שונה לחלוטין מ-Heebo.

### 19.5 walkthrough + קומיט

`feat(kit): הוספת fonts — Rubik + Frank Ruhl Libre`

---

## 20. קומיט 14 — `fix(kit): שדרוג themes לפי השוואה למשחקים אמיתיים`

### 20.1 שינוי גדול ב-`slate.css`

ה-theme הזה מציג header כהה — אבל היום ה-HeaderBar משתמש ב-`surface-elevated`
שזה לבן בכל ה-themes. צריך פתרון אחד משני:

**אופציה א — token חדש `--surface-header`:**
- מוסיף ל-`tokens.css`: `--color-surface-header: var(--theme-surface-header);`
- ברירת מחדל ב-default/kids/minimal/find-letter/wordys/portal/read-faster:
  `--theme-surface-header: var(--theme-surface-elevated);` (לבן, כמו היום)
- ב-slate בלבד: `--theme-surface-header: #1e293b;` (slate-800)
- מוסיף `--theme-text-on-header` (לבן ב-slate, primary בשאר)
- מעדכן את `HeaderBar.svelte` להשתמש ב-`bg-surface-header text-text-on-header`

**אופציה ב — `:has` selector:**
- ב-`slate.css` מוסיף:
  ```css
  [data-theme='slate'] header.lbk-header-bar {
    background: #1e293b;
    color: #ffffff;
  }
  ```
  זה דורש class יציב ב-HeaderBar (`class="lbk-header-bar"` קיים? אם לא — להוסיף).

**העדפה: אופציה א** — נכון יותר ויאפשר בעתיד גם themes כהים אחרים.

### 20.2 עדכון slate.css נוסף

- `surface-base: #fef9c3` (קרם-צהוב במקום `#f8fafc` אפור — לפי המקור)
- `surface-sunken: #fef3c7` (קרם בהיר)
- שאר ה-tokens נשארים

### 20.3 עדכון `find-letter.css`

- הוסף token חדש `--theme-accent-frame: #ff6a3d;` (מקור: `--color-frame` במשחק)
  ובשאר ה-themes: `--theme-accent-frame: transparent;`
- ב-`tokens.css` ב-`@theme`: `--color-accent-frame: var(--theme-accent-frame);`
  (יוצר utility `border-accent-frame`)

### 20.4 עדכון `read-faster.css`

- `radius-sm: 2px` (מינימליסטי)
- `radius-md: 4px`
- `radius-lg: 8px`
- `shadow-card: none`
- `shadow-elevated: 0 1px 2px rgba(0,0,0,.05)`

### 20.5 עדכון `portal.css`

- `shadow-card: 0 24px 70px rgba(15,23,42,.09)` (כבר ככה לפי המפרט המקורי — וודא)
- `shadow-elevated: 0 32px 90px rgba(15,23,42,.16)` (להגדיל)

### 20.6 walkthrough + קומיט

`fix(kit): שדרוג themes לפי השוואה למשחקים אמיתיים`

---

## 21. קומיט 15 — `feat(kit): Card variants חדשים — framed + ribbon`

### 21.1 מטרה

לאפשר לתאר ב-Card visual treatments שמייצגים ז'אנרים שונים:
- `framed`: מסגרת עבה צבעונית (כמו ה-frame של find-letter סביב ה-grid)
- `ribbon`: פס accent תחתון בצבע (כמו cards של wordys + main portal)

### 21.2 שינוי ב-`Card.svelte`

הוסף variants:
```ts
interface Props {
	variant?: 'elevated' | 'flat' | 'outlined' | 'framed' | 'ribbon';  // ← הרחבה
	ribbonColor?: string;  // CSS color (default: var(--theme-brand-secondary))
	// ...
}
```

- `variant='framed'`: `bg-surface-elevated border-4 border-accent-frame rounded-lg`
  (משתמש ב-`--color-accent-frame` שהוסף בקומיט 14 — ב-find-letter זה כתום, בשאר transparent — במצב transparent זה ייראה כמו "no border")
- `variant='ribbon'`: `bg-surface-elevated rounded-lg overflow-hidden`
  עם pseudo-element `::after` שתופס `position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: var(--ribbon-color, var(--theme-brand-secondary))`
  בנוסף — צריך לוודא ש-Card יש `position: relative`.
  אם `ribbonColor` prop קיים — להעביר ל-CSS דרך `style="--ribbon-color: {ribbonColor}"`.

### 21.3 עדכון showcase

בסקציית Card, הוסף:
```svelte
<Card variant="framed">
	<p>Framed (אם theme=find-letter — מסגרת כתומה)</p>
</Card>
<Card variant="ribbon">
	<p>Ribbon (default secondary color)</p>
</Card>
<Card variant="ribbon" ribbonColor="#3b82f6">
	<p>Ribbon (custom blue)</p>
</Card>
```

### 21.4 טסטים

הוסף לקיים:
```ts
it('framed variant מכיל גבול', async () => {
	const screen = render(Card, { children: () => 'X', variant: 'framed' });
	const card = screen.container.firstElementChild as HTMLElement;
	const styles = window.getComputedStyle(card);
	expect(parseInt(styles.borderWidth)).toBeGreaterThan(0);
});
```

### 21.5 walkthrough + קומיט

`feat(kit): Card variants חדשים — framed + ribbon`

---

## 22. קומיט 16 — `feat(kit-test-screen): שיפור מסך game להתאמה למקור`

### 22.1 שינויים ב-`apps/kit-test-screen/src/routes/showcase/game/+page.svelte`

#### 22.1.1 כפתור "השמע שוב" — secondary color
```svelte
<IconButton
	label="השמע שוב"
	showLabel
	variant="solid"
	color="secondary"   <!-- ← חדש -->
	onclick={...}
>
	{#snippet icon()}<SpeakerIcon />{/snippet}
</IconButton>
```

#### 22.1.2 הוסף subtitle לכותרת
ב-HeaderBar centerInfo:
```svelte
{#snippet centerInfo()}
	<div class="title-wrap">
		<h2 class="title">מצא את האות {targetLetter}</h2>
		<p class="subtitle">הקשיבו וגעו באות הנכונה</p>
	</div>
{/snippet}
```

CSS:
```css
.subtitle {
	margin: 0;
	font-size: var(--theme-font-size-sm);
	color: var(--theme-text-secondary);
	text-align: center;
}
```

#### 22.1.3 הוסף ProgressWidget mock בצד שמאל

ב-`.game-area`, עטוף ב-flex עם sidebar שמאלי:
```svelte
<div class="game-area-wrap">
	<aside class="progress-mock" aria-label="התקדמות לפרס">
		<div class="track">
			<div class="fill" style="height: {progressPct}%"></div>
		</div>
		<span class="counter">{score}/12</span>
		<span class="label">לפרס</span>
	</aside>
	<div class="game-area">
		<!-- ... prompt + grid ... -->
	</div>
</div>
```

עם `let progressPct = $derived((score % 12) / 12 * 100);`

CSS:
```css
.game-area-wrap {
	display: flex;
	gap: 1rem;
	height: 100%;
	padding: 1rem;
}
.progress-mock {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	padding: 1rem 0.5rem;
	background: var(--theme-surface-elevated);
	border-radius: var(--theme-radius-md);
	box-shadow: var(--theme-shadow-card);
	min-width: 60px;
}
.track {
	width: 12px;
	height: 200px;
	background: var(--theme-surface-sunken);
	border-radius: var(--theme-radius-pill);
	position: relative;
	overflow: hidden;
}
.fill {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: var(--theme-feedback-success);
	border-radius: var(--theme-radius-pill);
	transition: height 300ms ease;
}
.counter {
	font-weight: var(--theme-font-weight-bold);
	color: var(--theme-text-primary);
}
.label {
	font-size: var(--theme-font-size-xs);
	color: var(--theme-text-tertiary);
}
.game-area {
	flex: 1;
	/* ... כמו קודם ... */
}
```

#### 22.1.4 עטיפת ה-grid ב-Card framed

```svelte
<Card variant="framed" padding="lg" class="grid-frame">
	<div class="grid" data-grid={gridSize}>
		...
	</div>
</Card>
```

זה יוסיף את המסגרת הכתומה ב-find-letter, ובשאר ה-themes זה ייראה
שקוף/דק (כי `--accent-frame: transparent`).

### 22.2 walkthrough + קומיט

`feat(kit-test-screen): שיפור מסך game להתאמה למקור`

---

## 23. סדר ביצוע חלק III

1. **קומיט 12**: `feat(kit): prop color="secondary" ל-Button + IconButton`
2. **קומיט 13**: `feat(kit): הוספת fonts — Rubik + Frank Ruhl Libre`
3. **קומיט 14**: `fix(kit): שדרוג themes לפי השוואה למשחקים אמיתיים`
4. **קומיט 15**: `feat(kit): Card variants חדשים — framed + ribbon`
5. **קומיט 16**: `feat(kit-test-screen): שיפור מסך game להתאמה למקור`

### 23.1 הוראות חוזרות

- אישור: autonomous (לא לבקש פר-קומיט).
- בדיקות לפני כל קומיט: `bun run --filter <pkg> check` חייב לעבור.
- walkthrough מתעדכן לפני כל קומיט.
- `git add` סלקטיבי, פקודות git בנפרד.
- הודעות קומיט בעברית.
- ⚠️ **קרא קודם כל קובץ לפני שינוי** — חלק מהקבצים שונו ידנית בריצות
  קודמות (`+layout.svelte`).
- לא לגעת בקבצים שב-section 2.
- לא לגעת ב-`docs/component-system-spec.md` (זה המסמך הזה).

### 23.2 בדיקה סופית

אחרי קומיט 16:
1. `bun run --filter kit-test-screen dev`
2. עבור על כל 5 ה-themes (`find-letter`, `wordys`, `slate`, `read-faster`,
   `portal`) ב-`/showcase/game`.
3. ב-`find-letter`: וודא ש"השמע שוב" כתום עם צל כתום.
4. ב-`slate`: וודא ש-Header כהה.
5. ב-`read-faster`: וודא ש-fonts serif נטענים.
6. ב-`portal`: וודא צללים גדולים-רכים.
7. דווח למפעיל.

בהצלחה.

---

# חלק IV — סקירת איכות מקיפה לכל ה-themes

> נוסף 2026-05-17 אחרי סקירה ויזואלית של כל 8 ה-themes (3 גנריים + 5
> מבוססי-משחקים) בכל 3 מסכי הדמו (showcase / welcome / game).
> נמצאו בעיות איכות בקטגוריות: ניגודיות, בידול-צבעים, גבולות חסרים, ו-emoji.
>
> מתבצע ב-4 קומיטים. אותם כללים כמו חלקים קודמים.

## 24. רקע — הסקירה

נסקרו 24 צילומי מסך (8 themes × 3 דפים). המסקנות:

| Theme | בעיות שזוהו |
|-------|-------------|
| **default** | ✅ תקין |
| **kids** | ✅ תקין (חוץ מ-emoji — ראה pack C) |
| **minimal** | ProgressWidget נראה ריק — `surface-elevated=white` על `surface-base=white` בלי גבול |
| **find-letter** | ✅ תקין |
| **wordys** | Color tokens מתחרים (warning כתום + brand-secondary צהוב + brand-primary כתום); shadow-elevated ירוק רווי = "glitch effect" |
| **slate** | HeaderBar — cream buttons/badges על dark; showcase tokens — surface-sunken צהוב נראה כמו warning |
| **read-faster** | brand-primary (כחול) + brand-secondary (טורקיז) קרובים מדי לבידול ויזואלי |
| **portal** | tokens panel — Card לבן על base קרם כמעט בלי גבול → נראה ריק |
| **כל ה-themes** | emoji 🎮 ב-Welcome מופיע כ-□ (tofu) — אין font emoji בלינוקס headless |

---

## 25. קומיט 17 — `fix(kit-test-screen): ProgressWidget גובה — לא נמתח לכל הגובה`

### 25.1 רקע

באג ב-layout שזוהה לאחר חלק III: ב-`apps/kit-test-screen/src/routes/showcase/game/+page.svelte`
ה-`.game-area-wrap` הוא `display: flex` בלי `align-items`, וברירת המחדל היא `stretch` —
לכן ה-ProgressWidget נמתח לכל הגובה הזמין (~800px במקום 250px).

### 25.2 שינוי

הקובץ **כבר עודכן ידנית** במצב working tree (`git status` → M).
השינויים שכבר נעשו (קרא אותם לוודא, ואז קמט):

```diff
 .game-area-wrap {
 	display: flex;
+	align-items: flex-start;
 	gap: 1rem;
 	height: 100%;
 	padding: 1rem;
 }
 .progress-mock {
 	display: flex;
 	flex-direction: column;
 	align-items: center;
 	gap: 0.5rem;
 	padding: 1rem 0.5rem;
+	flex-shrink: 0;
```

### 25.3 קומיט

`git add` רק את `apps/kit-test-screen/src/routes/showcase/game/+page.svelte`.
לא לכלול את `docs/component-system-spec.md` (שמתעדכן ע"י המפעיל).
walkthrough: עדכן את `apps/kit-test-screen/docs/walkthrough.md`.

הודעה: `fix(kit-test-screen): ProgressWidget גובה — לא נמתח לכל הגובה`

---

## 26. קומיט 18 — Pack A: `fix(kit): ניגודיות וגבולות בthemes — minimal, slate, wordys`

3 תיקונים מקובצים — כולם בקטגוריית "P0 ניגודיות וגבולות חסרים".

### 26.1 Slate — scoped CSS variable overrides ב-HeaderBar

ב-`packages/learn-booster-kit/src/ui/theme/themes/slate.css`, הוסף בלוק חדש בסוף הקובץ:

```css
/* Header dark — scoped token overrides */
[data-theme='slate'] header.lbk-header-bar {
	/* Surfaces become semi-transparent white over dark header */
	--theme-surface-sunken: rgba(255, 255, 255, 0.12);
	--theme-surface-elevated: rgba(255, 255, 255, 0.08);

	/* Text becomes white-on-dark */
	--theme-text-primary: #ffffff;
	--theme-text-secondary: rgba(255, 255, 255, 0.75);
	--theme-text-tertiary: rgba(255, 255, 255, 0.55);

	/* Feedback bgs become tinted-transparent (work over dark) */
	--theme-feedback-success-bg: rgba(74, 222, 128, 0.2);
	--theme-feedback-warning-bg: rgba(250, 204, 21, 0.2);
	--theme-feedback-error-bg: rgba(248, 113, 113, 0.2);

	/* Borders white-tinted */
	--theme-border-subtle: rgba(255, 255, 255, 0.18);
	--theme-border-strong: rgba(255, 255, 255, 0.35);
}
```

**איך זה עובד**: CSS custom properties יורשים. כשמשנים אותם תחת `header.lbk-header-bar`,
כל אלמנט nested בתוכו (Button, IconButton, ScoreBadge, וכו') יקבל את הערכים החדשים
אוטומטית, **בלי לגעת בקוד הקומפוננטות**.

**דרישה**: ל-`HeaderBar.svelte` חייב להיות class יציב `lbk-header-bar` על ה-`<header>`.
אם זה לא קיים — להוסיף.

### 26.2 Minimal — גבול עדין ל-Card כש-surface=base

ב-`packages/learn-booster-kit/src/ui/primitives/Card.svelte`, בעדכון של variant
`elevated`:

```css
.lbk-card[data-variant='elevated'] {
	background: var(--theme-surface-elevated);
	box-shadow: var(--theme-shadow-card);
	border: 1px solid var(--theme-border-subtle);
	border-radius: var(--theme-radius-lg);
}
```

ה-`border` החדש (`1px solid var(--theme-border-subtle)`) פתר את הבעיה ב-minimal
(שם `surface-elevated=#ffffff` ו-`surface-base=#ffffff` כך ש-Card "נעלם"). בשאר
ה-themes הגבול עדין מספיק שלא יפריע (default: `#e2e8f0`).

> **אם הגבול כבר קיים** — להשאיר. אם נראה כפול עם shadow — להוריד ל-`1px solid transparent`
> ב-themes שלא צריכים אותו (אופציונלי, פחות מועדף).

### 26.3 Wordys — shadow-elevated רגוע

ב-`packages/learn-booster-kit/src/ui/theme/themes/wordys.css`:

```css
/* היה: */
--theme-shadow-elevated: 0 12px 32px rgba(34, 197, 94, 0.3);

/* לשנות ל: */
--theme-shadow-elevated: 0 8px 22px rgba(234, 88, 12, 0.2);
```

הסבר: הצל הירוק (`rgba(34,197,94,.3)`) על כפתור כתום נראה כמו glitch. המעבר לצל
כתום עדין (`rgba(234,88,12,.2)`) שומר על אופי "חם" של ה-theme אבל לא יוצר התנגשות
צבעים.

### 26.4 walkthrough + קומיט

`fix(kit): ניגודיות וגבולות בthemes — minimal, slate, wordys`

---

## 27. קומיט 19 — Pack B: `fix(kit): בידול צבעים — wordys, read-faster, portal`

### 27.1 Wordys — distinct colors

ב-`packages/learn-booster-kit/src/ui/theme/themes/wordys.css`:

```css
/* היה: */
--theme-brand-secondary: #facc15;        /* yellow-400 */
--theme-brand-secondary-hover: #eab308;  /* yellow-500 */
--theme-feedback-warning: #f97316;       /* orange-500 — מתנגש עם brand-primary כתום */
--theme-feedback-warning-bg: #fed7aa;

/* לשנות ל: */
--theme-brand-secondary: #fbbf24;        /* amber-400 — גוון מעט שונה מ-yellow */
--theme-brand-secondary-hover: #f59e0b;  /* amber-500 */
--theme-feedback-warning: #b45309;       /* amber-700 — חום-כתום כהה שלא מתחרה */
--theme-feedback-warning-bg: #fef3c7;    /* amber-100 */
```

תוצאה: 3 הצבעים החמים (brand-primary, brand-secondary, warning) הופכים להיררכיים
לפי בהירות: כתום עז → amber → חום-כהה.

### 27.2 Read-faster — bidul brand-secondary

ב-`packages/learn-booster-kit/src/ui/theme/themes/read-faster.css`:

```css
/* היה: */
--theme-brand-secondary: oklch(.75 .12 190);        /* טורקיז — קרוב מדי לכחול */
--theme-brand-secondary-hover: oklch(.65 .14 190);

/* לשנות ל: */
--theme-brand-secondary: oklch(.7 .15 50);          /* כתום-אדמדם — ניגודיות מקסימלית מכחול */
--theme-brand-secondary-hover: oklch(.6 .17 50);
```

הסבר: ה-brand-primary של read-faster הוא `oklch(.55 .18 250)` (כחול עמוק). secondary
שמיועד "להבליט" צריך להיות בקצה השני של גלגל הצבעים — כתום-אדמדם (`hue ~50`) הוא
הניגוד הטבעי לכחול (`hue ~250`).

### 27.3 Portal — Card outline ב-tokens panel

ב-`packages/learn-booster-kit/src/ui/theme/themes/portal.css`, הוסף בסוף:

```css
/* Brand-primary שחור על surface=לבן בכרטיס tokens panel — outline עדין */
[data-theme='portal'] .lbk-card[data-variant='elevated'] {
	border: 1px solid var(--theme-border-subtle);
}
```

> שים לב: זה override שמתאים רק ל-portal. בשאר ה-themes Card variant=elevated
> כבר יקבל את הגבול שהוסף ב-Pack A.2. אז אולי הסעיף הזה מתייתר — בדוק לפני
> שאתה כותב. אם Pack A.2 כבר נתן את הגבול לכל ה-themes, דלג על 27.3.

### 27.4 walkthrough + קומיט

`fix(kit): בידול צבעים — wordys, read-faster, portal`

---

## 28. קומיט 20 — Pack C: `feat(kit-test-screen): SVG hero ב-Welcome במקום emoji`

### 28.1 רקע

ה-emoji `🎮` שהוספתי במפרט (סעיף 14.3) לא נטען בסביבת לינוקס headless ובחלק
מהדפדפנים — מופיע כ-□ (tofu). הפתרון: SVG פנימי במקום emoji.

### 28.2 שינוי ב-`apps/kit-test-screen/src/routes/showcase/welcome/+page.svelte`

מצא את ה-snippet `heroIllustration`:

```svelte
{#snippet heroIllustration()}
	<div class="hero">
		<span class="emoji">🎮</span>
	</div>
{/snippet}
```

החלף ב:

```svelte
{#snippet heroIllustration()}
	<div class="hero" aria-hidden="true">
		<svg
			width="120"
			height="120"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<!-- SVG של מחוון משחק מינימליסטי (D-pad + 2 כפתורים) -->
			<rect x="2" y="8" width="20" height="10" rx="3" />
			<circle cx="7" cy="13" r="1.5" />
			<circle cx="17" cy="13" r="1.5" />
			<line x1="5" y1="11" x2="5" y2="15" />
			<line x1="3" y1="13" x2="7" y2="13" />
		</svg>
	</div>
{/snippet}
```

וב-`<style>`:

```css
.hero {
	width: 200px;
	height: 200px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--theme-radius-lg);
	background: linear-gradient(
		135deg,
		var(--theme-brand-primary),
		var(--theme-brand-secondary)
	);
	box-shadow: var(--theme-shadow-elevated);
	color: var(--theme-text-on-brand);   /* ← חדש: עבור stroke של SVG דרך currentColor */
}
/* מחק את .emoji entirely */
```

### 28.3 walkthrough + קומיט

`feat(kit-test-screen): SVG hero ב-Welcome במקום emoji`

---

## 29. סדר ביצוע חלק IV

1. **קומיט 17**: `fix(kit-test-screen): ProgressWidget גובה`
2. **קומיט 18**: Pack A — `fix(kit): ניגודיות וגבולות בthemes — minimal, slate, wordys`
3. **קומיט 19**: Pack B — `fix(kit): בידול צבעים — wordys, read-faster, portal`
4. **קומיט 20**: Pack C — `feat(kit-test-screen): SVG hero ב-Welcome במקום emoji`

### 29.1 הוראות חוזרות

- אישור: autonomous (לא לבקש פר-קומיט).
- בדיקות לפני כל קומיט: `bun run --filter <pkg> check` חייב לעבור.
- walkthrough מתעדכן לפני כל קומיט.
- `git add` סלקטיבי, פקודות git בנפרד.
- הודעות קומיט בעברית.
- ⚠️ **קומיט 17**: כבר יש שינוי M ב-working tree — תקרא קודם, ודא שהשינוי בפנים,
  קמט. אל תוסיף שינוי נוסף לאותו קובץ באותו קומיט.
- ⚠️ **בכל הקומיטים**: קרא קודם כל קובץ לפני שינוי — חלקם שונו ידנית.
- לא לגעת בקבצים שב-section 2.
- לא לגעת ב-`docs/component-system-spec.md`.

### 29.2 בדיקה סופית

אחרי קומיט 20:
1. `bun run --filter kit-test-screen dev` (כבר רץ — HMR יעדכן)
2. סקירה ב-`/showcase/game` ו-`/showcase/welcome` בכל 8 ה-themes:
   - slate: HeaderBar — buttons/badges אדפטיביים על dark
   - minimal: ProgressWidget Card עם גבול עדין
   - wordys: shadow כתום עדין, צבעים מובחנים
   - read-faster: brand-secondary כתום-אדמדם בולט מ-primary
   - portal: Card עם גבול בכרטיס tokens
   - all welcome: SVG במקום emoji
3. דווח למפעיל.

בהצלחה.
