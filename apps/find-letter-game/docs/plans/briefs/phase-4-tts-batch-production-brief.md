---
phase: phase-4-tts-batch-production
verifier-slice: light
complexity-score: 2
---

# ‏Phase 4 — ‏ייצור TTS לכל הניקודים (batch של ~160 קבצים)

## ‏Context

‏תכנון אסטרטגי: [`../tts-production-plan.md`](../tts-production-plan.md)
‏אזהרות Sonnet: [`../sonnet-pitfalls.md`](../sonnet-pitfalls.md)
‏מקור הלקחים: ‏[`../../tts-review/README.md`](../../tts-review/README.md) ‏+ ‏`docs/walkthrough.md` שורות 227-298

‏בפאזה 3 ‏נוספו 10 ניקודים ל-`vowels.ts` אבל בלי MP3 — ‏כל הצירופים החדשים יורדים ל-Web Speech fallback. ‏עכשיו ייצור הקבצים האמיתיים.

**‏החלטות שהמשתמש כבר קיבל:**
‏- ‏**עיצור — ‏לא בסקופ זה.** ‏יישאר ה-be-style הקיים. ‏המחקר הנפרד עליו יקרה אחר כך.
‏- ‏**שווא — ‏לא בסקופ זה.** ‏יישאר Web Speech (מקביל לעיצור).
‏- ‏**קמץ — ‏לא ייצור.** ‏קמץ ≡ פתח צלילית → ‏entry ב-`TTS_FILES` שמצביע על Ba.mp3, ‏Ga.mp3 וכו'.
‏- ‏**8 ניקודים לייצור:** ‏חיריק, סגול, צירה, חולם, שורוק, קובוץ, חטף פתח, חטף סגול.

## ‏Scope

### ‏מה כן

‏- ‏Automation script שמייצר 8 batches MP3 (אחד פר ניקוד) דרך proxy AAC.
‏- ‏Gemini judge פר קובץ — ‏transcription + ‏השוואה לציפייה.
‏- ‏שימוש בלקחים מסיבוב 1 לטיפול באותיות בעייתיות (Fa תעתיק לטיני, Tsa עם `[Israeli accent]`, Ra פשרה, וכו').
‏- ‏דף HTML לבדיקה ב-tunnel למשתמש (כמו פאזה 2).
‏- ‏2 NEEDS_DECISION points: ‏(א) אחרי חיריק כ-sanity, (ב) אחרי batch מלא.
‏- ‏אחרי אישור סופי: ‏העלאה ל-R2 + עדכון `TTS_FILES`.
‏- ‏עדכון test #22 ‏עם ניקודים שיש להם MP3.

### ‏מה לא

‏- ‏אין ייצור עיצור (none) — ‏יישאר ה-be-style הקיים.
‏- ‏אין ייצור שווא — ‏Web Speech.
‏- ‏אין ייצור קמץ (משותף עם פתח).
‏- ‏אין שינוי קוד באפליקציה (`makePair`, ‏`pickBoard`, ‏UI) — ‏ההוספה היא רק data ב-TTS_FILES.
‏- ‏אין deploy ל-Cloudflare Pages (המשתמש ביקש להישאר preview-only).

## ‏Architecture

### ‏שיתופי MP3 (מסיבוב 1 + הרחבה לניקודים החדשים)

‏לכל ניקוד חדש, ‏אם שני זוגות אותיות חולקים צליל בפתח — ‏סביר שיחלקו גם בניקוד החדש. ‏ה-Gemini judge יאמת.

‏שיתופים צפויים (חוזרים על סיבוב 1):

| ‏אותיות | ‏הסבר |
|---------|--------|
| ‏א + ע | ‏גרוניות אילמות |
| ‏ס + שׂ | ‏אותו צליל "s" |
| ‏ט + ת | ‏אותו צליל "t" |
| ‏ק + כּ | ‏אותו צליל "k" (לפי סיבוב 1) |
| ‏ו + ב רפה | ‏אותו צליל "v" |
| ‏ח + כ רפה | ‏אותו צליל "kh" |

‏פר ניקוד: ‏26 - 6 = ‏**20 unique MP3** (בערך).
‏סה"כ: ‏8 × 20 = ‏**~160 קבצים unique**.

### ‏Naming convention

‏בעקבות הסיבוב הראשון (`Ba.mp3` = ב+פתח), ‏הרחבה עקבית:

| ‏ניקוד | ‏suffix |
|--------|---------|
| ‏patah | `a` (קיים, ‏Ba, Ga, ...) |
| ‏hirik | `i` (Bi, Gi, Di, ...) |
| ‏segol | `e` (Be, Ge, ...) |
| ‏tzere | `ei` (Bei, Gei, ...) |
| ‏holam | `o` (Bo, Go, ...) |
| ‏shuruk | `u` (Bu, Gu, ...) |
| ‏kubutz | `uu` (Buu, Guu, ...) |
| ‏hatafPatah | `ah` (Bah, Gah, ...) |
| ‏hatafSegol | `eh` (Beh, Geh, ...) |

### ‏Speak text per vowel

‏לפי טבלת §4.2 ב-`vowels-support-plan.md` + ‏הלקחים מסיבוב 1:

| ‏ניקוד | ‏speakSuffix base | ‏אזהרות |
|--------|-------------------|----------|
| ‏hirik | `'ִי'` (חיריק + יוד) | ‏יחסית קל — תנועה ברורה |
| ‏segol | `'ֶא'` (סגול + א) | ‏סיומת `א` שעבדה בסיבוב 1 |
| ‏tzere | `'ֵא'` (צירה + א) | |
| ‏holam | `'ֹא'` (חולם + א) | |
| ‏shuruk | `'וּ'` (ו + דגש) | ‏unicode מורכב — Sonnet כבר ראה בתstים של פאזה 3 |
| ‏kubutz | `'ֻ'` (קצר) | ‏אולי דרוש סיומת `א` כמו צרה — ניסוי |
| ‏hatafPatah | `'ֲא'` | ‏חטף — קצר; ‏אם נשמע זהה לפתח, ‏אפשר share MP3 |
| ‏hatafSegol | `'ֱא'` | ‏כנ"ל |

## ‏Sub-phases

### ‏Sub-phase 4.1: ‏Setup ‏(http-server + tunnel + automation script)

‏Testing: **`none`** (infrastructure)

1. ‏ודא ‏ש-`tts-review/batch/` ‏קיים, ‏ריק את התת-תיקיות הקיימות בו (אם יש).
2. ‏הפעל http-server על `tts-review/batch/`:
   ```sh
   python3 -m http.server 8878 --directory tts-review/batch &
   ```
3. ‏הפעל tunnel:
   ```sh
   ssh -i ~/.ssh/pico -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 \
       -R find-letter-tts:80:localhost:8878 tuns.sh http &
   ```
   ‏URL ‏ציבורי: ‏`https://musicode-find-letter-tts.nue.tuns.sh/<vowel>/<file>.mp3`
4. ‏כתוב automation script ‏ב-`tts-review/produce-batch.ts` (TypeScript, ‏Bun runtime):
   ‏- ‏פונקציה ‏`produce(letterId: string, vowelCode: VowelCode): Promise<{filename, speak, mp3Url}>`
   ‏- ‏לולאה על אותיות × ניקוד עם de-duplication לפי שיתופים
   ‏- ‏שמירה ל-`tts-review/batch/<vowel>/<Filename>.mp3`
   ‏- ‏לוג בכל קובץ
   ‏- ‏Rate limit: ‏השהיה ‏500ms בין קריאות (להימנע מ-throttle של פרוקסי)
   ‏- ‏Resume: ‏אם קובץ כבר קיים — ‏לא לעשות שוב

### ‏Sub-phase 4.2: ‏Pilot — חיריק (sanity check)

‏Testing: **`manual`**

1. ‏הפעל את ה-script רק לחיריק: ‏`bun produce-batch.ts --vowel hirik`.
2. ‏~20 קבצים נוצרים ב-`tts-review/batch/hirik/`.
3. ‏Gemini judge פר קובץ:
   ```sh
   gemini -p "האזן: מה הצליל ששמעת? האם זה תואם להברה X (לדוגמה 'בִּי' = bee)? @tts-review/batch/hirik/Bi.mp3"
   ```
   ‏שמור תוצאות ב-`tts-review/batch/hirik/judge-report.md` (טבלה: ‏file, expected, Gemini said, status).
4. ‏צור דף HTML ‏`tts-review/batch/hirik.html` עם ‏`<audio>` ‏לכל קובץ + ‏טקסט expected + ‏Gemini transcription. ‏(תבנית כמו /tmp/find-letter-consonants.html של פאזה 2.)
5. **‏STATUS: NEEDS_DECISION** ל-Opus:
   ‏- ‏URL: ‏`https://musicode-find-letter-tts.nue.tuns.sh/hirik.html`
   ‏- ‏סיכום: ‏N קבצים, ‏X נסמנו ע"י Gemini כתקינים, ‏Y בעייתיים
   ‏- ‏רשימת variants מומלצים לבעייתיים (תעתיק לטיני, audio tag, וכו')
   ‏- ‏ממתין להחלטה: ‏המשך לbatch מלא? ‏או iteration על חיריק?

### ‏Sub-phase 4.3: ‏Batch מלא — ‏7 הניקודים הנותרים

‏Testing: **`manual`**

‏אחרי אישור Opus/משתמש לחיריק:

1. ‏הפעל script ‏לשאר ה-vowels: ‏`bun produce-batch.ts --vowel segol,tzere,holam,shuruk,kubutz,hatafPatah,hatafSegol`.
2. ‏~140 קבצים נוצרים.
3. ‏Gemini judge על כולם. ‏סיכום פר ניקוד ב-`tts-review/batch/<vowel>/judge-report.md`.
4. ‏צור דף HTML מאוחד `tts-review/batch/all.html` ‏עם sections פר ניקוד, ‏audio + Gemini transcription + status.
5. ‏ניתוח שיתופים: ‏לכל ‏זוג שיתוף צפוי (ס+שׂ, ‏ט+ת, וכו'), ‏הזן ל-Gemini לשני הקבצים: ‏"האם זהים?". ‏סכם ב-`tts-review/batch/sharing-report.md`.
6. **‏STATUS: NEEDS_DECISION** ל-Opus:
   ‏- ‏URL: ‏`https://musicode-find-letter-tts.nue.tuns.sh/all.html`
   ‏- ‏סיכום: ‏N קבצים, ‏X תקינים, ‏Y בעייתיים, ‏Z שיתופים מאומתים
   ‏- ‏Iteration suggestions לבעייתיים (Sonnet ינסה אוטומטית 1-2 variants לפני שמסמן NEEDS_DECISION)
   ‏- ‏ממתין להחלטה: ‏אישור להעלאה ל-R2? ‏או iteration?

### ‏Sub-phase 4.4: ‏העלאה ל-R2 + ‏עדכון TTS_FILES

‏Testing: **`integration`**

‏רק אחרי אישור הסופי:

1. ‏העלאת כל הקבצים ל-R2:
   ```sh
   for vowel in hirik segol tzere holam shuruk kubutz hatafPatah hatafSegol; do
       for file in tts-review/batch/$vowel/*.mp3; do
           bunx wrangler r2 object put --remote \
               "tzlev-static/shared/tts/find-letter/$(basename $file)" \
               --file $file --content-type "audio/mpeg"
       done
   done
   ```
   ‏(script דומה אבל קל לכלל ב-`produce-batch.ts` עם flag `--upload`.)
2. ‏עדכון ‏`src/lib/utils/letters.ts` ‏TTS_FILES ‏עם כל ה-entries החדשים:
   ‏- ‏לכל ניקוד שיש לו MP3 — ‏לכל אות (לא רק unique), ‏entry שמצביע על השם.
   ‏- ‏שיתופים: ‏שתי entries → ‏אותו filename. ‏לדוגמה ‏`'סִי': 'Si.mp3'` ‏וגם ‏`'שִׂי': 'Si.mp3'`.
   ‏- ‏**קמץ**: ‏לכל אות, ‏entry שמצביע על MP3 של פתח. ‏לדוגמה ‏`'בָּא': 'Ba.mp3'` כבר קיים — ‏אבל קמץ של ‏b ‏יבנה speak ‏שונה (`'בָּא'` עם קמץ במקום פתח). ‏מבדיקה: ‏אם ‏`makePair(b, kamatz).speak === makePair(b, patah).speak` ‏— ‏אין צורך ב-entry חדש. ‏אם שונה — ‏entry חדש שמצביע על אותו filename.
3. ‏עדכן ‏test #22 ‏ב-`letters.test.ts`:
   ```ts
   const PAIRS_WITH_MP3: VowelCode[] = ['patah', 'kamatz', 'hirik', 'segol', 'tzere',
                                          'holam', 'shuruk', 'kubutz', 'hatafPatah',
                                          'hatafSegol', 'none'];
   // ‏רק שווא נשאר exclud.
   ```
4. ‏הרץ ‏`bun run check` + ‏`bun test`. ‏וודא ירוק.
5. ‏rebuild + restart preview (אם נדרש להציג למשתמש).

### ‏Sub-phase 4.5: ‏Verification ‏מקומי

‏Testing: **`manual`**

1. ‏בדפדפן (`https://musicode-find-letter.nue.tuns.sh`):
   ‏- ‏`/settings` → ‏בחר חיריק בלבד → ‏`/play` → ‏לוח עם `בִּי`, `גִי`, ‏TTS מ-R2 (לא Web Speech).
   ‏- ‏חזור על 2-3 ניקודים נוספים מהbatch.
2. ‏עדכן ‏`docs/walkthrough.md` ‏עם entry פאזה 4.
3. **‏STATUS: DONE** ל-Opus + ‏הפעל verifier-slice-light.

## ‏TTS Production Playbook — ‏לקחים מסיבוב 1

‏(מ-`docs/walkthrough.md` שורות 237-241 + ‏`tts-review/README.md`)

| ‏אות | ‏בעיה ידועה בפתח | ‏פתרון שעבד | ‏אזהרה לניקודים חדשים |
|------|------------------|--------------|------------------------|
| ‏פ רפה | ‏Sarah מתעלמת מ-`ָ`/`ַ` בעברית | ‏תעתיק לטיני (`Fa`) | ‏לכל ניקוד: ‏תעתיק לטיני (`Fi`, `Fe`, `Fo`, `Fu`, וכו'). ‏אל תנסה עברית. |
| ‏צ | ‏`צָא` יוצא "Sa" | ‏`[Israeli accent] צַה` | ‏נסה ‏`[Israeli accent] <heb>` קודם לכל ניקוד. ‏אם לא — ‏תעתיק (`Tsi`, `Tse`, וכו'). |
| ‏ר | ‏American R, ‏לא נפתר | ‏פשרה — ‏רָא | ‏סביר שכל ניקוד יהיה American R. ‏פשרה, ‏לא לבזבז זמן על variants. |
| ‏ז | ‏`זָא` יוצא "Zoa" | ‏`זַה` (פתח+ה) | ‏עם תנועות אחרות, ‏יבדק. ‏סביר שלא יחזור. |
| ‏ח, ט | ‏`חָה`/`טָה` נבלע ל-"הָ" | ‏שינו `ה` ב-`א` | ‏הצורה שלי משתמשת ב-`א` כסיומת — ‏בעיה זו לא צפויה. |

‏**טכניקות זמינות (לפי סדר עדיפות):**

1. ‏הברה עברית טבעית (`'בִּי'`, `'גִי'`, וכו') — ‏default.
2. ‏Audio tag `[Israeli accent] <heb>` — ‏לאותיות בעייתיות (צ במיוחד).
3. ‏תעתיק לטיני — ‏fallback כשעברית לא עובדת (פ רפה, ‏אולי גם ר).

‏**STATUS escalation:** ‏אם variant 1 + 2 לא עובדים — ‏סמן NEEDS_DECISION ב-judge-report עם הצעת אופציה ל-Opus.

## ‏Data Flow Bridges

‏אין שינוי במנגנון של flow. ‏הכל data-only ב-`TTS_FILES`. ‏המנגנון הקיים (`getTtsFilename` → ‏fetch מ-R2 → ‏cache IndexedDB → play) ‏עובד אוטומטית.

| Producer | Consumer | Data | Mechanism | קובץ:שורה |
|----------|----------|------|-----------|-----------|
| ‏`makePair(letter, vowel)` | ‏`getTtsFilename(speak)` | speak text | ‏string lookup | `letters.ts:TTS_FILES` |
| ‏`getTtsFilename` | ‏`fetchStaticAudio` | filename | ‏URL construction | `tts.ts:47` |
| ‏R2 CDN | ‏IndexedDB cache | mp3 blob | ‏fetch + cache | `tts.ts:36-58` |

## ‏DELETE blocks

‏אין מחיקות.

## ‏Anti-patterns

‏מתוך `sonnet-pitfalls.md`:

‏- ‏**3.1** — ‏Batch MP3 ללא ‏Gemini judge ‏(אסור).
‏- ‏**3.5** — ‏עיצור גרוע ידוע — ‏לא לתקן בסקופ זה.

‏ספציפי לפאזה זו:

‏- **‏אל תעלה ל-R2 לפני אישור הסופי של המשתמש** — ‏אם תעלה גרסה רעה, ‏cache הדפדפן (IndexedDB) ‏יחזיק אותה ‏ויקשה דיבוג.
‏- **‏אל תייצור batch בלי resume support** — ‏אם network שוגה באמצע, ‏לא להתחיל מאפס. ‏הסקריפט בודק אם הקובץ קיים לפני ייצור.
‏- **‏אל תניח שיתופים** — ‏לכל זוג שאמור להיות זהה (ס+שׂ), ‏בקש מ-Gemini אישור.
‏- **‏אל תוסיף עיצור או שווא ל-PAIRS_WITH_MP3** — ‏הם נשארים פילטר-out.
‏- **‏Cloudflare R2 ≠ Cloudflare Pages** — ‏העלאה ל-R2 ‏(static CDN לקבצים) ‏בלבד. ‏אסור deploy ל-Pages.

## ‏DoD

‏- [ ] ‏`bun run check` ירוק
‏- [ ] ‏`bun test` ירוק (כולל test #22 מעודכן)
‏- [ ] ‏~160 קבצי MP3 הועלו ל-R2 (אחרי אישור משתמש)
‏- [ ] ‏TTS_FILES מעודכן עם ~200+ entries חדשים (כולל קמץ-משותף-עם-פתח)
‏- [ ] ‏test #22 ‏מאשר coverage לכל הניקודים פרט לעיצור+שווא
‏- [ ] ‏בדפדפן: ‏בחירת חיריק → ‏TTS מנגן (לא Web Speech)
‏- [ ] ‏בדפדפן: ‏בחירת ניקוד אחר מ-batch → ‏TTS מנגן
‏- [ ] ‏Screenshot של ‏לוח עם ניקוד חדש (חיריק לדוגמה)
‏- [ ] ‏תיעוד פאזה 4 ב-`docs/walkthrough.md` (פר-app)
‏- [ ] ‏רשימת קבצים בעייתיים שנשארו (אם יש) ‏ופתרון (פשרה, ‏Web Speech fallback, וכו')

## ‏Environment notes

‏- ‏Working directory: ‏`/home/user/projects/learn-games-project/apps/find-letter-game`
‏- ‏TTS proxy: ‏`https://aac-proxy.aybritman.workers.dev`
‏- ‏R2: ‏`tzlev-static/shared/tts/find-letter/` ‏דרך ‏`bunx wrangler r2 object put --remote`
‏- ‏Browser לאימות: ‏linux-gui + ‏`pw-clean.sh`
‏- ‏Preview server: ‏port 5180 (אם רץ; ‏אחרת ‏`bun run --filter find-letter-game preview --port 5180 --host 0.0.0.0`)
‏- ‏TTS preview server: ‏port 8878 (יוקם ב-sub-phase 4.1)
‏- ‏Tunnel TTS: ‏`https://musicode-find-letter-tts.nue.tuns.sh` (יוקם ב-sub-phase 4.1)
‏- ‏Gemini CLI: ‏`gemini -p "..." @path.mp3`
‏- ‏Active app tunnel: ‏`https://musicode-find-letter.nue.tuns.sh`

## ‏Complexity Score Breakdown

```
Integration / Data flow: 0
Code surface:
[ ] Refactor: 0
[ ] >5 files: 0 (~3 files: letters.ts, letters.test.ts, walkthrough)
[ ] State machine: 0

External:
[ ] ספרייה חיצונית חדשה: 0
[ ] DOM mutation: 0

Risk:
[X] Test coverage <70% על UI חדש: 0 (אין UI חדש)
[X] Deploy לפרודקשן: 0 (אין deploy בסקופ — רק R2)

Mitigators:
[X] Pure data + automation: -2
[X] Greenfield (אין call sites חדשים): -1

Total: 0 - 2 - 1 = -3 → 0
Tier: light only, no verifier-phase

(הציון נמוך כי השינוי הוא רובו data + scripts. הסיכון העיקרי הוא איכות
TTS, וזה לא מודד code complexity.)
```

## ‏Decision Points (חזרה ל-Opus + משתמש)

### ‏Point 1 — ‏אחרי חיריק (sub-phase 4.2)

```
STATUS: NEEDS_DECISION
טופס:

‏Pilot חיריק הסתיים. ‏~20 קבצים ב-tts-review/batch/hirik/.
‏URL לבדיקה: ‏https://musicode-find-letter-tts.nue.tuns.sh/hirik.html

‏Gemini judge:
- ‏תקינים: X/20
- ‏מסומנים בעייתיים: Y/20 (פירוט: ...)
- ‏אני ממליץ variants ל: ... (פירוט)

‏ממתין: ‏(א) ‏המשך לbatch מלא? ‏(ב) ‏iteration על קבצים בעייתיים? ‏(ג) ‏עצירה?
```

### ‏Point 2 — ‏אחרי batch מלא (sub-phase 4.3)

```
STATUS: NEEDS_DECISION
טופס:

‏Batch מלא הסתיים. ‏~160 קבצים ב-tts-review/batch/.
‏URL לבדיקה: ‏https://musicode-find-letter-tts.nue.tuns.sh/all.html

‏Gemini judge: X/160 תקינים, Y/160 בעייתיים.
‏שיתופים מאומתים: Z זוגות.
‏Variants מומלצים לבעייתיים: ...

‏ממתין: ‏(א) ‏אישור להעלאה ל-R2? ‏(ב) ‏iteration? ‏(ג) ‏עצירה?
```

## ‏Verifier-slice-light ‏תזכורת

‏בסיום (אחרי sub-phase 4.5):

```
Task(subagent_type="verifier-slice-light", prompt="""
brief: apps/find-letter-game/docs/plans/briefs/phase-4-tts-batch-production-brief.md
slice: phase-4-tts-batch-production
base commit: 1734847
environment: preview port 5180, browser linux-gui+pw-clean.sh, R2 R/O ב-https://static.tzlev.ovh/shared/tts/find-letter/
""")
```

---

*‏Brief נכתב ע"י Opus, 2026-05-17. ‏גרסה 1.*
