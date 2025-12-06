# יומן פיתוח - Wordy's

## 2025-12-06 22:30
### יצירת תמונות חסרות וסנכרון ענן (Partial Image Gen & Cloud Sync)

תהליך מובנה ליצירת התמונות החסרות במשחק באמצעות AI, וסנכרון הנכסים לאחסון בענן (R2).

#### מה בוצע?

**1. יצירת תמונות (Image Generation)**
*   **גישה מדורגת**: עבודה בשלבים (Stages) לניהול העומס והמכסות.
*   **שלב 1 (הושלם)**: אוכל ושתייה (Meals & Drinks) - נוצרו 11 תמונות חדשות (`omelet`, `cheese`, `schnitzel`...).
*   **שלב 2 (חלקי)**: אנשים (People) - נוצרו כל בני המשפחה (`dad`, `mom`...) וחלק מהדמויות (`boy`, `girl`, `friend_m`). התהליך נעצר עקב מגבלת מכסות (Quota).
*   **אחידות ויזואלית**: פרומפטים מותאמים לשמירה על סגנון אחיד (Flat illustration, isolated).

**2. ניהול נכסים וקוד**
*   **Assets Update**: הקבצים החדשים נשמרו ב-`wordys-assets-source/cards`.
*   **Code Update**: קובץ `words.ts` עודכן לקשר לתמונות החדשות במקום ל-Placeholder.
*   **R2 Sync**: הורץ סנכרון (`npm run sync:assets`) שהעלה 21 קבצים חדשים ל-Cloudflare R2 Bucket.

**3. תיעוד**
*   נוצר מסמך `docs/ND.md` לריכוז הפרומפטים ומעקב אחר הסטטוס של כל תמונה.

---

## 2025-12-06 20:30
### גרסה v0.7 - אופטימיזציית תצוגה וגמישות (Responsive Layout)

שדרוג מקיף למנוע התצוגה של המשחק (`GameContainer` ו-`WordDisplay`) כדי להבטיח ניצול מקסימלי של שטח המסך בכל מכשיר ובכל אוריינטציה (Portrait/Landscape).

#### מה בוצע?

**1. לוגיקת עימוד חכמה (Smart Layout Logic)**
*   **גמישות מלאה (Flexbox Fluidity)**: מעבר מגדלים קבועים (`w-48`) ושימוש ב-Percent-based Layout ו-`flex-grow` כדי שהאלמנטים ימלאו את כל השטח הפנוי.
*   **התאמה לאוריינטציה**:
    *   **Portrait**: התמונה מקבלת את מקסימום הגובה האפשרי, והמילה מתחתיה בגודל אופטימלי.
    *   **Landscape**: חלוקה אופקית (Side-by-side) שבה אזור השליטה (מילה + מקלדת) מקבל עדיפות (`flex-[1.5]`), והתמונה ממלאת את השארית.
*   **שמירה על פרופורציות (Aspect Ratio)**:
    *   שימוש ב-`aspect-[5/7]` לכרטיסי האותיות כדי למנוע עיוות.
    *   שימוש ב-`aspect-[5/7]` לכרטיסי האותיות כדי למנוע עיוות.
    *   **Container Queries**: שימוש ב-`cqw` לקביעת גודל פונט וכרטיס, מה שמאפשר לאלמנטים לגדול ללא "תקרה" מלאכותית (`clamp(..., ..., 150px)`) בהתאם לשטח המיכל.

**2. תיעוד וקריאות**
*   הוספת הערות בעברית (`{/* ... */}`) בתוך ה-Markup של Svelte להסבר על הבחירות העיצוביות ומחלקות ה-Tailwind המורכבות.

**3. אימות (Verification)**
*   בוצעה בדיקה מקיפה בדפדפן (Browser Subagent) במצבי קיצון:
    *   **Portrait (375x812)**: תצוגה אנכית ברורה. ![Portrait Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/portrait_mode_1765045508435.png)
    *   **Landscape (812x375)**: תצוגה אופקית מנוצלת היטב. ![Landscape Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/landscape_mode_1765045509150.png)
    *   **Maximized View**: בדיקת Container Queries - הכרטיסים גדלים משמעותית כשיש שטח. ![Maximized Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/maximized_view_1765046429758.png)
    *   **Dynamic Scaling Verification**:
        *   **Small (375x812)**: ![Small Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/small_375x812_1765046530082.png)
        *   **Medium (768x1024)**: ![Medium Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/medium_768x1024_1765046537725.png)
        *   **Large (1920x1080)**: ![Large Check](file:///D:/Users/User/.gemini/antigravity/brain/29b2f1ff-8926-4dc5-9ab0-4cf1a4f9467a/large_1920x1080_1765046544972.png)

---


## 2025-12-06 05:30
### תיקון אזהרות (Maintenance)

בוצע תיקון של אזהרות `svelte-check` לניקוי הקוד ושיפור הנגישות.

#### מה בוצע?
*   **SettingsControls**: תיקון תגיות `span` שהיו `self-closing` (מה שגרם לאזהרת HTML תקין).
*   **Admin Shelves**: החלפת השימוש ב-attribute `autofocus` (שגורם לאזהרת נגישות) ב-Action ייעודי `use:focus` שמבצע את הפוקוס בצורה תקינה.
*   **Verification**: הרצת `bun run check` עברה ללא שגיאות או אזהרות.

## 2025-12-06 05:20
### הושלמה גרסה v0.6 - מעבר ל-Cloudflare R2 וניהול נכסים חכם

שדרוג משמעותי לתשתית הנכסים (תמונות וסאונד) כדי לשפר ביצועים, להקל על ה-Repository, ולאפשר ניהול נוח יותר בעתיד.

#### מה בוצע?

**1. אחסון בענן (Cloud Infrastructure)**
*   **Cloudflare R2**: כל התמונות והסאונד הועברו לאחסון ב-bucket יעודי (`wordys-game-assets`).
*   **Custom Domain**: הנכסים מוגשים דרך דומיין מותאם (`static.wordys-game.tzlev.ovh`) לביצועים מיטביים.

**2. ניהול נכסים מקומי (Local Workflow)**
*   **תיקיית מקור**: נוצרה תיקייה `wordys-assets-source` (מחוץ לגיט) לניהול קבצי המקור (`cards`, `ui_sounds`, `audio`).
*   **סנכרון חכם (Smart Sync)**: פותח סקריפט (`npm run sync:assets`) המשתמש ב-MD5 Hashing כדי להעלות רק קבצים חדשים או ששונו, וחוסך זמן ורוחב פס.
*   **ניקיון**: הוסרו התיקיות `static/images` ו-`static/sounds` מהפרויקט כדי להקטין את גודל ה-Repo.

**3. קוד ואבסטרקציה**
*   **`assets.ts`**: נוצר שירות מרכזי לניהול כתובות נכסים (`getAssetUrl`), המאפשר גמישות (למשל, החלפת ספק אחסון בעתיד) ומונע שבירת קישורים.
*   **תיקון נתיבים**: כל הרכיבים (`ImageDisplay`, `words.ts`, `sound.ts`) עודכנו להשתמש בשירות החדש.

**4. שיפורי רספונסיביות (CSS & Layout)**
*   **גדלים מותאמים (Tuned Sizes)**: המעבר לשימוש ב-Classes מדוייקים (`w-20` במובייל) המבטיחים ש-4 כרטיסים ייכנסו בשורה אחת במסך סטנדרטי.
*   **לוגיקת Aspect Ratio**: פריסת המשחק מתאימה את עצמה אוטומטית לפי היחס בין הרוחב לגובה של המסך (ולא רק לפי סוג המכשיר).
    *   **מצב רגיל (Portrait)**: המקלדת סגורה? המסך גבוה? -> פריסה אנכית.
    *   **מצב דחוס (Landscape/Keyboard Open)**: היחס גדל -> פריסה אופקית.
    *   **גודל תמונה דינמי**: במצב אופקי, התמונה גדלה בהתאם לגודל המסך (`md:w-72`, `lg:w-96`) כדי לנצל את השטח הריק בדסקטופ, אך נשארת קטנה (`w-48`) במובייל כדי לא להסתיר את המקלדת.

---

## 2025-12-06 02:40
### הושלמה גרסה v0.5 - שיפורי ממשק, טיפוגרפיה ואייקונים

בוצע שדרוג משמעותי לממשק המשתמש, כולל מעבר לפונט Rubik, שיפור קריאות הכרטיסים והוספת אייקון ייעודי למקש רווח.

#### מה בוצע?

**1. טיפוגרפיה ועיצוב (Typography & Design)**
*   **פונט Rubik**: הוטמע הפונט `Rubik` (מ-Google Fonts) כפונט הראשי של האפליקציה למראה מודרני וקריא יותר בעברית.
*   **משקלי פונט**: הופחתו משקלי הפונט (מ-Black ל-Bold/Semibold) בכרטיסים ובכותרות לשיפור הקריאות.
*   **ריווח**: הוגדלו המרווחים בין האותיות והכרטיסים (`gap`) למניעת צפיפות.

**2. רכיב הצגת המילה (WordDisplay)**
*   **גלישת מילים חכמה**: הטמעת לוגיקה שמונעת שבירת מילים באמצע שורה (Wrap by word).
*   **גודל דינמי**: התאמת גודל האותיות באופן דינמי (קטן יותר למילים ארוכות מ-5 תווים) כדי להבטיח התאמה לרוחב המסך.
*   **שיפורים למובייל**: הגדלת כרטיסי האותיות במצב Portrait לנוחות מקסימלית.

**3. שיפורי UI נוספים (Additional UI Improvements)**
*   **צבעוניות**: הוגדרה פלטת צבעים ייחודית לכל קטגוריה (כתום לאוכל, סגול לאנשים וכו') לשיפור ההתמצאות והחוויה הוויזואלית.
*   **תצוגת תמונות**: כל התמונות המוקטנות (Thumbnails) מיושרות כעת לחלק העליון (`object-top`) כדי להציג את נושא התמונה בצורה ברורה יותר.
*   **אייקון מקש רווח**: עיצוב וקטורי (`space-key.svg`) למקש הרווח לשיפור הניגודיות.

**4. מקלדת וירטואלית (Virtual Keyboard)**
*   נוסף רכיב `VirtualKeyboard.svelte` המממש מקלדת עברית מלאה.

**5. תיקונים (Fixes)**
*   **קישור הגדרות**: הכפתור "חזרה למשחק" מההגדרות כעת מחזיר למסך ממנו הגעת.
*   **נקה בחירה**: תוקן באג שמנע ניקוי בחירה במסך בחירת הכרטיסים.
*   **פריסת לוח**: שיפור ניצול שטח המסך (`max-w-[95vw]`) במסכים רחבים.

**6. תשתית ותהליכי עבודה (Infrastructure & Workflow)**
*   **מסמך חוקים**: שופר ופורט מסמך החוקים של הפרויקט (כולל נהלי טרמינל וגיט).
*   **Workflow**: עודכן תהליך הקומיט (`/commit`) לאכיפת בדיקות תקינות ומניעת שרשור פקודות.
*   **README**: עודכן קישור למסמך החוקים.

---

## 2025-12-05 01:55
### הושלמה גרסה v0.4 - ממשק ניהול ופריסה לענן

המשחק כעת כולל ממשק ניהול מלא וזמין אונליין!

**Live URL**: [https://wordys-game.pages.dev](https://wordys-game.pages.dev) 🚀

#### מה בוצע?

**1. ממשק ניהול (Admin Interface)**
*   **כתובת**: `/admin` (מוגן ע"י `AdminGate` - מקצב הקשות).
*   **ניהול מילים**: הוספה (כולל העלאת תמונה), מחיקה ואיפוס.
*   **הגדרות**: שליטה מלאה על הגדרות המשחק מתוך הממשק.
*   **ארכיטקטורה**: חלוקה ל-Sub-routes (`/admin/words`, `/admin/settings`) עם Layout משותף.

**2. פריסה (Deployment)**
*   המשחק נפרס ל-**Cloudflare Pages**.
*   שימוש ב-`adapter-cloudflare` לביצועים מקסימליים.
*   תהליך CI/CD אוטומטי מול GitHub.

**3. תיקונים (Fixes)**
*   **תצוגת טאבלט**: תוקנה בעיית חיתוך הממשק במסכים קטנים/בינוניים ע"י הוספת גלילה (`overflow-y-auto`) והקטנת מרווחים.
*   **מצב מאוזן (Landscape)**: הוספת תמיכה בתצוגה רוחבית (תמונה לצד המילים) כדי למנוע גלילה ולנצל את המסך בצורה מיטבית.
    ![Landscape Layout Fix](file:///D:/Users/User/.gemini/antigravity/brain/a45cad25-fcba-4ad6-97d3-dc044545ba79/landscape_layout_fix_check_1764893821981.png)
*   **טעינת גרסה**: מעבר לטעינת `package.json` בצד השרת (`+layout.server.ts`) כדי למנוע שגיאות Vite.

---

## 2025-12-04 23:51
### הושלמה גרסה v0.2 - סאונד, הגדרות וליטוש

הוספנו שכבות של משוב, סאונד והתאמה אישית למשחק.

#### מה בוצע?

**1. סאונד ומשוב (Audio & Feedback)**
*   **הקראת מילים (TTS)**: שימוש ב-Web Speech API להקראת המילה בעברית.
*   **אפקטים קוליים**:
    *   צליל הצלחה (`success.mp3`) בעת השלמת מילה.
    *   צליל שגיאה (`error.wav`) בעת הקלדת אות שגויה.
*   **רצף הצלחה משופר**: סאונד הצלחה -> הקראת המילה -> "כל הכבוד!" -> השהיה -> מילה הבאה.

**2. מערכת הגדרות (Settings System)**
*   **כפתור הגדרות**: גישה מהירה להגדרות המשחק (אייקון גלגל שיניים).
*   **אפשרויות התאמה אישית**:
    *   **הצג מילה**: אפשרות להסתיר את המילה הכתובה לאתגר זיכרון.
    *   **הדגשת אות**: חיווי ויזואלי לאות הנוכחית.
    *   **חיווי שגיאה**: אפשרות לכיבוי הרעידה והצליל.
*   **שמירה**: ההגדרות נשמרות בדפדפן (LocalStorage).

**3. שיפורים ופוליש (Polish)**
*   **אנימציות**: הילה מהבהבת (Pulse) סביב האות הנוכחית (רק הצל, ללא שינוי גודל).
*   **חיווי שגיאה מדויק**: רעידה וצליל בכל הקשה שגויה (אך לא במחיקה/תיקון).
*   **WordDisplay**: עיצוב חדש עם תיבות לכל אות.

#### צעדים הבאים (Future)
*   ממשק ניהול להוספת מילים ותמונות (`/admin`).
*   הפיכה ל-PWA (אפליקציה לאופליין).

---

## 2025-12-04 20:45
### הושלמה גרסה ראשונית (v0.1)

השלמנו את הגרסה הראשונית של המשחק **Wordy's**! 🎉
המשחק מותאם לתלמידי חינוך מיוחד, עם עיצוב נקי, ברור ומחזק.

#### מה בוצע?

**1. תשתית ועיצוב**
*   הוקם פרויקט **SvelteKit** עם **Tailwind CSS**.
*   עיצוב **Distraction-free**: נקי, עם פוקוס על המשימה.
*   שימוש ב-**Svelte 5 Runes** לניהול מצב יעיל.

**2. רכיבי המשחק**
*   **ImageDisplay**: מציג את תמונת האובייקט עם מסגרת ואפקט עדין.
*   **WordDisplay**: מציג את המילה באותיות גדולות וברורות.
*   **TypingInput**:
    *   תיבת קלט גדולה ומרכזית.
    *   **בדיקה מיידית**: חיווי שגיאה (רעידה וצבע אדום) ברגע שיש טעות באות.
    *   מונע התקדמות אם יש שגיאה (המשתמש רואה את הטעות וצריך לתקן).
    *   **שיפורים**: פוקוס אוטומטי ושגיאה מתמשכת עד לתיקון.
*   **Feedback**: חיווי הצלחה בולט ("כל הכבוד!") עם אנימציה בסיום מילה.
*   **GameContainer**: מנהל את רצף המילים והמעבר ביניהן.

**3. תוכן (Mock Data)**
*   מאגר מילים ראשוני (כלב, חתול, בית, כדור, פרח) עם תמונות (Placeholders).
