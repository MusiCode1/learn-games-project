# הגדרת הפרויקט

## דרישות מקדימות
- Node.js v18 ומעלה
- npm v9 ומעלה
- חשבון Google Cloud Platform
- גישה לגוגל דרייב עם הסרטונים

## שלבי התקנה

### 1. התקנת הפרויקט
```bash
# שיבוט הפרויקט
git clone [repository-url]
cd server

# התקנת תלויות
npm install

# יצירת קובץ משתני סביבה
cp .env.example .env
```

### 2. הגדרת Google Cloud Platform

1. **יצירת פרויקט ב-Google Cloud Console**
   - היכנס ל [Google Cloud Console](https://console.cloud.google.com)
   - צור פרויקט חדש
   - העתק את מזהה הפרויקט

2. **הפעלת Google Drive API**
   - פתח את [API Library](https://console.cloud.google.com/apis/library)
   - חפש "Google Drive API"
   - לחץ על "Enable"

3. **יצירת Service Account**
   - פתח [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - לחץ על "Create Service Account"
   - מלא את הפרטים הנדרשים
   - הענק הרשאת "Viewer" ל-Service Account
   - צור מפתח חדש מסוג JSON
   - שמור את קובץ המפתח

4. **הגדרת הרשאות בגוגל דרייב**
   - פתח את תיקיית הסרטונים בגוגל דרייב
   - שתף את התיקייה עם כתובת המייל של ה-Service Account
   - הענק הרשאות צפייה

### 3. הגדרת משתני סביבה
פתח את קובץ `.env` והגדר את המשתנים הבאים:

```env
# הגדרות שרת
PORT=3000
HOST=localhost
NODE_ENV=development

# הגדרות Google Drive
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
GOOGLE_PROJECT_ID=your-project-id

# הגדרות קאש
CACHE_TTL=10800        # זמן חיים במטמון (3 שעות)
CACHE_MAX_SIZE=1000    # מספר מקסימלי של פריטים במטמון
```

### 4. הרצת הפרויקט

#### סביבת פיתוח
```bash
# הרצה עם טעינה מחדש אוטומטית
npm run dev
```

#### סביבת ייצור
```bash
# בנייה
npm run build

# הרצה
npm start
```

## בדיקת ההתקנה

1. **בדיקת חיבור לשרת**
```bash
curl http://localhost:3000/health
```

2. **בדיקת גישה לסרטון**
```bash
curl http://localhost:3000/video/[file-id]
```

## פתרון בעיות נפוצות

### בעיית הרשאות Google Drive
- ודא שה-Service Account יש גישה לתיקייה
- בדוק שקובץ ההרשאות נמצא בנתיב הנכון
- ודא שה-API מופעל בפרויקט

### בעיות קאש
- בדוק הגדרות זיכרון של Node.js
- נקה את המטמון באמצעות API: `DELETE /cache`

### בעיות ביצועים
- הגדל את ערך `UV_THREADPOOL_SIZE`
- הקטן את גודל המטמון
- בדוק את הגדרות הסטרימינג

## תחזוקה

### גיבוי
- גבה את קובץ ההרשאות
- שמור את הגדרות הסביבה

### עדכונים
- בדוק עדכוני חבילות: `npm outdated`
- עדכן חבילות: `npm update`
- בדוק שינויים ב-Google Drive API
