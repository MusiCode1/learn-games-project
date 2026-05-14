# תוכנית בדיקות — Wordy's

> מטרה: כיסוי כל האינטראקציות של המשתמשת/הילד עם המשחק וממשק הניהול,
> כולל מצבי קצה, התמדה (persistence), ותגובתיות (reactivity).
>
> משמש גם **כרשת ביטחון לבאגים מסוג `state_unsafe_mutation`** — כל בדיקת
> Playwright שמרנדרת קומפוננטה ולא מחילה `expect(consoleErrors).toEqual([])`
> תפסיד באגים כאלה.

---

## 1. פירמידת הבדיקות וכלים

| שכבה | כלי | מה מכוסה כאן | מהירות |
|---|---|---|---|
| Unit | Vitest (node env) | פונקציות טהורות: `assets.ts`, `image-helpers.ts`, סטור-כלים בלי DOM | מאוד מהיר |
| Component | Vitest (browser provider, Playwright headless) | קומפוננטה אחת + state, ללא navigation | מהיר |
| E2E | Playwright | flow מלא: ניווט בין מסכים, IndexedDB אמיתי, localStorage, אינטראקציה אנושית | איטי |

**הרבה תכלית — מה הולך איפה?**
- *לוגיקה גרידא* (חישובי שורות ב-WordDisplay, derive, formatting): Unit.
- *קומפוננטה עם state פנימי* (TypingInput, HintButton, VirtualKeyboard): Component.
- *flow עם ניווט/אחסון/IDB* (משחק שלם, admin add/edit/delete): E2E.

ה-baseline הקיים: `playwright.config.ts` + `e2e/demo.test.ts` + Vitest configured ל-2 projects (client browser, server node) ב-`vite.config.ts`.

---

## 2. תשתית ומכניות בסיסיות (להוסיף לפני הבדיקות עצמן)

### 2.1 Helpers ב-E2E (`e2e/_helpers/`)

- `resetStorage(page)` — לפני כל בדיקה: `page.evaluate(() => { localStorage.clear(); /* delete IDB */ })`. חובה — אחרת בדיקות זולגות זו על זו.
- `seedShelves(page, shelves[])` — מכניס מבנה מדפים מוגדר ל-localStorage.
- `seedImage(page, cardId, file)` — שותל תמונה ב-IDB ללא מעבר דרך ה-UI.
- `expectNoConsoleErrors(page)` — צוברת console.errors לאורך הבדיקה ובסוף `expect([]).toEqual(...)`. **קריטי לתפיסת `state_unsafe_mutation` ושאר חריגות runtime.**
- `uploadImage(page, locator, fixturePath)` — מעטפת ל-`setInputFiles`.

### 2.2 Fixtures (`e2e/_fixtures/`)

- תמונות קטנות: `tiny.png`, `tiny.jpg` (~1KB) להעלאה.
- JSON של מדפים מוכן לבדיקות.

### 2.3 שילוב in-page

`page.addInitScript` שמדליק `window.addEventListener('error', ...)` ו-`window.addEventListener('unhandledrejection', ...)` ושומר רשימה ב-`window.__errors__`. אחרי כל פעולה: `expect(await page.evaluate(() => window.__errors__)).toEqual([])`.

---

## 3. מטריצת בדיקות — לפי פיצ'ר

### A. ניווט בסיסי (E2E — קצרצרים, smoke)

- [ ] טעינת `/` — h1 גלויה, שפת `dir="rtl"`, אין שגיאות בקונסול.
- [ ] טעינת `/admin` — טעינה תקינה, הניווט הפנימי (Shelves/Settings) עובד.
- [ ] טעינת `/admin/shelves` — מציג רשימה (גם אם ריקה — מציג ברירת-מחדל מ-`defaultShelves`).
- [ ] טעינת `/admin/settings` — כל ה-toggles גלויים, אין SSR error (תופס את הבעיה הקיימת ב-`localStorage` + Bun).

### B. מדפים — admin (E2E)

- [ ] **הוספה**: כפתור "הוסף מדף" → דיאלוג שם → מופיע ברשימה → שמור ב-localStorage.
- [ ] **שינוי שם**: עריכת מדף קיים → שם משתנה ברשימה ובאחסון.
- [ ] **שינוי צבע**: בחירת צבע מתוך palette → צבע מתעדכן.
- [ ] **בחירת קופסה כ-cover**: סימון coverBoxId → תמונה ראשית של המדף משתנה (`getShelfImage`).
- [ ] **מחיקה**: כפתור מחיקה → confirm → מדף נעלם, **כל התמונות של כל הקופסאות והכרטיסים שבו נמחקות מ-IDB** (חובה לבדוק עם `seedImage`+`expect IDB empty`).
- [ ] **רענון דף**: כל השינויים נשמרים אחרי F5.
- [ ] **ניווט אל מדף**: לחיצה על מדף → `/admin/shelves/[shelfId]` עם שם נכון בכותרת.

### C. קופסאות — admin (E2E)

זהה ל-B, ברמת קופסאות:

- [ ] הוספת קופסה / שינוי שם / צבע / coverCardId / מחיקה (כולל ניקוי תמונות ב-IDB) / persistence / ניווט.

### D. כרטיסים — admin (E2E + Component)

#### D.1 הוספה

- [ ] **טופס ריק** → כפתור "הוסף" disabled.
- [ ] **רק מילה, בלי תמונה** → כפתור "הוסף" disabled.
- [ ] **מילה + תמונה** → כפתור enabled.
- [ ] לחיצה על "הוסף":
  - הכרטיס מופיע ברשימה עם התמונה (לא placeholder).
  - הטופס מתאפס.
  - localStorage `wordys_shelves` כולל את הכרטיס.
  - IndexedDB `wordys-game-images/cards` כולל entry עם `id` חדש ו-`blob`.
- [ ] **תצוגה מקדימה**: כשבוחרים קובץ — preview מופיע מיד דרך `URL.createObjectURL`.
- [ ] **ביטול אחרי בחירת קובץ**: revoke של ה-blob URL (לא memory leak — בדיקה דרך `performance.measureUserAgentSpecificMemory` או חזרה למצב התחלתי).

#### D.2 עריכה

- [ ] **טעינת טופס**: לחיצה על ✎ → מילים נטענות לטופס, preview מציג את התמונה הקיימת (מ-IDB אם יש, אחרת CDN).
- [ ] **שינוי מילה בלבד**: שמירה → המילה משתנה, התמונה נשארת זהה ב-IDB.
- [ ] **החלפת תמונה**: בחירת קובץ חדש → preview משתנה → שמירה → IDB מעודכן עם blob חדש, blob URL ישן revoked.
- [ ] **ביטול עריכה**: כפתור "ביטול" → טופס מתאפס, אין שינוי באחסון.
- [ ] **עריכה ואז עריכה של כרטיס אחר**: state נקי, אין מיזוג.

#### D.3 מחיקה

- [ ] לחיצה על 🗑️ → דיאלוג confirm.
- [ ] אישור → הכרטיס נמחק מהרשימה ומ-localStorage.
- [ ] **התמונה נמחקת גם מ-IDB** (לפי id).
- [ ] ביטול confirm → אין שינוי.
- [ ] מחיקה של כרטיס תחת עריכה → טופס מתאפס.

#### D.4 cover card

- [ ] לחיצה על ⭐ → הכרטיס הופך ל-cover של הקופסה.
- [ ] לחיצה שוב → cover מבוטל.
- [ ] רק כרטיס אחד יכול להיות cover.

### E. בחירת כרטיסים למשחק (E2E)

`/select/[shelfId]/[boxId]/+page.svelte`:

- [ ] טעינה — כל הכרטיסים מופיעים, התמונות נטענות (CDN או IDB).
- [ ] "בחר הכל" / "נקה בחירה".
- [ ] בחירה ידנית של כרטיסים בודדים — toggle.
- [ ] מונה "נבחרו: X" מתעדכן בזמן אמת.
- [ ] "התחל משחק" disabled כשאין בחירה.
- [ ] "התחל משחק" עם תת-קבוצה → URL כולל `?cards=...`.
- [ ] "התחל משחק" עם הכל → URL בלי `cards`.
- [ ] שמירת בחירה אחרונה ב-localStorage (אם קיים).

### F. לב המשחק — `GameContainer` (E2E + Component)

#### F.1 בסיס

- [ ] תמונה מופיעה (מותאמת מ-IDB אם קיימת, אחרת CDN).
- [ ] לחיצה על תמונה → playCardAudio.
- [ ] WordDisplay עם הסידור הנכון (שורות נפרדות לכל מילה, אריח רווח בסוף).
- [ ] קוביות אותיות נכנסות במסגרת — אין גלישה אופקית גם במילים של 7+ אותיות (regression של הבאג שתיקנו).
- [ ] TypingInput ממוקד.

#### F.2 מצבי תצוגת מילה

- [ ] `letters` — אותיות פתוחות.
- [ ] `hidden` — אותיות מוסתרות; כפתור "רמז" מציג זמנית אם `hintEnabled`.
- [ ] `word` — מילה שלמה ללא חלוקה.

#### F.3 לוגיקת הקלדה

- [ ] אות נכונה → אין שגיאה, ה-typedValue מתקדם, האות הבאה מסומנת.
- [ ] אות שגויה → צליל שגיאה + animation shake (אם `errorFeedback`).
- [ ] השלמה → `handleSuccess`: צליל הצלחה, "כל הכבוד", התקדמות לכרטיס הבא.

#### F.4 מצב מתחילים (`beginnerMode`)

- [ ] אות שגויה — לא נכתבת (revert מיידי ב-`beforeinput`).
- [ ] אות נכונה — הקובייה הופכת לירוקה.
- [ ] אותיות עתידיות — `opacity-25 blur-[2px]`.
- [ ] חוסם גם ממקלדת פיזית וגם מ-VirtualKeyboard.

#### F.5 הקראת אותיות (`speakLetters`)

- [ ] לחיצה על מקש (וירטואלי או פיזי) → TTS עם שם האות המנוקד (`אָלֶף`, `בֵּית`).
- [ ] צליל הצלחה/שגיאה לפני, הקראה ב-+500ms (סדר השמעה).

#### F.6 רמז (`hintEnabled`)

- [ ] לחיצה על רמז → השמעת קבצי האודיו של הכרטיס + הצגת אותיות (`forceShow=true`) למשך `hintDuration`.
- [ ] צינון לאחר רמז: כפתור disabled עם countdown של `hintCooldown`.
- [ ] מקלדת חסומה בזמן רמז (`isHintActive` — כעת לא מטופל; אם נדרש — לבדוק).

#### F.7 חזרות (`cardRepetitions`)

- [ ] `2` — playQueue באורך `cards.length × 2`, מעורבב.
- [ ] `0` — אינסופי, queue מתמלא דינמית.
- [ ] בסיום — אם `boosterEnabled && autoBoosterLoop` → reward ואז restart; אחרת → CompletionScreen.

#### F.8 חזרה מהגדרות (`game-session`)

- [ ] התחל משחק → התקדם 3 כרטיסים → ⚙️ → חזור → המשחק ממשיך מהמילה ה-4 (לא מתחיל מההתחלה).
- [ ] אם משנים `cardRepetitions` או סט הכרטיסים — מאפס.

#### F.9 CompletionScreen

- [ ] מופיע בסיום הסבב (כש-`!autoBoosterLoop`).
- [ ] כפתור "שחק שוב" → restart.
- [ ] כפתור "מחזק" → `boosterService.triggerReward` אם `boosterEnabled`. **כפתור disabled מיד אחרי לחיצה למניעת לחיצות כפולות** (regression test לבאג שתוקן).
- [ ] כפתור "יציאה" → onExit.

### G. הגדרות (Settings) — E2E

לכל toggle:

- [ ] שינוי הערך → נשמר ב-localStorage `wordys-settings`.
- [ ] רענון דף → הערך משוחזר.
- [ ] **ההשפעה במשחק/admin** (במקום מתאים — בכל קטגוריה למעלה כבר).
- [ ] migration: שמירת גרסה ישנה ב-localStorage (`schemaVersion: 2` למשל) → אחרי טעינה משודרגת ל-`CURRENT_VERSION` בלי לאבד נתונים.

### H. תגובתיות חוצת-store (E2E — קריטי)

- [ ] מוסיפים כרטיס עם תמונה ב-admin → חוזרים ל-`/select/...` → התמונה מופיעה (לא placeholder).
- [ ] מוחקים כרטיס ב-admin → ה-IDB entry נמחק → ב-`/select` הכרטיס נעלם → באף `<img>` לא מופיע ה-blob URL הישן.
- [ ] עורכים מילת כרטיס → ב-`/select` הטקסט מתעדכן.

### I. רספונסיביות ו-RTL

- [ ] viewport portrait `412×915` (Pixel) — WordDisplay נכנס, GameContainer בעמודה.
- [ ] viewport landscape `915×412` — GameContainer בשורה.
- [ ] viewport קטן `320×568` (iPhone SE) — אין גלישה, אין overflow אופקי.
- [ ] `dir="rtl"` בכל המסכים.

---

## 4. בדיקות יחידה (Vitest, ללא DOM)

קבצים מועמדים:

- `src/lib/services/assets.ts`
  - `getAssetUrl('http://x')` → `'http://x'`
  - `getAssetUrl('blob:abc')` → `'blob:abc'` (regression לתיקון שעשינו)
  - `getAssetUrl('data:image/png;base64,...')` → as-is
  - `getAssetUrl('/cards/foo.png')` → `https://static.../cards/foo.png`
  - `getCardImageUrl('known-id')` → CDN URL
  - `getCardImageUrl('unknown-id')` → placeholder URL
  - `getCardImage({id: 'x'})` כש-IDB ריק → CDN fallback (מצריך mock של `cardImageStore`)

- `src/lib/utils/image-helpers.ts`
  - `getBoxImage` עם/בלי `coverCardId`, עם/בלי כרטיסים
  - `getShelfImage` רקורסיבית

- `src/lib/utils/sound.ts`
  - `HEBREW_LETTER_NAMES` mapping מלא ל-א-ת + סופיות
  - `speakLetter(' ')` נכון

---

## 5. בדיקות קומפוננטה (Vitest browser)

קומפוננטות מועמדות (קלות לבידוד):

- **`WordDisplay.svelte`**:
  - 1 מילה / 2 מילים / מילה ארוכה (8+ אותיות) — מבנה ה-DOM נכון.
  - `currentIndex` שונה — האות הנכונה מודגשת.
  - `wordDisplayMode='hidden'` — האותיות לא מוצגות (אבל הקוביות קיימות).
  - `forceShow=true` (רמז) — כן מוצגות.
  - `compact=true` — `--max-cube-w` מוקטן.
  - `beginnerMode=true` + `currentIndex=3` — אותיות 0-2 ירוקות, 3 מודגשת, 4+ מטושטשות.
  - **regression**: עם 7 אותיות + container 400px — `aspect-ratio` נשמר + רוחב הקוביות ≤ container/7.

- **`HintButton.svelte`**:
  - `disabled=false` — לחיצה מפעילה onClick.
  - `cooldownRemaining > 0` — disabled, מציג countdown.

- **`VirtualKeyboard.svelte`**:
  - `mode='full'` — כל האותיות.
  - `mode='focused' + targetWord='שלום'` — רק `ש,ל,ו,ם` (+ delete/space).
  - `mode='none'` — לא מציג.

- **`TypingInput.svelte`**:
  - הקלדה תקינה — `value` מתעדכן.
  - הקלדה שגויה — animate shake.
  - `targetWord === value` → `onSuccess` נקרא פעם אחת.
  - `beginnerMode` → `beforeinput` חוסם תווים שגויים.

- **`ImageDisplay.svelte`**:
  - `src` עם `blob:` URL — מועבר as-is לתג `<img>`.
  - `src` עם path יחסי — מומר ל-CDN.
  - לחיצה → `onclick` נקרא.

---

## 6. בדיקות ספציפיות לבאגים מוכרים (regression tests)

חשוב להוסיף בדיקה לכל באג שתפסנו, כדי שלא יחזור.

| באג | טסט |
|---|---|
| גלישת קוביות אותיות | E2E: viewport 770×950, מילה של 7 אותיות → `cube.boundingBox().width × 7 + gaps ≤ container.width`. |
| `$state(new Map)` לא תגובתי | E2E: הוסף תמונה → רענן `/select/...` → `expect(img.src).toMatch(/^blob:/)`. **שילוב עם `expectNoConsoleErrors` כדי לתפוס גם `state_unsafe_mutation`**. |
| לחיצות כפולות על כפתור מחזק | E2E: סיים סבב → דאבל-קליק על "מחזק" → triggerReward נקרא רק פעם. |
| SSR error ב-`localStorage` | בדיקה: `curl /admin/settings` → status 200, אין `[500]` בלוגים. |
| `state_unsafe_mutation` ב-`cardImageStore.get` | E2E: כל בדיקה עם `expectNoConsoleErrors`. ספציפית: רנדור של `/admin/shelves/[shelfId]/[boxId]` עם 3 כרטיסים → צבירת errors == []. |

---

## 7. חופף ל-CI

- `npm run test:unit` (Vitest) — בכל commit.
- `npm run test:e2e` (Playwright) — בכל commit ל-`dev`/`main` (כי איטי).
- `npm run check` (svelte-check) + `npm run lint` — pre-commit (כבר קיים בסקיל commit).
- כל פיתוח של פיצ'ר חדש מחייב טסט מקביל.

---

## 8. סדר הוצאה לפועל מומלץ

לפי החזר על השקעה:

1. **תשתית** — `_helpers/resetStorage`, `expectNoConsoleErrors`, fixtures. (~1 שעה)
2. **טסט אחד שבולע את הבאג הנוכחי** — admin add card with image → `expectNoConsoleErrors`. (~30 דק')
3. **smoke E2E**: ניווט בסיסי בכל המסכים, אף שגיאה בקונסול. (~1 שעה)
4. **D — כרטיסים admin** מקצה לקצה, כי זה ה-flow הכי שינינו לאחרונה. (~2 שעות)
5. **F — לב המשחק** — TypingInput + WordDisplay + beginnerMode. (~3 שעות)
6. **שאר ה-flows** (B, C, E, G, H, I) — לפי הצורך/באגים. (~1 יום)
7. **Unit tests** ל-`assets.ts` ו-`sound.ts` — מהיר ושווה. (~1 שעה)
8. **Component tests** — כשמוסיפים פיצ'ר חדש לקומפוננטה.

---

## 9. פתרון הבאג הנוכחי — מתי

אחרי שתשתית הטסטים ובדיקה אחת קיימים → ניגשים לתקן את `state_unsafe_mutation`. הטסט יכשל כעת, ייעשה ירוק לאחר התיקון. גישה red-green-refactor.
