# תיעוד ה-API

## נקודות קצה

### GET /videos/folder/:folderId
מחזיר רשימת סרטונים מתיקייה בגוגל דרייב.

#### פרמטרים
- `folderId` (string, חובה) - מזהה התיקייה בגוגל דרייב

#### תגובה
```json
{
  "files": [
    {
      "id": "string",
      "name": "string",
      "mimeType": "string",
      "size": "number",
      "createdTime": "string",
      "modifiedTime": "string"
    }
  ]
}
```

### GET /video/:fileId
מזרים סרטון מגוגל דרייב.

#### פרמטרים בנתיב
- `fileId` (string, חובה) - מזהה הקובץ בגוגל דרייב

#### תגובות

##### הצלחה (200 OK)
- Content-Type: video/mp4 (או סוג MIME מתאים אחר)
- Content-Length: [גודל הקובץ המלא]

##### שגיאות
- 400 Bad Request - הקובץ אינו סרטון
- 403 Forbidden - אין הרשאות גישה לקובץ
- 404 Not Found - הקובץ לא נמצא
- 500 Internal Server Error - שגיאה כללית

## דוגמאות לשימוש

### הזרמת סרטון
```bash
curl http://localhost:3000/video/FILE_ID
```

### קבלת רשימת סרטונים מתיקייה
```bash
curl http://localhost:3000/videos/folder/FOLDER_ID
```

## הערות מימוש
- הסרטונים מוזרמים באיכות המקורית שלהם מגוגל דרייב
- המערכת משתמשת במטמון עבור טוקנים של גוגל דרייב
