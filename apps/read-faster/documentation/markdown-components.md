# אפשרויות לשילוב קומפוננטות במסמכי Markdown

## MDX
- פורמט פופולרי המאפשר שילוב של JSX בתוך קבצי Markdown
- תומך בייבוא וניהול של קומפוננטות React
- מאפשר שימוש בלוגיקה של JavaScript בתוך המסמך
- דוגמה:
```mdx
import { Button } from './Button'

# כותרת המסמך

זהו תוכן רגיל ב-Markdown.

<Button onClick={() => alert('Hello!')}>
  לחץ כאן
</Button>
```

## Svelte Markdown Components
- ניתן לשלב קומפוננטות Svelte בתוך מסמכי Markdown
- נדרש להגדיר preprocessor מתאים (mdsvex)
- תומך בכל התכונות של Svelte
- דוגמה:
```svelte
<script>
  import Button from './Button.svelte'
</script>

# כותרת המסמך

תוכן רגיל ב-Markdown.

<Button on:click={() => alert('Hello!')}>
  לחץ כאן
</Button>
```

## Vue Markdown Components
- Vue מציעה תמיכה מובנית ב-Markdown דרך VuePress או VitePress
- מאפשר שילוב של קומפוננטות Vue
- דוגמה:
```vue
# כותרת המסמך

<custom-button @click="handleClick">
  לחץ כאן
</custom-button>

<script>
export default {
  methods: {
    handleClick() {
      alert('Hello!')
    }
  }
}
</script>
```

## Custom HTML + JavaScript
- אפשרות פשוטה יותר שלא דורשת framework
- מתאים למקרים פשוטים
- דוגמה:
```html
# כותרת המסמך

<button onclick="handleClick()">
  לחץ כאן
</button>

<script>
function handleClick() {
  alert('Hello!')
}
</script>
```

## המלצות לשימוש

1. **MDX** - מומלץ כאשר:
   - הפרויקט כבר משתמש ב-React
   - נדרשת גמישות מקסימלית
   - יש צורך בקומפוננטות מורכבות

2. **Svelte (mdsvex)** - מומלץ כאשר:
   - הפרויקט משתמש ב-Svelte (כמו במקרה שלנו)
   - נדרשת אינטגרציה טובה עם מערכת הקומפוננטות הקיימת
   - רוצים להשתמש ביכולות המיוחדות של Svelte

3. **Vue** - מומלץ כאשר:
   - הפרויקט משתמש ב-Vue
   - נדרשת תמיכה טובה בדוקומנטציה
   - רוצים להשתמש במערכות כמו VitePress

4. **Custom HTML** - מומלץ כאשר:
   - נדרש פתרון פשוט ומהיר
   - אין צורך בקומפוננטות מורכבות
   - רוצים להימנע מתלות בפריימוורק

## צעדי התקנה בסיסיים

### MDX
```bash
npm install @mdx-js/mdx
```

### Svelte (mdsvex)
```bash
npm install mdsvex
```

### Vue (VitePress)
```bash
npm install vitepress
```

### Custom HTML
- לא נדרשת התקנה מיוחדת
- יש לוודא שמעבד ה-Markdown תומך ב-HTML מותאם אישית
