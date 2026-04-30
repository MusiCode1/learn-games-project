# תוכנית: Settings Refactor (שלבים 2-3)

> תאריך: 2026-04-30
> מצב נוכחי: שלב 1 הושלם (Grid אדפטיבי, commit da9f159)

---

## שלב 2: סידור הגדרות לקטגוריות

**סוג:** UI refactor בלבד, ללא שינוי behavior או store
**TDD:** לא נדרש

### קובץ לעריכה
`src/routes/(app)/settings/+page.svelte`

### קטגוריות (לפי הסדר בדף)

#### 1. רמת קושי והתאמה לתלמיד
כותרת קטגוריה עם רקע צהוב/amber להבלטה.

הגדרות בקטגוריה (לפי הסדר):
- מצב מתחילים (כבר מובלט בצהוב — להשאיר)
- מצב נעילה לתלמידים (כבר מובלט בוורוד — להשאיר)
- גודל פאזל
- התאם grid לתמונה
- ערבוב חלקים
- הצגת חלקים (pieceFilter)
- רגישות חיבור (proximity)
- סגנון חלקים (shapeStyle)
- אפשר פירוק חלקים (allowDisconnect)

#### 2. תמונות ומהלך משחק
כותרת קטגוריה רגילה.

הגדרות בקטגוריה:
- חבילת תמונות
- תמונת עזר
- ערבוב תמונות
- מצב משחק (continuous/manual_end)
- כפתור המשך לצד פרס
- הקראת משוב
- כפתור סידור מחדש

#### 3. חיזוקים (Gingim Booster)
להשאיר את כל הבלוק הקיים כפי שהוא, כולל ההגדרות הפנימיות.

#### 4. תחזוקה
- כפתור איפוס להגדרות ברירת מחדל

### הנחיות לביצוע

1. **לא לשנות bindings** — כל `bind:checked`, `bind:value`, `onchange` נשארים זהים
2. **לא לשנות store** — אין שינויים ב-`settings.svelte.ts` או `types.ts`
3. **להוסיף כותרות קטגוריה** — `<h2>` או `<div>` עם styling מתאים
4. **לשמור על responsive** — הקטגוריות צריכות להיראות טוב גם במובייל

### עיצוב מוצע לכותרת קטגוריה

```svelte
<div class="mt-8 mb-4">
  <h2 class="text-xl font-bold text-slate-700 border-b-2 border-slate-200 pb-2">
    שם הקטגוריה
  </h2>
</div>
```

### בדיקות בסיום

```bash
cd /home/user/projects/learn-games-project/apps/jigsaw-puzzle-game/version-2
bun run check
bun run build
```

### סיום שלב 2

1. עדכן `docs/walkthrough.md` עם תיאור השינוי
2. Commit רק קבצי jigsaw:
   ```bash
   git add apps/jigsaw-puzzle-game/
   git commit -m "(jigsaw-puzzle): סידור הגדרות לקטגוריות UI"
   ```
3. Deploy:
   ```bash
   npx wrangler pages deploy .svelte-kit/cloudflare --project-name puzzle-game --branch dev --commit-dirty=true
   ```

---

## שלב 3: מערכת פרופילים

**סוג:** לוגיקה חדשה + UI
**TDD:** כן — בדיקות קודם לקוד

### קבצים לעריכה/יצירה

- `src/lib/types.ts` — הוספת type ו-field
- `src/lib/stores/settings.svelte.ts` — לוגיקת profiles
- `src/lib/stores/settings.test.ts` — **חדש**, בדיקות TDD
- `src/routes/(app)/settings/+page.svelte` — UI בחירת profile

### Types להוספה

```typescript
// ב-types.ts
export type SettingsProfile = "beginner" | "intermediate" | "advanced" | "custom";

// להוסיף ל-TeacherSettings:
activeProfile: SettingsProfile;
```

### הגדרות פרופילים

| הגדרה | beginner | intermediate | advanced |
|-------|----------|--------------|----------|
| beginnerMode | true | false | false |
| gridPresetIndex | 1 (2×2) | 3 (3×3) | 5 (4×4) |
| shufflePiecePlacement | false | true | true |
| adaptGridToImage | true | true | false |
| studentLockMode | true | false | false |
| proximity | 50 | 35 | 25 |
| shapeStyle | classic | classic | classic |

### ברירות מחדל

- **משתמש חדש:** `activeProfile: "beginner"`
- **משתמש קיים (migration):** `activeProfile: "custom"` — לא לדרוס הגדרות קיימות

### בדיקות TDD (לכתוב קודם!)

קובץ: `src/lib/stores/settings.test.ts`

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("Settings Profiles", () => {
  // 1. applyProfile("beginner") מגדיר ערכים נכונים
  it("applyProfile beginner sets correct values", () => {
    // ...
  });

  // 2. applyProfile("advanced") מגדיר ערכים נכונים  
  it("applyProfile advanced sets correct values", () => {
    // ...
  });

  // 3. שינוי הגדרה ידנית → activeProfile="custom"
  it("manual setting change switches to custom profile", () => {
    // ...
  });

  // 4. migration: משתמש קיים (v6) מקבל custom
  it("migration from v6 sets activeProfile to custom", () => {
    // ...
  });

  // 5. משתמש חדש מקבל beginner
  it("new user gets beginner profile", () => {
    // ...
  });
});
```

### Store changes

```typescript
// settings.svelte.ts

const CURRENT_VERSION = 7; // היה 6

// הוסף field:
activeProfile = $state<SettingsProfile>(DEFAULT_SETTINGS.activeProfile);

// הוסף method:
applyProfile(profile: SettingsProfile): void {
  this.activeProfile = profile;
  if (profile === "custom") return;
  
  const presets = {
    beginner: { beginnerMode: true, gridPresetIndex: 1, ... },
    intermediate: { ... },
    advanced: { ... },
  };
  
  const preset = presets[profile];
  // apply all preset values
}

// עדכן load() עם migration:
if (!parsed.activeProfile) {
  this.activeProfile = "custom"; // משתמש קיים
}
```

### UI בחירת Profile

להוסיף בראש דף ההגדרות (לפני הקטגוריות):

```svelte
<div class="rounded-2xl bg-gradient-to-r from-sky-100 to-indigo-100 p-5 shadow-md mb-6">
  <label class="block text-lg font-bold text-slate-700 mb-3">
    פרופיל הגדרות
  </label>
  <div class="flex flex-wrap gap-2">
    {#each ["beginner", "intermediate", "advanced", "custom"] as profile}
      <button
        onclick={() => settings.applyProfile(profile)}
        class="rounded-lg px-4 py-2 font-bold transition-all {settings.activeProfile === profile
          ? 'bg-sky-500 text-white shadow-lg'
          : 'bg-white text-slate-700 hover:bg-slate-100'}"
      >
        {profile === "beginner" ? "מתחילים" : 
         profile === "intermediate" ? "בינוני" :
         profile === "advanced" ? "מתקדם" : "מותאם אישית"}
      </button>
    {/each}
  </div>
</div>
```

### בדיקות בסיום

```bash
cd /home/user/projects/learn-games-project/apps/jigsaw-puzzle-game/version-2
bun run test:unit -- --run --project server
bun run check
bun run build
```

### סיום שלב 3

1. עדכן `docs/walkthrough.md`
2. Commit:
   ```bash
   git add apps/jigsaw-puzzle-game/
   git commit -m "(jigsaw-puzzle): מערכת פרופילים להגדרות (TDD)"
   ```
3. Deploy:
   ```bash
   npx wrangler pages deploy .svelte-kit/cloudflare --project-name puzzle-game --branch dev --commit-dirty=true
   ```

---

## פקודות הרצה

### שלב 2 בלבד:
```bash
cd /home/user/projects/learn-games-project/apps/jigsaw-puzzle-game/version-2
opencode --model anthropic/claude-sonnet-4-6 -p "קרא את docs/plan-settings-refactor.md ובצע את שלב 2 בלבד. עבוד רק בקבצי jigsaw-puzzle-game. בסיום: bun run check, bun run build, עדכן walkthrough.md, commit, deploy ל-dev."
```

### שלב 3 בלבד (אחרי שלב 2):
```bash
cd /home/user/projects/learn-games-project/apps/jigsaw-puzzle-game/version-2
opencode --model anthropic/claude-sonnet-4-6 -p "קרא את docs/plan-settings-refactor.md ובצע את שלב 3 בלבד (TDD). עבוד רק בקבצי jigsaw-puzzle-game. כתוב בדיקות קודם, אמת שהן נכשלות, ואז כתוב קוד. בסיום: tests, check, build, עדכן walkthrough.md, commit, deploy ל-dev."
```
