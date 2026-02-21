# יומן פיתוח - kit-test-screen

## 2026-02-21 00:00

### הסרת @source עם path יחסי ל-learn-booster-kit

#### מה בוצע?

**1. `src/routes/layout.css`**

- הוחלף `@source '../../../../packages/learn-booster-kit'` ב-`@import 'learn-booster-kit/styles'`.

**2. `vite.config.ts`**

- ה-alias של `learn-booster-kit` שונה מ-`src/index.ts` (קובץ ספציפי) ל-`src/` (ספרייה).
- כך `learn-booster-kit` → `src/index.ts` ו-`learn-booster-kit/styles` → `src/styles.css`.

#### החלטות ארכיטקטורה

- **שינוי alias לספרייה**: כשה-alias מצביע לספרייה (ולא לקובץ ספציפי), Vite מפנה sub-paths כמו `/styles` לקבצים בספרייה. זה מאפשר הרחבה עתידית (למשל `learn-booster-kit/types`) ללא שינוי בconfig.

---
