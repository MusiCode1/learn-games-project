# שרת פרוקסי לסרטוני גוגל דרייב

שרת Node.js המאפשר צפייה ישירה בסרטונים מגוגל דרייב עם תמיכה במטמון ואופטימיזציה של ביצועים.

## תכונות עיקריות

- 🎥 סטרימינג ישיר של סרטונים מגוגל דרייב
- 💾 מטמון חכם לשיפור ביצועים
- 🔄 תמיכה בהזרמה חלקית ונקודות זמן
- 📊 ניטור וסטטיסטיקות
- 🔒 אבטחה ובקרת גישה

## התקנה מהירה

```bash
# התקנת תלויות
npm install

# הגדרת משתני סביבה
cp .env.example .env

# הרצת השרת
npm run dev
```

## תיעוד מפורט

- [ארכיטקטורה](documentation/architecture.md)
- [הגדרה והתקנה](documentation/setup.md)
- [תיעוד ה-API](documentation/api.md)
- [הנחיות פיתוח](documentation/development.md)

## דרישות מערכת

- Node.js v18 ומעלה
- חשבון Google Cloud Platform
- גישה לגוגל דרייב

## דוגמה לשימוש

```typescript
// קבלת סרטון
GET http://localhost:3000/video/abc123

// קבלת מידע על סרטון
GET http://localhost:3000/video/abc123/info

// צפייה בסרטון מנקודת זמן מסוימת
GET http://localhost:3000/video/abc123?timestamp=120
```

## תרומה לפרויקט

1. בצע fork לפרויקט
2. צור branch חדש: `git checkout -b feature/amazing-feature`
3. בצע commit לשינויים: `git commit -m 'הוספת תכונה חדשה'`
4. דחוף ל-branch: `git push origin feature/amazing-feature`
5. פתח Pull Request

## רישיון

MIT License - ראה [LICENSE](LICENSE) לפרטים נוספים.

## קרדיטים

- [Fastify](https://www.fastify.io/)
- [Google Drive API](https://developers.google.com/drive)
- [TypeScript](https://www.typescriptlang.org/)
