You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

# Project Rules for Wordy's Game

## 🗣️ שפה ותקשורת

- **עברית בלבד**: כל התקשורת, מסמכי התכנון, והודעות הקומיט חייבים להיות בשפה העברית. אין לכתוב מסמך, הודעת קומיט, או כל תוכן שפונה למשתמש באנגלית.
- **RTL**: הממשק חייב לתמוך בכיווניות מימין לשמאל (RTL) באופן מלא.

## 💻 טרמינל ופקודות (Terminal)

- **בדיקת ביצוע**: חובה להמתין לסיום הפקודה ולקרוא את הפלט שלה לפני שיגור הפקודה הבאה. אין לשלוח רצף פקודות "על עיוור".
- **שרשור פקודות**: שימוש ב-`&&` מותר (כיוון שהוא מבטיח עצירה בעת שגיאה). חל איסור מוחלט להשתמש ב-`;` או להריץ פקודות במקביל.
- **טיפול בשגיאות**: אם פקודה נכשלה, אין להמשיך לפקודה הבאה. יש לתקן את השגיאה או לקרוא למשתמש.
- **הערה טכנית**: לעיתים מתווספת האות 'ב' לתחילת פקודה עקב בעיות טרמינל - יש לשים לב לכך בבדיקת הפלט. לעיתים המשתמש יכול להתגבר על בעיה זו.

## 📦 Git & Commits

- **אישור לפני ביצוע**: אין לבצע קומיט ללא אישור מפורש מהמשתמש.
- **סלקטיביות**: יש להוסיף ל-Stage (`git add`) **רק** את הקבצים ששונו או נוצרו במשימה הנוכחית. אין להשתמש ב-`git add .` באופן גורף.
- **הודעות קומיט**: הודעות הקומיט יהיו בעברית, ברורות ותמציתיות.
- **הפרדה**: יש לבצע קומיט נפרד לכל נושא (אטומיות).
- **בדיקה**: לפני קומיט, יש לוודא תקינות (`npm run check`) ולבדוק שינויים (`git diff`) במידת הצורך.
- **תיעוד**: לפני ביצוע הקומיט, חובה לעדכן את [docs/walkthrough.md](./docs/walkthrough.md) בפרטי העבודה שבוצעה (השתמש ב-`/update_walkthrough`).
- יש לפעול עם הוורקפלואו /commit .

## 🔊 סאונד

- **קבצים אמיתיים**: אין להשתמש ב-Oscillators או צלילים מסונתזים. יש להשתמש בקבצי אודיו (MP3/WAV) מתוך תיקיית `static/sounds`.
- **קבצים לא בשימוש**: קבצי סאונד שאינם בשימוש יועברו לתיקיית `unused_sounds` בשורש הפרויקט (המוחרגת מ-Git).

## 🎨 עיצוב (Design)

- **Distraction-free**: העיצוב צריך להיות נקי, מינימליסטי ומונגש, מותאם לתלמידי חינוך מיוחד.
- **משוב ברור**: חיווי ויזואלי וקולי מיידי לכל פעולה (הצלחה/כישלון).

## 📚 תיעוד ומידע (Documentation)

- **מטרת הפרויקט**: להבנת המטרה המרכזית והקשר הכללי, יש לקרוא את קובץ `README.md`.
