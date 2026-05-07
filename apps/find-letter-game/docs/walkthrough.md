# יומן פיתוח — איפה האות?

תיעוד התקדמות פיתוח של משחק "איפה האות?" — תרגול זיהוי אותיות עברית בקול ובמראה.

**Live URLs (פנימי):**

- Dev: https://musicode-find-letter.nue.tuns.sh (HMR)
- Preview: https://musicode-find-letter-preview.nue.tuns.sh (build)

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
