# מערכת פרופילים – תכנון מפורט

## תקציר
מטרה: לאפשר למורים ליצור, לשמור ולהחליף בין סטים של הגדרות (פרופילים) עבור תלמידים שונים, עם ניהול מלא מצד אחד ואפשרות להסתיר את הפרופילים למי שאינו משתמש בהם מצד שני. הפתרון כולל מודול לוגי חדש, התאמות ל־Settings UI, ניתוב מחדש של אחסון הגדרות לפורמט חדש בלבד ובדיקות משלימות.

---

## יעדים עיקריים
- יצירת/ProfileManager ייעודי שמחזיק רשימת פרופילים, פרופיל פעיל והגדרות ה־UI (כולל דגל הסתרה).
- מעבר מלא לפורמט שמירת פרופילים חדש ללא תלות ב־`gingim-booster-config` הישן.
- סנכרון מלא בין config-manager לפרופיל הפעיל, כולל טיפול בהבדלים (dirty state).
- אפשרות להסתרת UI של הפרופילים בכל רגע, בלי לאבד נתונים קיימים.
- חוויית משתמש ברורה: יצירה, בחירה, עריכה, מחיקה וייצוא/ייבוא של פרופילים.
- כיסוי בדיקות (יחידה, אינטגרציה ו־E2E) למסלולי משתמש ותרחישי קצה.

---

## דרישות מוצר
1. **פרופילים כמכלול הגדרות**: כל פרופיל שומר snapshot מלא של `Config` + מטה־דאטה (שם, צבע, תיוג, חותמת זמן).
2. **הסתרת רשימת הפרופילים**: משתמש יכול לכבות את הניהול דרך Toggle ב־Settings; במצב מוסתר לא מופיעים כפתורים/רשימות אבל הנתונים נשמרים.
3. **ללא תאימות אחורה**: האפליקציה לא כותבת או קוראת מהkey הישן. (מותר script חד־פעמי למיגרציה, אך לא חלק מריצה רגילה.)
4. **Active Profile**: אחת התצורות תמיד מוגדרת כפעילה; שינוי הגדרות מעדכן את הפרופיל או מוצע לשמירה מחדש.
5. **ייבוא/ייצוא**: שמירת קובץ JSON עם מבנה `schemaVersion`, `profiles[]`, `activeProfileId`, `uiEnabled`.
6. **שמירה על חוויית fully kiosk**: מעברים מהירים, תיעוד שגיאות ב־console והודעות toast בממשק.

---

## ארכיטקטורה ולוגיקה
### מודל נתונים
```ts
type Profile = {
  id: string;              // UUID
  name: string;
  color?: string;          // אופציונלי לתיוג חזותי
  tags?: string[];
  config: Config;          // snapshot מלא
  meta: {
    createdAt: number;
    updatedAt: number;
  };
};

type ProfilesState = {
  schemaVersion: 1;
  profiles: Record<string, Profile>;
  order: string[];         // לשימור סדר תצוגה
  activeProfileId: string;
  uiEnabled: boolean;      // האם להציג UI למשתמש
  dirtyConfig: Config | null; // נשמר כאשר יש שינוי שלא סונכרן לפרופיל פעיל
};
```

### ProfileManager (מודול חדש ב־`src/lib/profile-manager.ts`)
- **אחריות**:
  - טעינה/שמירה ל־`localStorage` (key חדש, למשל `gingim-booster-profiles:v1`).
  - CRUD לפרופילים (create/update/delete/reorder).
  - ניהול דגל `uiEnabled` (כולל עדכון listeners).
  - החלת פרופיל על config-manager (`applyProfile`).
  - איתור מצב "מלוכלך" כשמשתמש משנה הגדרות אחרי טעינת פרופיל.
  - חשיפת events/Stores לשכבת ה־UI (`profilesStore`, `activeProfile`, `profilesUiEnabledStore`).
- **Public API מוצע**:
  - `initializeProfiles(initialConfig: Config): Promise<void>` – נטען בעת עליית האפליקציה, ואם אין פרופילים ניצור ברירת מחדל מה־Config שסופק.
  - `getProfilesState(): ProfilesState`
  - `setProfilesUiEnabled(enabled: boolean)`
  - `createProfile(payload: { name: string; color?: string; config?: Config })`
  - `updateProfile(id: string, updates: Partial<Profile>)`
  - `deleteProfile(id: string)` – מונע מחיקת פרופיל פעיל עד שיוחלף.
  - `applyProfile(id: string)` – קורא ל־`updateConfig` עם snapshot מתאים ומעדכן `activeProfileId`.
  - `markDirty(config: Config)` – נקרא מה־Settings כשמשתמש שינה משהו; מאפשר הצגת הודעה/CTA לשמירה.
  - `exportProfiles()` / `importProfiles(json: string)`.

### אינטגרציה עם config-manager
1. `initializeConfig` יקבל hook ל־ProfileManager:
   - אם נמצאו פרופילים → נטען את הפרופיל הפעיל ל־appConfig.
   - אחרת → נשמור את ה־Config שנוצר כפרופיל ראשון (`Default Profile`).
2. `updateConfig` לאחר שמירה צריך לבדוק:
   - האם שינוי מגיע מטופס Settings עם פרופיל פעיל → לעדכן את הפרופיל (אם המשתמש לחץ "שמור בפרופיל") או לסמן כ־dirty.
   - אם השינוי מגיע מפעולת `applyProfile` → לא לסמן כ־dirty.
3. אירועי listeners קיימים יורחבו כך ש־ProfileManager יוכל לדעת על שינויים ולבצע התאמות.

### אחסון ומיגרציה
- key ישן (`gingim-booster-config`) לא נטען ולא נכתב יותר. קיימת אפשרות לסקריפט CLI/פקודת dev שתמיר נתונים עבור משתמשים קיימים, אך אינה חלק מהריצה הרגילה.
- כל הנתונים החדשים נשמרים ב־`gingim-booster-profiles:v1`. מבנה הנתונים כולל `schemaVersion` כדי לאפשר שדרוגים עתידיים.
- אחרי מיגרציה (אם נבחר להריץ) מומלץ למחוק את הkey הישן כדי לחסוך מקום ולמנוע בלבול.

---

## ממשק משתמש
1. **Toggle הצגת פרופילים**  
   - ממוקם בראש כרטיס ההגדרות (למשל ליד כותרת "פרופילים").  
   - טקסט מוצע: “הפעל ניהול פרופילים”. כשהדגל כבוי – כל הסקשן מתכווץ ולא מוצגים כפתורים/רשימות.
2. **רכיבי ניהול** (מוצגים רק כאשר `uiEnabled === true`):  
   - Select / Dropdown לפרופיל פעיל + אינדיקציה אם הוא Sync או Dirty.  
   - כפתורים: “החל פרופיל”, “שמור לפרופיל”, “שמור כחדש”, “ערוך”, “ייבוא/ייצוא”.  
   - Modal/RHS panel לניהול מפורט (רשימה עם חיפוש, צבעים, מחיקה, שינוי סדר).  
3. **Workflow טיפוסיים**:
   - יצירת פרופיל חדש מתוך ההגדרות הנוכחיות.  
   - מעבר לפרופיל אחר עם אישור במקרה של שינוי לא שמור.  
   - מחיקה רק לאחר החלפה לפרופיל אחר, עם אזהרה.  
   - ייבוא קובץ JSON (Drag & Drop או בחירה בקובץ). אם מזהים קונפליקט בשם/צבע – ניתן לבחור merge או override.  
4. **Feedback**: Toast קצר לכל פעולה (הופעל/כובה, נשמר, יובא). במצב Fully Kiosk נטו להשתמש ב־setTimeout קצר כדי למנוע חסימות.

---

## תרחישי שימוש מרכזיים
1. **מורה חדש** – נכנס לראשונה, toggle כברירת־מחדל יכול להיות כבוי; בלחיצה הוא יוצר פרופיל ברירת מחדל ומתחיל לעבוד.  
2. **מורה שמשרת כמה תלמידים** – מפעיל ניהול פרופילים, יוצר פרופיל לכל תלמיד, ובכל שיעור מחליף בלחיצה אחת.  
3. **משתמש שמעדיף ממשק פשוט** – משאיר את toggle כבוי; החוויה שווה לגמרי לגרסה ללא פרופילים.  
4. **העברת פרופילים בין מכשירים** – מבצע export/import (בלבד פורמט חדש).  
5. **Fully Kiosk remote command** (פיצ’ר עתידי): אפשרות לשלוח `profileId` דרך API כדי לטעון מרחוק – תיעוד נקודת חיבור.

---

## בדיקות ואיכות
- **Unit**:  
  - ProfileManager CRUD, פעולות על order, טיפול ב־dirty state, toggle UI.  
  - Serialization/Deserialization ל־schemaVersion 1.  
  - Import/Export כולל ולידציה בסיסית.  
- **Integration**:  
  - `initializeConfig` + `initializeProfiles` – טעינה עם/בלי פרופילים קיימים.  
  - עדכון config דרך Settings מסמן dirty כשהפרופיל פעיל.  
  - הסתרה/הצגה של UI לא מוחקת נתונים.  
- **E2E (Playwright)**:  
  - יצירת פרופיל חדש, מעבר, מחיקה עם אזהרה.  
  - הפעלת toggle, וידוא שהUI מוסתר/מוצג.  
  - ייבוא קובץ JSON → וידוא שהפרופילים נטענו ונבחרה ברירת־מחדל.  

---

## תוכנית ביצוע (Workplan)
1. **הקמת תשתית**  
   - [ ] יצירת `profile-manager.ts` עם מודלים, אחסון והחלת פרופיל.  
   - [ ] הוספת Stores/Events לשיתוף בין UI ללוגיקה.  
2. **שילוב עם config-manager**  
   - [ ] הרחבת `initializeConfig`/`updateConfig` לעבודה עם פרופילים פעילים.  
   - [ ] סימון dirty state בעת עריכת הגדרות.  
3. **UI – Settings**  
   - [ ] הוספת Toggle “הפעל ניהול פרופילים”.  
   - [ ] בניית קומפוננטות לניהול (dropdown, מודלים, CTA).  
   - [ ] חיווי Dirty, פעולות שמירה, מחיקה.  
4. **ייבוא/ייצוא**  
   - [ ] API לייצוא קובץ JSON.  
   - [ ] דיאלוג לייבוא + ולידציה.  
5. **ניקוי תאימות ישנה**  
   - [ ] הסרת שימוש ב־`gingim-booster-config`.  
   - [ ] (אופציונלי) סקריפט חד־פעמי למיגרציה ידנית.  
6. **בדיקות**  
   - [ ] יחידה (ProfileManager, deep merge, import/export).  
   - [ ] Integration (טסטים סביב Settings + config-manager).  
   - [ ] Playwright flows.  
7. **דוקומנטציה והדרכה**  
   - [ ] עדכון README/Settings help על קיומו של toggle וייצוא/ייבוא.  
   - [ ] וידאוון קצר/תמונות למורים במידת הצורך.

---

## הערות ביצוע
- יש להשאיר פוקוס על ביצועים (שמירה בלוקאל־סטורג’ מהירה, המרה ל־JSON קצר).  
- להקפיד על טיפול בשגיאות (try/catch סביב localStorage) כדי שמכשירים עם הגבלות לא ייתקעו.  
- בעתיד אפשר לשקול סנכרון מול backend – לכן כדאי לשמור הפרדה ברורה בין ProfileManager לבין UI.

