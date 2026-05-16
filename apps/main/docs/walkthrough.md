# יומן פיתוח — apps/main

## 2026-05-16 01:30

### שדרוג מ-template ריק לפורטל מלא + פריסה ל-Cloudflare Pages

הפיכת `apps/main` מ-skeleton של SvelteKit לפורטל-משחקים שמקשר ל-משחקי הפרויקט, ופרוס באופן עצמאי ל-Cloudflare Pages תחת `learn-games`.

#### מה בוצע?

**1. שדרוג ל-Cloudflare Pages**

- `package.json`: הוספת `@sveltejs/adapter-cloudflare@^7.2.4` ו-`wrangler@^4.56.0`, ו-script `deploy` להפעלת `wrangler pages deploy`
- `svelte.config.js`: החלפת `adapter-auto` ב-`adapter-cloudflare`
- `wrangler.jsonc` (חדש): קונפיג Pages עם `nodejs_compat`, project name `learn-games`

**2. עיצוב פורטל מלא ב-`+page.svelte`**

- Hero עם סטטיסטיקה (מונה משחקים זמינים) ועיצוב יוקרתי
- Grid של כרטיסי משחק (responsive: 1/2/3 עמודות), 7 גוונים (rose/sky/emerald/amber/violet/teal/indigo)
- כל כרטיס מציג: אייקון, סטטוס pill, קטגוריה, כותרת, תיאור, נתיב פרויקט (LTR), כפתורי "פרודקשן" + "גרסת פיתוח" (אופציונלי)
- אנימציות hover, צללים מעודנים, `color-mix` עם CSS custom properties

**3. תמיכת RTL מלאה**

- `layout.svelte`: עטיפת `<div lang="he" dir="rtl">` סביב `children`
- `layout.css`: `html { direction: rtl }` + reset CSS גלובלי + רקע `#f7f2e8` קבוע

**4. הרחבת מודל המשחק**

- `defaults.ts`: הוספת `devHref?: string` ל-`AvailableGame` interface
- מולא URL של dev לכל המשחקים שיש להם subdomain dev (wordys, train-addition, passcode, jigsaw, find-letter)
- תיקון URL של readFaster (`read-faster.vercel.app` → `read-faster-tzlev.vercel.app`)
- jigsaw: הוחלפו ה-hrefs — `href` עכשיו פרודקשן, `devHref` הוא הישן

**5. עדכון `language.ts`**

- `openGameLabel`: "פתח משחק" → "פרודקשן"
- חדש: `openDevLabel: "גרסת פיתוח"`
- `readFaster.title`: "קוראים מהר" → "האצת קריאה"

**6. עדכון בדיקות**

- `page.svelte.spec.ts`: בדיקה חדשה שמוודאת שכל משחק ב-`AVAILABLE_GAMES` מקבל קישור עם כותרת המשחק. שמות הבדיקות הוסבו לעברית.

**7. root package.json**

- הוספת `packageManager: "bun@1.3.13"` (declaration רשמי לתאימות סקריפטים)

#### החלטות ארכיטקטורה

- **שני קישורים פר משחק (פרודקשן + dev)**: במקום קישור יחיד, נחשפים שתי סביבות. מאפשר למורה לבדוק גרסה חדשה לפני שמשתמשים שם, וגם לסוכן לפתח על dev בלי לשבר את חוויית התלמיד.
- **`main` נפרס בנפרד תחת `learn-games`**: לא כחלק מ-deploy מאוחד למונוריפו. שומר על אסטרטגיית "deploys נפרדים" של פלטפורמת-המשחקים, ומאפשר עדכון של ה-portal בלי לפרוס מחדש את כל המשחקים.
- **תוכן הפורטל מודולרי דרך `AVAILABLE_GAMES`**: ניתן להוסיף משחק חדש לפורטל בעריכת `defaults.ts` + `language.ts` בלבד, בלי לגעת ב-`+page.svelte`.
