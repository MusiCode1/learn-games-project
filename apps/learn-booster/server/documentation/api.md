# תיעוד ה-API

## נקודות קצה

### GET /video/:fileId/info
מחזיר מידע על סרטון מגוגל דרייב.

#### פרמטרים
- `fileId` (string, חובה) - מזהה הקובץ בגוגל דרייב

#### תגובה
```json
{
  "id": "string",
  "name": "string",
  "mimeType": "string",
  "size": "number",
  "duration": "number",
  "createdTime": "string",
  "modifiedTime": "string"
}
```

### GET /video/:fileId
מזרים סרטון מגוגל דרייב עם תמיכה בהזרמה חלקית (HTTP 206).

#### פרמטרים בנתיב
- `fileId` (string, חובה) - מזהה הקובץ בגוגל דרייב

#### פרמטרים ב-Query
- `timestamp` (number, אופציונלי) - נקודת זמן בשניות להתחלת ההזרמה

#### Headers
הנקודה תומכת ב-Range header לבקשת חלקים ספציפיים מהסרטון:
```
Range: bytes=start-end
```

לדוגמה:
- `Range: bytes=0-1048575` - לבקש את המגה-בייט הראשון
- `Range: bytes=1048576-2097151` - לבקש את המגה-בייט השני
- `Range: bytes=10485760-` - לבקש את כל התוכן החל מ-10MB

#### תגובות

##### הצלחה (200 OK)
כאשר מבקשים את כל הסרטון:
- Content-Type: video/mp4 (או סוג MIME מתאים אחר)
- Content-Length: [גודל הקובץ המלא]
- Accept-Ranges: bytes
- Cache-Control: public, max-age=31536000

##### תוכן חלקי (206 Partial Content)
כאשר מבקשים חלק מהסרטון:
- Content-Type: video/mp4 (או סוג MIME מתאים אחר)
- Content-Range: bytes start-end/total
- Content-Length: [גודל החלק המבוקש]
- Accept-Ranges: bytes
- Cache-Control: public, max-age=31536000

##### שגיאות
- 400 Bad Request - הקובץ אינו סרטון
- 403 Forbidden - אין הרשאות גישה לקובץ
- 404 Not Found - הקובץ לא נמצא
- 416 Range Not Satisfiable - טווח הבתים המבוקש אינו תקין
- 500 Internal Server Error - שגיאה כללית

## דוגמאות לשימוש

### קבלת מידע על סרטון
```bash
curl http://localhost:3000/video/FILE_ID/info
```

### הזרמת סרטון מלא
```bash
curl http://localhost:3000/video/FILE_ID
```

### הזרמת חלק מסרטון
```bash
curl http://localhost:3000/video/FILE_ID -H "Range: bytes=0-1048575"
```

### קפיצה לנקודת זמן ספציפית
```bash
curl http://localhost:3000/video/FILE_ID?timestamp=120
```

## הערות מימוש
- המערכת תומכת בהזרמה חלקית באמצעות HTTP 206 Partial Content
- ניתן לשלב timestamp עם Range header לקבלת חלק ספציפי מנקודת זמן מסוימת
- המערכת משתמשת במטמון עבור מידע על סרטונים (נקודת הקצה info)
- הסרטונים מוזרמים באיכות המקורית שלהם מגוגל דרייב
