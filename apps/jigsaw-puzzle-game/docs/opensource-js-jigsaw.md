# מחקר ספריות Jigsaw Puzzle — JS/TS

## הבחירה שלנו (v2)

**codeaashu/Jigsaw-Puzzle-Game** — Vanilla JS + Canvas, Bezier tabs/slots אמיתיים.
הקוד שימש כבסיס ל-version-2 של הפאזל שלנו (ראה version-2-plan.md).

---

## ניתוח מפורט של פרויקטים שנבדקו (מרץ 2026)

### codeaashu/Jigsaw-Puzzle-Game — נבחר לשימוש

- **URL**: https://github.com/codeaashu/Jigsaw-Puzzle-Game
- **טכנולוגיה**: Vanilla JS + HTML5 Canvas, אפס תלויות
- **צורת חלקים**: Bezier curves אמיתיים — 4 סגנונות (classic/triangle/round/straight)
- **גודל רשת**: 12, 25, 50, 100, 200 חלקים — חישוב אדפטיבי לפי aspect ratio
- **תמונות**: כן — upload תמונה דרך FileReader API
- **Drag & Drop**: State machine + `isPointInPath()` pixel-accurate hit testing
- **Snap/חיבור**: distance + grid adjacency, מיזוג PolyPiece עם cascade merge, חישוב contour
- **רינדור**: כל PolyPiece מקבל canvas משלו, אפקט emboss תלת-ממדי על קצוות
- **רישיון**: אין רישיון (copyright default) — בשימוש אישי, שאלנו את המפתח
- **איכות קוד**: אלגוריתמים מצוינים (contour tracing, merge, Bezier generation). קובץ מונוליטי (~900 שורות), globals, אין תיעוד. פורק למודולי TypeScript ב-v2 שלנו.
- **מבנה classes**: Point, Segment, Side, Piece, PolyPiece, Puzzle + state machine + twist0-twist3

### gorhill/jigsawpuzzle-rhill — חלופה מצוינת (MIT)

- **URL**: https://github.com/gorhill/jigsawpuzzle-rhill
- **מחבר**: Raymond Hill (יוצר uBlock Origin)
- **טכנולוגיה**: Vanilla JS + HTML5 Canvas, ~1850 שורות
- **צורת חלקים**: Bezier profiles — classic, wave, tenon, straight
- **גודל רשת**: 4-999 חלקים
- **תמונות**: כן — URL parameter
- **Snap**: proximity + angle check + side matching, merge עם polygon XOR
- **תכונות נוספות**: סיבוב חלקים, complexity levels (0-9), persistent state (cookies)
- **רישיון**: MIT — חופשי לשימוש
- **איכות קוד**: ארכיטקטורה מסודרת (Point, Bezier, Profile, Side, Contour, Polygon, PuzzleTile), קוד מ-2009 עם gadgets API ישן, אין touch support
- **למה לא נבחר**: codeaashu פשוט יותר למימוש, ויזואלית טוב, ויש בו את 4 סגנונות הצורה שרצינו

### immanuel404/Jigsaw-Puzzle — לא מתאים

- **URL**: https://github.com/immanuel404/Jigsaw-Puzzle
- **טכנולוגיה**: React 18 (class components)
- **צורת חלקים**: אין! — מלבנים בלבד, תמונות חתוכות מראש ב-12 JPGs
- **מכניקה**: drag-and-swap של תמונות, לא פאזל אמיתי
- **רישיון**: אין
- **סיכום**: למרות שנראה יפה, זה לא פאזל jigsaw אמיתי — רק חידת החלפת תמונות מלבניות. לא מתאים לצרכים שלנו.

### Nico-Src/jigsaw-js-puzzle-lib — פוטנציאל, לא בשל

- **URL**: https://github.com/Nico-Src/jigsaw-js-puzzle-lib
- **טכנולוגיה**: Vanilla JS, ES6 classes, Canvas, אפס תלויות (~550 שורות)
- **צורת חלקים**: כן — Bezier tabs/slots אמיתיים עם randomization
- **גודל רשת**: configurable לגמרי (כל rows x columns)
- **תמונות**: כן — כל HTMLImageElement
- **רישיון**: לא צוין
- **חסרונות**: אין touch support, אין piece grouping (merged pieces), אין סיבוב, WIP, 7 commits בלבד
- **סיכום**: קוד נקי ומודרני, שימושי כהשראה, אבל חסר פיצ'רים חיוניים (grouping, touch)

### grrd01/Puzzle — פיצ'רים עשירים, תלות ישנה

- **URL**: https://github.com/grrd01/Puzzle
- **טכנולוגיה**: KineticJS v4.7.4 (discontinued, forked as Konva)
- **צורת חלקים**: כן — Bezier curves, alternating checkerboard pattern
- **גודל רשת**: 3 presets (6/24/40 + gold variants)
- **תמונות**: כן + EXIF orientation handling
- **תכונות**: piece grouping, סיבוב, PWA, 25 שפות, medals, sound effects
- **רישיון**: MPL-2.0
- **סיכום**: הפיצ'רים הכי מלאים, אבל תלוי ב-KineticJS (deprecated), מונוליטי עם 50+ globals, קשה להתאמה

### pvmolle/puzzle-canvas — prototype בלבד

- **URL**: https://github.com/pvmolle/puzzle-canvas
- **טכנולוגיה**: CoffeeScript + Paper.js
- **צורת חלקים**: כן אבל hardcoded ל-3x3 בלבד
- **רישיון**: MIT
- **סיכום**: prototype מינימלי, 0 stars, לא מתאים

---

## טבלת השוואה מסכמת

| פרויקט | tabs/slots | רשת | touch | grouping | רישיון | התאמה ל-Svelte |
|--------|-----------|------|-------|----------|--------|---------------|
| **codeaashu** | 4 סגנונות Bezier | 12-200 | כן | כן (PolyPiece) | אין | גבוהה |
| **gorhill** | 4 profiles Bezier | 4-999 | לא | כן (polygon merge) | MIT | בינונית |
| **immanuel404** | לא (מלבנים) | 4x3 קבוע | לא | לא | אין | לא רלוונטי |
| **Nico-Src** | Bezier פשוט | חופשי | לא | לא | אין | גבוהה |
| **grrd01** | Bezier | 3 presets | כן | כן (rotation-aware) | MPL-2.0 | נמוכה |
| **pvmolle** | hardcoded 3x3 | קבוע | חלקי | לא | MIT | נמוכה |

---

## קישורים נוספים (מהמחקר המקורי)

### ספריות/קומפוננטות

- **react-jigsaw-puzzle**: [GitHub][1] — React component, plug-and-play
- **jqJigsawPuzzle**: [GitHub][3] — jQuery (ישנה)

### פרויקטים נוספים

- **Canvas Jigsaw (andysellick)**: [GitHub][6] — פרויקט קטן וברור
- **GitHub topic "jigsaw-puzzle"**: [GitHub][8] — חיפוש כללי

### Phaser

- דוגמאות sliding puzzle: [samme.github.io][9]
- אוסף דוגמאות Phaser: [GitHub][10]

[1]: https://github.com/yuri-becker/react-jigsaw-puzzle "yuri-becker/react-jigsaw-puzzle"
[2]: https://github.com/Nico-Src/jigsaw-js-puzzle-lib "Nico-Src/jigsaw-js-puzzle-lib"
[3]: https://github.com/jfmdev/jqJigsawPuzzle "jfmdev/jqJigsawPuzzle"
[4]: https://github.com/gorhill/jigsawpuzzle-rhill "gorhill/jigsawpuzzle-rhill"
[5]: https://github.com/grrd01/Puzzle "grrd's Puzzle"
[6]: https://github.com/andysellick/jigsaw "Simple jigsaw puzzle"
[7]: https://github.com/pvmolle/puzzle-canvas "Jigsaw puzzle using paper.js"
[8]: https://github.com/topics/jigsaw-puzzle "jigsaw-puzzle"
[9]: https://samme.github.io/phaser-examples-mirror/games/sliding%20puzzle.html "sliding puzzle"
[10]: https://github.com/noowxela/phaser-examples "phaser-examples"
