# יומן פיתוח — איפה האות?

תיעוד התקדמות פיתוח של משחק "איפה האות?" — תרגול זיהוי אותיות עברית בקול ובמראה.

**Live URLs:**

- **Production**: https://find-letter-game.pages.dev (Cloudflare Pages — main branch)
- **Dev (Cloudflare)**: https://dev.find-letter-game.pages.dev (Cloudflare Pages — dev branch)
- Dev (פנימי): https://musicode-find-letter.nue.tuns.sh (HMR, tuns.sh)
- Preview (פנימי): https://musicode-find-letter-preview.nue.tuns.sh (build, tuns.sh)

---

## 2026-05-16 01:35

### הפרדת מסך פתיחה ממסך משחק — `/` ↔ `/play` לעקיפת autoplay policy

עד עכשיו ה-route `/` היה גם מסך הפתיחה וגם מסך המשחק. הבעיה: התלמיד מגיע ל-`/`, ה-game state מתאתחל ב-`onMount`, ו-`Audio.play()` של ה-TTS נחסם ע"י הדפדפן כי אין user gesture חי (במיוחד ב-iOS Safari). הפתרון: פיצול ל-`/` (פתיחה עם CTA) ו-`/play` (משחק), כך שה-`resetGame` רץ בתוך `onclick` של הכפתור — gesture חי, האודיו עובד.

#### מה בוצע?

**1. `routes/+page.svelte` — שכתוב מלא למסך פתיחה**

- מסך נחיתה ייעודי עם hero, אות-לוגו `בַּ`, כותרת, subtitle, CTA "להתחלת המשחק"
- אייקון הגדרות בפינה (גלגל SVG) עטוף ב-`AdminGate` — מורה יכול לקפוץ ל-`/settings` בלי להיכנס למשחק
- ה-`handleStart()` עושה `gameState.resetGame()` ואז `goto('/play')` — שניהם בתוך call-stack של ה-click → ה-`Audio.play()` ב-`startBoard()` עובר את autoplay policy
- מסיר את כל הלוגיקה של הלוח, `ProgressWidget` ו-`COOLDOWN` (עברה ל-`/play`)

**2. `routes/play/+page.svelte` (חדש) — מסך המשחק**

- מכיל את הלוח, `HeaderBar`, `ProgressWidget`, ו-`CooldownOverlay`
- ה-`onMount` בודק `gameState.status === 'IDLE'` — אם נכנסו ישירות ל-`/play` (refresh/URL), מחזיר ל-`/` (אין gesture). כניסה תקינה היא רק דרך מסך הפתיחה
- מאתחל `boosterService` רק אם `settings.boosterEnabled`

**3. `routes/settings/+page.svelte` — "חזרה למשחק" מאפס + הולך ל-`/play`**

- כפתור החזרה היה `goto('/')` — עכשיו `gameState.resetGame() + goto('/play')` בתוך אותו click
- מאפס את ה-state כדי שהגדרות חדשות יחולו (`gridSize`, `boardsPerSet`, וכו') ולא ייווצרו מצבי "14/12" כש-`totalQuestionsPerSet` משתנה באמצע סבב
- bonus: `cooldownMs` max עלה מ-5000 ל-10000ms

**4. `services/language.ts` — 3 מחרוזות חדשות**

- `startScreenSubtitle: "משחק זיהוי אותיות בעברית"`
- `startButtonLabel: "להתחלת המשחק"`
- `startScreenTip: "הקשיבו ולחצו על האות הנכונה"`

#### מעקפים ופתרונות

- **autoplay policy של דפדפנים**: הדפדפן (בעיקר Safari) חוסם `Audio.play()` אם הוא לא בתוך call-stack של event-handler חי. ה-`startBoard()` עושה `setTimeout(250)` ובו `repeatTarget()` עם `Audio.play()` — ה-`setTimeout` שובר את ה-gesture chain. התיקון פה הוא ארכיטקטוני: לוודא שה-`resetGame` קורה תחת click, ושה-`/play` בעצמו לא מאתחל game state אם הוא מצא `IDLE` — מחזיר ל-`/`.

#### החלטות ארכיטקטורה

- **שני routes במקום state machine ב-`/`**: יכולנו להישאר ב-route אחד ולהוסיף `{#if showStartScreen}`. בחרנו ב-routes כי: (א) מאפשר deep-link ל-`/settings` בלי לעבור דרך הלוגיקה של המשחק, (ב) מוודא שה-game state נטען בעצלן רק כשנכנסים ל-`/play`, (ג) מסיר תלות בין hero ו-game logic.

---

## 2026-05-12 17:35

### מעבר ל-TTS סטטי דרך CDN (R2), אישור איכותי של 20 קבצים, ניקוי מסך הגדרות

מעבר ארכיטקטוני: אין יותר סינתזת TTS בזמן ריצה. כל קובץ אודיו עובר אישור אנושי לפני שמשתמשים בו, ומאוחסן ב-R2 (`tzlev-static`). זרימת ההשמעה במשחק היא עכשיו fetch ישיר מ-CDN, עם fallback ל-Web Speech בלבד.

#### מה בוצע?

**1. תהליך אישור איכותי של 20 קבצי TTS**

- נוצרה תיקייה `apps/find-letter-game/tts-review/` עם 20 קבצי MP3 ייחודיים (4 צמדים חולקים קובץ: א=ע, ו=ב-רפה, ס=שׂ, ח=כ-רפה; ק=כּ ו-ת=ט אוחדו בקוד).
- `README.md` ו-`results.md` מתעדים את המיפוי של כל קובץ לאותיות שמשתמשות בו, ומשמשים לסקירה ידנית.
- המשתמש האזין לכל קובץ ודיווח על 4 בעיות: Fa נשמע Pa, Ra עם מבטא אמריקאי, Tsa נשמע Sa, Za נשמע Zoa.
- סבב וריאנטים: נוצרו 12 וריאנטים (3 לכל בעיה) עם speak texts שונים בעברית. Tsa ו-Za נפתרו עם `צַה`/`זַה` (פתח+ה במקום קמץ+א). Fa ו-Ra נשארו בעייתיים.
- סבב שני ל-Fa: ניסיון English transliteration (`Fa`) — עבד! ElevenLabs מתעלם באופן עקבי מהבחנת דגש/רפה של פ' בעברית, אבל קורא תעתיק לטיני כפי שהוא נכתב.
- סבב שלישי ל-Tsa: וריאנטים עם ElevenLabs v3 audio tags. `[Israeli accent] צַה` עבד מצוין.
- Ra לא נפתר — `[Israeli accent] רַה` יוצא ר' לשונית במקום גרונית. נשאר עם `רָא` (American R) כפשרה.

**2. שינויי `speak` ב-`letters.ts`**

| אות | speak ישן | speak חדש | סיבה |
|-----|-----------|------------|------|
| `tza` (צ) | `צָא` | `[Israeli accent] צַה` | הצליל "ts" נשמר |
| `za` (ז) | `זָא` | `זַה` | תיקון "Zoa" |
| `fa_rafe` (פ רפה) | `פָא` | `Fa` | תעתיק לטיני — Sarah מתעלמת מרפה |
| `qa` (ק) | `קָא` | `כָּא` | אוחד עם כּ |
| `tav` (ת) | `תָּא` | `טָא` | אוחד עם ט |

**3. העלאה ל-R2 (`tzlev-static`)**

- כל 20 הקבצים הועלו ל-`tzlev-static/shared/tts/find-letter/` דרך `bunx wrangler r2 object put --remote`.
- נגישים ציבורית דרך `https://static.tzlev.ovh/shared/tts/find-letter/<name>.mp3`.
- `.gitignore` ברמת השורש כבר חוסם `*.mp3` — הקבצים לא נכנסים לגיט.

**4. שכתוב `tts.ts` ל-CDN-only**

- הוסר: לוגיקת POST/GET לפרוקסי AAC, חישוב hash.
- נוסף: `getTtsFilename(text)` ב-`letters.ts` — מיפוי `speak → filename` עם נירמול NFC ו-trim.
- חדש: `fetchStaticAudio(filename)` שולף מ-`${VITE_STATIC_BASE_URL}/shared/tts/find-letter/<file>` עם IndexedDB cache.
- כשטקסט לא ממופה או fetch נכשל → `console.error` + Web Speech fallback (כפי שהמשתמש ביקש).

**5. מבחנים חדשים (7 בדיקות ב-`letters.test.ts`)**

- בדיקות 17–23: `getTtsFilename` מחזיר את הקובץ הנכון, מטפל ב-NFC ו-trim, מחזיר `null` לטקסט לא-מוכר.
- **בדיקת כיסוי קריטית** (#22): כל ה-`speak` של `ALL_LETTERS` ממופים ב-`TTS_FILES` — מבטיח שלא תהיה אות יתומה.
- בדיקת yatomut הפוכה (#23): כל קובץ ב-`TTS_FILES` בשימוש על-ידי לפחות אות אחת.
- **סה"כ: 47 בדיקות ירוקות** (היו 40, נוספו 7).

**6. ניקוי מסך הגדרות**

- הוסרה הסקציה "הגדרות TTS" ממסך `/settings` (3 select-ים של provider/voice/model + כפתור "בדוק קול").
- הוסרו הפונקציות `testVoice`, `loadVoicesForCurrentProvider`, `changeProvider`, `changeVoice`, `changeModel`, וה-state `voices`/`loadingVoices`/`currentModels`.
- הוסרו ה-imports של `ttsSettings`, `fetchVoices`, `MODELS_BY_PROVIDER`, `speak`.
- הוסרו CSS classes `.select` ו-`.test-btn` שהפכו unused.
- **לא נמחקו** (לפי בקשת המשתמש): `src/lib/stores/tts-settings.svelte.ts`, `src/lib/utils/voices.ts`, מפתחות `tts*` ב-`language.ts`. אלה יוסרו בסבב נפרד בעתיד.

**7. דפלוי ל-Cloudflare Pages dev**

- `bun run build && bun x wrangler pages deploy .svelte-kit/cloudflare --project-name find-letter-game --branch=dev --commit-dirty=true`.
- כתובת קבועה חדשה: `https://dev.find-letter-game.pages.dev`.

#### החלטות ארכיטקטורה

- **CDN-only במקום dynamic synthesis**: כל קובץ TTS בייצור עובר אישור אנושי. אין יותר סיכון של חוסר עקביות בין סשנים (אם ElevenLabs שינה משהו) או צירוף לא-מאומת שמושמע לתלמיד.
- **המיפוי לפי `speak text`, לא לפי letter ID**: אותה מחרוזת `speak` יכולה לשמש כמה כרטיסים (א/ע משתמשים שניהם ב-`אָא`). מיפוי לפי `speak` נותן de-duplication טבעי. אם בעתיד נרצה ID-based, השינוי קל.
- **TTS tags (`[Israeli accent]`) כחלק מה-`speak`**: לא הופרדו לשדה נפרד. הסיבה: ה-tag הוא חלק אינטגרלי מהוראת ההגייה למודל, וצריך להישמר ב-hash הסטטי. הפרדה תוסיף מורכבות בלי תועלת.
- **שימוש מעורב עברית + אנגלית ב-`speak`**: 19 ערכים בעברית + 1 באנגלית (`Fa`). הסיבה: Sarah/eleven_v3 מתעלם באופן עקבי מהבחנת דגש/רפה של פ' בעברית — אין דרך להפיק "fa" עם קלט עברי. תעתיק לטיני עוקף את הבעיה. נשמר כחריג אחד עם הערה מפורשת ב-JSDoc.
- **לא מוחקים את הקוד הישן בבת אחת**: `tts-settings.svelte.ts`, `voices.ts`, ומפתחות `tts*` ב-language.ts נשארים כ-dead code זמני. הסיבה: בקשת המשתמש לחכות — אולי נחזור אליהם בעתיד.

#### מעקפים ופתרונות

- **`[Israeli accent]` עבד ל-Tsa אבל לא ל-Ra**: ניסינו את אותו tag עם רֵישׁ/רַעַשׁ/רַע — תוצאות סלאביות/לשוניות, לא גרוניות. כנראה Sarah-eleven_v3 לא מכירה ר' אובולרית. נשאר עם `רָא` (American R) כפשרה.
- **`פִיל` (מילה אמיתית) יוצא "pil" ולא "fil"**: זה הוכיח שהבעיה לא בטקסט אלא במודל — Sarah ממש לא יודעת לבטא פ רפה בעברית. אבל `אַף` כן יצא עם "f" (כי ף סופית **חייבת** להיות רפה — אין דגש בסופית). זה אישר שהצליל קיים במודל אבל לא נטרגב. הפתרון: לעקוף עם תעתיק לטיני.
- **Cloudflare Pages דרש `--commit-message` מפורש**: הניסיון הראשון נכשל עם "Invalid commit message, it must be a valid UTF-8 string". סיבה לא ידועה (אולי git tree dirty + תווי עברית בקומיט אחרון?). הוספת `--commit-message="..."` פתרה.
- **שני שמות שלא יודעים מה מיפוי**: `[Israeli accent] צַה` מכיל את כל המחרוזת כולל ה-tag כ-key במיפוי. נשמר NFC normalize ב-`getTtsFilename` כדי שהשוואה תהיה דטרמיניסטית.

---

## 2026-05-12 19:22

### באג "14/12" — איפוס משחק בחזרה מ-`/settings`

תיקון באג שבו מונה הפרס (ProgressWidget) הציג ערך גבוה מהמקסימום (לדוגמה `14/12 לפרס`) אחרי שהמורה שינה הגדרות באמצע משחק וחזר ישירות למסך המשחק.

#### מה בוצע?

- ב-`src/routes/+page.svelte` ה-`onMount` קורא עכשיו ל-`gameState.resetGame()` במקום `gameState.startBoard()`.
- נוספה הערה מפורטת שמסבירה מתי הבאג מתרחש ולמה האיפוס חיוני.

#### השורש של הבאג

המסך `/settings` משנה את `boardsPerSet` / `gridSize` / `questionsPerBoard` / `selectedLetterIds` / `avoidSimilar` ב-`SettingsStore`, אבל **לא** מאפס את מוני הסבב ב-`GameState`. רק `HeaderBar.changeSize()` ו-`HeaderBar.newGame()` קוראים ל-`resetGame()`.

תרחיש שמייצר 14/12:
1. המורה משחק עם `boardsPerSet=3`, `gridSize=2x3` → `totalQuestionsPerSet=18`.
2. אחרי 14 תשובות נכונות (`correctInCurrentSet=14`), המורה נכנס ל-`/settings` ומשנה `boardsPerSet` ל-2.
3. `totalQuestionsPerSet` הופך ל-12 reactively, אבל `correctInCurrentSet` נשאר 14.
4. ProgressWidget מציג `14/12`. הפרס לא יופעל עד שהלוח הנוכחי יסתיים.

#### החלטות ארכיטקטורה

- **איפוס בכל onMount של דף המשחק** (ולא effect/watch ייעודי על שינוי הגדרות): פשוט, צפוי, וקל להבנה לתלמיד/מורה — "כניסה למשחק = התחלה טרייה". `gameState` הוא singleton ב-module scope, אז `onMount` רץ גם בכניסה ראשונית וגם בחזרה מ-`/settings` (SPA navigation).
- **score מתאפס גם הוא**: לא נחשב לבעיה, כי `gameState` ממילא מתאפס בכל רענון של הדף (state חי בזיכרון בלבד).
- **לא נוגעים ב-`learn-booster-kit`**: ה-ProgressWidget של ה-kit לא תוחם value ל-max (יכול להציג 14/12). זה תיקון קוסמטי נפרד שדורש שינוי בחבילה משותפת — לא נחוץ אחרי שהבאג השורשי תוקן.

---

## 2026-05-12 16:20

### תשתית בדיקות, CooldownOverlay, תיקון צמדי דמיון, ובחירת אותיות פרטנית

ארבעה שלבי פיתוח סדרתיים בגישת TDD (vertical slicing): הקמת vitest, חלון cooldown עם טבעת SVG, הגדרה מחדש של צמדי דמיון לצלילי-בלבד, ומעבר לבחירת אותיות פרטנית במסך ההגדרות.

#### מה בוצע?

**1. Phase 0 — תשתית בדיקות (vitest)**

- נוסף `vitest@3` + `jsdom` + `@testing-library/svelte` + `@testing-library/jest-dom` ל-devDependencies.
- נוצר `vitest.config.ts` עצמאי (עם `@sveltejs/vite-plugin-svelte` ישירות — לא `mergeConfig` — בגלל אי-תאימות עם ה-SvelteKit adapter בסביבת jsdom).
- נוצר `vitest-setup.ts` עם `@testing-library/jest-dom/vitest`.
- נוסף `"types": ["vitest/globals"]` ל-`tsconfig.json` לפתרון שגיאות TypeScript על `test`/`expect`.
- `bun run test:run` עובד; `bun run check` ירוק (12 שגיאות pre-existing ב-`learn-booster-kit` — לא קשורות אלינו).

**2. Phase 1 — CooldownOverlay עם טבעת SVG**

- **הבעיה**: מנגנון ה-cooldown הציג רק pill קטן עם מספר. הלחיצות נחסמו בלוגיקה אבל ויזואלית הכרטיסים נראו עדיין לחיצים.
- `src/lib/utils/cooldown.ts` — פונקציה טהורה `computeCooldownView(untilTs, nowTs, durationMs): CooldownView`. ניתנת לבדיקה בלי DOM. 6 בדיקות TDD (9 cases עם `.each`).
- `src/routes/_components/CooldownOverlay.svelte` — overlay מלא-מסך (position:absolute, blur, z-50, pointer-events:auto) עם מודל לבן ב-center. טבעת SVG (r=56, CIRC≈351.86) מתרוקנת מ-100% ל-0% לאורך `cooldownMs`. `setInterval` כל 50ms לאנימציה חלקה.
- `+page.svelte` — הוסר ה-`cooldown-pill` הישן (now/effect/derived + HTML + CSS). נוסף `<CooldownOverlay>`.
- הערה: בדיקות רכיב Svelte 5 דורשות `mount()` שאינו זמין ב-jsdom (SSR limitation). 2 בדיקות סומנו `test.skip`. הלוגיקה הטהורה — 100% מכוסה.

**3. Phase 2 — צמדי דמיון: צלילי בלבד**

- **הבעיה**: `SIMILARITY_PAIRS` ערבב צמדים צליליים עם צורניים. ק+כ, א+ע+ה הופיעו יחד בלוח.
- שינוי שם: `SIMILARITY_PAIRS` → `PHONETIC_SIMILARITY_PAIRS` (מיוצאת).
- **5 צמדים חדשים שנוספו**: ק↔כּ (`qa`↔`ka`), א↔ה (`a`↔`ha`), ע↔ה (`aa`↔`ha`), ס↔ז (`sa`↔`za`), צ↔ט (`tza`↔`ta`).
- **8 צמדים צורניים שהוסרו** מהלוגיקה הפעילה: בּ↔בַ, כּ↔כַ, פּ↔פַ, ד↔ר, ח↔ה, ו↔ז, ג↔נ, י↔ו.
- `VISUAL_SIMILARITY_PAIRS_FUTURE` — קבוע חדש מיוצא עם 13 צמדים ויזואליים + JSDoc. מתועד לשימוש עתידי בפיצ'ר "זוגות מכוונים".
- `buildSimilarityMap` משתמשת רק ב-`PHONETIC_SIMILARITY_PAIRS`.
- 9 בדיקות TDD כולל regression סטטיסטי (100 ריצות — לא מופיע צמד צלילי באותו לוח; לא מופיע fallback בלוח נורמלי).
- `docs/similar-letters.md` — נוסף סעיף 9 "תכונות עתידיות" עם תיעוד: צמדים ויזואליים, מצב "זוגות מכוונים", ניקוד מרובה.

**4. Phase 3 — בחירת אותיות פרטנית**

- **הבעיה**: המורה יכול היה רק לבחור קבוצות מאקרו (base/confusing/rafe), לא אותיות פרטניות.
- `src/lib/utils/letters.ts`:
  - `ALL_LETTERS_ALPHABETICAL` — 26 האותיות בסדר א-ב: א,בּ,בַ,ג,ד,ה,ו,ז,ח,ט,י,כּ,כַ,ל,מ,נ,ס,ע,פּ,פַ,צ,ק,ר,שׁ,שׂ,תּ.
  - `DEFAULT_LETTER_IDS` — 26 מזהים (ברירת מחדל = הכל).
  - `getLettersByIds(ids: string[]): LetterCard[]`.
  - `PickBoardOptions`: שדה `groups` הוחלף ב-`selectedLetterIds: string[]`.
  - `pickBoard` משתמש ב-`getLettersByIds` במקום `getLettersForGroups`.
- `src/lib/stores/settings-migration.ts` — פונקציה טהורה `migrateSettings(raw)`. טבלת מיפוי סטטית `GROUP_TO_IDS` (דטרמיניסטי — לא תלוי בקוד `letters.ts`). תומך: v2 עם `activeGroups` → ממיר ל-`selectedLetterIds`; v3 → pass-through; שבור → אובייקט ריק. 5 בדיקות TDD.
- `src/lib/stores/settings.svelte.ts` — `CURRENT_VERSION=3`. שדה `activeGroups` הוחלף ב-`selectedLetterIds`. `load()` קורא ל-`migrateSettings()`. ברירת מחדל = כל 26 האותיות.
- `src/lib/stores/game-state.svelte.ts` — קריאת `pickBoard` עודכנה ל-`selectedLetterIds`.
- `src/routes/_components/LetterSelectionGrid.svelte` — רשת CSS `auto-fill minmax(60px,1fr)` עם כפתורי בחירה לכל אות. כפתורי "סמן הכל" / "נקה הכל" / "ברירת מחדל". אכיפת מינימום 2 אותיות.
- `src/routes/settings/+page.svelte` — הוסרו `toggleGroup`/`isGroupActive` ו-3 ה-toggles של הקבוצות. נוסף `<LetterSelectionGrid>`.
- `src/lib/services/language.ts` — הוסרו 8 מפתחות `group*`. נוספו: `letterSelectionHeader`, `letterSelectionHint`, `selectAllLabel`, `clearAllLabel`, `resetToDefaultLabel`, `minimumLettersHint`.
- 7 בדיקות TDD נוספות (tests 10–16 ב-`letters.test.ts`).

**5. סה"כ בדיקות**

- 40 בדיקות עוברות, 2 דולגות (Svelte 5 + jsdom — מגבלת סביבה).
- קבצי בדיקה: `smoke.test.ts`, `cooldown.test.ts`, `letters.test.ts`, `settings-migration.test.ts`.

#### החלטות ארכיטקטורה

- **צלילי בלבד ב-avoidSimilar**: צמדים צורניים (ד↔ר, ח↔ה וכו') הועברו ל-`VISUAL_SIMILARITY_PAIRS_FUTURE` — מתועדים אך לא פעילים. ההחלטה: בלבול **צלילי** הוא המשמעותי ביותר לתלמידים שלומדים לקרוא; בלבול צורני רלוונטי לשלב מתקדם יותר (ראה `docs/similar-letters.md §9`).
- **migration דטרמיניסטי**: `GROUP_TO_IDS` ב-`settings-migration.ts` מפורש ולא קורא ל-`getLettersForGroups`. כך המיגרציה תישאר נכונה גם אם המאגר ישתנה בעתיד.
- **vitest config עצמאי** (לא `mergeConfig`): `@sveltejs/kit/vite` ב-vitest mode מכניס adapter שמצפה ל-Cloudflare Pages runtime. עם `@sveltejs/vite-plugin-svelte` ישירות — הbuild עובד תקין לבדיקות TS טהורות.
- **`computeCooldownView` כ-deep module**: כל לוגיקת הטיימר (remainingMs, progress, ceil) בפונקציה טהורה ניתנת לבדיקה. ה-component עצמו "טיפש" — רק interval + render.

#### מעקפים ופתרונות

- **`@testing-library/svelte` + Svelte 5 + jsdom**: קריאה ל-`mount()` בסביבת jsdom נכשלת עם `lifecycle_function_unavailable`. המעקף: `test.skip` על 2 בדיקות הרכיב. הלוגיקה הטהורה מכוסה ב-100%. בדיקות e2e ויזואליות — דרך linux-gui browser (לא CI).
- **vitest@3 במקום @2**: `vitest@2` מביא `vite@5`; `@sveltejs/vite-plugin-svelte@6` דורש `server.environments` שנוסף רק ב-`vite@6`. `vitest@3` מגיע עם `vite@6` ופותר את הבעיה.

---

## 2026-05-12 15:15

### תיקוני TTS, מודל סבב חדש (boards/questions), ודפלוי ל-Cloudflare Pages

איטרציה שנייה אחרי הגרסה הראשונית — תיקון באג סינכרון משמעותי ב-ProgressWidget, החלפת מודל ה-"turn" של booster-kit במודל מקומי דו-ממדי (לוחות × שאלות בלוח), תיקון בעיית הגייה ב-TTS, ופרסום ל-Cloudflare Pages.

#### מה בוצע?

**1. תיקון סינכרון ProgressWidget (איטרציה ראשונה)**

- באג: `winsSinceLastReward++` רץ בכל לחיצה נכונה, אבל בדיקת הפרס רצה רק כשהלוח התרוקן. התוצאה — ProgressWidget הציג `1/1`, `2/1`, `3/1` תוך כדי משחק, בלי שהפרס מופעל.
- תיקון ראשון: הזזה של `winsSinceLastReward++` ל-`handleBoardCompleted()` (turn = לוח שלם, תואם passcode-practice ו-lotto-game).

**2. מודל סבב חדש: boards × questions (איטרציה שנייה — לבקשת המשתמש)**

- הוספו שתי הגדרות חדשות ב-`settings.svelte.ts`:
  - `questionsPerBoard` (0–12, 0 = כל הכרטיסים) — כמה שאלות לשאול בלוח לפני שהוא מתחלף.
  - `boardsPerSet` (1–10) — כמה לוחות התלמיד צריך להשלים לפני פרס.
- הוספו getters נגזרים:
  - `totalCellsInGrid` — `gridSize.rows × gridSize.cols`.
  - `effectiveQuestionsPerBoard` — אם `questionsPerBoard=0` אז `totalCellsInGrid`, אחרת `min(questionsPerBoard, totalCellsInGrid)`.
  - `totalQuestionsPerSet` — `effectiveQuestionsPerBoard × max(1, boardsPerSet)`.
- שכתוב כולל של `game-state.svelte.ts`:
  - 3 מונים חדשים: `correctInCurrentSet`, `boardsCompletedInSet`, `questionsAnsweredInBoard` (במקום `winsSinceLastReward`).
  - `startBoard()` שולף `effectiveQuestionsPerBoard` כרטיסים אקראיים מהלוח לתור.
  - `handleCorrect()` מקדם את `correctInCurrentSet` ו-`score` יחד עם כל לחיצה נכונה.
  - `handleBoardCompleted()` מקדם את `boardsCompletedInSet`, ומפעיל פרס כשמגיע ל-`settings.boardsPerSet`.
- ProgressWidget מציג עכשיו `correctInCurrentSet / totalQuestionsPerSet` — מעודכן בכל לחיצה נכונה.

**3. הסרת תלות ב-`turnsPerReward` של booster-kit**

- ה-kit חושף `boosterService.config.turnsPerReward`, אבל אנחנו מנהלים את הסבב באופן עצמאי.
- ב-`+page.svelte` הסרנו את הקריאה ל-`config.turnsPerReward`; `progressMax = settings.totalQuestionsPerSet`.
- ב-settings page הסתרנו את ההגדרה `#turnsPerVideo` של ה-kit עם `:global(div:has(> #turnsPerVideo)) { display: none }` כדי שלא יבלבל את המשתמש.

**4. סקציית "סך השאלות לפרס" במסך ההגדרות**

- חישוב חי: `boardsPerSet × effectiveQuestionsPerBoard`.
- תצוגה צהובה/כתומה מסכמת כדי שהמשתמש יראה את ההשפעה של ה-sliders.

**5. דפלוי ל-Cloudflare Pages**

- יצירת פרויקט Pages: `bun x wrangler pages project create find-letter-game --production-branch=main`.
- הדפלוי הראשון יצא ל-branch dev (אוטומטית לפי git branch); הדפלוי השני עבר ל-branch main עם `--branch=main --commit-dirty=true`.
- ה-URL הקבוע: **https://find-letter-game.pages.dev**.

**6. תיקון הגייה ב-TTS**

- באג שזיהה המשתמש: `חָה` נשמע כמו "הָ" (ח' נבלעת), `טָה` נשמע כמו "הָ" (ט' נבלעת). זה קרה ב-ElevenLabs `eleven_v3` עבור עברית.
- תהליך אבחון:
  - הורדנו 20 קבצי אודיו (כל ה-`speak` הקיימים) מ-CDN של הפרוקסי.
  - שלחנו ל-Gemini CLI (`gemini-3-flash-preview`) לתמלול אובייקטיבי עם הוראה ברורה להתעלם משם הקובץ.
  - Gemini אישר: כל ה-`speak` שמסתיים ב-`ה` בעייתי באותיות גרוניות; כל ה-`speak` שמסתיים ב-`א` (או בלי ה') תקין.
- תיקון: החלפת `ה` בסוף ה-`speak` של כל 26 הכרטיסים ב-`א`:
  - `בָּה` → `בָּא`, `חָה` → `חָא`, `טָה` → `טָא`, `הָה` → `הָא` וכו'.
- אימות חוזר מול Gemini אחרי השינוי: 16/16 אותיות נקראות נכון (Gemini זיהה את העיצור הראשון נכון בכולן).
- דפלוי ל-prod עם ה-`speak` החדש.

#### החלטות ארכיטקטורה

- **turn = לוח שלם ולא לחיצה בודדת**: כדי לתאום את הסמנטיקה של booster-kit (turnsPerReward) ושאר המשחקים. גם נראה הגיוני יותר מבחינת ה-flow של המשחק.
- **המודל החדש הוא דו-ממדי**: `boardsPerSet × questionsPerBoard`. נותן למורה גמישות מקסימלית — אפשר להגדיר "3 לוחות עם 5 שאלות כל אחד" = 15 תשובות לפרס, או "1 לוח שלם" = 12 תשובות לפרס, וכו'.
- **המשחק לא תלוי ב-`turnsPerReward` של ה-kit**: ההגדרות שלנו מנצחות כי הן מותאמות לדומיין הספציפי של המשחק (אותיות). booster-kit נשאר אחראי רק על *סוג* החיזוק (וידאו/אפליקציה/אתר), לא על *תדירותו*.
- **הזרמת `correctInCurrentSet` ל-ProgressWidget בכל לחיצה**: מאפשר למשתמש לראות התקדמות חיה במקום שהפס "יקפוץ" רק אחרי כל לוח. חוויה הרבה יותר מתגמלת לתלמיד.
- **שימוש ב-Gemini כ-"שופט" אובייקטיבי ל-TTS**: במקום להאזין ידנית לכל אופציה ולנחש מה נשמע נכון, שלחנו את הקבצים ל-Gemini Vision/Audio לתמלול. ניתוח אובייקטיבי שעוצב אצלי כתב את התוצאה. אומת מול הדיווחים של המשתמש.
- **`ה` → `א` בסוף ה-speak**: שני התווים הם אם-קריאה שלא נשמעת בעברית מודרנית; ההבדל בצליל זניח. אבל `א` בסוף לא "טורף" את העיצור הראשון כפי ש-`ה` עושה במודל. ההסבר המלא נוסף כהערה ב-`letters.ts`.

#### מעקפים ופתרונות

- **אופטימיזציית cache R2**: כשהחלפנו את ה-`speak` (`חָה`→`חָא`), ה-hash של כל קובץ השתנה. הקאש הישן נשאר ב-R2 אבל לא נקרא יותר. בעתיד אפשר לרוץ cleanup, אבל זה לא דחוף.
- **`bun x wrangler pages` deploys ל-branch הנוכחי**: אם ה-git branch הוא `dev`, wrangler יחשוב שזה הסביבה — לא production. הפתרון: `--branch=main` במפורש בפקודת ה-deploy, או החלפת `git checkout main` לפני.
- **רימון על linux-gui חוסם את `*.tuns.sh`**: בזמן בדיקה, סינון האינטרנט "רימון" חסם את ה-preview URL ב-linux-gui container. הפתרון: ביצענו את הבדיקות מול **prod** (`find-letter-game.pages.dev`) שלא חסום.
- **Svelte CSS לא תומך ב-`:global(...)` באמצע סלקטור**: ניסיון ראשון `.booster-wrap :global(#turnsPerVideo) ~ *` נכשל ב-build. הפתרון: `:has` באותו רמה — `.booster-wrap :global(div:has(> #turnsPerVideo)) { display: none }`.
- **Gemini Pro quota exhausted**: כשניסינו עם `-m pro` (gemini-3-pro-preview) קיבלנו `QUOTA_EXHAUSTED` עם reset של 11 שעות. עברנו ל-`gemini-3-flash-preview` שהיה 100% פנוי — והוא הצליח לבצע את התמלול בצורה מספקת.

---

## 2026-05-07 11:36

### גרסה ראשונית מלאה — מהקמה ועד מנגנון משחק עם תור, דמיון, ועונש

תהליך פיתוח רציף בתוך שיחה אחת — החל מהקמת המבנה הבסיסי על המונורפו, דרך הוספת TTS חי דרך פרוקסי AAC, מצב preview/dev עם מנהרות, אינטגרציית learn-booster-kit, מסך הגדרות מלא, ועד שדרוג מנגנון המשחק לתור על הלוח כולו עם מניעת אותיות דומות ומנגנון עונש cooldown.

#### מה בוצע?

**1. הקמת מבנה האפליקציה (איטרציה 1)**

- `apps/find-letter-game/` נוסף למונורפו על בסיס תבנית של `passcode-practice` (SvelteKit + adapter-cloudflare + Tailwind v4).
- מבנה תיקיות: `src/lib/{stores,utils,services,assets}`, `src/routes/_components`, `static`.
- קבצי תצורה: `package.json` (תלוי ב-`learn-booster-kit`), `svelte.config.js`, `tsconfig.json`, `vite.config.ts` (`envDir: "../../"`), `wrangler.jsonc`.
- `app.html` עם `dir="rtl"` ו-favicon SVG inline (כדי להימנע מ-404 על favicon.png חסר).

**2. ליבת המשחק — גרסה ראשונה**

- `letters.ts` — מאגר 21 אותיות עבריות עם פתח (`LETTERS_PATAH`), כולל `id`, `display` (אות+ניקוד), `speak` (טקסט להקראה).
- `settings.svelte.ts` — store עם persistence ב-localStorage: `gridSize`, `voiceEnabled`, `autoSpeakOnNewRound`.
- `game-state.svelte.ts` — state machine: IDLE → PLAYING → SUCCESS/WRONG_SHAKE → לוח חדש בכל לחיצה נכונה.
- `tts.ts` ראשוני — Web Speech API עם Fully Kiosk fallback, בלי proxy.
- קומפוננטות: `Board.svelte`, `LetterCard.svelte`, `HeaderBar.svelte` (כפתור "השמע שוב" + "משחק חדש" + בורר גודל לוח 2x3/3x3/3x4/4x4 + ניקוד).
- אנימציות: shake (טעות), pop-success, מסך ברכה זמני אחרי הצלחה.
- שילוב במסך הראשי `apps/main` — נוסף ל-`defaults.ts` ו-`language.ts` תחת קטגוריית `reading`, accent rose, אייקון `בַּ`.

**3. תיקון מבנה לוח שגולש מהמסך**

- בעיית `aspect-ratio: 1/1` + `width: 100%` ב-LetterCard גרמה לכך שלוח 4x4 חורג מגובה ה-viewport.
- שוכתב `Board.svelte` עם `ResizeObserver` שמודד את הקונטיינר ומחשב `cellSize = min(cellW, cellH)`.
- הגריד מקבל מידות מפורשות בפיקסלים (`grid-template-columns/rows: repeat(N, cellSize px)`).
- הפונט באות עבר ל-`60cqh` (container query height) במקום `clamp(...vw...)`.
- הפונקציה `gridDims()` נוספה ל-settings (`'ROWSxCOLS'` → `{rows, cols}`).

**4. מנהרות tuns.sh — dev + preview**

- מנהרה ראשונה (dev): `ssh -R find-letter:80:localhost:5179 tuns.sh http` → https://musicode-find-letter.nue.tuns.sh.
- שני שרתי vite במקביל: `bun run dev --port 5179` ו-`bun run preview --port 5180`.
- מנהרה שנייה (preview): `ssh -R find-letter-preview:80:localhost:5180` → https://musicode-find-letter-preview.nue.tuns.sh.
- שתי המנהרות מוחזקות ב-background processes עם keep-alive (`ServerAliveInterval=30`).

**5. שילוב TTS דרך פרוקסי AAC Board**

- זוהה הפרוקסי הקיים: `https://aac-proxy.aybritman.workers.dev` (חושף `POST /v1/tts` ו-`GET /v1/tts/:hash`).
- נוסף `idb-keyval` ל-deps לצורך cache מקומי.
- שכתוב `tts.ts`: שליחת בקשה לפרוקסי, hash דטרמיניסטי זהה ל-AAC (16 hex על SHA-256 של `provider|voiceId|modelId|text`), ניגון ה-blob, fallback ל-Web Speech.
- Cache דו-שכבתי: IndexedDB מקומי (`find-letter-tts-cache`) + R2 בצד הפרוקסי.
- `.env` במונורפו (envDir): `VITE_PROXY_URL=https://aac-proxy.aybritman.workers.dev`.
- מעבר מ-Gemini (3 בקשות/דקה ב-free tier) ל-ElevenLabs (Sarah, eleven_v3) אחרי שהתברר ש-Gemini נחסם מהר עם 21 אותיות חדשות.
- בעיית SSR ב-localStorage תוקנה: `typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'`.

**6. דיבוג בקונסול**

- כל `startBoard()`/`advanceToNextTarget()` מדפיס לקונסול:
  ```
  [find-letter] round N: target = "..." (id=..., speak="...", remaining=K/total)
  ```
- בלי זה אי אפשר לדעת לאיזה כרטיס ללחוץ בבדיקות אוטומטיות עם playwright-cli.

**7. אינטגרציית learn-booster-kit**

- צלילים נטענים מ-Cloudflare R2 CDN המשותף (`static.tzlev.ovh/shared/sounds/`) — בלי קבצים בינאריים ב-Git.
- נתיב הבסיס דרך `VITE_STATIC_BASE_URL` ב-`.env` של המונורפו.
- `playWin = playSuccess` (שני הצלילים זהים בלוטו, אז משתמשים באותו קובץ).
- מודול `sound.ts` — מנגן MP3/WAV אמיתיים (לפי project-rules: בלי Oscillators).
- ב-`+layout.svelte`: `boosterService.init()` ב-mount + `<BoosterContainer />` כ-overlay.
- ב-`+page.svelte`: `<ProgressWidget orientation="vertical">` בצד הלוח (`absolute top-4 left-4`) — אנכי כמו ב-passcode-practice ולא בתוך ה-header (תיקון מאיטרציה קודמת).
- ב-`game-state.svelte.ts`: מונה `winsSinceLastReward`, סטטוס `REWARD`, `triggerReward()` אסינכרוני שמופעל כשהמונה מגיע ל-`turnsPerReward`.
- `app.css` — הוספת `@source "../../../../packages/learn-booster-kit"` כדי ש-Tailwind יסרוק את הקלאסים של ה-kit.

**8. מסך הגדרות מלא**

- `/settings/+page.svelte` כעמוד מלא, מוגן ב-`AdminGate` (סדרת לחיצות במקום סיסמה).
- כפתור גלגל-שיניים ב-HeaderBar עטוף ב-AdminGate שעם unlock קורא ל-`goto('/settings')`.
- שלוש סקציות:
  - **הגדרות משחק** — gridSize, voiceEnabled, autoSpeakOnNewRound, avoidSimilar, cooldownMs (slider 0–5s), boosterEnabled.
  - **הגדרות TTS** — `tts-settings.svelte.ts` store נפרד; provider (elevenlabs/gemini), voice (נטען דינמית מ-`GET /v1/voices/:provider`), model, וכפתור "בדוק קול".
  - **קבוצות אותיות** — 3 toggles. מוגן: חייב להישאר לפחות אחד.
  - **הגדרות חיזוקים** — `<Settings>` של booster-kit (turnsPerReward, סוג חיזוק, סרטונים).
- `voices.ts` — שירות שליפת קולות מהפרוקסי + cache בזיכרון; `MODELS_BY_PROVIDER` מקודד-קשיח כי הפרוקסי לא חושף endpoint למודלים.

**9. מאגר אותיות מורחב + קבוצות + צמדי דמיון**

- שכתוב `letters.ts` לפי `docs/similar-letters.md`:
  - `base` — 21 אותיות בסיסיות עם פתח.
  - `confusing` — שׂ (שין שמאלית), ע — מייצרים צמדים צליליים חדשים.
  - `rafe` — בַ, כַ, פַ עם הקראה לפי הצליל הרפה (ב→וָה, כ→חָה, פ→פָה).
- כל אות מתויגת `group: LetterGroup`.
- מבנה `SIMILARITY_PAIRS` עם 13 צמדים — צליליים, צורניים, ודגוש/רפה.
- פונקציה `areSimilar(idA, idB)` עם `SIMILARITY_MAP` (Map דו-כיווני).

**10. שאלה על כל הלוח לפני לוח חדש**

- ב-`game-state.svelte.ts` נוסף תור `remainingTargets` של כל הכרטיסים בלוח, מעורבב ב-Fisher-Yates.
- כל לחיצה נכונה → `advanceToNextTarget()` שמושך את הבא בתור.
- כשהתור מתרוקן → `handleBoardCompleted()`: בודק אם הגיע פרס; אם כן — חיזוק ואז לוח חדש; אחרת — לוח חדש מיד.
- שינוי שם: `startRound()` → `startBoard()`.

**11. בחירת לוח שעומד באילוץ הדמיון**

- `pickBoard(opts)` מנסה עד 50 פעמים: shuffle של ה-pool + מעבר חמדני, מוסיף כרטיס רק אם אינו דומה לאחד הנבחרים.
- אם אף ניסיון לא הצליח (אילוץ חזק מדי) — fallback בטוח שמשלים את הלוח ללא האילוץ + `console.warn` לדיבוג.

**12. מנגנון עונש (cooldown) על טעות**

- בלחיצה שגויה: `status='COOLDOWN'`, `cooldownUntilTs = Date.now() + cooldownMs`.
- כל הלחיצות חסומות במהלך העונש (`if (this.isOnCooldown) return`).
- ה-target **נשאר זהה** אחרי העונש — לא מועבר target חדש; חזרה ל-`PLAYING`.
- ספירה לאחור ויזואלית: `cooldown-pill` בראש אזור המשחק עם איקון שעון (SVG) ומספר שניות, מעודכן ב-`$effect` כל 100ms עם אנימציית pulse.
- ניתן לכוון מ-0 עד 5 שניות (slider) במסך ההגדרות. ברירת מחדל: 2s.

#### החלטות ארכיטקטורה

- **אדפטציה ל-passcode-practice ולא ל-lotto-game**: passcode-practice פשוט יותר (אין קונטיינטר providers, settings מינימליים) ומתאים יותר לאופי המשחק שלנו.
- **TTS דרך פרוקסי AAC ולא לבד**: ה-AAC כבר חושף proxy עם credentials מוגדרים, R2 cache, ושני providers (Gemini + ElevenLabs). שיכפול שלהם היה בזבוז זמן ומשאבים.
- **ElevenLabs במקום Gemini כברירת מחדל**: מכסה החינם של Gemini (3 בקשות/דקה) מספיקה רק לתחילת המשחק; ElevenLabs יותר נדיב ומאפשר חוויה רציפה.
- **קוד דטרמיניסטי של hash זהה ל-AAC**: בכוונה ננעלים על אותו אלגוריתם (16 hex של SHA-256 על `provider|voiceId|modelId|text`) כדי שה-cache ב-R2 יהיה משותף — אם ה-AAC כבר סינתז את הטקסט "בָּה", אין צורך לסנתז שוב.
- **שאלה על כל הלוח לפני לוח חדש**: בחרנו במנגנון תור על ה-board הנוכחי במקום `pickTarget` בכל סיבוב, כדי להעמיק את האינטראקציה של התלמיד עם אותו set אותיות. זה גם מקטין משמעותית את עומס ה-TTS — 12 הקראות → 1 לוח חדש במקום 12 לוחות חדשים.
- **`SIMILARITY_PAIRS` כמבנה נפרד מהקבוצות**: צמדי הדמיון עצמאיים מהקבוצות הפעילות. כל צמד פעיל רק אם שתי האותיות שלו זמינות בקבוצות הפעילות. כך אפשר להפעיל/לכבות קבוצות בלי "לשבור" את האילוץ.
- **50 ניסיונות + fallback**: אלגוריתם חמדני נטו עלול להיכשל יותר מדי במצבים בהם הקבוצות מצומצמות וגודל הלוח גדול. 50 ניסיונות עם shuffle שונה בכל פעם נותנים סיכוי גבוה למצוא לוח תקין; ה-fallback מבטיח שהמשחק לעולם לא נתקע.
- **target נשאר אחרי cooldown**: בניגוד ל-passcode-practice שמאפס לחלוטין אחרי טעות, אצלנו ה-target נשאר — התלמיד צריך למצוא **בדיוק** את האות שנשאל עליה, לא לחפש אות אחרת. זה תואם את מטרת הלמידה.
- **ProgressWidget בצד ולא ב-header**: כמו במשחקים האחרים (passcode-practice). יושב `absolute top-4 left-4` בתוך אזור המשחק, ב-orientation אנכי, ולא נמלא את ה-header.
- **`ResizeObserver` במקום aspect-ratio + media queries**: container queries (`60cqh`) על האות + מדידה דינמית של הקונטיינר נותנים לוח שתמיד יושב במסך, לא משנה איזה viewport.

#### מעקפים ופתרונות

- **`localStorage.getItem is not a function` ב-SSR**: למרות ש-`globalThis.localStorage` מוגדר ב-SvelteKit SSR, הוא לא תקין. תיקנו עם בדיקה כפולה: `typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'`.
- **Vite preview קורס בזמן build**: כשעושים `bun run build` בעוד `vite preview` רץ, הקבצים מוחלפים על הדיסק תוך כדי קריאה והשרת קורס. הפתרון: לעצור את ה-preview, build, ואז להפעיל מחדש את ה-preview. הזרימה הסטנדרטית: `terminate(preview) && build && start(preview)`.
- **`BoosterService not initialized` ב-HeaderBar**: ה-Layout קורא ל-`init()` אסינכרונית, וה-HeaderBar (ב-mount) ניסה מיד לקרוא ל-`config.subscribe()`. הפתרון: כל קומפוננטה שצריכה את ה-config עושה `await boosterService.init()` בעצמה (init הוא idempotent — אחרי הפעם הראשונה הוא מחזיר מיד).
- **`Window.fully` הוצהר פעמיים**: ה-package fully-kiosk-js (transitive של booster-kit) כבר מצהיר על `Window.fully`. הסרנו את ההצהרה הכפולה ב-`tts.ts` והשתמשנו ב-cast מקומי במקום.
- **Tailwind לא מזהה קלאסים של booster-kit**: בלי `@source "../../../../packages/learn-booster-kit"` ב-app.css, ה-ProgressWidget מאבד את כל הסטיילים שלו. הוספנו את ההפניה (כמו ב-passcode-practice).
- **emoji לא נראה בצילומי linux-gui**: ⏳ הופיע כריבוע ריק. החלפנו ל-SVG inline שעובד בכל מקום.
- **favicon 404**: לא רצינו להוסיף קובץ סטטי בשביל אייקון אחד. השתמשנו ב-data URL עם SVG inline שמכיל את האות `בַּ`.
- **"כ דגושה" קשה להבחין מ"כ רפה" בפונט David**: הנקודה הקטנה (דגש) פחות בולטת בפונטי serif. כרגע משאירים — בעתיד אפשר לשקול הגדלה ויזואלית של הדגש או החלפת פונט.
- **`gridDims` נוסף לפני שהיה ברור שצריך rows + cols**: התחלנו עם `gridColumns()` בלבד; כשהוצרכנו גם rows (לחישוב cellSize ב-ResizeObserver), הוספנו `gridDims()` ושמרנו על `gridColumns/gridRows` כ-wrappers דקים.
- **קבצי mp3/wav מוחרגים ב-`.gitignore`**: במקום `git add -f`, אימצנו את התשתית הקיימת — R2 bucket `tzlev-static` שמשמש את jigsaw-puzzle-game ו-wordys-game. הצלילים `success.mp3` ו-`error.wav` כבר היו תחת `shared/sounds/` (משותפים לכל המשחקים), אז רק הצבענו אליהם דרך URL ב-`.env`. `win.mp3` של lotto-game היה זהה ל-`success.mp3` (אותו MD5), אז במקום להעלות שכפול ל-CDN, מיפינו `playWin = playSuccess`.

#### תשתית

- **Tunnels**: שתי מנהרות tuns.sh דרך `~/.ssh/pico` — `find-letter` (dev:5179) ו-`find-letter-preview` (preview:5180).
- **Background processes**: 4 רצים בו-זמנית (vite dev, vite preview, ssh dev tunnel, ssh preview tunnel).
- **רישום במשחקי הלמידה**: `apps/main/src/lib/defaults.ts` ו-`language.ts` תחת `reading`/rose/`בַּ`.
- **בדיקות**: באמצעות `playwright-cli` ב-linux-gui container — צילומי מסך + console logs לוודא שהזרימה תקינה.
