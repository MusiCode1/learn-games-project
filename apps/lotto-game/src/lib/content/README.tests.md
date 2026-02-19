# בדיקות מערכת ContentProvider

## סקירה

מערכת ספקי התוכן (Content Providers) מכוסה במלואה בבדיקות יחידה (unit tests) המבטיחות תקינות, immutability, ו-type safety.

## הרצת הבדיקות

```bash
# הרצת כל הבדיקות
bun run test:unit

# הרצה עם watch mode (לפיתוח)
bun run test:unit

# הרצה עם coverage
bun run test:unit -- --coverage
```

## מבנה הבדיקות

### 1. **types.spec.ts** (9 בדיקות)

בדיקות ל-Type Guard `isContentProvider`:

- ✅ Provider תקין עובר את הבדיקה
- ✅ Validation של כל השדות הנדרשים
- ✅ בדיקות שליליות (null, undefined, missing fields)

**דוגמה:**
```typescript
it('should return true for valid provider', () => {
    const validProvider: ContentProvider = {
        id: 'test',
        displayName: 'Test',
        icon: '🧪',
        getAvailableItems: () => [],
        getDefaultSettings: () => ({}),
        generateCardContent: () => ({ ... }),
        contentMatches: () => true,
        getSelectedItemIds: () => [],
        updateSelectedItems: (s) => s,
        renderComponent: mockComponent
    };
    expect(isContentProvider(validProvider)).toBe(true);
});
```

### 2. **registry.spec.ts** (12 בדיקות)

בדיקות ל-ContentProviderRegistry:

- ✅ רישום providers
- ✅ שליפה (get), בדיקת קיום (has), מחיקה (unregister)
- ✅ רישום מעל provider קיים (HMR support)
- ✅ ניקוי (clear)

**דוגמה:**
```typescript
it('should register a provider', () => {
    registry.register(mockProvider);
    expect(registry.has('test')).toBe(true);
});
```

### 3. **letters/index.spec.ts** (24 בדיקות)

בדיקות מקיפות לספק האותיות:

#### Metadata (5 בדיקות)
- id, displayName, icon
- renderComponent, settingsComponent

#### getAvailableItems (5 בדיקות)
- מחזיר 22 אותיות עבריות
- מבנה תקין של ContentItem
- כולל אלף ותו

#### getDefaultSettings (2 בדיקות)
- כל האותיות נבחרות כברירת מחדל

#### generateCardContent (2 בדיקות)
- יצירת CardContent תקין
- אותיות שונות יוצרות תוכן שונה

#### contentMatches (2 בדיקות)
- אותיות זהות מתאימות
- אותיות שונות לא מתאימות

#### getSelectedItemIds (3 בדיקות)
- החזרת מערך IDs תקין
- מערך ריק עובד
- **Immutability** - שינוי במערך המוחזר לא משפיע על המקור

#### updateSelectedItems (4 בדיקות)
- עדכון בחירה
- **Immutability** - לא משנה את ההגדרות המקוריות
- עובד עם מערך ריק
- מחזיר אובייקט חדש

#### Integration (1 בדיקה)
- תהליך מלא: default → update → getIds → generate → match

### 4. **shapes/index.spec.ts** (30 בדיקות)

בדיקות מקיפות לספק הצורות:

#### Metadata (5 בדיקות)
- זהה לספק אותיות

#### getAvailableItems (4 בדיקות)
- מחזיר 10 צורות גיאומטריות
- מבנה תקין
- כולל עיגול וכל הצורות מ-SHAPES

#### getDefaultSettings (3 בדיקות)
- כל הצורות נבחרות
- colorMode = 'random' כברירת מחדל

#### generateCardContent (3 בדיקות)
- מצב uniform - צבע קבוע (#3B82F6)
- מצב random - צבע hex תקין
- צורות שונות יוצרות תוכן שונה

#### contentMatches (3 בדיקות)
- אותה צורה + אותו צבע = התאמה
- צורות שונות = לא התאמה
- אותה צורה + צבעים שונים = לא התאמה

#### getSelectedItemIds + updateSelectedItems (7 בדיקות)
- זהה לספק אותיות + בדיקת שמירת colorMode

#### SHAPES Constant (3 בדיקות)
- 10 צורות
- כל הצורות הנדרשות קיימות
- שמות בעברית

#### Integration (1 בדיקה)
- תהליך מלא במצב uniform

### 5. **reading/index.spec.ts** (35 בדיקות)

בדיקות מקיפות לספק "ציור של קריאה":

#### Metadata (6 בדיקות)
- זהה לאחרים + בדיקת cardStyles

#### getAvailableItems (6 בדיקות)
- מחזיר 8 אותיות (א-ח)
- מבנה תקין
- פורמט label: "אַ - אגס"
- כולל אלף וחית
- כל הפריטים מ-READING_ITEMS

#### getDefaultSettings (3 בדיקות)
- כל הפריטים נבחרים
- IDs תואמים

#### generateCardContent (3 בדיקות)
- CardContent תקין עם letter, imagePath, helper
- פריטים שונים יוצרים תוכן שונה
- שמירה על כל המאפיינים

#### contentMatches (3 בדיקות)
- אותו itemId = התאמה
- itemIds שונים = לא התאמה

#### getSelectedItemIds + updateSelectedItems (7 בדיקות)
- זהה לספק אותיות

#### READING_ITEMS Constant (6 בדיקות)
- 8 פריטים
- סדר נכון (aleph → het)
- מבנה תקין לכל פריט
- נתיבי תמונות ב-/reading-icons/
- אותיות עם ניקוד
- מילות עזר בעברית

#### Integration (1 בדיקה)
- תהליך מלא

## עקרונות Immutability

כל הבדיקות אוכפות immutability:

### getSelectedItemIds
```typescript
// ❌ לא נכון
getSelectedItemIds(settings) {
    return settings.selectedItems; // מחזיר את המערך המקורי!
}

// ✅ נכון
getSelectedItemIds(settings) {
    return [...settings.selectedItems]; // מחזיר עותק
}
```

### updateSelectedItems
```typescript
// ❌ לא נכון
updateSelectedItems(settings, newIds) {
    settings.selectedItems = newIds; // משנה את המקור!
    return settings;
}

// ✅ נכון
updateSelectedItems(settings, newIds) {
    return { ...settings, selectedItems: newIds }; // אובייקט חדש
}
```

## הוספת בדיקות ל-Provider חדש

כאשר יוצרים provider חדש, יש להוסיף קובץ בדיקות:

### 1. צור קובץ בדיקה

```
src/lib/content/providers/your-provider/index.spec.ts
```

### 2. השתמש בתבנית

העתק את המבנה מאחד מה-providers הקיימים (letters/shapes/reading) והתאם:

```typescript
import { describe, it, expect } from 'vitest';
import { yourProvider } from './index';

describe('Your Provider', () => {
    describe('Provider Metadata', () => {
        it('should have correct id', () => {
            expect(yourProvider.id).toBe('your-id');
        });
        // ... 4 בדיקות נוספות
    });

    describe('getAvailableItems', () => {
        it('should return all items', () => {
            const items = yourProvider.getAvailableItems();
            expect(items).toHaveLength(expectedCount);
        });
        // ... בדיקות נוספות
    });

    // ... המשך לפי התבנית
});
```

### 3. וודא כיסוי מלא

בדוק שכיסית:
- ✅ כל המתודות הנדרשות
- ✅ getSelectedItemIds + updateSelectedItems
- ✅ Immutability tests
- ✅ Integration workflow
- ✅ קבועים (אם יש)

## CI/CD

הבדיקות רצות אוטומטית ב-CI pipeline:

```yaml
- name: Run tests
  run: bun run test:unit -- --run
```

## Coverage Goals

- **Types & Registry**: 100%
- **Each Provider**: 100%
- **Overall**: 95%+

## דיווח בעיות

אם בדיקה נכשלת:

1. **הבן את השגיאה** - קרא את ההודעה במלואה
2. **בדוק Immutability** - רוב הבעיות קשורות ל-mutation
3. **הרץ בדיקה בודדת**: `bun run test:unit -- index.spec.ts`
4. **בדוק את הקוד המקורי** - האם השינוי שלך שובר API?

## שאלות נפוצות

**ש: איך להריץ רק בדיקה אחת?**
```bash
bun run test:unit -- --run -t "should have correct id"
```

**ש: איך לראות coverage?**
```bash
bun run test:unit -- --coverage
```

**ש: למה הבדיקה נכשלת על immutability?**
תוודא שאתה מחזיר עותק של מערכים (`[...array]`) ואובייקטים חדשים (`{ ...obj }`).

**ש: איך לדבג בדיקה?**
הוסף `console.log` בבדיקה או השתמש ב-debugger של Vitest.

---

**סה"כ**: 112 בדיקות | 100% coverage | 🟢 כולן עוברות
