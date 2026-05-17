---
phase: phase-2-consonant-support
verifier-slice: light
complexity-score: 1
---

# ‏Phase 2 — חשיפת UI ניקוד + תמיכה בעיצור

## ‏Context

‏תכנון אסטרטגי: [`../vowels-support-plan.md`](../vowels-support-plan.md) — ‏פאזה 2
‏אזהרות Sonnet: [`../sonnet-pitfalls.md`](../sonnet-pitfalls.md)
‏מקור ייצור TTS: [`../../tts-review/README.md`](../../tts-review/README.md)
‏פאזה קודמת (מבוצעת): [`./archive/phase-1-letter-vowel-refactor-brief.md`](./archive/phase-1-letter-vowel-refactor-brief.md) (commit `00bf317`)

‏בפאזה 1 הוקמה תשתית `Letter` + `Vowel` + `LetterVowelPair`. ‏הvowel `none` כבר קיים במאגר ‏(`src/lib/data/vowels.ts`) ‏אבל לא חשוף למשתמש. ‏בפאזה הזו ‏נחשוף אותו: ‏fieldset חדש ב-`/settings`, ‏ייצור MP3 לעיצור, ‏וטיפול בגרוניות.

## ‏Scope

### ‏מה כן

‏- ‏ייצור 24 קבצי MP3 לעיצור לאותיות לא-גרוניות ‏(`'בְּ'`, ‏`'גְּ'`, ‏וכו').
‏- ‏ניסוי + הצעה (לא בחירה סופית — ‏ראה §Decision Point) ‏ל-2 הגרוניות (א, ע) + עיצור.
‏- ‏הוספת ‏`TTS_FILES` ‏entries חדשים.
‏- ‏Component חדש: ‏`VowelSelectionGrid.svelte` ‏(דומה ל-`LetterSelectionGrid`).
‏- ‏שילוב ב-`/settings/+page.svelte` ‏כ-section בפני עצמו.
‏- ‏עדכון `language.ts` ‏עם שמות הניקודים + תוויות UI חדשות.
‏- ‏ולידציה: ‏מינימום ניקוד אחד נבחר.

### ‏מה לא

‏- ‏אין הוספת ניקודים מעבר ל-`patah` ‏ו-`none`. ‏שאר 10 — ‏פאזה 3.
‏- ‏אין סופיות. ‏פאזה 4.
‏- ‏אין שינוי בלוגיקת ‏`isValidCombination` ‏(תמיד true בפאזה זו).
‏- ‏אין שינוי ב-similarity logic.
‏- ‏אין שינוי במבנה ה-data של ‏`Letter`, ‏`Vowel`, ‏או ‏`LetterVowelPair`.

## ‏Sub-phases

### ‏Sub-phase 2.1: ‏עדכון language.ts + שמות ניקודים

‏Testing: **`none`** ‏(string additions, ‏typecheck יתפוס breakage)

‏הוסף ל-`src/lib/services/language.ts`:

```ts
// === בחירת ניקוד ===
vowelSelectionHeader: 'ניקוד להצגה',
vowelSelectionHint: 'אילו סוגי ניקוד יופיעו בלוח',
minimumVowelsHint: 'יש לסמן לפחות סוג ניקוד אחד',

// שמות הניקודים
vowelNamePatah: 'פתח',
vowelNameNone: 'עיצור',
```

‏**הקפד**: ‏הסדר בקובץ מוסדר בקטגוריות (`// === ... ===`). ‏הכנס את הסעיף החדש אחרי "בחירת אותיות" ‏ולפני "הגדרות TTS".

### ‏Sub-phase 2.2: ‏ייצור MP3 — 24 אותיות לא-גרוניות

‏Testing: **`manual`** ‏(TTS quality control — ‏ראה sonnet-pitfalls §3.1)

‏**רשימת הצירופים לייצור** ‏(לפי `pair.id` ‏מ-`makePair(letter, none_vowel)`):

‏בסיבוב 1, ‏אותיות שנשמעות זהה מבחינה צלילית חלקו קובץ MP3 ‏(`Sa.mp3` = ‏ס+שׂ, ‏`Va.mp3` = ‏ו+ב רפה, ‏וכו'). ‏אותה לוגיקה חלה כאן: ‏אם Gemini ‏אומר ש-`'סְ'` ‏ו-`'שְׂ'` ‏נשמעים זהה — ‏MP3 משותף ‏(שתי שורות ב-`TTS_FILES` שמצביעות לאותו filename).

‏**ייצור unique MP3 — צריך ~18 קבצים, לא 24:**

| ‏Letter.id | ‏speak | ‏שם קובץ מוצע | ‏שיתוף עם |
|-----------|--------|----------------|------------|
| ‏b | ‏בְּ | ‏B.mp3 | — |
| ‏g | ‏גְּ | ‏G.mp3 | — |
| ‏d | ‏דְּ | ‏D.mp3 | — |
| ‏h | ‏הְ | ‏H.mp3 | — |
| ‏v | ‏וְ | ‏V.mp3 | ‏va_rafe ‏(אותו צליל) |
| ‏z | ‏זְ | ‏Z.mp3 | — |
| ‏ch | ‏חְ | ‏Ch.mp3 | ‏cha_rafe ‏(אותו צליל) |
| ‏t | ‏טְ | ‏T.mp3 | ‏tav ‏(אותו צליל — ‏ת=ט בסיבוב 1) |
| ‏y | ‏יְ | ‏Y.mp3 | — |
| ‏k | ‏כְּ | ‏K.mp3 | ‏q ‏(אם Gemini ‏מאשר זהות) |
| ‏l | ‏לְ | ‏L.mp3 | — |
| ‏m | ‏מְ | ‏M.mp3 | — |
| ‏n | ‏נְ | ‏N.mp3 | — |
| ‏s | ‏סְ | ‏S.mp3 | ‏sa_sin ‏(אותו צליל) |
| ‏p | ‏פְּ | ‏P.mp3 | — |
| ‏tz | ‏צְ ‏או ‏`'[Israeli accent] צְ'` | ‏Tz.mp3 | — |
| ‏r | ‏רְ ‏או ‏`'Re'` (פשרה) | ‏R.mp3 | — |
| ‏sh | ‏שְׁ | ‏Sh.mp3 | — |
| ‏fa_rafe | ‏`'F'` ‏או ‏`'Fə'` (תעתיק לטיני) | ‏F.mp3 | ‏נפרד מ-P.mp3 (צליל שונה!) |

**‏שיתופי קבצים — איך זה עובד טכנית:**

ב-`TTS_FILES` ‏(ב-`src/lib/utils/letters.ts`), ‏שתי entries מצביעות לאותו קובץ. ‏לדוגמה:

```ts
export const TTS_FILES: Record<string, string> = {
    // ... קיים
    'סְ': 'S.mp3',
    'שְׂ': 'S.mp3',   // ‏שיתוף עם 'סְ'
    'וְ': 'V.mp3',
    // (va_rafe ‏גם מייצר 'וְ' כי speakChar='ו', ‏אז זה אותו entry — ‏לא צריך כפילות)
    'חְ': 'Ch.mp3',
    // (cha_rafe ‏גם מייצר 'חְ' מאותה סיבה — ‏לא צריך כפילות)
    'טְ': 'T.mp3',
    'תְּ': 'T.mp3',   // ‏שיתוף ‏(ט=ת בסיבוב 1)
    'כְּ': 'K.mp3',
    'קְ': 'K.mp3',    // ‏שיתוף אם Gemini ‏מאשר
    // ...
};
```

‏שים לב: ‏עבור הרפות (`va_rafe`, ‏`cha_rafe`), ‏`makePair` ‏מייצר `speak` ‏זהה לאות הלא-רפה ‏(`'וְ'`, ‏`'חְ'`) ‏בזכות ‏`letter.speakChar ?? letter.char`. ‏אז ‏הם **לא צריכים entries חדשים** ‏ב-`TTS_FILES` — ‏הם ימצאו את הקיים אוטומטית. ‏אבל `fa_rafe` ‏שונה: ‏`speakChar` ‏שלו הוא תעתיק לטיני (`'F'` ‏או דומה), ‏אז הוא ‏יצריך entry נפרד ‏(`'F': 'F.mp3'` ‏או ‏`'Fə': 'F.mp3'`).

‏**Validation:** ‏בסוף הsub-phase, ‏הtest test הקיים ‏(`letters.test.ts` ‏#22) ‏יוודא שכל ה-`speak` ‏של ‏`ALL_LETTERS` ‏(שכולל את כל הpairs המייצרים את `selectedVowels = ['patah', 'none']`) ‏ממופים ב-`TTS_FILES`. ‏צריך **לעדכן את הtest** ‏שיכלול גם pairs עם vowel none.

**‏הערה לרפות:** ‏בפאזה 1, ‏`pair<va_rafe, none>.speak` ‏יבנה אוטומטית מ-`letter.char + vowel.speakSuffix`. ‏אבל ‏ה-`letter.char` ‏של ‏`va_rafe` ‏הוא `'ב'` ‏(האות עירומה) — ‏ייתן `'בְ'` ‏שלא נכון להגייה רפה. ‏צריך שיקול:

‏**אופציה א:** ‏`letter.char` ‏עבור ‏`va_rafe` ‏יישאר `'ב'`, ‏אבל ‏`pair.speak` ‏ייקח מאיפשהו את המידע שזה רפה ‏(אולי דרך `letter.legacyCardId === 'va_rafe'` ‏החזרת `'וְ'`). ‏מורכב.

‏**אופציה ב (פשוטה):** ‏`Letter` ‏יקבל שדה אופציונלי ‏`speakChar?: string` ‏שמכיל את ה-char להקראה ‏(שונה מ-`char` ‏שמכיל את הצורה הויזואלית). ‏עבור ‏`va_rafe`: ‏`char: 'ב'`, ‏`speakChar: 'ו'`. ‏עבור רוב האותיות, ‏`speakChar` ‏לא קיים → ‏`speak` ‏נוצר מ-`char`.

‏**ה-executor יבחר אופציה ב, ‏ויעדכן את `makePair`** ‏ב-`utils/pair.ts` ‏לקרוא ‏`speakChar ?? char`.

‏**Process פר קובץ** (לפי [`tts-review/README.md`](../../tts-review/README.md)):

1. ‏קרא ל-pair API דרך הפרוקסי AAC:
   ```sh
   curl -X POST https://aac-proxy.aybritman.workers.dev/v1/tts \
       -H "Content-Type: application/json" \
       -d '{"text":"<speak>","provider":"elevenlabs","voiceId":"EXAVITQu4vr4xnSDxMaL","modelId":"eleven_v3","lang":"he-IL"}'
   # ‏יחזיר hash
   curl -o tts-review/<Name>.mp3 https://aac-proxy.aybritman.workers.dev/v1/tts/<hash>
   ```
2. **‏אמת איכות עם Gemini כ-judge** — ‏זה הפתרון שעבד בסיבוב הקודם (`walkthrough.md` ‏שורה 467: ‏"במקום להאזין ידנית לכל אופציה ולנחש מה נשמע נכון, שלחנו את הקבצים ל-Gemini Vision/Audio לתמלול. ניתוח אובייקטיבי"):
   ```sh
   gemini -p "האזן לקובץ הזה. (1) מה הצליל ששמעת בדיוק? (2) האם זה תואם להברה 'בְּ' (b עם שווא נח — עיצור קצר ללא תנועה מלאה)? @tts-review/B.mp3"
   ```
   ‏אם Gemini אומר שזה לא תואם — ‏לא לעלות ל-R2, ‏לעשות variant.
3. ‏אם לא טוב — ‏ראה ‏**§TTS Production Playbook** ‏(למטה) ‏לטכניקות שעבדו בסיבוב הקודם. ‏שמור variants ב-`tts-review/variants/<Name>-v<N>-<description>.mp3`.
4. ‏כשמצאת קובץ טוב:
   ```sh
   bunx wrangler r2 object put --remote "tzlev-static/shared/tts/find-letter/<Name>.mp3" \
       --file tts-review/<Name>.mp3 --content-type "audio/mpeg"
   ```
5. ‏הוסף שורה ל-`TTS_FILES` ‏ב-`src/lib/utils/letters.ts`: ‏`'<speak>': '<Name>.mp3'`.
6. ‏עדכן ‏`tts-review/results.md` — ‏הוסף section ‏"## ‏פאזה 2 — עיצור" ‏ותעד פר אות: ‏speak שעבד, ‏Gemini transcription, ‏variants שנדחו ‏ולמה.

**‏Pitfall קריטי** (‏מ-`sonnet-pitfalls.md` §3.1): ‏**אסור** ‏לייצר את כל 24 הקבצים ‏ב-loop ‏ולסיים. ‏חובה אימות איכות פר קובץ עם Gemini. ‏אם Gemini מדווח על בעיה — ‏variant מיידי, ‏לא להמשיך לקובץ הבא.

### ‏TTS Production Playbook — ‏לקחים מסיבוב 1 (קריטי לקרוא)

‏סיבוב 1 (פאזה ראשונה של המשחק, ‏לפתח) ‏לימד אילו טכניקות עבדו ‏ואילו לא. ‏מקור: ‏`docs/walkthrough.md` ‏שורות 227-298, ‏ו-`tts-review/README.md`. ‏סיכום עבור עיצור (פאזה 2):

**‏אותיות בעייתיות שאתה כמעט בטוח תיתקל בהן** ‏(לפי מה שראינו בפתח):

| ‏אות | ‏מה קרה בסיבוב 1 (פתח) | ‏מה כנראה יקרה לעיצור | ‏פתרון מומלץ |
|------|------------------------|-------------------------|-----------------|
| ‏פ רפה ‏(`fa_rafe`) | ‏Sarah מתעלמת מ-`ָ`/`ַ` ‏בעברית, ‏מבטאת "p" תמיד | ‏אותה בעיה — `'פְ'` תצא "p" | **‏התחל ישר** ‏עם תעתיק לטיני: ‏`'F'`, ‏`'Fə'`, ‏או ‏`'Ff'`. ‏אל תנסה ‏`'פְ'`. |
| ‏צ ‏(`tz`) | ‏`צָא` נשמע ‏"Sa"; ‏נדרש ‏`[Israeli accent] צַה` | ‏סביר ש-`'צְ'` יצא "s" | ‏נסה ‏`'[Israeli accent] צְ'` ‏קודם. ‏אם לא — ‏תעתיק ‏`'Ts'` ‏או ‏`'Tsə'`. |
| ‏ז ‏(`z`) | ‏`זָא` נשמע "Zoa"; ‏נדרש `זַה` | ‏אין תנועה לבלוע — ‏סביר ש-`'זְ'` ‏יעבוד | ‏התחל עם ‏`'זְ'`. ‏אם נשמע מוזר, ‏נסה ‏`'Z'`. |
| ‏ר ‏(`r`) | ‏American R — ‏לא נפתר, ‏פשרה | ‏אותה בעיה — ‏American R | **‏פשרה.** ‏השתמש ב-`'רְ'` ‏(או ‏`'Re'` ‏אם רוצים לוודא R קצר ולא ארוך). ‏לא לבזבז זמן על variants — ‏זו מגבלת המודל. |
| ‏ח ‏(`ch`) | ‏`חָה` נבלע ל-"הָ" (סיומת `ה` בלעה את העיצור) | ‏אין `ה` בעיצור → ‏סביר שיעבוד | ‏התחל עם ‏`'חְ'`. ‏סביר שעובד. |
| ‏ט ‏(`t`) | ‏`טָה` נבלע ל-"הָ" — ‏אותה בעיה | ‏אין `ה` בעיצור → ‏סביר שיעבוד | ‏התחל עם ‏`'טְ'`. |
| ‏ק ‏(`q`) | ‏בסיבוב 1 אוחד עם כּ (אותו MP3) | ‏לעיצור — ‏האם להפריד? | ‏יצור MP3 נפרד ל-`'קְ'`. ‏אם Gemini ‏אומר שזה זהה ל-`'כְּ'`, ‏ה-executor יכול להציע ל-Opus איחוד. |

**‏טכניקות שעבדו בסיבוב 1 (לפי סדר עדיפות):**

1. **‏ההברה העברית הטבעית** ‏(`'בְּ'`, ‏`'גְּ'`, ‏וכו') ‏— ‏ברירת המחדל. ‏עובד לרוב האותיות הלא-בעייתיות.
2. **‏Audio tags של eleven_v3** ‏— ‏`'[Israeli accent] <heb>'`. ‏עבד ל-Tsa בסיבוב 1, ‏לא ל-Ra.
3. **‏תעתיק לטיני קצר** ‏— ‏כשעברית לא עובדת. ‏עבד ל-Fa בסיבוב 1. ‏פורמטים: ‏`'F'`, ‏`'Fə'`, ‏`'Ts'`, ‏`'Be'`, ‏וכו'. ‏שווא נשמע כמו "e" קצר באנגלית או "ə" (schwa).
4. **‏שינוי תנועה/הברה** ‏— ‏פחות רלוונטי לעיצור (אין תנועה).

**‏סדר ביצוע מומלץ ‏(הקטנת עומס):**

1. ‏התחל בקלות: ‏g, d, l, m, n, s, sh, sa_sin, b, k, p, tav — ‏סביר שיעבדו ‏עם ‏ההברה הטבעית.
2. ‏עבור לבעייתיות: ‏fa_rafe (תעתיק לטיני מהתחלה), ‏tz (audio tag או תעתיק), ‏r (פשרה), ‏va_rafe, ‏cha_rafe.
3. ‏אחרון — גרוניות (sub-phase 2.3, ‏נקודת החלטה).

**‏מה ‏**לא** ‏לעשות:**

‏- ‏אל תיצור 24 קבצים ‏ב-loop ‏ולסיים — ‏Gemini פר קובץ.
‏- ‏אל תניח שמה שעבד בפתח עובד בעיצור — ‏Sarah מתנהגת שונה לפי תנועה.
‏- ‏אל תמשיך לקובץ הבא אם הנוכחי לא נסגר — ‏סיים אות לפני המעבר.
‏- ‏אל תעלה ל-R2 לפני אימות Gemini — ‏אם תעלה גרסה רעה, ‏cache הדפדפן (IndexedDB) ‏יחזיק אותה ויהיה קשה לדבג.
‏- ‏אל תבזבז זמן על Ra — ‏זו מגבלת מודל ידועה. ‏פשרה.

**‏החלטות שכבר נסגרו (‏ראה ‏`tts-review/README.md`):**

‏- ‏Voice: ‏Sarah ‏(`EXAVITQu4vr4xnSDxMaL`)
‏- ‏Model: ‏`eleven_v3`
‏- ‏Provider: ‏ElevenLabs דרך פרוקסי AAC
‏- ‏Cache: ‏R2 ‏אוטומטי + ‏IndexedDB צד-לקוח

‏**STATUS escalation:** ‏אם לאות מסוימת ‏3 variants ‏לא הצליחו, ‏ולא ברור איזה לבחור ‏(כמו Ra שלא נפתר) — ‏החזר ‏`STATUS: NEEDS_DECISION` ‏עם רשימת הvariants. ‏Opus יציג למשתמש.

### ‏Sub-phase 2.3: ‏גרוניות (א, ע) + עיצור — ‏ניסוי + ‏STATUS: NEEDS_DECISION

‏Testing: **`manual`**

‏המקרה המיוחד ‏(לפי ‏[`../vowels-support-plan.md`](../vowels-support-plan.md) §4.4):

‏הצליל הרצוי: ‏**glottal stop קצר עם שובל אוויר** — ‏"אֶה קצרצר" ‏או "מכת תוף". ‏לא ‏`אַה` ‏מלא, ‏לא שתיקה.

‏**הקשר מסיבוב 1 שכדאי לזכור:** ‏בסיבוב הקודם, ‏לא היה ניסיון להפיק "עיצור של גרונית". ‏הקובץ ‏`A.mp3` ‏שימש לא + ע ‏עם speak `אָא` ‏(= "אה" עם א דקורטיבית בסוף ‏ל-TTS stability), ‏כי הם תמיד הופיעו עם פתח. ‏בפאזה זו צריך משהו **שונה** — ‏גרונית עם שווא נח, ‏לא תנועה.

‏**שלוש דרכי מימוש לנסות** ‏(‏עבור כל אחת מ-`a` ‏ו-`aa`):

1. **‏הברה עברית עירומה (baseline)**:
   ‏- ‏`speak: 'אְ'`, ‏`speak: 'עְ'`
   ‏- ‏סביר שיצא כלום (Sarah מתעלמת מגרונית עם שווא נח). ‏ולידציה מהירה ב-Gemini.
   ‏- ‏שמור ‏ב-`tts-review/variants/A-shva-v1.mp3`, ‏`Aa-shva-v1.mp3`.
2. **‏תעתיק לטיני קצר**:
   ‏- ‏`speak: 'eh'`, ‏`speak: 'uh'`, ‏`speak: 'ah'` ‏(שלוש variants לאות)
   ‏- ‏ה-`ah` ‏אולי ייצא כתנועה מלאה ‏(לא רצוי), ‏אבל ‏`eh` ‏ו-`uh` ‏יכולים לתת glottal קצר.
   ‏- ‏שמור ‏ב-`tts-review/variants/A-eh-v2.mp3`, ‏`A-uh-v3.mp3`, ‏`A-ah-v4.mp3` ‏(וכן ל-Aa).
3. **‏Audio tags של eleven_v3**:
   ‏- ‏בסיבוב 1 ‏עבד ל-Tsa: ‏`[Israeli accent]` ‏שינה את אופי הצליל.
   ‏- ‏נסה: ‏`'[breath]'`, ‏`'[short ah]'`, ‏`'[grunt] ah'`, ‏`'[Israeli accent] אְ'`.
   ‏- ‏שמור ‏ב-`tts-review/variants/A-tag-breath-v5.mp3`, ‏`A-tag-shortah-v6.mp3`, ‏וכו'.

‏סה"כ ‏~14 variants (7 ‏לכל אות). ‏לא צריך לעשות את כולם — ‏3-5 לכל אות מספיקים. ‏Gemini יסנן את הברורים מראש.

‏**‏Process מומלץ ב-loop קצר:**

```
‏לכל variant:
  1. ייצור MP3 דרך proxy AAC עם הspeak
  2. שמירה ב-tts-review/variants/<Name>-<desc>-v<N>.mp3
  3. Gemini judge: "מה הצליל הזה? האם זה glottal stop קצר עם שובל אוויר?"
  4. תיעוד ב-tts-review/results.md
```

‏**אל תעלה ל-R2 ואל תוסיף ל-`TTS_FILES` עדיין.**

‏**בסיום:** ‏הוסף ל-`tts-review/results.md` ‏טבלה:

```markdown
## ‏פאזה 2 — גרוניות (א, ע) + עיצור

| ‏Variant | ‏speak | ‏Gemini transcription | ‏ה-executor ממליץ? | ‏הערות |
|----------|--------|----------------------|--------------------|--------|
| ‏A-shva-v1 | `אְ` | "שתיקה" | ❌ | ... |
| ‏A-eh-v2 | `eh` | "eh" קצר | ✅ קרוב | ... |
| ‏A-tag-breath-v5 | `[breath]` | "שאיפה קצרה" | ⚠️ אולי | ... |
| ...
```

‏**Return STATUS** ‏מה-executor: ‏`NEEDS_DECISION` ‏עם:

‏- ‏רשימת הvariants ‏ו-file paths
‏- ‏Gemini transcription לכל אחד
‏- ‏המלצת ה-executor: ‏איזה variant הכי קרוב ל-"מכת תוף / אֶה קצר" ‏בכל אות
‏- ‏אופציונלי: ‏URL להאזנה ‏(דרך tuns.sh ‏או linux-gui)

‏Opus יציג למשתמש, ‏יקבל החלטה, ‏יחזיר לexecutor להמשך עם 2 קבצי המבחר ‏(`A.mp3`, ‏`Aa.mp3`) — ‏העלאה ל-R2 ‏+ ‏עדכון `TTS_FILES`.

‏**אם כל הvariants גרועים** ‏— ‏אפשרות נוספת: ‏לא להציע "עיצור" עבור גרוניות בכלל. ‏`isValidCombination(a_or_aa, none) === false`. ‏זה דורש שינוי בעדכון `pair.ts` ‏וסינון ב-`generateDeck`. ‏לא מועדף ‏אבל קיים כ-fallback.

### ‏Sub-phase 2.4: ‏VowelSelectionGrid.svelte ‏(component חדש)

‏Testing: **`manual`** ‏(UI)

‏צור ‏`src/routes/_components/VowelSelectionGrid.svelte`:

‏- ‏API דומה ל-`LetterSelectionGrid`:
  ```ts
  interface Props {
      selectedCodes: VowelCode[];
      onChange: (next: VowelCode[]) => void;
  }
  ```
‏- ‏מקור הvowels: ‏`ALL_VOWELS` ‏מ-`$lib/data/vowels`.
‏- ‏שמות התצוגה: ‏מ-`language.vowelNamePatah`, ‏`language.vowelNameNone` ‏— ‏או דרך mapping ‏`vowelDisplayName(code) => language[`vowelName${capitalize(code)}`]`.
‏- ‏Buttons: ‏`selectAll`, ‏`clearAll` ‏(שאיף לפחות 1), ‏`resetToDefault` ‏(מחזיר ל-`['patah']`).
‏- ‏ולידציה visuelle: ‏אם ‏`selectedCodes.length < 1` ‏→ ‏הצג ‏`language.minimumVowelsHint`.
‏- ‏סגנון: ‏עקוב אחרי הסגנון של ‏`LetterSelectionGrid` ‏(same `.letter-grid-wrap`, ‏`.grid-actions`, ‏`.letter-btn` patterns). ‏הצג את ה-`vowel.displayName` ‏בכפתור ‏(לא את ה-mark — ‏אין מה להראות ל-`none`, ‏ופתח לבד גם לא קריא).

### ‏Sub-phase 2.5: ‏שילוב בעמוד ההגדרות

‏Testing: **`integration`**

‏עדכן ‏`src/routes/settings/+page.svelte`:

‏- ‏Import: ‏`VowelSelectionGrid` ‏+ ‏`type VowelCode`.
‏- ‏הוסף section חדש **אחרי** ‏section "בחירת אותיות" ‏(שורה ~206) ‏ולפני ‏section "הגדרות חיזוקים" ‏(שורה ~209):

```svelte
<!-- ‏Section: בחירת ניקוד -->
<section class="card">
    <h2 class="card-title">{language.vowelSelectionHeader}</h2>
    <p class="muted small">{language.vowelSelectionHint}</p>
    <VowelSelectionGrid
        selectedCodes={settings.selectedVowels}
        onChange={(next) => (settings.selectedVowels = next)}
    />
</section>
```

‏אין שינויים אחרים ב-`/settings`.

### ‏Sub-phase 2.6: ‏Mockup compliance audit + ‏בדיקה ידנית

‏Testing: **`manual`**

1. ‏Build: ‏`bun run --filter find-letter-game build`.
2. ‏Preview: ‏`bun run --filter find-letter-game preview --port 5180`.
3. ‏פתח דפדפן ‏(linux-gui + pw-clean.sh) ‏ב-`http://localhost:5180`.
4. ‏Mobile (390×844):
   ‏- ‏Screenshot ‏`/settings` — ‏מציג את ה-fieldset החדש של ניקוד עם פתח+עיצור.
   ‏- ‏בחר רק עיצור ‏→ ‏`/play` ‏→ ‏Screenshot של הלוח (כרטיסים עם `בְּ`, `גְּ` וכו').
   ‏- ‏לחץ על אות נכונה ‏→ ‏Screenshot של ‏success state.
   ‏- ‏בחר רק פתח ‏→ ‏Screenshot של הלוח (כרטיסים עם `בַּ`, `גַ` וכו', ‏זהה לפני הפאזה).
   ‏- ‏בחר את שניהם ‏→ ‏Screenshot של לוח מעורב.
5. ‏Desktop (1280×800): ‏חזרה על אותם screenshots.
6. ‏שמור ‏ב-`/tmp/find-letter-phase-2/`.
7. ‏וודא ‏שאם המשתמש מנסה לבטל את כל הניקודים, ‏ה-UI מציג את ‏`minimumVowelsHint` ‏ולא מאפשר.

## ‏Data Flow Bridges

| Producer | Consumer | Data | Mechanism | קובץ:שורה |
|----------|----------|------|-----------|-----------|
| ‏VowelSelectionGrid | ‏settings store | ‏`VowelCode[]` | ‏`onChange={(next) => settings.selectedVowels = next}` | settings/+page.svelte (section חדש) |
| ‏settings.selectedVowels | ‏game-state.startBoard | ‏array של codes | ‏`generateDeck(settings.selectedLetterIds, settings.selectedVowels)` | game-state.svelte.ts:94 (קיים) |
| ‏`pair.speak` עבור `<letter, none>` | ‏TTS | string (`'בְּ'`, וכו') | ‏`speak(this.target.speak)` → ‏`getTtsFilename(speak)` → ‏fetch מ-R2 | game-state.svelte.ts:148 + tts.ts |
| ‏Letter.speakChar (חדש) | ‏makePair | ‏char שונה מ-`char` עבור רפות | ‏`makePair` ‏יקרא ‏`letter.speakChar ?? letter.char` | utils/pair.ts |

## ‏DELETE blocks

‏בפאזה זו **אין מחיקות**. ‏הכל תוספות.

## ‏Anti-patterns

‏מתוך `sonnet-pitfalls.md`:

‏- ‏**3.1** — ‏Batch MP3 production ‏ללא האזנה. ‏**אסור.** ‏פר קובץ: ‏הקלטה → ‏האזנה → ‏אישור.
‏- ‏**3.2** — ‏גרוניות + עיצור: ‏אל תקבל את ה-`speak: 'אְ'` ‏באלת ברירת מחדל בלי בדיקה.
‏- ‏**4.1** — ‏Settings → game-state. ‏כש-`selectedVowels` משתנה ב-settings ‏(דרך VowelSelectionGrid), ‏ה-deck נוצר מחדש רק ב-`startBoard()` הבא. ‏זה בסדר אם המשתמש משנה ניקוד ‏ב-`/settings` ‏ואז חוזר ל-`/play` ‏(`backToGame` ‏קורא ‏`gameState.resetGame()` ‏שקורא ‏`startBoard()`). ‏וודא שזה עובד.
‏- ‏**5.1** — ‏CSS שטח מת. ‏Mobile + desktop screenshots חובה.
‏- ‏**5.3** — ‏RTL: ‏`VowelSelectionGrid` ‏חייב לעבוד ב-RTL.

‏ספציפי לפאזה זו:

‏- ‏**`Letter.speakChar` ‏רק על רפות**: ‏אל תיתן ‏`speakChar` ‏ל-26 האותיות. ‏רק ‏`va_rafe`, ‏`cha_rafe`, ‏`fa_rafe`. ‏בכל מקום אחר ‏`speakChar` ‏נשאר ‏`undefined` ‏ו-`makePair` ‏יפול ל-`letter.char`.
‏- ‏**`displayChar` ‏לעומת ‏`char` ‏לעומת ‏`speakChar`** — ‏שלושתם שונים עבור ‏`b`:
  ‏- ‏`char: 'ב'` ‏(עירומה — בסיס לחישוב speak)
  ‏- ‏`displayChar: 'בּ'` ‏(עם דגש — מה שהמשתמש רואה)
  ‏- ‏`speakChar`: ‏לא קיים (`char` ‏מספיק)
  
  ‏ועבור ‏`va_rafe`:
  ‏- ‏`char: 'ב'` ‏(עירומה — visual base)
  ‏- ‏`displayChar: 'ב'` ‏(רפה ויזואלית — אותה צורה)
  ‏- ‏`speakChar: 'ו'` ‏(הקראה כ-ו)
‏- ‏**fa_rafe ייצור F.mp3 חדש לעיצור**: ‏בפתח השתמש בתעתיק לטיני ‏(`'Fa'`). ‏לעיצור — ‏נסה ‏`'F'` ‏או ‏`'fə'` ‏ידנית. ‏אם eleven_v3 לא נותן צליל טוב — ‏נדון. ‏סמן ‏ב-`results.md`.
‏- ‏**אל תיגע ב-`speak` של pair `<letter, patah>`** ‏— ‏זה מבטיח תאימות לאחור.

## ‏DoD

‏- [ ] ‏`bun run check` ‏ירוק (0 errors מקוד שלנו)
‏- [ ] ‏`bun test` ‏ירוק
‏- [ ] ‏24 קבצי MP3 לעיצור (לא-גרוניות) ‏הועלו ל-R2 ‏אחרי האזנה ידנית. ‏תיעוד ב-`tts-review/results.md`.
‏- [ ] ‏Variants לגרוניות (א, ע) ‏יוצרו ושמורים ב-`tts-review/variants/`. ‏`STATUS: NEEDS_DECISION` ‏נמסר ל-Opus.
‏- [ ] ‏אחרי החלטת המשתמש: ‏2 הקבצים שנבחרו (`A.mp3`, ‏`Aa.mp3` ‏או שמות אחרים) ‏הועלו ל-R2 ‏ונרשמו ב-`TTS_FILES`.
‏- [ ] ‏`Letter.speakChar` ‏הוסף ל-type ‏וב-3 הרפות בלבד.
‏- [ ] ‏`makePair` ‏משתמש ב-`letter.speakChar ?? letter.char`.
‏- [ ] ‏`VowelSelectionGrid.svelte` ‏נוצר ופעיל.
‏- [ ] ‏`/settings` ‏מציג section חדש "ניקוד להצגה" ‏עם 2 checkboxes.
‏- [ ] ‏Screenshots: ‏מובייל + דסקטופ × ‏(`/settings`, ‏`/play` עם פתח בלבד, ‏`/play` עם עיצור בלבד, ‏`/play` עם שניהם, ‏success state עם עיצור).
‏- [ ] ‏E2E flow ידני: ‏שינוי בחירת ניקוד ב-`/settings` ‏משפיע על הלוח הבא.
‏- [ ] ‏ולידציה: ‏אי-אפשר לבחור 0 ניקודים (UI hint מוצג).
‏- [ ] ‏תיעוד ב-`docs/walkthrough.md` ‏של פאזה 2.

## ‏Environment notes

‏- ‏Working directory: ‏`/home/user/projects/learn-games-project/apps/find-letter-game`
‏- ‏Monorepo root: ‏`/home/user/projects/learn-games-project`
‏- ‏Dev server: ‏`bun run --filter find-letter-game dev` (port 5179, host 0.0.0.0)
‏- ‏Preview server: ‏port 5180
‏- ‏Browser: ‏linux-gui + ‏`pw-clean.sh` (לא playwright-cli רגיל)
‏- ‏TTS proxy: ‏`https://aac-proxy.aybritman.workers.dev` (cred מנוהל בפרוקסי, ‏לא נדרש API key אצלך)
‏- ‏R2 CLI: ‏`bunx wrangler r2 object put --remote ...` ‏(מצריך wrangler מאומת — ‏אם נכשל, ‏STOP ובקש מ-Opus)
‏- ‏Active tunnel: ‏`https://musicode-find-letter.nue.tuns.sh` ‏(ל-dev server)
‏- ‏Test: ‏`bun test` ‏מ-find-letter-game

## ‏Complexity Score Breakdown

```
Integration / Data flow:
[ ] ‏Cross-store data flow חדש                       0  (אותו flow קיים, ‏רק axis נוסף)
[ ] ‏Streaming / real-time                            0
[ ] ‏Protocol contract חדש                            0  (אותה API של פרוקסי AAC)

Code surface:
[ ] ‏Refactor של קוד קיים                            0  (תוספות)
[ ] >5 files touched ב->2 packages                  0  (כל ה-files באותו package)
[ ] ‏State machine / async coordination               0

External dependencies:
[ ] ‏ספרייה חיצונית חדשה                              0
[ ] ‏DOM mutation / monkey-patching                  0

Risk indicators:
[ ] 3 הslices האחרונים החזירו bugs                  0
[X] ‏Test coverage <70% ‏על UI חדש                    +1  (manual mostly)
[X] ‏Deploy לפרודקשן מיד אחרי הסליס                  +2

Mitigators:
[ ] ‏Pure logic                                       0  (יש UI + IO ל-TTS proxy)
[X] ‏TDD על behavior חדש                              -1  (logic של makePair וsettings ב-TDD)
[X] ‏Greenfield (UI חדש)                              -1  (VowelSelectionGrid אין שום call site קיים)

Total: 1 + 2 - 1 - 1 = 1
Tier: light only, no verifier-phase
```

## ‏Decision Point — ‏גרוניות + עיצור

‏בסוף ‏sub-phase 2.3, ‏ה-executor חייב להחזיר:

```
STATUS: NEEDS_DECISION
טופס:

‏מצורפים variants לאות א:
- ‏tts-review/variants/A-eh-v1.mp3 ‏(speak: 'eh')
- ‏tts-review/variants/A-uh-v2.mp3 ‏(speak: 'uh')
- ‏tts-review/variants/A-tag-shortah-v3.mp3 ‏(speak: '[short ah]')
- ‏(ועוד)

‏מצורפים variants לאות ע:
- ...

‏אני ממליץ על: ‏<X> ‏לאות א, ‏<Y> ‏לאות ע, ‏על בסיס: <reason>

‏ממתין להחלטה לפני העלאה ל-R2.
```

‏Opus יציג למשתמש, ‏יקבל החלטה, ‏ויחזיר לexecutor ‏(דרך תשובה לאותו task) ‏עם השמות הסופיים. ‏ה-executor ישלים את ‏העלאה ל-R2 ‏+ ‏עדכון `TTS_FILES` ‏ויעבור ל-sub-phase 2.4.

## ‏Verifier-slice-light ‏תזכורת

‏בסיום הביצוע (לפני commit):

```
Task(subagent_type="verifier-slice-light", prompt="""
brief: apps/find-letter-game/docs/plans/briefs/phase-2-consonant-support-brief.md
slice: phase-2-consonant-support
base commit: 00bf317
environment: dev server port 5179, browser linux-gui+pw-clean.sh, R2 R/O verification ב-https://static.tzlev.ovh/shared/tts/find-letter/
""")
```

‏ה-verifier יבדוק:

‏- ‏השדה ‏`selectedVowels` ‏ב-settings מתחבר ל-UI חדש
‏- ‏בחירה רק "עיצור" → ‏הלוח מציג ‏`בְּ` ‏וכו'
‏- ‏בחירה רק "פתח" → ‏הלוח זהה לפאזה 1
‏- ‏בחירת שניהם → ‏לוח מעורב
‏- ‏TTS מנגן MP3 עבור עיצור (לא Web Speech fallback)
‏- ‏ולידציה ‏של 0 ניקודים
‏- ‏Mobile + desktop screenshots

‏הדוח יישמר ב-`apps/find-letter-game/docs/plans/verification/phase-2-consonant-support-report.md`.

---

*‏Brief נכתב ע"י Opus, 2026-05-17. ‏גרסה 1.*
