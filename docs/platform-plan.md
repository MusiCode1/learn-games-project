# תכנית פלטפורמיזציה — Learn Games Platform

> נכתב ב-2026-05-13 בעקבות דיון מתכנן. מטרת המסמך: לתעד את ההחלטות האסטרטגיות, מפת השטח הנוכחית, ותכנית העבודה ההדרגתית להפיכת אוסף המשחקים הנוכחי לפלטפורמת למידה מאוחדת.

## 1. רקע ומטרה

הפרויקט הוא monorepo (Bun workspaces) של 12 apps. כל משחק נבנה היסטורית בנפרד עבור תלמיד או צורך ספציפי. כתוצאה, יש:

- חלקי רעיונות מפוזרים, כל אחד עם הגדרות ופרטים משלו
- כפילות קוד מאסיבית בין משחקים
- חוסר עיצוב אחיד
- חוסר composition — אין דרך לעבור בין משחקים כחוויה אחת

**המטרה:** מבלי לזרוק את העבודה הקיימת, להפוך את כל זה לפלטפורמת למידה אחת — קוהרנטית, בעלת עיצוב אחיד, עם משחקים שניתן לחבר ולפרק, שבה אפשר ללמד דברים שונים.

**ההשראה למודל התוכן:** Bitsboard — אפליקציית iOS שבה התוכן מנותק לחלוטין מהמשחק. יוצרים תוכן פעם אחת, ויש הרבה משחקים שיכולים לרוץ עליו.

---

## 2. ארבע החלטות אסטרטגיות (ה-DNA של התכנית)

### 2.1 Composition — איך הפלטפורמה מורכבת טכנית?

**ההחלטה:** Shell משותף עכשיו → איחוד מלא בעתיד.

- **לטווח הקצר:** Monorepo נשאר. כל משחק עדיין app נפרד עם deploy עצמאי. אבל מוסיפים package של Shell משותף עם HeaderBar, theme, ניווט, מסך-כניסה אחיד.
- **לטווח הארוך:** איחוד מלא ל-SvelteKit אחת עם דומיין יחיד. כל משחק הופך ל-route.

### 2.2 Content Abstraction — עד כמה המשחקים גנריים?

**ההחלטה:** מודל היברידי בסגנון Bitsboard.

- **משחקים שמתאימים למגוון תוכן** (כמו find-letter, lotto, sort-cards) → מקבלים `ContentProvider`, התוכן הופך לישות עצמאית.
- **משחקים מקובעים מטבעם** (כמו `train-addition` למתמטיקה, `passcode-practice` לקוד 4 ספרות) → נשארים מקובעים. זה בסדר.
- **תובנה מרכזית:** תוכן הופך לישות עצמאית — נוצר פעם אחת, יכול לרוץ על כמה משחקים שמסוגלים לצרוך אותו.

### 2.3 גישת הגירה — איך עוברים בפועל?

**ההחלטה:** Strangler Fig **לפי שכבה רוחבית** (ולא לפי משחק).

כל שלב הוא רוחב — נוגעים בכל המשחקים, אבל בשכבה אחת בלבד. כל שלב יציב לחלוטין בפני עצמו, ואפשר לעצור אחרי כל אחד בלי שהפלטפורמה תהיה במצב חצי-שבור.

### 2.4 היקף הפלטפורמה — איפה היא נעצרת?

**ההחלטה (הדרגתית):**

| שלב | מה כלול |
|------|---------|
| **עכשיו** | רק שכבה טכנית — kit משותף, design system, code reuse. אין סנכרון התקדמות בין משחקים (בגלל דומיינים נפרדים) |
| **בהמשך** | Backend לסנכרון — פרופיל תלמיד אחד, התקדמות חוצת-משחקים, הורה רואה תמונה כללית |
| **בעתיד רחוק** | פלטפורמה מלאה — content authoring ללא קוד, dashboard למורה/הורה, אולי גם API |

---

## 3. מפת השטח — 12 apps

### 3.1 חלוצי הפלטפורמיזציה (יש להם content abstraction)

| משחק | פטרן | מצב |
|------|------|------|
| `lotto-game` | **Provider pattern** — `ContentProvider` interface (109 שורות), registry, 3 providers: letters / shapes / reading | המודל המוביל לחיקוי לגבי תוכן דינמי |
| `sort-cards-game` | **Data pack pattern** — `ContentPack` עם rounds, categories, cards. הכי דומה למודל Bitsboard | המודל המוביל לחיקוי לגבי תוכן סטטי |

### 3.2 מועמדים מובהקים לפלטפורמיזציה

| משחק | מה חזק | מה חסר |
|------|---------|---------|
| `find-letter-game` ("איפה האות?") | `language.ts` עם 74 מחרוזות, state machine נקי, settings store, cooldown logic | חסר `ContentProvider`. תוכן hardcoded לאותיות עברית בלבד |
| `wordys-game` | היררכיה של Shelf → Boxes → Cards, ניהול צבעים | תוכן `defaultShelves` hardcoded ב-`data/words.ts`, אין concept של חבילות |

### 3.3 משחקים מקובעים בריאים (נשארים ככה)

| משחק | למה מקובע | מה כן לחלץ |
|------|-----------|-------------|
| `train-addition-game` | types שלו (`maxA`, `maxB`, `builtA`) חסרי משמעות מחוץ לחיבור | state machine pattern, settings store, sound, tts |
| `passcode-practice` | מקובע לקוד 4 ספרות (`passcode`, `showHint`, `hintCooldownMs`) | אותו דבר — tooling בלבד |

### 3.4 חריגים שצריכים החלטה

| משחק | בעיה | המלצה ראשונית |
|------|------|----------------|
| `jigsaw-puzzle-game` | תיקיית `lib/` ריקה — כל הקוד ב-`+page.svelte`. המבנה הכי לא בוגר | refactor או הקפאה |
| `read-faster` | Svelte 5 (תקין), אבל Vercel adapter + Storybook ולא משתמש ב-kit | להחליט: להגר ל-Cloudflare + kit, או להוציא ל-repo נפרד |
| `learn-booster` | פרויקט legacy רחב — vite-plugin משלו, server/, prompts/, output/. זה היה הפלטפורמה הקודמת | להקפיא, לא תחזוקה |

### 3.5 תשתית (לא משחקים)

| app | תפקיד |
|------|--------|
| `main` | פורטל / landing page. משתמש ב-`language.ts` ויש לו `AVAILABLE_GAMES` |
| `drive-viewer` | תשתית לתצוגת תוכן מ-Google Drive |
| `kit-test-screen` | סביבת בדיקה של ה-kit המשותף |

### 3.6 כפילויות מרכזיות שזוהו

מהסקירה לעומק התגלו דפוסים שחוזרים על עצמם:

| דפוס | מספר העתקות | מצב |
|------|---------------|------|
| `SettingsStore` class עם `$state` properties | ~8 משחקים | רק השדות שונים — מועמד מספר 1 לחילוץ |
| `GameStateStore` (state machine) | ~6 משחקים | אותו pattern בערך, שונה רק ב-states |
| `sound.ts` (playSuccess/playError/playWin) | 6 גרסאות | קוד דומה מאוד |
| `tts.ts` | 3+ זהים ברמת מחרוזות (passcode, sort-cards, jigsaw-v2) | חילוץ פשוט |
| `shuffle` inline | 3+ פעמים | **כבר קיים ב-kit** — סתם לא משתמשים |
| `cooldown` | 3 מימושים שונים | חילוץ קצת מורכב יותר |

ה-kit הקיים (`learn-booster-kit`) כבר מספק: `BoosterContainer`, `AdminGate`, `ProgressWidget`, `SettingsForm`, `BoosterService`, `Config+Profiles`, `OverlayTimer`. **לפי הסקירה, יש כבר 70% מהפלטפורמה — הוא רק מפוזר ולא ממונף.**

---

## 4. תכנית עבודה בשלבים

### שלב 1: חילוץ קוד משותף ל-kit (DRY refactor רוחבי)

חילוץ ה-Boilerplate החוזר ל-`learn-booster-kit`:

1. **`SettingsStore` Base class** — class גנרי שמטפל ב-load/save ל-localStorage, ה-`$state` properties, וה-versioning. כל משחק יוריש ויגדיר את השדות שלו.
2. **`GameStateStore` בסיסי** — state machine pattern גנרי.
3. **`sound` API** — `playSuccess`, `playError`, `playWin` משותפים. כל משחק עדיין יכול להוסיף צלילים משלו.
4. **`tts` API** — wrapper משותף ל-Web Speech / ElevenLabs / colbass.
5. **`cooldown` utility** — מימוש אחד מקוון.
6. **Shell components:** `HeaderBar`, `StartScreen`, `SettingsShell`, `AdminGate` (קיים)

**יעד:** משחק יוכל להיבנות עם פחות מ-30% מהקוד הנוכחי שלו, כי כל ה-tooling יבוא מה-kit.

### שלב 2: מערכת Themes

מנגנון Themes ב-package המשותף עם:
- Design tokens (`tokens.css` או `theme.css`) — צבעים, מרווחים, רדיוסים, פונטים
- מספר ערכות נושא להחלפה
- HeaderBar אחיד שמכבד את ה-theme

**יעד:** מראה אחיד לכל המשחקים, גם בלי שהם מאוחדים ל-app אחד.

### שלב 3: הפרדת תוכן ממשחק (content extraction)

**עבור משחקים שמתאימים למגוון תוכן:**

1. הרחבת ה-`ContentProvider` interface ל-multi-axis (ראה סעיף 5)
2. ניתוק התוכן מהמשחק:
   - `find-letter` → ContentProvider של אותיות + ContentProvider של אותיות-עם-ניקוד
   - `wordys` → ContentProvider של מילים בקטגוריות
3. תוכן הופך לישות עצמאית — אותו provider של אותיות יכול לרוץ בלוטו וגם ב-find-letter (מודל Bitsboard)

**עבור משחקים מקובעים:** דילוג. הם נשארים ככה.

### שלב 4: providerization מלא

- בניית content registry גלובלי (אולי ב-package נפרד או ב-kit)
- כלי לראות איזה תוכן יכול לרוץ על איזה משחק (אולי UI במסך admin)
- מעבר כל המשחקים המתאימים לעבוד עם ה-registry

### שלב 5 (עתידי): Backend לסנכרון

- שירות שמרכז התקדמות, פרופילי תלמיד, הגדרות מורה
- כל משחק שואב/שומר דרכו (במקום localStorage לבדה)
- מסך הורה/מורה שמציג את התמונה הכוללת

### שלב 6 (עתידי רחוק): איחוד דומיין

מעבר מ-monorepo עם deploys נפרדים ל-SvelteKit יחיד תחת דומיין אחד. כל משחק route בתוכו. בשלב זה כל הבסיסים המשותפים יושבים כבר ב-kit, אז המעבר הוא יחסית טכני.

---

## 5. תכנון מעמיק: הרחבת ContentProvider ל-Multi-Axis

### 5.1 רקע — שני מקרי המבחן

**מקרה א — לוטו (קיים, עובד):**

ה-`ContentProvider` בלוטו (`apps/lotto-game/src/lib/content/types.ts`) מבוסס על רשימה שטוחה אחת:

```ts
interface ContentProvider<TItem, TSettings> {
  getAvailableItems(): ContentItem<TItem>[];
  getSelectedItemIds(settings: TSettings): string[];
  updateSelectedItems(settings: TSettings, ids: string[]): TSettings;
  // ...
}
```

המורה רואה רשימה אחת של פריטים, מסמן את אלה שהוא רוצה. ה-deck נוצר רק מהם.

**מקרה ב — find-letter עם כל קומבינציות עיצור×תנועה:**

זה המקרה שאתה תיארת. המודל לחיקוי הוא [קריאה להמראה](https://kriale.co.il/vowels-generator/), שמתועד במלואו ב-`apps/find-letter-game/docs/kriale-vowels-generator.md`.

המודל המנטלי שלו:
- 32 אותיות (כולל אותיות סופיות, דגושות, ושיניים נפרדות)
- 12 סוגי ניקוד (קמץ, פתח, שווא, סגול, צירה, חיריק, קובוץ, שורוק, חולם, חטף פתח, חטף סגול, "ללא ניקוד")
- **המורה בוחר משני צירים נפרדים** עם UI של checkboxes לכל ציר
- ה-deck הוא **מכפלה קרטזית** של הבחירות, מסונן לפי חוקים:
  - סופיות (ך/ם/ן/ף/ץ) לא יכולות לקבל שווא או "ללא ניקוד"
  - צירופים חסרי TTS — מסוננים

### 5.2 ההתנגשות

המודל הנוכחי של לוטו יודע ציר אחד (`selectedItemIds: string[]`). אם ננסה להכניס "אותיות עם ניקוד":

| ניסיון | בעיה |
|--------|-------|
| Flatten — 384 צירופים בודדים | UX נורא, אין חוקי סינון |
| רק אותיות | אין איפה לבחור ניקוד |
| רק ניקודים | אין איפה לבחור אותיות |

לכן: **ה-ContentProvider חייב להתפתח כדי לתמוך במספר צירי בחירה.**

### 5.3 ההצעה: `SelectionAxis`

```ts
/** ציר בחירה — קטגוריה שהמורה בוחר ממנה פריטים */
export interface SelectionAxis<T = unknown> {
  id: string;                                    // 'letters', 'vowels', 'shapes', 'colors'
  displayName: string;                           // 'אותיות', 'תנועות'
  icon?: string;
  getAvailableItems(): ContentItem<T>[];
  /** האם הציר מותר לבחירה ריקה */
  allowEmpty?: boolean;                          // default: false
  /** מינימום פריטים שצריך לבחור */
  minSelected?: number;                          // default: 1
}

/** בחירת המורה — מיפוי axisId → רשימת itemIds */
export type ProviderSelection = Record<string, string[]>;

/** ה-Provider החדש */
export interface ContentProvider<TSettings = unknown> {
  id: string;
  displayName: string;
  icon: string;

  // === Selection axes ===
  /** מספר צירי-בחירה. ציר אחד מתאים למשחקים פשוטים, מספר צירים למורכבים. */
  selectionAxes: SelectionAxis[];

  // === Deck generation ===
  /** ייצור deck של ContentItems מהבחירה (כולל סינון פנימי) */
  generateDeck(selection: ProviderSelection, settings: TSettings): ContentItem[];

  /** האם צירוף יחיד תקין (לסינון inline במכפלה קרטזית) */
  isValidCombination?(combination: Record<string, string>): boolean;

  // === Card rendering & matching ===
  generateCardContent(item: ContentItem, settings: TSettings): CardContent;
  contentMatches(a: CardContent, b: CardContent): boolean;
  renderComponent: ComponentType;
  settingsComponent?: ComponentType;

  // === Defaults ===
  getDefaultSelection(): ProviderSelection;
  getDefaultSettings?(): TSettings;

  // === Optional ===
  prepareForGame?(): void;
  cardStyles?: CardStyleOptions;
}
```

### 5.4 איך זה מטפל בכל המקרים

| מקרה | מבנה |
|------|------|
| **lotto.letters (היום)** | axis יחיד `letters`, `generateDeck` מחזיר card לכל אות נבחרת |
| **lotto.shapes (היום)** | axis יחיד `shapes`, `generateCardContent` מוסיף צבע אקראי |
| **lotto.reading (היום)** | axis יחיד `readingItems`, generateDeck פשוט |
| **find-letter + ניקוד (חדש)** | 2 axes: `letters` × `vowels`. `generateDeck` מחזיר מכפלה קרטזית. `isValidCombination` מסנן סופית+שווא |
| **חיבור גנרי (היפותטי)** | 2 axes: `operandA` × `operandB` |
| **צורה × צבע × גודל (היפותטי)** | 3 axes |
| **קטגוריות מילים בעברית (היפותטי)** | axis יחיד עם פריטים מסווגים, או axis 'category' × 'word' |

### 5.5 תאימות לאחור

ה-providers הקיימים של לוטו ימשיכו לעבוד דרך adapter:

```ts
function legacyToMultiAxis<TItem, TSettings>(
  legacy: LegacyContentProvider<TItem, TSettings>
): ContentProvider<TSettings> {
  return {
    ...legacy,
    selectionAxes: [{
      id: 'items',
      displayName: legacy.displayName,
      icon: legacy.icon,
      getAvailableItems: () => legacy.getAvailableItems()
    }],
    generateDeck: (selection, settings) => {
      const ids = selection.items ?? [];
      return legacy.getAvailableItems().filter(item => ids.includes(item.id));
    },
    getDefaultSelection: () => ({ items: legacy.getSelectedItemIds(legacy.getDefaultSettings()) })
  };
}
```

### 5.6 ה-UI של בחירת המורה

הגנריקה של multi-axis מאפשרת ל-`SettingsForm` (ב-kit) להציג את כל הצירים אוטומטית:

```svelte
{#each provider.selectionAxes as axis}
  <fieldset>
    <legend>{axis.displayName}</legend>
    <button onclick={() => selectAll(axis.id)}>הכל</button>
    {#each axis.getAvailableItems() as item}
      <label>
        <input type="checkbox"
               checked={isSelected(axis.id, item.id)}
               onchange={(e) => toggle(axis.id, item.id, e.currentTarget.checked)}>
        {item.label}
      </label>
    {/each}
  </fieldset>
{/each}
```

**זה בדיוק ה-UX של "קריאה להמראה"** — מספר fieldsets, "הכל" לכל אחד, checkboxes פנימה. וזה fully generic.

### 5.7 מה זה משאיר פתוח לעתיד

הצעות שעלו בעבר במסמך `kriale-vowels-generator.md` שעדיין רלוונטיות:

1. **TTS ל-384 צירופים פוטנציאליים** — לבנות מראש או on-demand? ההצעה: on-demand עם cache.
2. **תומכי זיכרון (regular) / פרצופים (faces)** — אופציונלי, האם נדרש?
3. **לשון הקודש** — voice אלטרנטיבי. אופציונלי לעתיד.
4. **קטגוריות תמטיות ב"הכל"** — "רק תנועות גדולות", "רק שורש"... כדאי גם זה לעתיד.

---

## 6. שאלות פתוחות (לדיון/החלטה עתידיים)

### 6.1 Progression — סכמת שלבים לכל משחק

כיום אין במשחקים progression ליניארי מסודר. תלמידים שונים מתקשים בדברים שונים, אז קשה להגדיר "שלב 1, שלב 2...".

**אפשרויות:**

- **Linear levels** — שלבים מוגדרים מראש (שלב 1 = אותיות א-ה, שלב 2 = ו-י וכו'). הכי פשוט, פחות מותאם אישית.
- **Mastery-based** — כדי לעבור לשלב הבא צריך % הצלחה מסוים בנוכחי. מותאם יותר, אבל דורש מדידה.
- **Spaced repetition** (כמו Anki) — תוכן שטעו בו חוזר יותר. מתחיל בלי שלבים, מתחזק אדפטיבי.
- **Adaptive difficulty** — המשחק זיהוי רמת התלמיד ומתאים אוטומטית.
- **Free exploration** — אין שלבים, המורה/תלמיד בוחר. המצב הנוכחי.

**הצעה:** spaced repetition + free exploration נראים הכי מתאימים לאופי הקיים. אבל החלטה נדחית.

### 6.2 ניהול חריגים

- `jigsaw-puzzle-game` v1 vs v2 — האם למחוק את v1?
- `read-faster` — להגר ל-Cloudflare + kit, או להוציא ל-repo נפרד?
- `learn-booster` — להקפיא רשמית? למחוק? להעביר ל-archive?

### 6.3 ה-`apps/main` Portal

המצב הנוכחי: דף סטטי עם קישורים חיצוניים ל-`*.pages.dev`. בשלב Shell משותף הוא ייהפך לדף האחיד הראשון של החוויה. בשלב איחוד דומיין הוא יהפוך ל-root של ה-SvelteKit.

### 6.4 מבנה ה-content registry הגלובלי

בשלב 3-4, כשהתוכן הופך לישות עצמאית, צריך להחליט:
- האם ה-registry יושב ב-kit, ב-package נפרד, או במקום אחר?
- איך משחקים מצהירים אילו providers הם מסוגלים לצרוך?
- האם תוכן יכול להיות מאוחסן ב-JSON/YAML חיצוני (לטובת content authoring), או רק ב-TypeScript?

---

## 7. הצעה לצעד הראשון בפועל

מתוך שלוש אופציות שיקול, כל אחת תפתח את התכנית בצורה שונה:

### אופציה א — חילוץ `SettingsStore` משותף ל-kit
- **קלות:** קל
- **רוחב כיסוי:** 8 משחקים יושפעו
- **סיכון:** מינימלי (קוד בלבד, ללא שינוי במהות)
- **ROI:** מבטל ~200 שורות כפולות
- **מבליט:** את הפלטפורמה כתשתית

### אופציה ב — חילוץ `ContentProvider` מורחב + מיגרציה של `find-letter`
- **קלות:** בינוני-קשה (interface change + adapter + 1 מיגרציה)
- **רוחב כיסוי:** 2 משחקים (lotto, find-letter)
- **סיכון:** בינוני (משנה את לוטו דרך adapter)
- **ROI:** **המשחק שהוזכר ("שמע X, מצא X") הופך גנרי**
- **מבליט:** את הפלטפורמה כפתרון פדגוגי

### אופציה ג — מערכת Themes ב-kit
- **קלות:** קל-בינוני
- **רוחב כיסוי:** כל המשחקים יכולים לאמץ
- **סיכון:** מינימלי
- **ROI:** מראה אחיד מיידי (UI-first)
- **מבליט:** את הפלטפורמה כחוויה אחת

**מומלץ להחליט באמצעות שיחה חיה, על בסיס תחושת בטן ועדיפויות עיתוי.**

---

## 8. הקפדות חוזרות

לאורך כל התהליך:

- ✅ **אסור hardcoded Hebrew בקוד** — כל המחרוזות עוברות ב-`language.ts` (כיום רק `find-letter` ו-`main` מקיימים זאת)
- ✅ **Svelte 5 בלבד** — runes (`$state`, `$derived`, `$effect`)
- ✅ **כל משחק חדש משתמש ב-kit** — לא בונים מאפס
- ✅ **תיעוד ב-`docs/walkthrough.md`** לפני כל commit
- ✅ **`AGENTS.md` בכל פרויקט** (כבר קיים ברוב)
- ✅ **deploys ל-Cloudflare Pages** (חוץ מ-`read-faster` שעדיין על Vercel)

---

## 9. משימות פתוחות (Backlog)

> עודכן: 2026-05-28. מבוסס על סקירת תיעוד כוללת.

### 9.1 קריטי / טכני-חוב

| משימה | היכן | הערות |
|-------|------|--------|
| `registerGameSchema` ל-find-letter-game | `apps/find-letter-game` | כרגע passthrough — פגמי migration לא יתגלו. הוזכר ב-verification report כ-"slice הבא" |
| `updateGameSettings` להחזיר `Result<T, E>` | `packages/learn-booster-kit` | מוגדר ב-`functional-programming.md §8` כ-`❌ זורק`. לוודא אם תוקן ב-migration system slice |
| 10 Svelte `state_referenced_locally` warnings | `apps/find-letter-game` | ב-SettingsForm.svelte, VideoMain.svelte ועוד. Pre-existing, לא מ-migration slice |

### 9.2 DRY — כפילויות שזוהו ועוד לא טופלו

| דפוס | מצב | פעולה נדרשת |
|------|------|--------------|
| `sound.ts` (playSuccess/playError/playWin) | 6 עותקים. קוד דומה מאוד | לחלץ ל-kit, להחליף בכל אפליקציה |
| `tts.ts` | 3+ עותקים זהים (passcode, sort-cards, jigsaw-v2) | לחלץ ל-kit |
| `shuffle` | 3+ אפליקציות שמממשות בעצמן | כבר קיים ב-kit — פשוט לעדכן imports |

### 9.3 עמידה בכללים — מה עדיין שבור

| כלל | מצב | אפליקציות מושפעות |
|-----|------|-------------------|
| אסור hardcoded Hebrew בקוד | רק `find-letter` ו-`main` עומדים בכלל | `wordys-game`, `passcode-practice`, `sort-cards-game`, `train-addition-game`, ועוד |

### 9.4 תאימות ורספונסיביות — design-specs.md

לפי `design-specs.md`, יש לבדוק תאימות בכל המשחקים על:

| מכשיר | Viewport | יחס |
|-------|----------|-----|
| CUBOT Tab KingKong | 1097 × 685 | 16:10 landscape |
| iPad Air (1/2) | 1024 × 768 | 4:3 |
| Desktop FHD | 1920 × 1080 | 16:9 |
| Desktop Laptop | 1366 × 768 | 16:9 |
| Mobile portrait | ~390 × 844 | portrait |
| Mobile landscape | ~844 × 390 | landscape |

**משחקים שלא נבדקו אחרונה:** wordys-game, jigsaw-v2, sort-cards-game, train-addition-game, passcode-practice, lotto-game.
**כלי בדיקה:** Playwright viewport testing דרך linux-gui.

### 9.5 החלטות ממתינות

| נושא | אפשרויות | מצב |
|------|----------|------|
| `read-faster` | להגר ל-Cloudflare + kit, או להוציא ל-repo נפרד | ממתין להחלטה |
| `jigsaw-puzzle-game v1` | למחוק? להקפיא? | ממתין |
| `learn-booster` | להקפיא רשמית? למחוק? | ממתין |

---

## 10. מקורות

- `docs/game-design-rules.md` — המפרט הקיים (10 סעיפים) — **מקור האמת לעקרונות**
- `docs/walkthrough.md` — יומן פיתוח
- `apps/find-letter-game/docs/kriale-vowels-generator.md` — תיעוד מפורט של מודל "קריאה להמראה"
- `apps/lotto-game/src/lib/content/types.ts` — ה-`ContentProvider` interface הקיים
- `apps/sort-cards-game/src/lib/types.ts` — ה-`ContentPack` interface הקיים
- Bitsboard (iOS) — השראת המודל

---

*מסמך חי. עדכון אחרון: 2026-05-28.*
