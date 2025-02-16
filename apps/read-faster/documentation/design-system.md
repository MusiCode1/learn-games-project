# מערכת העיצוב - Read Faster

מסמך זה מתאר את מערכת העיצוב של Read Faster, כולל צבעים, טיפוגרפיה, רכיבים ואנימציות.

## צבעים

### צבעי בסיס

| שם | ערך | שימוש |
|---|---|---|
| Primary | `oklch(0.55 0.18 250)` | כפתורים, כותרות, הדגשות |
| Secondary | `oklch(0.75 0.12 190)` | גרדיאנטים, רקעים משניים |
| Accent | `oklch(0.70 0.15 160)` | אלמנטים מיוחדים, הדגשות |
| Surface | `oklch(0.98 0 0)` | רקע כללי, קארדים |
| Text Primary | `oklch(0.2 0 0)` | טקסט ראשי, כותרות |
| Text Secondary | `oklch(0.5 0 0)` | טקסט משני, תיאורים |

### גרדיאנטים

1. **גרדיאנט ראשי**
```css
background: linear-gradient(to right, oklch(0.55 0.18 250), oklch(0.75 0.12 190));
```

2. **גרדיאנט משני**
```css
background: linear-gradient(to right, oklch(0.75 0.12 190), oklch(0.70 0.15 160));
```

3. **גרדיאנט רקע**
```css
background: linear-gradient(135deg, 
  oklch(0.98 0 0), 
  oklch(0.55 0.18 250 / 0.35), 
  oklch(0.75 0.12 190 / 0.25), 
  oklch(0.98 0 0)
);
```

## טיפוגרפיה

### פונטים

1. **פונט ראשי - Rubik**
   - משמש עבור: טקסט כללי, כפתורים, ניווט
   - משקלים: Regular (400), Medium (500), Bold (700)

2. **פונט משני - Frank Ruhl Libre**
   - משמש עבור: כרטיסי מילים, כותרות מיוחדות
   - משקלים: Regular (400), Bold (700)

### גדלי טקסט

| שם | גודל | שימוש |
|---|---|---|
| text-4xl | 2.25rem | כותרות ראשיות |
| text-2xl | 1.5rem | כותרות משניות |
| text-xl | 1.25rem | כותרות קטנות |
| text-lg | 1.125rem | טקסט מודגש |
| text-base | 1rem | טקסט רגיל |
| text-sm | 0.875rem | טקסט קטן |

## רכיבים

### כפתורים

1. **כפתור ראשי**
```html
<button class="px-6 py-3 text-base rounded-lg transition-all duration-300 
bg-linear-to-r/oklch from-primary to-secondary text-white 
hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5">
  התחל לתרגל
</button>
```

2. **כפתור משני**
```html
<button class="px-6 py-3 text-base rounded-lg transition-all duration-300 
bg-linear-to-r/oklch from-secondary to-accent text-white 
hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5">
  המשך לשלב הבא
</button>
```

### כרטיס מילה
```html
<div class="w-[300px] h-[200px] border-2 rounded-2xl shadow-lg 
hover:-translate-y-1 hover:shadow-xl transition-all duration-300 
flex items-center justify-center">
  <div class="font-['Frank_Ruhl_Libre'] text-[60px] text-center">
    מִילָה
  </div>
</div>
```

### קארדים

1. **קארד צבעוני**
```html
<div class="w-full bg-linear-to-r/oklch from-primary to-secondary 
rounded-2xl shadow-lg p-8 text-white hover:-translate-y-1 
hover:shadow-xl transition-all duration-300">
  <h4 class="text-2xl font-bold mb-4">כותרת</h4>
  <p>תוכן הקארד</p>
</div>
```

2. **קארד לבן**
```html
<div class="bg-white p-8 rounded-2xl shadow-sm">
  <h4 class="text-2xl font-bold mb-4">כותרת</h4>
  <p>תוכן הקארד</p>
</div>
```

### שדה קלט
```html
<div>
  <label class="text-lg font-medium mb-2 block">תיאור השדה</label>
  <input type="text" class="w-full p-4 text-center bg-surface 
    border-2 border-transparent rounded-lg focus:outline-none 
    focus:border-primary focus:ring-4 focus:ring-primary/10 
    transition-all duration-300">
</div>
```

### סרגל התקדמות
```html
<div class="w-full h-4 bg-surface rounded-full overflow-hidden">
  <div class="h-full bg-linear-to-r/oklch from-primary to-secondary 
    transition-all duration-300 ease-out" style="width: 75%">
  </div>
</div>
```

## אנימציות

### אנימציות בסיסיות

1. **Fade In Up**
```css
@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out;
}
```

2. **Fade In Right**
```css
@keyframes fade-in-right {
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
}

.animate-fade-in-right {
  animation: fade-in-right 0.8s ease-out;
}
```

3. **Fade In Down**
```css
@keyframes fade-in-down {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-down {
  animation: fade-in-down 0.8s ease-out;
}
```

### מעברים (Transitions)

- **משך מעבר**: `duration-300` (0.3 שניות)
- **עקומת מעבר**: `ease-out`

דוגמאות לשימוש:
```css
transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
transition-all duration-300 hover:scale-105
```

## מרווחים

### רווחים בסיסיים
| שם | גודל | שימוש |
|---|---|---|
| space-2 | 0.5rem | מרווחים קטנים |
| space-4 | 1rem | מרווחים רגילים |
| space-6 | 1.5rem | מרווחים בינוניים |
| space-8 | 2rem | מרווחים גדולים |
| space-12 | 3rem | מרווחים גדולים מאוד |
| space-16 | 4rem | מרווחים ענקיים |

### מיכלים (Containers)
```html
<div class="max-w-4xl mx-auto px-6">
  <!-- תוכן -->
</div>
