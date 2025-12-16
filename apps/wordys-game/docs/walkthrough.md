# יומן פיתוח - Wordy's

## 17/12/2025 Walkthrough - Mobile Keyboard Fix

תיקנתי את הבעיה שבה המקלדת המובנית של הטלפון הייתה קופצת ומסתירה את המסך בעת שימוש במקלדת הווירטואלית של המשחק.

### מה בוצע?

**1. מניעת מקלדת מובנית (Native Keyboard Prevention)**

- **inputmode="none"**: הוספתי הגדרה זו לשדה הקלט (`TypingInput`) כאשר המקלדת הווירטואלית פעילה.
- **משמעות**: הדפדפן מבין שאין להציג מקלדת רכה (Software Keyboard), אך השדה עדיין נשאר בפוקוס ומאפשר הקלדה דרך הממשק שלנו.

## 16/12/2025 Walkthrough - Progress Widget (ווידג'ט התקדמות)

נוסף ווידג'ט המציג לתלמיד באופן ברור (ויזואלי וטקסטואלי) את התקדמותו לקראת הבוסטר (המחזק).

### מה בוצע?

**1. ווידג'ט התקדמות (`ProgressWidget`)**

- **רכיב חדש**: פס התקדמות אנכי המציג "X/Y" (למשל "1/3").
- **מיקום קבוע**: הווידג'ט ממוקם כעמודה קבועה מימין לתוכן המשחק בכל הגדלים (כולל מובייל), מה שמבטיח נראות תמידית.
- **לוגיקה חכמה**: חישוב דינמי של גודל ה"באץ'" (Batch) הנוכחי. אם נותרו פחות מילים מהמוגדר למחזק, הווידג'ט מתאים את עצמו (למשל "1/1").

**2. שינויי פריסה (Layout)**

- **GameContainer**: שדרוג המבנה ל-`flex-row` ראשי המכיל את הווידג'ט והמשחק זה לצד זה.

**3. אימות**

- `npm run check` עבר בהצלחה.

## 14/12/2025 Walkthrough - Space Key Support

הוספתי תמיכה במקש רווח במקלדת הווירטואלית.

### מה בוצע?

**1. מקלדת וירטואלית (Virtual Keyboard)**

- **מקש רווח**: נוסף מקש רווח בשורה נפרדת בתחתית המקלדת.
- **מקשים ריקים**: נוספו מקשים "ריקים" (Spacers) משני צידי מקש הרווח למראה מקלדת טבעי יותר.
- **עיצוב**: מקש הרווח רחב (40%), והמקשים הריקים הם בגודל סטנדרטי (כמו שאר המקשים).
- **נגישות**: נוספה תווית `aria-label` לנגישות.

## 14/12/2025 Walkthrough - Hint Mechanism (מנגנון רמז)

הוספתי מנגנון רמז המסייע לתלמידים כאשר המילה מוסתרת.

### מה בוצע?

**1. כפתור רמז (Hint Button)**

- נוסף כפתור נורה (💡) המופיע רק כאשר מצב תצוגת המילה הוא `hidden`.
- לחיצה על הכפתור חושפת את המילה למשך זמן קצוב ומשמיעה אותה.

**2. הגדרות וניהול (Settings)**

- **משך רמז**: ניתן להגדיר כמה זמן המילה תהיה חשופה (ברירת מחדל: 1.5 שניות).
- **זמן צינון (Cooldown)**: ניתן להגביל את תדירות השימוש ברמז ע"י קביעת זמן המתנה בין לחיצות.
- **מיקום**: כפתור הרמז ממוקם משמאל לשדה הקלט, בעיצוב עגול ובולט.
- **הפעלה/כיבוי**: הוספת מתג ראשי להפעלת או ביטול מנגנון הרמז. ההגדרות מופיעות רק במצב "מוסתר" ונפתחות באנימציית החלקה (`slide`).
- **חיווי ויזואלי**: כאשר הכפתור בצינון, מוצג שעון ספירה לאחור ומעגל התקדמות גרפי.

**3. רכיבים**

- `HintButton.svelte`: קומפוננטה חדשה לניהול הויזואליה של הכפתור.
- `GameContainer.svelte`: שילוב הלוגיקה והטיימרים.
- `SettingsStore`: הוספת השדות `hintDuration` ו-`hintCooldown`.

**4. אימות**

- `bun run check` עבר בהצלחה (0 שגיאות) לאחר תיקון שגיאת סינטקס.

## 14/12/2025 Walkthrough - Hint Refinement & Design Patterns

חידדנו את התנהגות הרמז ושיפרנו את ארכיטקטורת הקוד והעיצוב.

### מה בוצע?

**1. שיפור מנגנון הרמז (Hint Logic)**

- **חשיפה על הכרטיסים**: במקום להציג כרטיס נפרד ("Whole Word"), הרמז כעת חושף את האותיות בתוך הכרטיסים הריקים הקיימים. זה שומר על ההקשר הוויזואלי ומרגיש טבעי יותר.

**2. ארכיטקטורה ועיצוב (Design Patterns)**

- **Container/Presenter**: הוגדרה ויושמה תבנית עיצוב המפרידה בין האחריות לפריסה (Layout) לבין האחריות לנראות (Visuals).
  - **יישום**: ב-`HintButton`, האלמנט החיצוני (`<button>`) אחראי על הגודל והמיקום (`w-14 h-14`), והאלמנט הפנימי (`<div>`) אחראי על העיצוב (`bg-white`, `shadow`, `border`).
  - **יתרונות**: מאפשר אנימציות נקיות (ללא דחיפת אלמנטים שכנים) ושימוש חוזר קל.
- **תיעוד**: הכלל נוסף למסמך `GEMINI.md` תחת פרק העיצוב.

**3. ממשק משתמש (UI)**

- **כפתור רמז**: עיצוב תלת-מימדי משופר (צל, גבול תחתון עבה) למראה "משחקי" ולחיץ.

## 13/12/2025 Walkthrough - Word Display Mode & Settings Refactor

הוספתי פיצ'ר חדש המאפשר להציג את המילה ככרטיס שלם "גלובלי" (Whole Word Reading) במקום כאותיות נפרדות, לטובת תרגול קריאה גלובלית. בנוסף, בוצע שדרוג וניקוי יסודי של מנגנון ההגדרות.

### מה בוצע?

**1. מצב תצוגת מילה (Word Display Mode)**

- **תמיכה ב-3 מצבים**:
  1. **אותיות נפרדות (`letters`)**: המצב הקיים.
  2. **מילה שלמה (`word`)**: המילה מוצגת ככרטיס אחד גדול וברור.
  3. **מוסתר (`hidden`)**: המילה מוסתרת (לאתגר זיכרון/הכתבה).
- **Settings API**: הוחלף המשתנה הבוליאני `showWord` ב-Enum חדש `wordDisplayMode`.

**2. שדרוג תשתית ההגדרות (Settings Store Refactor)**

- **ניקוי קוד (Clean Code)**: הקוד ב-`SettingsStore` פוצל לפונקציות ברורות: `load` (טעינה), `save` (שמירה), ו-`migrate` (מיגרציה).
- **תאימות לאחור (Migration)**: נכתבה לוגיקה חכמה שיודעת להמיר את ההגדרות הישנות (של המשתמשים הקיימים) למבנה החדש באופן שקוף.
- **תיעוד**: נוספו הערות בעברית לכל שדות ההגדרות והפונקציות.
- **תמציתיות**: שימוש בסינטקס מודרני (`...this`) לשמירה יעילה של ההגדרות.

**3. ממשק משתמש (UI)**

- **Settings Controls**: הוחלף המתג (Toggle) הפשוט של "הצג מילה" בתפריט בחירה (Dropdown) המציג את 3 האפשרויות בצורה ברורה.
- **WordDisplay**: עודכן הרכיב לתמוך ויזואלית בכל אחד מהמצבים, כולל עיצוב מותאם לכרטיס ה"מילה השלמה".

**4. ביצועים (Performance)**

- **Preload Assets**: נוסף מנגנון טעינה מוקדמת (Preload) לכל הנכסים (תמונות וסאונד) מיד עם פתיחת המשחק.
  - הפונקציה `preloadAllAssets` ב-`assets.ts` רצה ברקע (`onMount` ב-Layout הראשי) ומבטיחה שכל התמונות והצלילים יהיו זמינים מיידית במטמון הדפדפן, ללא עיכובים בזמן המשחק.
  - **חדש**: נוספה הפונקציה `preloadCards(ids)` המאפשרת לטעון רשימה ספציפית של כרטיסים (למשל, רק של שלב מסוים) אם נרצה בעתיד לחסוך בתעבורה.

---

# 13/12/2025 Walkthrough - Refactor Asset Handling

ביצעתי שינוי מקיף (Refactor) באופן שבו המערכת מנהלת נכסים (תמונות וסאונד) ומשייכת אותם למילים.

## שינויים שבוצעו

### 1. ניהול נכסים דינמי

- נוצר קובץ `available-assets.json` המכיל רשימה של כל הקבצים הקיימים במערכת.
- עודכן `src/lib/services/assets.ts` לטעון קובץ זה ולבדוק קיום קבצים בזמן אמת.
- נוספו פונקציות עזר:
  - `getCardImageUrl(cardId)`: מחזירה את כתובת התמונה לפי ה-ID של הכרטיס (או placeholder אם לא קיים).
  - `getCardAudioUrl(cardId)`: מחזירה את כתובת הסאונד (wav/mp3) אם קיימת.

### 2. ניקוי נתונים (`data clean-up`)

- **`src/lib/types.ts`**: הוסרו השדות `imageUrl` ו-`audioUrl` מהממשק `Card`. כעת הכרטיס מכיל רק `id` ו-`word`.
- **`src/lib/data/words.ts`**: הוסרו כל ההגדרות הישירות של `imageUrl: getAssetUrl(...)`. הקובץ כעת נקי ורזה יותר.

### 3. עדכון רכיבים ושירותים

- **`image-helpers.ts` & `sound.ts`**: עודכנו להשתמש בפונקציות החדשות מ-`assets.ts`.
- **`sound.ts`**: נוספה יכולת לנגן קבצי אודיו (`playAudio`), עם Fallback ל-TTS אם אין קובץ הקלטה זמין.
- **רכיבי UI (`GameContainer`, `Select`, `Admin`)**: עודכנו להשתמש ב-`getCardImageUrl(card.id)` במקום לגשת לשדה שאינו קיים עוד.
- **`shelvesStore.svelte.ts`**: עודכן להתאים לשינויי הטיפוסים (הוסרה תמיכה בהגדרת URL ידנית לכרטיס, המערכת מסתמכת על ID).

## אימות

- הורצה בדיקת `npm run check` שהסתיימה ללא שגיאות (0 errors).
- המערכת כעת יציבה ומסתמכת על קונבנציית שמות (Convention over Configuration) - קובץ התמונה והסאונד חייבים להיות בעלי אותו שם כמו ה-ID של הכרטיס.

## הוראות למשתמש

- אם ברצונך להוסיף כרטיס חדש דרך ה-Admin, יש לוודא שקובץ התמונה והסאונד המתאימים נמצאים בתיקייה המתאימה בשרת/R2 עם השם התואם ל-ID שנוצר (או ID ידני אם יתאפשר בעתיד).

## 10/12/2025 - ניקוי וארגון נכסים (Refactor)

### שיפור קוד (Refactoring)

- **VirtualKeyboard**: החלפת inline SVG של כפתור המחיקה בשימוש בקובץ נכס חיצוני (`backspace.svg`) לשיפור הקריאות.

### תשתית (Infrastructure)

- **.gitignore**: הוספת התעלמות מקבצי וידאו מקומיים (`static/videos/*`) להקטנת ה-Repo.

## 10/12/2025 - אינטגרציה של הגדרות Booster

### שיפורים ושילוב מערכת (Integration)

- שולבו הגדרות `learn-booster-kit` ישירות בתוך רכיב `SettingsControls.svelte`.
- הוסר התלות ברכיב `SettingsForm` המוטמע, לטובת חווית משתמש אחידה עם שאר ממשק ההגדרות.
- נוספו כל הפקדים הנדרשים לניהול בוסטר:
  - הפעלה/כיבוי ראשי עם אתחול שירות.
  - לולאה אוטומטית.
  - בחירת סוג פרס (וידאו/אפליקציה/אתר).
  - הגדרת תורות לחיזוק ומשך זמן.
  - הגדרות ספציפיות לכל סוג חיזוק (בחירת אפליקציה מ-Fully Kiosk, תיקיית דרייב, כתובת אתר).
- תוקנו בעיות ייבוא בחבילת `learn-booster-kit` (חשיפת `getAppsList` ו-`isFullyKiosk`).
- טופלו בעיות נגישות (A11y) בתוויות הטפסים החדשים.

### קבצים ששונו

- `apps/wordys-game/src/lib/components/admin/SettingsControls.svelte` - שכתוב מלא לשילוב ההגדרות.
- `packages/learn-booster-kit/src/index.ts` - ייצוא פונקציות עזר.

## 2025-12-06 22:30

### יצירת תמונות חסרות וסנכרון ענן (Partial Image Gen & Cloud Sync)

תהליך מובנה ליצירת התמונות החסרות במשחק באמצעות AI, וסנכרון הנכסים לאחסון בענן (R2).

#### מה בוצע?

**1. יצירת תמונות (Image Generation)**

- **גישה מדורגת**: עבודה בשלבים (Stages) לניהול העומס והמכסות.
- **שלב 1 (הושלם)**: אוכל ושתייה (Meals & Drinks) - נוצרו 11 תמונות חדשות (`omelet`, `cheese`, `schnitzel`...).
- **שלב 2 (חלקי)**: אנשים (People) - נוצרו כל בני המשפחה (`dad`, `mom`...) וחלק מהדמויות (`boy`, `girl`, `friend_m`). התהליך נעצר עקב מגבלת מכסות (Quota).
- **אחידות ויזואלית**: פרומפטים מותאמים לשמירה על סגנון אחיד (Flat illustration, isolated).

**2. ניהול נכסים וקוד**

- **Assets Update**: הקבצים החדשים נשמרו ב-`wordys-assets-source/cards`.
- **Code Update**: קובץ `words.ts` עודכן לקשר לתמונות החדשות במקום ל-Placeholder.
- **R2 Sync**: הורץ סנכרון (`npm run sync:assets`) שהעלה 21 קבצים חדשים ל-Cloudflare R2 Bucket.

**3. תיעוד**

- נוצר מסמך `docs/ND.md` לריכוז הפרומפטים ומעקב אחר הסטטוס של כל תמונה.

---

## 2025-12-06 20:30

### גרסה v0.7 - אופטימיזציית תצוגה וגמישות (Responsive Layout)

שדרוג מקיף למנוע התצוגה של המשחק (`GameContainer` ו-`WordDisplay`) כדי להבטיח ניצול מקסימלי של שטח המסך בכל מכשיר ובכל אוריינטציה (Portrait/Landscape).

#### מה בוצע?

**1. לוגיקת עימוד חכמה (Smart Layout Logic)**

- **גמישות מלאה (Flexbox Fluidity)**: מעבר מגדלים קבועים (`w-48`) ושימוש ב-Percent-based Layout ו-`flex-grow` כדי שהאלמנטים ימלאו את כל השטח הפנוי.
- **התאמה לאוריינטציה**:
  - **Portrait**: התמונה מקבלת את מקסימום הגובה האפשרי, והמילה מתחתיה בגודל אופטימלי.
  - **Landscape**: חלוקה אופקית (Side-by-side) שבה אזור השליטה (מילה + מקלדת) מקבל עדיפות (`flex-[1.5]`), והתמונה ממלאת את השארית.
- **שמירה על פרופורציות (Aspect Ratio)**:
  - שימוש ב-`aspect-[5/7]` לכרטיסי האותיות כדי למנוע עיוות.
  - שימוש ב-`aspect-[5/7]` לכרטיסי האותיות כדי למנוע עיוות.
  - **Container Queries**: שימוש ב-`cqw` לקביעת גודל פונט וכרטיס, מה שמאפשר לאלמנטים לגדול ללא "תקרה" מלאכותית (`clamp(..., ..., 150px)`) בהתאם לשטח המיכל.

**2. תיעוד וקריאות**

- הוספת הערות בעברית (`{/* ... */}`) בתוך ה-Markup של Svelte להסבר על הבחירות העיצוביות ומחלקות ה-Tailwind המורכבות.

**3. אימות (Verification)**

- בוצעה בדיקה מקיפה בדפדפן (Browser Subagent) במצבי קיצון:
  - **Portrait (375x812)**: תצוגה אנכית ברורה. ![Portrait Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/portrait_mode_1765045508435.png)
  - **Landscape (812x375)**: תצוגה אופקית מנוצלת היטב. ![Landscape Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/landscape_mode_1765045509150.png)
  - **Maximized View**: בדיקת Container Queries - הכרטיסים גדלים משמעותית כשיש שטח. ![Maximized Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/maximized_view_1765046429758.png)
  - **Dynamic Scaling Verification**:
    - **Small (375x812)**: ![Small Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/small_375x812_1765046530082.png)
    - **Medium (768x1024)**: ![Medium Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/medium_768x1024_1765046537725.png)
    - **Large (1920x1080)**: ![Large Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/large_1920x1080_1765046544972.png)

---

## 2025-12-06 05:30

### תיקון אזהרות (Maintenance)

בוצע תיקון של אזהרות `svelte-check` לניקוי הקוד ושיפור הנגישות.

#### מה בוצע?

- **SettingsControls**: תיקון תגיות `span` שהיו `self-closing` (מה שגרם לאזהרת HTML תקין).
- **Admin Shelves**: החלפת השימוש ב-attribute `autofocus` (שגורם לאזהרת נגישות) ב-Action ייעודי `use:focus` שמבצע את הפוקוס בצורה תקינה.
- **Verification**: הרצת `bun run check` עברה ללא שגיאות או אזהרות.

## 2025-12-06 05:20

### הושלמה גרסה v0.6 - מעבר ל-Cloudflare R2 וניהול נכסים חכם

שדרוג משמעותי לתשתית הנכסים (תמונות וסאונד) כדי לשפר ביצועים, להקל על ה-Repository, ולאפשר ניהול נוח יותר בעתיד.

#### מה בוצע?

**1. אחסון בענן (Cloud Infrastructure)**

- **Cloudflare R2**: כל התמונות והסאונד הועברו לאחסון ב-bucket יעודי (`wordys-game-assets`).
- **Custom Domain**: הנכסים מוגשים דרך דומיין מותאם (`static.wordys-game.tzlev.ovh`) לביצועים מיטביים.

**2. ניהול נכסים מקומי (Local Workflow)**

- **תיקיית מקור**: נוצרה תיקייה `wordys-assets-source` (מחוץ לגיט) לניהול קבצי המקור (`cards`, `ui_sounds`, `audio`).
- **סנכרון חכם (Smart Sync)**: פותח סקריפט (`npm run sync:assets`) המשתמש ב-MD5 Hashing כדי להעלות רק קבצים חדשים או ששונו, וחוסך זמן ורוחב פס.
- **ניקיון**: הוסרו התיקיות `static/images` ו-`static/sounds` מהפרויקט כדי להקטין את גודל ה-Repo.

**3. קוד ואבסטרקציה**

- **`assets.ts`**: נוצר שירות מרכזי לניהול כתובות נכסים (`getAssetUrl`), המאפשר גמישות (למשל, החלפת ספק אחסון בעתיד) ומונע שבירת קישורים.
- **תיקון נתיבים**: כל הרכיבים (`ImageDisplay`, `words.ts`, `sound.ts`) עודכנו להשתמש בשירות החדש.

**4. שיפורי רספונסיביות (CSS & Layout)**

- **גדלים מותאמים (Tuned Sizes)**: המעבר לשימוש ב-Classes מדוייקים (`w-20` במובייל) המבטיחים ש-4 כרטיסים ייכנסו בשורה אחת במסך סטנדרטי.
- **לוגיקת Aspect Ratio**: פריסת המשחק מתאימה את עצמה אוטומטית לפי היחס בין הרוחב לגובה של המסך (ולא רק לפי סוג המכשיר).
  - **מצב רגיל (Portrait)**: המקלדת סגורה? המסך גבוה? -> פריסה אנכית.
  - **מצב דחוס (Landscape/Keyboard Open)**: היחס גדל -> פריסה אופקית.
  - **גודל תמונה דינמי**: במצב אופקי, התמונה גדלה בהתאם לגודל המסך (`md:w-72`, `lg:w-96`) כדי לנצל את השטח הריק בדסקטופ, אך נשארת קטנה (`w-48`) במובייל כדי לא להסתיר את המקלדת.

---

## 2025-12-06 02:40

### הושלמה גרסה v0.5 - שיפורי ממשק, טיפוגרפיה ואייקונים

בוצע שדרוג משמעותי לממשק המשתמש, כולל מעבר לפונט Rubik, שיפור קריאות הכרטיסים והוספת אייקון ייעודי למקש רווח.

#### מה בוצע?

**1. טיפוגרפיה ועיצוב (Typography & Design)**

- **פונט Rubik**: הוטמע הפונט `Rubik` (מ-Google Fonts) כפונט הראשי של האפליקציה למראה מודרני וקריא יותר בעברית.
- **משקלי פונט**: הופחתו משקלי הפונט (מ-Black ל-Bold/Semibold) בכרטיסים ובכותרות לשיפור הקריאות.
- **ריווח**: הוגדלו המרווחים בין האותיות והכרטיסים (`gap`) למניעת צפיפות.

**2. רכיב הצגת המילה (WordDisplay)**

- **גלישת מילים חכמה**: הטמעת לוגיקה שמונעת שבירת מילים באמצע שורה (Wrap by word).
- **גודל דינמי**: התאמת גודל האותיות באופן דינמי (קטן יותר למילים ארוכות מ-5 תווים) כדי להבטיח התאמה לרוחב המסך.
- **שיפורים למובייל**: הגדלת כרטיסי האותיות במצב Portrait לנוחות מקסימלית.

**3. שיפורי UI נוספים (Additional UI Improvements)**

- **צבעוניות**: הוגדרה פלטת צבעים ייחודית לכל קטגוריה (כתום לאוכל, סגול לאנשים וכו') לשיפור ההתמצאות והחוויה הוויזואלית.
- **תצוגת תמונות**: כל התמונות המוקטנות (Thumbnails) מיושרות כעת לחלק העליון (`object-top`) כדי להציג את נושא התמונה בצורה ברורה יותר.
- **אייקון מקש רווח**: עיצוב וקטורי (`space-key.svg`) למקש הרווח לשיפור הניגודיות.

**4. מקלדת וירטואלית (Virtual Keyboard)**

- נוסף רכיב `VirtualKeyboard.svelte` המממש מקלדת עברית מלאה.

**5. תיקונים (Fixes)**

- **קישור הגדרות**: הכפתור "חזרה למשחק" מההגדרות כעת מחזיר למסך ממנו הגעת.
- **נקה בחירה**: תוקן באג שמנע ניקוי בחירה במסך בחירת הכרטיסים.
- **פריסת לוח**: שיפור ניצול שטח המסך (`max-w-[95vw]`) במסכים רחבים.

**6. תשתית ותהליכי עבודה (Infrastructure & Workflow)**

- **מסמך חוקים**: שופר ופורט מסמך החוקים של הפרויקט (כולל נהלי טרמינל וגיט).
- **Workflow**: עודכן תהליך הקומיט (`/commit`) לאכיפת בדיקות תקינות ומניעת שרשור פקודות.
- **README**: עודכן קישור למסמך החוקים.

---

## 2025-12-05 01:55

### הושלמה גרסה v0.4 - ממשק ניהול ופריסה לענן

המשחק כעת כולל ממשק ניהול מלא וזמין אונליין!

**Live URL**: [https://wordys-game.pages.dev](https://wordys-game.pages.dev) 🚀

#### מה בוצע?

**1. ממשק ניהול (Admin Interface)**

- **כתובת**: `/admin` (מוגן ע"י `AdminGate` - מקצב הקשות).
- **ניהול מילים**: הוספה (כולל העלאת תמונה), מחיקה ואיפוס.
- **הגדרות**: שליטה מלאה על הגדרות המשחק מתוך הממשק.
- **ארכיטקטורה**: חלוקה ל-Sub-routes (`/admin/words`, `/admin/settings`) עם Layout משותף.

**2. פריסה (Deployment)**

- המשחק נפרס ל-**Cloudflare Pages**.
- שימוש ב-`adapter-cloudflare` לביצועים מקסימליים.
- תהליך CI/CD אוטומטי מול GitHub.

**3. תיקונים (Fixes)**

- **תצוגת טאבלט**: תוקנה בעיית חיתוך הממשק במסכים קטנים/בינוניים ע"י הוספת גלילה (`overflow-y-auto`) והקטנת מרווחים.
- **מצב מאוזן (Landscape)**: הוספת תמיכה בתצוגה רוחבית (תמונה לצד המילים) כדי למנוע גלילה ולנצל את המסך בצורה מיטבית.
  ![Landscape Layout Fix](file:///D:/Users/User/.gemini/antigravity/brain/a45cad25-fcba-4ad6-97d3-dc044545ba79/landscape_layout_fix_check_1764893821981.png)
- **טעינת גרסה**: מעבר לטעינת `package.json` בצד השרת (`+layout.server.ts`) כדי למנוע שגיאות Vite.

---

## 2025-12-04 23:51

### הושלמה גרסה v0.2 - סאונד, הגדרות וליטוש

הוספנו שכבות של משוב, סאונד והתאמה אישית למשחק.

#### מה בוצע?

**1. סאונד ומשוב (Audio & Feedback)**

- **הקראת מילים (TTS)**: שימוש ב-Web Speech API להקראת המילה בעברית.
- **אפקטים קוליים**:
  - צליל הצלחה (`success.mp3`) בעת השלמת מילה.
  - צליל שגיאה (`error.wav`) בעת הקלדת אות שגויה.
- **רצף הצלחה משופר**: סאונד הצלחה -> הקראת המילה -> "כל הכבוד!" -> השהיה -> מילה הבאה.

**2. מערכת הגדרות (Settings System)**

- **כפתור הגדרות**: גישה מהירה להגדרות המשחק (אייקון גלגל שיניים).
- **אפשרויות התאמה אישית**:
  - **הצג מילה**: אפשרות להסתיר את המילה הכתובה לאתגר זיכרון.
  - **הדגשת אות**: חיווי ויזואלי לאות הנוכחית.
  - **חיווי שגיאה**: אפשרות לכיבוי הרעידה והצליל.
- **שמירה**: ההגדרות נשמרות בדפדפן (LocalStorage).

**3. שיפורים ופוליש (Polish)**

- **אנימציות**: הילה מהבהבת (Pulse) סביב האות הנוכחית (רק הצל, ללא שינוי גודל).
- **חיווי שגיאה מדויק**: רעידה וצליל בכל הקשה שגויה (אך לא במחיקה/תיקון).
- **WordDisplay**: עיצוב חדש עם תיבות לכל אות.

#### צעדים הבאים (Future)

- ממשק ניהול להוספת מילים ותמונות (`/admin`).
- הפיכה ל-PWA (אפליקציה לאופליין).

---

## 2025-12-04 20:45

### הושלמה גרסה ראשונית (v0.1)

השלמנו את הגרסה הראשונית של המשחק **Wordy's**! 🎉
המשחק מותאם לתלמידי חינוך מיוחד, עם עיצוב נקי, ברור ומחזק.

#### מה בוצע?

**1. תשתית ועיצוב**

- הוקם פרויקט **SvelteKit** עם **Tailwind CSS**.
- עיצוב **Distraction-free**: נקי, עם פוקוס על המשימה.
- שימוש ב-**Svelte 5 Runes** לניהול מצב יעיל.

**2. רכיבי המשחק**

- **ImageDisplay**: מציג את תמונת האובייקט עם מסגרת ואפקט עדין.
- **WordDisplay**: מציג את המילה באותיות גדולות וברורות.
- **TypingInput**:
  - תיבת קלט גדולה ומרכזית.
  - **בדיקה מיידית**: חיווי שגיאה (רעידה וצבע אדום) ברגע שיש טעות באות.
  - מונע התקדמות אם יש שגיאה (המשתמש רואה את הטעות וצריך לתקן).
  - **שיפורים**: פוקוס אוטומטי ושגיאה מתמשכת עד לתיקון.
- **Feedback**: חיווי הצלחה בולט ("כל הכבוד!") עם אנימציה בסיום מילה.
- **GameContainer**: מנהל את רצף המילים והמעבר ביניהן.

**3. תוכן (Mock Data)**

- מאגר מילים ראשוני (כלב, חתול, בית, כדור, פרח) עם תמונות (Placeholders).
