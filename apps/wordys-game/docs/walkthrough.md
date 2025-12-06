# יומן פיתוח - Wordy's

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

**3. אייקון מקש רווח (Space Key)**
*   **עיצוב ייעודי**: יצירת אייקון SVG וקטורי (`space-key.svg`) המדמה מקש רווח במקלדת אמיתית.
*   **High Contrast**: עיצוב בקווים שחורים ברורים (Bold Black) על רקע בהיר.
*   **אינטגרציה**: שילוב האייקון בתוך `WordDisplay` כתמונה חיצונית לשיפור התחזוקה והביצועים.

**4. מקלדת וירטואלית (Virtual Keyboard)**
*   נוסף רכיב `VirtualKeyboard.svelte` המממש מקלדת עברית מלאה (טיוטה ראשונית).

**5. תיקונים כלליים**
*   **קישור הגדרות**: תוקן הקישור בכפתור ההגדרות שיוביל ל-`/admin/shelves`.
*   **פריסת לוח**: שיפור ניצול שטח המסך (`max-w-[95vw]`) במסכים רחבים.

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
