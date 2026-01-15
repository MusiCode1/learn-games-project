# מפרט עיצוב - Wordy's Game

## 📱 גדלי מסך ומכשירי יעד

הפרויקט מתוכנן לתמוך במגוון מכשירים, עם דגש על טאבלטים ומחשבים שולחניים.

### 🎯 מכשירים עיקריים (Tier 1)

אלו המכשירים עליהם חווית המשתמש חייבת להיות אופטימלית וללא פשרות.

1.  **CUBOT Tab KingKong**

    - **Effective Viewport:** 1097px x 685px (זהו הגודל שהדפדפן מדווח ומציג בפועל).
    - **רזולוציה פיזית:** 1600px x 1000px.
    - **יחס תצוגה:** 16:10 (רחב).
    - **שימוש אופייני:** מצב לרוחב (Landscape).

2.  **iPad Air (דורות ישנים - 1 & 2)**

    - **Effective Viewport:** 1024px x 768px (זהו הגודל הקובע ל-CSS).
    - **רזולוציה פיזית:** 2048px x 1536px (Retina, DPR 2).
    - **יחס תצוגה:** 4:3 (מרובע יותר).

3.  **Desktop (מחשב שולחני)**
    - תמיכה ברזולוציות Full HD (1920x1080) ומעלה.
    - תמיכה ברזולוציות Laptop סטנדרטיות (1366x768).

### 📱 מכשירים משניים (Tier 2)

תמיכה במכשירים אלו חשובה, אך ייתכנו התאמות עיצוביות לטובת שימושיות במסך קטן.

1.  **טלפון נייד (Mobile Phone)**
    - **דרישה:** תאימות פונקציונלית מלאה.
    - **אוריינטציה:** חובה לתמוך גם ב-Portrait (לאורך) וגם ב-Landscape (לרוחב).
    - **אתגרים:** התאמת לוח המשחק וכפתורי השליטה למסך צר.

## 📏 החלטות טכניות למימוש

- **Responsive Design:** שימוש ב-Flexbox ו-Grid להתאמה גמישה.
- **Container Queries:** העדפה לשימוש ב-Container Queries על פני Media Queries ברמת הרכיבים (במיוחד ללוח המשחק והקלפים), כדי לאפשר התאמה אופטימלית לכל שטח נתון.
- **Safe Areas:** התחשבות ב-"Safe Areas" במכשירים ניידים (למשל, אזור המגרעת ב-iPhone או סרגל הניווט באנדרואיד).
