# יומן פיתוח - משחק לוטו (Lotto Game)

## 2026-01-15 22:18

### ריפקטורינג UI - SegmentedControl, ארגון קומפוננטות ו-@apply

בוצע ריפקטורינג מקיף לממשק המשתמש: יצירת קומפוננטה גנרית לבוררים, העברת קומפוננטות למיקומים לוגיים, שינוי מבנה ההגדרות, ומעבר לשימוש ב-Tailwind עם `@apply` מאורגן.

#### מה בוצע?

**1. קומפוננטה גנרית - SegmentedControl**

- **[NEW] `SegmentedControl.svelte`**: קומפוננטה חדשה ב-`lib/components/` לבוררים סגמנטיים (2-3 מצבים).
- **שימושים**: החליפה כפתורים בודדים בשלושה מקומות:
  - סוג תוכן (אותיות | צורות)
  - מצב צבעים (רנדומלי | אחיד)
  - מבנה המשחק (מוגבל | אינסופי)
- **עיצוב**: בורר מחובר עם רקע משותף, אנימציות scale וצבעים, כולל תמיכה באייקונים.

**2. ארגון מחדש של קומפוננטות**

- **קומפוננטות ייעודיות לראוטינג**: הועברו `Confetti.svelte` ו-`Board.svelte` מ-`lib/components/` ל-`routes/_components/` (משמשות רק בדף המשחק הראשי).
- **קומפוננטות ייעודיות לפרוביידר**: הועבר `ShapeSvg.svelte` מ-`lib/components/` ל-`content/providers/shapes/` (משמש רק בצורות).
- **עדכון ייבואים**: כל הייבואים עודכנו בהתאם למיקומים החדשים.

**3. מבנה הגדרות חדש**

- **סדר מחודש**: סקשנים בדף ההגדרות עודכנו לסדר לוגי יותר:
  1. 🎨 **בחירת תוכן** (סוג תוכן + הגדרות ספציפיות לפרוביידר)
  2. ⚙️ **הגדרות משחק** (מספר זוגות, אפשרויות)
  3. 🎁 **מהלך משחק וחיזוקים**
- **איחוד**: סוג התוכן שהיה בסקשן נפרד עבר להיות חלק מסקשן "בחירת תוכן" יחד עם ההגדרות הספציפיות.
- **SegmentedControl**: כל הבוררים הוחלפו ב-`SegmentedControl` במקום כפתורים נפרדים.

**4. מעבר ל-@apply עם ארגון לפי קטגוריות**

- **13 קומפוננטות עודכנו**: כל סגנונות ה-Tailwind inline הועברו ל-`<style>` block עם `@apply`.
- **ארגון לפי קטגוריות**: כל class מאורגן לקטגוריות:
  - **Layout** - `flex`, `grid`, `items-center`, `justify-between`
  - **Spacing** - `p-*`, `m-*`, `gap-*`
  - **Visual** - `bg-*`, `text-*`, `rounded-*`, `shadow-*`, `border-*`, `font-*`
  - **Interactive** - `hover:*`, `focus:*`, `transition-*`, `cursor-*`
- **קומפוננטות שעודכנו**:
  - `routes/+page.svelte`
  - `routes/settings/+page.svelte`
  - `routes/settings/_components/SettingsControls.svelte`
  - `lib/components/SegmentedControl.svelte` (חדש)
  - `routes/_components/Board.svelte`
  - `content/providers/letters/LettersSettings.svelte`
  - `content/providers/shapes/ShapesSettings.svelte`

**5. תיקון Registry לתמיכה ב-HMR**

- **בעיה**: בסביבת פיתוח, HMR (Hot Module Reload) גרם לרישום כפול של providers וזרק שגיאה.
- **פתרון**: שונה `ContentProviderRegistry.register()` מזריקת שגיאה במקרה של provider קיים לדריסה שקטה, מה שמאפשר HMR לעבוד בצורה תקינה.

#### החלטות ארכיטקטורה

- **SegmentedControl גנרי**: נבחר לבנות קומפוננטה גנרית במקום לשכפל קוד דומה בכל בורר. הקומפוננטה מקבלת `options[]` ו-`value` ומטפלת בכל הלוגיקה הויזואלית באופן אחיד.

- **ארגון קומפוננטות לפי שימוש**: קומפוננטות הועברו למיקומים לוגיים לפי עקרון "co-location" - קומפוננטות שמשמשות רק במקום אחד נמצאות קרוב לאותו מקום (routes/_components או בתוך ה-provider).

- **@apply עם קטגוריות**: מעבר מ-inline classes ל-`@apply` בארגון קטגוריאלי משפר קריאות, תחזוקה ויכולת לשתף סגנונות. הארגון לקטגוריות עוזר למצוא מהר שינויים ספציפיים (למשל, כל מה שקשור ל-hover נמצא תחת Interactive).

- **דריסה במקום שגיאה ב-Registry**: במקום לזרוק שגיאה על provider כפול (שמתאים ל-production), נבחר לאפשר דריסה (overwrite) בפיתוח כדי שלא לשבור את ה-HMR. זה pattern נפוץ בכלי פיתוח מודרניים.

## 2026-01-15 17:50

### תיקון בהפעלת פרס ועדכוני תשתית

נוסף מנגנון הגנה מפני הפעלה כפולה של כפתור הפרס, לצד עדכונים בתהליכי הבנייה והפריסה.

#### מה בוצע?

**1. חווית משתמש (UX) - מניעת כפילויות**

- **ניהול מצב**: נוסף המשתנה `isRewardPending` ב-`+page.svelte` כדי לעקוב אחר סטטוס בקשת הפרס.
- **הגבלת אינטראקציה**: כפתור הפרס ("קבל הפתעה") הופך ללא פעיל (Disabled) מייד לאחר הלחיצה הראשונה ועד לסיום הטיפול, למניעת קריאות כפולות לשרת או הפעלות מקבילות.

**2. תשתית (Infrastructure)**

- **Deployment**: נוסף סקריפט `deploy` ל-`package.json` המבצע בנייה (`vite build`) ומיד לאחריה פריסה ל-Cloudflare Pages (`wrangler pages deploy`).
- **Types**: תיקון תחבירי קטן ב-`package.json`.

## 2026-01-14 17:15

### הוספת אפשרות להסתיר כרטיסים שהותאמו

נוספה תכונה המאפשרת למשתמש לבחור האם כרטיסים שכבר הותאמו (זוגות שנמצאו) יוסתרו לחלוטין מהלוח במקום שיוצגו עמומים.

#### מה בוצע?

**1. ניהול הגדרות (`settings.svelte.ts`)**

- נוסף שדה `hideMatchedCards` (פעיל: שקר, כברירת מחדל) ל-Store הגדרות ולמנגנון השמירה.

**2. ממשק משתמש (`SettingsControls.svelte`)**

- נוסף צ'קבוקס "הסתר כרטיסים שהותאמו" במסך ההגדרות, תחת קטגוריית "אפשרויות משחק".

**3. לוגיקת משחק (`Card.svelte`)**

- עודכן חישוב `cardState`: כאשר כרטיס מותאם (`isMatched`) וההגדרה `hideMatchedCards` פעילה, הוא מקבל סטטוס `hidden`.
- נוספה מחלקת CSS `.card.hidden` שמגדירה `visibility: hidden` (כדי לשמור על המקום בגריד) ו-`opacity: 0`.

#### החלטות ארכיטקטורה

- **שימוש ב-CSS Class**: נבחר להשתמש ב-class נוסף (`hidden`) במקום להסיר את האלמנט מה-DOM (למשל `{#if}`) כדי לשמור על מבנה הגריד (Layout) בצורה פשוטה, כך שהכרטיסים האחרים לא יזוזו ממקומם.

## 2026-01-12 17:05

### שדרוג הגדרות, תיקון באג וידאו ושיפורי UX

בוצע שדרוג מקיף לממשק ההגדרות ולאופן הפעלת הבוסטר, יחד עם תיקון באג משמעותי בניגון וידאו.

#### מה בוצע?

**1. שיפורי ממשק הגדרות (`SettingsControls.svelte`)**

- **ארגון מחדש**: טופס ההגדרות חולק ל-3 קטגוריות לוגיות ברורות (הגדרות כלליות, מהלך משחק וחיזוקים, תוכן).
- **מיזוג הגדרות**: אוחדה הגדרת "תדירות חיזוק" לתוך הסליידר הראשי של "מספר סבבים" למניעת כפילות ובלבול.
- **כפתור בדיקה**: נוסף כפתור "בדוק חיזוק כעת" המאפשר בדיקה מיידית של מנגנון הפרס.

**2. שיפורי חווית משתמש (UX)**

- **ביטול בחירה**: נוסף מתג `enableDeselect` המאפשר לשלוט האם לחיצה חוזרת על כרטיס מבטלת את בחירתו.
- **הפעלה ידנית של חיזוק**: נוסף מתג `autoBooster`. כאשר הוא כבוי, בסיום סבב מזכה, מוצג כפתור "קבל הפתעה" גדול בחלונית הניצחון, המאפשר למשתמש לבחור מתי לפתוח את החיזוק.
- **Admin Gate**: הוספת הגנה על כפתור ההגדרות (לחיצה במקצב מסוים) למניעת יציאה בטעות על ידי ילדים, בדומה לשאר משחקי הסדרה.

**3. תיקוני באגים ותשתית (`learn-booster-kit`)**

- **תיקון וידאו (ריק)**:
  - שונתה ברירת המחדל של `source` מ-`google-drive` ל-`local` כדי למנוע ניסיון טעינה מתיקייה לא מוגדרת.
  - נוסף מנגנון fallback ב-`video-loader.ts`: אם אין קובץ וידאו מקומי ב-dev mode, המערכת תשתמש בוידאו לדוגמה מהאינטרנט (BigBuckBunny) במקום להיכשל.
- **תיקון טעינת הגדרות**:
  - עודכן `config-manager.ts` להשתמש ב-`deepMerge` בעת טעינה מ-`localStorage`. זה פתר בעיה בה הגדרות שמורות דרסו ומחקו את משתני הסביבה (כגון `googleDriveFolderUrl`) שהוגדר ב-`.env`.

#### החלטות ארכיטקטורה

- **Deep Merge להגדרות**: המעבר ל-Deep Merge הוא קריטי לשמירה על תאימות לאחור בעת הוספת שדות חדשים להגדרות או שינוי משתני סביבה, שכן הוא מבטיח שערכי ברירת מחדל חדשים לא יידרסו על ידי אובייקט הגדרות "שטוח" ושמור.

## 2026-01-12 11:37

### שילוב מערכת מחזק (Booster) ודף הגדרות מרכזי

הושלמה אינטגרציה מלאה עם ספריית `learn-booster-kit`, יצירת דף הגדרות ייעודי, ומעבר לניהול סטייט ריאקטיבי ופרסיסטנטי (שמירת הגדרות).

#### מה בוצע?

**1. ניהול הגדרות ותשתית**

- **[NEW] `settings.svelte.ts`**: נוצר Store גלובלי ב-`$lib/stores` המרכז את כל הגדרות המשחק והמחזק.
  - תומך בשמירה אוטומטית ל-`localStorage`.
  - כולל מנגנון מיגרציה לגרסאות עתידיות.
  - מסיר את הצורך בניהול State מקומי בדפי המשחק.

**2. ממשק הגדרות (`/settings`)**

- **דף הגדרות ייעודי**: נוצר Route חדש ב-`/settings` המחליף את המודל הישן (`SettingsModal`).
- **`SettingsControls.svelte`**: רכיב המכיל את כל פקדי המשחק (בחירת תוכן, זוגות, לולאה) ופקדי המחזק (סוג פרס, בחירת אפליקציות, מקור וידאו).
- **תאימות**: הממשק מותאם לעבודה בטאבלטים (Kiosk Mode) עם כפתורים גדולים וברורים.

**3. אינטגרציה במשחק**

- **Layout**: הוסף `BoosterContainer` ואתחול של `boosterService` ברמת האפליקציה ב-`+layout.svelte`.
- **Game Page**: עודכן `+page.svelte` לקריאת הגדרות מה-Store הגלובלי והפעלת `triggerReward()` בסיום המשחק.
- **ניקיון**: נמחק רכיב `SettingsModal.svelte` הישן.

**4. תיקוני באגים**

- **תדירות מחזק**: תוקן באג בו המחזק הופעל בכל סבב. נוסף מונה ניצחונות (`winsCount`) והשוואה מול הגדרת `turnsPerReward` כדי להבטיח שהמחזק מופעל רק במרווחים הרצויים.

  ![אימות תדירות מחזק](D:/Users/User/.gemini/antigravity/brain/1229a5b9-f87a-4faa-8c16-303f338120c5/lotto_turns_check_retry_1768226398650.webp)

**5. תשתית ו-Deployment**

- **Tailwind**: הוספת `@source` ל-`layout.css` כדי לכלול את רכיבי `learn-booster-kit` בבניית ה-CSS.
- **Cloudflare Adapter**: החלפת המתאם ב-`svelte.config.js` ל-`@sveltejs/adapter-cloudflare` לצורך פריסת Production.
- **תאימות**: עדכון `wrangler.jsonc` לשימוש ב-`nodejs_compat`.
- **שם חבילה**: תיקון שם הפרויקט ב-`package.json` ל-`lotto-game`.

#### החלטות ארכיטקטורה

- **Store מאוחד**: נבחרה גישה של Store יחיד (`settings.svelte.ts`) המכיל גם הגדרות משחק וגם דגל `boosterEnabled`, במקום לפצל ל-Stores נפרדים. גישה זו (שנלקחה מ-`train-addition-game`) פישטה את הניהול בהשוואה למבנה המפוצל ב-`wordys-game`.
- **דף נפרד במקום מודל**: המעבר לדף הגדרות מלא (`/settings`) במקום מודל מאפשר הצגת כמות גדולה של הגדרות (במיוחד הגדרות המחזק המורכבות) בצורה נוחה וקריאה יותר, ומונע עומס ויזואלי על מסך המשחק עצמו.

---

## 2025-12-24 18:25

### הוספת מצב "צורות גיאומטריות" ושיפורי ממשק

נוספה אפשרות לשחק עם צורות גיאומטריות במקום אותיות, כולל התאמות עיצוביות ושיפורי חווית משתמש.

#### מה בוצע?

**1. לוגיקה ומשחקיות (Game Logic)**

- **סוגי תוכן**: תמיכה בשני מצבי משחק - אותיות (Letters) וצורות (Shapes).
- **מצבי צבעים**: אפשרות לבחור בין "צבע אחיד" (Uniform) לבין "צבע רנדומלי לכל זוג" (Random).
- **ניהול צבעים**: במצב "צבע רנדומלי", כל הכרטיסים של אותה צורה מקבלים צבע זהה כדי להקל על הזיהוי.
- **Grid דינמי**: הלוח מתאים את מספר העמודות והשורות באופן אוטומטי בהתאם לכמות הכרטיסים (למשל, 4 כרטיסים יוצגו כ-2x2).

**2. רכיבים וממשק משתמש**

- **[NEW] `ShapeSvg.svelte`**: רכיב חדש להצגת 10 צורות גיאומטריות שונות (עיגול, ריבוע, משולש, כוכב, לב, מעוין ועוד). נוספה מסגרת (Stroke) בצבע הצורה לשיפור הנראות.
- **`Card.svelte`**:
  - עודכן לתמיכה בהצגת רכיבי SVG.
  - **Refactor**: המרת רשימת ה-classes הארוכה לשימוש ב-Derived State ומילון מצבים (Idle, Matched, Error, Selected) לקוד נקי וקריא יותר.
- **`SettingsModal.svelte`**:
  - נוסף בורר ראשי עבור "סוג תוכן" (אותיות/צורות).
  - נוספה רשת לבחירת צורות ספציפיות למשחק.
  - נוסף בורר למצב צבעים.
- **`+page.svelte`**: כותרת המשחק מתעדכנת דינמית ("משחק לוטו אותיות" / "משחק לוטו צורות").

#### קבצים ששונו

- `src/lib/utils/gameLogic.ts`
- `src/lib/components/Card.svelte`
- `src/lib/components/Board.svelte`
- `src/lib/components/SettingsModal.svelte`
- `src/lib/components/ShapeSvg.svelte` (קובץ חדש)
- `src/routes/+page.svelte`
