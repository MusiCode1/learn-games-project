# ניתוח בעיות SmoothOutline — מסקנות ביניים

## קישורים

מישהו בנה פאזל 100% עצמאי
https://github.com/codeaashu/Jigsaw-Puzzle-Game/blob/main/script.js
https://github.com/search?q=jigsaw+puzzle++language%3ATypeScript&type=repositories&s=stars&o=desc&l=TypeScript
https://github.com/search?q=jigsaw+puzzle+language%3AJavaScript&type=repositories&s=stars&o=desc&l=JavaScript

## מצב נוכחי

ה-SmoothOutline מייצר חלקים שנראים כמעט כמו פאזל אמיתי, אבל עם 3 בעיות ויזואליות:

1. תמונה נמשכת מעבר לסלוט
2. קו שחותך את הטאב
3. קשקוש בחיבורי טאב/סלוט לקצה

## ממצא 1: מערכת הקואורדינטות של headbreaker

מקוד המקור של headbreaker (`konva-painter.js` שורות 107-131):

```js
figure.shape = new Konva.Line({
  points: outline.draw(piece, piece.diameter, canvas.borderFill),
  bezier: outline.isBezier(),
  tension: outline.isBezier() ? null : canvas.lineSoftness,
  ...Vector.multiply(piece.radius, -1), // x: -radius.x, y: -radius.y
});
```

**חשוב**: ה-painter מוסיף offset של `-radius` לנקודות. כלומר:

- ה-outline צריך להחזיר נקודות מ-(0,0) ל-(fullSize.x, fullSize.y)
- ה-painter אז מזיז אותן ב-(-radius.x, -radius.y) כדי למרכז

**הבעיה בקוד שלי**: אני כבר עושה את ה-offset בעצמי (שורה 200: `x - w/2, y - h/2`).
זה גורם ל-**double offset** — הנקודות מוזזות פעמיים!

`radius = diameter / 2 = (size + borderFill*2) / 2 = w/2, h/2`

אז הנקודות שלי מוזזות ב-(-w/2, -h/2) על ידי, ואז שוב ב-(-w/2, -h/2) על ידי ה-painter.
**זה הסיבה שהתמונה נמשכת — ה-outline לא ממוקם נכון ביחס לטקסטורה!**

### פתרון: להסיר את ה-offset שלי. להחזיר נקודות מ-(0,0) ל-(w,h).

## ממצא 2: עקומת S בבסיס הטאב

ב-`generateInsertPoints`, Curve 1 (base→neck):

```
baseLeft = {x: offset, y: 0}
CP1 = {x: offset, y: d * 0.15}      ← מעל הבסיס
CP2 = {x: neckLeft.x, y: 0}         ← חזרה לבסיס!
neckLeft = {x: ..., y: d * 0.4}     ← שוב מעל
```

CP2 חוזר ל-y=0, מה שיוצר עקומת S — העקומה עולה, חוזרת למטה, ועולה שוב.
זה גורם ל"קשקוש" בחיבור הטאב לקצה.

### פתרון: שנות CP2 ל-y ביניים (כמו d\*0.2) כדי שהעקומה תהיה מונוטונית.

## ממצא 3: פערים בין margin ל-insert

ה-margin נגמר ב-`marginL` אבל ה-insert מתחיל ב-`marginL + (insertW - iw) / 2`.
כש-`iw != insertW` (בגלל widthScale), יש פער או חפיפה.
עם tension של Konva, הפער הזה הופך לעיוות ויזואלי.

### פתרון: לא להוסיף נקודות margin נפרדות. במקום זה, לחשב איפה ה-insert באמת מתחיל ומסתיים ולהשתמש בנקודות האלה.

## ממצא 4: seeds לא מתאימים בין שכנים

כרגע ה-seed מבוסס על `seedBase = round(tp.x * 100 + tp.y * 7)` + side index.
הקצה התחתון של חלק (col,row) לא מקבל אותו seed כמו הקצה העליון של חלק (col,row+1).
זה אומר שה-tab וה-slot לא תואמים בצורה — ה-tab של חלק אחד לא נכנס בדיוק לסלוט של השכן.

### פתרון: seed מבוסס על מיקום הקצה (edge position), לא מיקום החלק.

- קצה עליון של (col,row) = קצה תחתון של (col,row-1) → אותו seed
- קצה שמאלי של (col,row) = קצה ימני של (col-1,row) → אותו seed

חישוב: מתוך targetPosition + pieceSize, לחלץ col/row, ואז:

- top edge seed = hash(col, row, "h")
- bottom edge seed = hash(col, row+1, "h")
- left edge seed = hash(col, row, "v")
- right edge seed = hash(col+1, row, "v")

## ממצא 5: כיווני ה-direction

בדקתי את הכיוונים — הם נכונים:

- Top: tab=-1 (למעלה), slot=+1 (למטה) ✓
- Right: tab=+1 (ימינה), slot=-1 (שמאלה) ✓
- Bottom: tab=+1 (למטה), slot=-1 (למעלה) ✓
- Left: tab=-1 (שמאלה), slot=+1 (ימינה) ✓

## סדר תיקונים (לפי עדיפות)

1. **הסרת double offset** — זו הבעיה הכי קריטית. פשוט להחזיר (x, y) במקום (x - w/2, y - h/2)
2. **תיקון עקומת S** — שינוי CP2 ב-Curves 1 ו-4
3. **הסרת margin points נפרדים** — חישוב ישיר של נקודות ההתחלה/סיום של ה-insert
4. **edge-based seeds** — כדי ש-tab ו-slot יתאימו בין שכנים

## גישות חלופיות ששקלתי

**שקלתי**: להשתמש ב-edge coordinate system אוניברסלי (u,v) עם transforms לכל צד.
**דחיתי**: יותר מדי מורכב, וה-bugs הנוכחיים הם ספציפיים (double offset, S-curve, margin gaps).
עדיף לתקן את ה-bugs הספציפיים בקוד הקיים.

**שקלתי**: לוותר על reverse iteration בקצה תחתון/שמאלי ובמקום זה לייצר insert points בכיוון הפוך.
**דחיתי**: ה-reverse iteration עובד נכון, רק צריך לוודא שה-offset מטופל נכון.

---

## תוכנית מימוש — שלב אחרי שלב

### שלב 1: הסרת double offset (הבעיה הכי קריטית)

**הבעיה**: `addPoint()` מוסיף `x - w/2, y - h/2`, אבל ה-Konva painter כבר עושה
`...Vector.multiply(piece.radius, -1)` שזה בדיוק אותו offset.

**התיקון**: לשנות `addPoint` ל-`points.push(x, y)` — בלי offset.
headbreaker מצפה לנקודות מ-(0,0) ל-(w,h), וה-painter ימרכז אותן בעצמו.

זה אמור לתקן את הבעיה שהתמונה נמשכת מעבר לסלוט — כי ה-outline
כרגע ממוקם לא נכון ביחס לטקסטורת התמונה.

### שלב 2: תיקון עקומת S ב-generateInsertPoints

**הבעיה**: ב-Curve 1, CP2 = `{x: neckLeft.x, y: 0}` — חוזר לבסיס.
העקומה עושה: 0 → d*0.15 → 0 → d*0.4. זה S-curve שגורם לקשקוש.
אותה בעיה ב-Curve 4 בכיוון ההפוך.

**התיקון**: שינוי CP2 של Curve 1 ל-`y: d * 0.25` (ביניים מונוטוני).
שינוי CP1 של Curve 4 ל-`y: d * 0.25` (אותו דבר בכיוון ההפוך).

### שלב 3: הסרת נקודות margin נפרדות

**הבעיה**: נקודת margin ב-`marginL` ונקודת insert ראשונה ב-`marginL + gap`.
עם tension של Konva, הפער הזה יוצר עיוות.

**התיקון**: לא להוסיף margin point נפרד. Insert כבר מתחיל ב-y=0.
הנתיב: corner → insertStart(y=0) → curve → insertEnd(y=0) → corner.
ללא נקודות ביניים על הקצה הישר.

### שלב 4: edge-based seeds (שיפור, לא באג קריטי)

להחליף seed מ-piece-based ל-edge-based כדי שטאב וסלוט יתאימו בין שכנים.
אפשר לעשות את זה בשלב נפרד.

---

## מעקב ביצוע

- [x] שלב 1 — הסרת double offset — `addPoint` מחזיר `(x, y)` בלי offset
- [x] שלב 2 — תיקון S-curve — CP2 ב-Curve1 ו-CP1 ב-Curve4 שונו ל-`d*0.2` (מונוטוני)
- [x] שלב 3 — הסרת margin points — רק corner + insert points, בלי נקודות ביניים
- [ ] שלב 4 — edge-based seeds (עדיין לא בוצע)
- [ ] בדיקה ויזואלית

### check עבר — אין שגיאות חדשות. ממתין לבדיקה ויזואלית.

---

## בדיקה ויזואלית #1 — עדיין בעיות (27/02/2026)

### מה שהשתפר:

- פאזל החתול (2x2) נראה הרבה יותר טוב — טאבים חלקים בצורת פטרייה
- אין יותר double-offset (התמונה לא נמשכת לגמרי)

### מה שעדיין שבור:

1. **אזורים אפורים/ריקים בתוך סלוטים** — התמונה לא ממלאת את הסלוט
2. **טאבים/סלוטים לא תואמים בין שכנים** — הטאב של חלק לא נכנס לסלוט של השכן
3. **טאבים צרים ומוארכים מידי** בחלק מהצדדים

## ממצא 6 (חדש!): w/h מחושבים עם borderFill מיותר

### הבעיה

בקוד שלי:

```typescript
const w = sz.x + bf.x * 2; // ← רוחב כולל = diameter + borderFill*2
const h = sz.y + bf.y * 2;
```

**אבל**: headbreaker Rounded outline מחזיר נקודות מ-(0,0) ל-(fullSize.x, fullSize.y)
כאשר `fullSize = piece.diameter` — **בלי** לחבר borderFill!

ב-Rounded outline של headbreaker:

```javascript
const fullSize = Vector.cast(size); // size = piece.diameter
const r2sx = r + 2 * s.x; // = fullSize.x
const r2sy = r + 2 * s.y; // = fullSize.y
```

המלבן הבסיסי הוא 0 עד fullSize. טאבים יוצאים **מחוץ** לטווח הזה (y שלילי למעלה, x מעבר ל-fullSize.x ימינה). סלוטים נכנסים **פנימה**.

**אצלי**: המלבן הוא 0 עד (fullSize + borderFill*2), כלומר גדול מידי ב-2*borderFill.

- ה-Konva painter מפזישן ב-(-radius) = (-diameter/2)
- אבל ה-outline שלי גדול מהdiameter
- אז ה-outline לא מתיישר עם הטקסטורה → אזורים אפורים

### הפתרון

```typescript
const w = sz.x; // diameter בלבד
const h = sz.y;
```

טאבים ירחיבו מעבר ל-(0,0)-(w,h), סלוטים יצמצמו פנימה — כמו שheadbreaker עובד.

## ממצא 7 (חדש!): seeds לפי edge position — מימוש מפורט

### הבעיה (חזרה על ממצא 4 + מימוש)

שכנים חייבים לקבל אותו seed על קצה משותף. הקצה התחתון של (col,row) חייב
להיות זהה לקצה העליון של (col,row+1).

### חישוב grid position מתוך targetPosition

```typescript
const col = Math.round(tp.x / sz.x);
const row = Math.round(tp.y / sz.y);
```

### Edge seeds

```
top edge:    hash(col, row, 0)     // = bottom edge של (col, row-1)
right edge:  hash(col+1, row, 1)   // = left edge של (col+1, row)
bottom edge: hash(col, row+1, 0)   // = top edge של (col, row+1)
left edge:   hash(col, row, 1)     // = right edge של (col-1, row)
```

שימוש בקבוע 0 = horizontal edge, 1 = vertical edge.
top edge (col,row) ↔ bottom edge (col,row-1): שניהם hash(col, row, 0) ✓
right edge (col,row) ↔ left edge (col+1,row): שניהם hash(col+1, row, 1) ✓

### מעקב ביצוע מעודכן

- [x] שלב 1 — הסרת double offset
- [x] שלב 2 — תיקון S-curve
- [x] שלב 3 — הסרת margin points
- [x] שלב 5 — תיקון w/h (להסיר borderFill מהחישוב)
- [x] שלב 6 — edge-based seeds

---

## בדיקה ויזואלית #2 — אותן בעיות (27/02/2026)

### הבעיות שנשארו:

1. **תמונה ממשיכה בתוך הסלוט** — fill pattern גולש מחוץ לפוליגון
2. **קו חותך את הטאב** — stroke לא עוקב אחרי הצורה

### ממצא 8 (חדש!): `isBezier()` = `false` + tension = הבעיה היסודית

**הבעיה**: SmoothOutline מחזיר `isBezier(): false` כדי שKonva ישתמש ב-tension.
אבל tension (cardinal spline) **מעוות** את צורת הפוליגון:

- הוא לא עובר בדיוק דרך הנקודות
- הוא "מחליק" פינות וחיבורים בצורה שגורם לגלישה

**ההוכחה**: headbreaker Rounded outline:

- `isBezier()` → `true`
- מחזיר bezier control points
- Konva מצייר עקומות מדויקות — אין עיוות

**הפתרון**: לשנות ל-`isBezier(): true` ולהחזיר bezier CPs ישירות.

פורמט Konva bezier:

```
[startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY, ...]
```

כל 6 ערכים אחרי נקודת ההתחלה = bezier segment אחד (cp1, cp2, end).

### יתרונות הגישה החדשה:

1. **צורה מדויקת** — Konva מצייר בדיוק את ה-bezier שהגדרנו
2. **פחות נקודות** — 4 curves × 6 ערכים = 24 ערכים per insert (במקום ~66)
3. **תואם ל-headbreaker** — אותו פורמט כמו Rounded outline
4. **אין tension artifacts** — אין cardinal spline, אין עיוות

### תוכנית מימוש — שלב 7

1. `isBezier()` → `true`
2. במקום `sampleBezier()`, להחזיר CPs: `push(cp1x, cp1y, cp2x, cp2y, endX, endY)`
3. קצוות ישרים (straight edges) → bezier degeneracy: `push(x, y, x, y, x, y)`
4. כל ה-transforms (rotate, mirror) פועלים על CPs כמו על נקודות רגילות
