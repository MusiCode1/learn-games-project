# Learn Games Project — Agent Entry Point

> פלטפורמת משחקים לימודיים לתלמידים עם צרכים מיוחדים.
> Monorepo: 12 משחקים + 2 packages, SvelteKit 5 + Tailwind 4 + Bun, פריסה ל-Cloudflare Pages.

מסמך זה הוא **entry point** לסוכני AI ולתורמים. הוא **מפנה למסמכים המפורטים**, ולא מחליף אותם.

---

## חובה לקרוא לפני התחלת עבודה

| מסמך | תפקיד |
|------|--------|
| [`docs/coding-conventions.md`](./docs/coding-conventions.md) | כללי קוד: שפה, TS, Svelte 5, naming, RTL, תהליך עבודה |
| [`docs/functional-programming.md`](./docs/functional-programming.md) | תכנות פונקציונלי: pure functions, `Result<T,E>`, core/shell |
| [`docs/game-design-rules.md`](./docs/game-design-rules.md) | כללי game design: booster, AdminGate, cooldown, TTS |
| [`docs/component_structure.md`](./docs/component_structure.md) | מבנה קומפוננטות Svelte (`_components/`) |
| [`docs/platform-plan.md`](./docs/platform-plan.md) | תכנון רב-שלבי לפלטפורמיזציה (רקע, החלטות אסטרטגיות) |

**הסקילים הגלובליים** `commit`, `update-walkthrough`, `dev-conventions` נטענים אוטומטית. אם הם לא קיימים בסביבת ה-agent — לכבד את ההנחיות במסמכי הפרויקט.

---

## תקציר הכללים הקריטיים

### שפה
- **עברית** ל-UI, walkthrough, קומיטים, הערות
- **אנגלית** לשמות (PascalCase קומפוננטות, kebab-case מודולים)
- **RTL מלא** ב-UI
- **אסור hardcoded Hebrew** בקבצי קוד — להשתמש ב-`language.ts` מרכזי

### Stack
- SvelteKit 5 (runes) + Tailwind 4 + Bun
- TypeScript חובה ב-logic
- **ArkType** ל-runtime validation (לא Zod)
- פריסה Cloudflare Pages per-app

### תכנות פונקציונלי — חכם ולא קנאי
- **Pure functions** ב-logic (migrate, validate, score, shuffle)
- **`Result<T, E>`** במקום `throw` ב-public API
- **Imperative shell** מותר ב-Svelte runes / DOM / IO
- ❌ לא Effect.ts / fp-ts / monads
- ❌ לא FP אגרסיבי ב-UI components

### תהליך עבודה
- **אישור מהמשתמש לפני קומיט** — ראה [סעיף קומיטים ב-coding-conventions](./docs/coding-conventions.md#92-אישור-לקומיטים) למודלים השונים (פר-קומיט / batch / autonomous)
- **`bun run check`** לפני קומיט
- **`git add` סלקטיבי** — קובץ אחר קובץ, לא `git add .`
- **פקודות git בנפרד** — אחת בכל פעם, בדיקת פלט בין אחת לשנייה (לא `&&`)
- **הודעות קומיט בעברית** בפורמט `(scope): כותרת`
- **`docs/walkthrough.md`** מתעדכן לפני כל קומיט (פר-app או רוחבי)
- **קומיט אחד = נושא אחד** (אטומיות)

### Files
- `AGENTS.md` חובה בכל app
- `docs/walkthrough.md` בכל app
- `_components/` ל-route-specific, `src/lib/components/` למשותפים
- `.svelte.ts` סיומת ל-runes מחוץ לקומפוננטה

---

## מבנה הפרויקט

```
learn-games-project/
├── AGENTS.md                       ← אתה כאן
├── docs/                           ← מסמכי תיעוד מרכזיים
│   ├── coding-conventions.md
│   ├── functional-programming.md
│   ├── game-design-rules.md
│   ├── component_structure.md
│   ├── platform-plan.md
│   └── walkthrough.md              ← יומן פיתוח רוחבי
├── apps/                           ← 12 SvelteKit apps + main portal
│   ├── main/                       ← Portal ל-Cloudflare Pages
│   ├── find-letter-game/           ← זיהוי אותיות עברית
│   ├── lotto-game/                 ← זוגות עם ContentProvider
│   ├── wordys-game/                ← תרגול מילים
│   ├── sort-cards-game/            ← מיון לקטגוריות
│   ├── train-addition-game/        ← חיבור
│   ├── passcode-practice/          ← תרגול קוד
│   ├── jigsaw-puzzle-game/         ← פאזל (v1 legacy, v2 ה-active)
│   ├── read-faster/                ← קריאה מהירה
│   ├── learn-booster/              ← legacy של gingim.net
│   └── ...
└── packages/
    ├── learn-booster-kit/          ← הקיט המשותף (BoosterService, AdminGate, profiles)
    └── fully-kiosk-js/             ← Types ל-Fully Kiosk Browser API
```

---

## חוקי הזהב המהירים

1. **החזר `Result<T, E>`** — שגיאות נצפות ב-types, לא ב-runtime.
2. **השתמש ב-`language.ts`** — מחרוזות עברית במקום אחד.
3. **`git add` סלקטיבי** — קובץ אחר קובץ, לא `git add .`.
4. **פקודות בנפרד** — אחת בכל פעם, בדיקת פלט בין אחת לשנייה.
5. **שאל לפני קומיט** — אלא אם המשתמש נתן רשות לסשן ללא השגחה.
6. **Composition over inheritance** — factory functions, לא היררכיות מורכבות.
7. **תן ל-Svelte 5 לעבוד** — runes הם mutable by design, לא להילחם.

---

## קישורים שימושיים

- Cloudflare Pages: כל app יש לו `wrangler.jsonc` + `bun run --filter <app> deploy`
- Portal הראשי: `https://learn-games.pages.dev`
- Source of truth של ה-Kit: `packages/learn-booster-kit/src/index.ts`
- Repo: `https://github.com/MusiCode1/learn-games-project`
