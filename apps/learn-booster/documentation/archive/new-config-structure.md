# מבנה חדש להגדרות המערכת

מסמך זה מתאר את המבנה החדש עבור אובייקט התצורה (Config) של המערכת, כחלק מהרפקטורינג של מנגנון ההגדרות.

## מבנה ה-Config החדש

```typescript
export type Config = {
  // הגדרות כלליות
  rewardType: 'video' | 'app'; // במקום mode
  rewardDisplayDurationMs: number; // במקום videoDisplayTimeInMS
  turnsPerReward: number; // במקום turnsPerVideo
  
  // הגדרות הודעות ותזכורות
  notifications: {
    // הודעה לפני סיום זמן התגמול
    endingNotification: {
      // טקסט ההודעה שתוצג לפני סיום זמן התגמול
      text: string;
      // כמה זמן (במילישניות) לפני סיום להציג את ההודעה
      displayBeforeEndMs: number;
      // מתי להציג את ההודעה
      enabledFor: 'video' | 'app' | 'both' | 'none';
    };
  };
  
  // הגדרות וידאו - רלוונטיות רק כאשר rewardType === 'video'
  video: {
    // רשימת סרטונים, כל אחד עם ה-URL וה-MIME Type שלו
    videos: Array<{
      url: string;
      mimeType: string;
    }>;
    source: 'local' | 'google-drive' | 'youtube'; // במקום videoSource
    googleDriveFolderUrl?: string; // נשאר אותו שם אבל עבר לתת-אובייקט
    hideProgressBar?: boolean; // במקום hideVideoProgress
  };
  
  // הגדרות אפליקציה - רלוונטיות רק כאשר rewardType === 'app'
  app: {
    packageName?: string; // במקום appName
  };
  
  // הגדרות מערכת - לא מיועדות לשינוי ע"י המשתמש
  system: { // במקום systemConfig
    enableHideModalButton: boolean;
    disableGameCodeInjection: boolean;
  };
}
```

## עקרונות המבנה החדש

1. **הפרדה לתתי-אובייקטים לוגיים** - הגדרות מקובצות לפי התחום שלהן:
   - הגדרות כלליות (ברמה העליונה)
   - הגדרות הודעות והתראות
   - הגדרות ספציפיות לוידאו
   - הגדרות ספציפיות לאפליקציה
   - הגדרות מערכת

2. **שמות ברורים יותר** - המונח "reward" משמש כטרמינולוגיה עקבית עבור התגמול שניתן לאחר השלמת משימות (סרטון או אפליקציה).

3. **מבנה מודולרי** - קל יותר להרחיב כל אחד מהתחומים בעתיד.

## השוואת שמות: ישן מול חדש

| שם ישן | שם חדש | הערות |
|--------|--------|-------|
| `mode` | `rewardType` | משקף טוב יותר את המהות - סוג התגמול |
| `videoDisplayTimeInMS` | `rewardDisplayDurationMs` | שם כללי יותר, מתאים לכל סוגי התגמולים |
| `turnsPerVideo` | `turnsPerReward` | שם כללי יותר, מתאים לכל סוגי התגמולים |
| `videoUrls` | `video.videos[].url` | כל URL עכשיו הוא חלק מאובייקט שכולל גם את ה-MIME Type |
| `type` | `video.videos[].mimeType` | עבר לכל סרטון בנפרד עם שם ספציפי יותר |
| `videoSource` | `video.source` | הועבר לתת-אובייקט הוידאו |
| `googleDriveFolderUrl` | `video.googleDriveFolderUrl` | הועבר לתת-אובייקט הוידאו |
| `hideVideoProgress` | `video.hideProgressBar` | שם יותר מדויק ומובן |
| `appName` | `app.packageName` | שם יותר ספציפי ומדויק טכנית |
| `systemConfig` | `system` | שם קצר יותר |

## הגדרות חדשות

המבנה החדש מוסיף את ההגדרות הבאות שלא היו קיימות במבנה הישן:

| שם חדש | תיאור |
|--------|-------|
| `notifications.endingNotification.text` | טקסט ההודעה שתוצג לפני סיום זמן התגמול |
| `notifications.endingNotification.displayBeforeEndMs` | זמן לפני סיום (במילישניות) להצגת ההודעה |
| `notifications.endingNotification.enabledFor` | באיזה מצבים להציג את ההודעה |

## שינויים במבנה הנתונים

- **סרטונים כאובייקטים** - במקום מערך פשוט של מחרוזות URL, כל סרטון הוא כעת אובייקט עם ה-URL וה-MIME Type שלו, מה שמאפשר גמישות רבה יותר והתאמה ספציפית לכל סרטון.

## טיפוסים נוספים

בנוסף לטיפוס `Config` הראשי, הוספנו טיפוסים נוספים לשימוש במערכת:

```typescript
/**
 * פריט וידאו בודד
 */
export interface VideoItem {
  url: string;
  mimeType: string;
}

/**
 * רשימת פריטי וידאו
 */
export type VideoList = VideoItem[];
```

טיפוסים אלו מאפשרים:
1. **קוד קריא יותר** - במקום לכתוב `Array<{ url: string; mimeType: string }>` בכל מקום, ניתן להשתמש ב-`VideoList`
2. **עקביות** - הגדרה אחידה של מבנה פריט וידאו בכל המערכת
3. **תחזוקה קלה יותר** - שינוי במבנה הנתונים נעשה במקום אחד בלבד

## מודול טעינת סרטונים

כחלק מהרפקטורינג, הפרדנו את הלוגיקה של טעינת הסרטונים ממודול ניהול ההגדרות. הלוגיקה הועברה לקובץ נפרד `src/lib/video-loader.ts` שמכיל פונקציות ייעודיות:

```typescript
// טעינת רשימת סרטונים בהתאם להגדרות
export async function loadVideoUrls(
    config: Config,
    selfUrl: string,
    devMode: boolean
): Promise<VideoList>;

// קבלת סרטון אקראי מהרשימה
export function getRandomVideo(
    videos: VideoList
): VideoItem | undefined;
```

## שלבי המעבר שבוצעו

המעבר מהמבנה הישן לחדש בוצע בשלבים הבאים:

1. **יצירת טיפוס Config חדש** והגדרתו ב-`src/types.ts`
2. **הוספת טיפוסים VideoItem ו-VideoList** לשימוש עקבי במבנה נתוני הסרטונים
3. **פיתוח פונקציות המרה** מהמבנה הישן לחדש ובחזרה, לתמיכה בקוד קיים
4. **הפרדת לוגיקת טעינת הסרטונים** למודול נפרד `video-loader.ts`
5. **עדכון מודול ניהול התצורה** לעבודה עם המבנה החדש
6. **שיפור הטיפול ב-mimeType** - זיהוי דינמי של סוג הקובץ לפי הסיומת

## שימוש במערכת ההגדרות החדשה

### קבלת ההגדרות

```typescript
import { appConfig, getAllConfig } from './lib/config-manager';

// גישה ישירה לאובייקט ההגדרות הגלובלי
const currentConfig = appConfig;

// קבלת עותק לקריאה בלבד של ההגדרות (מומלץ)
const configCopy = getAllConfig();
```

### טעינת ההגדרות

```typescript
import { initializeConfig } from './lib/config-manager';

// אתחול מערכת ההגדרות
async function setup() {
  const config = await initializeConfig(
    window.config,  // הגדרות חיצוניות (אופציונלי)
    import.meta.url, // ה-URL של הסקריפט הנוכחי
    import.meta.env.DEV // האם במצב פיתוח
  );
  
  console.log('ההגדרות נטענו:', config);
}
```

### עדכון ההגדרות

```typescript
import { updateConfig, saveConfigToStorage } from './lib/config-manager';

// עדכון הגדרה בודדת
updateConfig({
  rewardDisplayDurationMs: 30000 // 30 שניות
});

// עדכון מספר הגדרות
updateConfig({
  rewardType: 'video',
  turnsPerReward: 2,
  video: {
    source: 'google-drive',
    hideProgressBar: true
  }
});

// שמירת ההגדרות ל-localStorage
saveConfigToStorage();
```

### האזנה לשינויים בהגדרות

```typescript
import { addConfigListener } from './lib/config-manager';

// הוספת מאזין לשינויים בהגדרות
const unsubscribe = addConfigListener((config) => {
  console.log('ההגדרות התעדכנו:', config);
  // כאן אפשר להגיב לשינויים בהגדרות
});

// הסרת המאזין כשלא צריך יותר
unsubscribe();
```

### טעינת סרטונים

```typescript
import { loadVideoUrls } from './lib/video-loader';
import { appConfig, updateConfig } from './lib/config-manager';

// טעינת סרטונים
async function loadVideos() {
  const videos = await loadVideoUrls(
    appConfig,
    import.meta.url,
    import.meta.env.DEV
  );
  
  // עדכון רשימת הסרטונים בהגדרות
  updateConfig({
    video: {
      ...appConfig.video,
      videos
    }
  });
  
  console.log(`נטענו ${videos.length} סרטונים`);
}
```

## שיקולים נוספים

- **תאימות לאחור** - הקוד הקיים ממשיך לעבוד במהלך תקופת המעבר באמצעות פונקציות המרה
- **מבנה ברירת מחדל** - הוגדרו ערכי ברירת מחדל עבור כל השדות במבנה החדש
- **תיעוד** - התיעוד עודכן בהתאם לשינויים
- **הפרדת אחריות** - הפרדה ברורה בין ניהול ההגדרות לבין טעינת הסרטונים