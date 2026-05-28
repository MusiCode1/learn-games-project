# כל ההברות המוקלטות — Speak Texts Reference

> ‏תיעוד מלא של ה-text שנשלח ל-ElevenLabs/AAC ליצירת כל קובץ MP3 בשימוש במשחק.
> נכון ל-2026-05-28, אחרי הסרת חטף-פתח וחטף-סגול.
>
> **מקור-אמת לקוד**: ‏`src/lib/data/letters.ts`, `src/lib/data/vowels.ts`, `src/lib/utils/letters.ts`.
> **לוגיקת ה-Eleven overrides**: `tts-review/produce-batch.ts:computeSpeak()`.

---

## מקרא

| מונח | פירוש |
|------|--------|
| **‏App key** | ה-key ב-`TTS_FILES` של המשחק. ‏מיוצר ב-runtime ע"י `makePair(letter, vowel).speak` — בדרך כלל `(letter.speakChar ?? letter.char) + vowel.speakSuffix`. עבור פתח: `letter.legacySpeakPatah`. |
| **‏Speak ל-Eleven** | ה-text שנשלח בפועל ל-ElevenLabs ליצירת ה-MP3. ‏לעיתים שונה מ-app key (override ב-`computeSpeak` כדי לעקוף כשלים של המודל). |
| **‏Variant נבחר** | במקרים שבהם המשתמש בחר variant אלטרנטיבי על-פני ה-master (סבב 5 — סקירת איכות 2026-05-28). |

‏בכל הטבלאות: אם **Speak ל-Eleven** זהה ל-**App key**, הוא לא מצוין שוב (cell ריק = זהה).

---

## 1. ‏פתח (flat)

‏20 קבצים. ‏יוצרו בסבב 1 ע"י ElevenLabs (Sarah/eleven_v3). ה-master של כל המשחק.

| Letter id | תווית | App key | Speak ל-Eleven | Filename | הערות |
|-----------|--------|---------|------------------|----------|--------|
| `a` | א | אָא | | A.mp3 | |
| `b` | בּ | בָּא | | Ba.mp3 | |
| `g` | ג | גָא | | Ga.mp3 | |
| `d` | ד | דָא | | Da.mp3 | |
| `h` | ה | הָא | | Ha.mp3 | |
| `v` | ו | וָא | | Va.mp3 | |
| `z` | ז | זַה | | Za.mp3 | חריג: `זַה` ולא `זָא` (Sarah מבטאת `זָא` כמו "Zha") |
| `ch` | ח | חָא | | Cha.mp3 | |
| `t` | ט | טָא | | Ta.mp3 | |
| `y` | י | יָא | | Ya.mp3 | |
| `k` | כּ | כָּא | | Ka.mp3 | |
| `l` | ל | לָא | | La.mp3 | |
| `mm` | מ | מָא | | Ma.mp3 | |
| `nn` | נ | נָא | | Na.mp3 | |
| `s` | ס | סָא | | Sa.mp3 | |
| `p` | פּ | פָּא | | Pa.mp3 | |
| `tz` | צ | `[Israeli accent] צַה` | | Tsa.mp3 | חריג: accent tag + לא `ָא` (`[Israeli accent]` = tag של eleven_v3) |
| `r` | ר | רָא | | Ra.mp3 | פשרה — American R |
| `sh` | שׁ | שָׁא | | Sha.mp3 | |
| `f_rafe` | פ | Fa | | Fa.mp3 | תעתיק לטיני (Sarah אינה מבטאת `פָ` רפה) |

‏**שותפים בקבצים** (אותו `.mp3`, אבל אפליקציה מייצרת key שונה):
‏- `q` (ק) → `כָּא` → ‏Ka.mp3
‏- `tav` (תּ) → `טָא` → ‏Ta.mp3
‏- `sin` (שׂ) → `סָא` → ‏Sa.mp3
‏- `aa` (ע) → `אָא` → ‏A.mp3
‏- `v_rafe` (ב) → `וָא` → ‏Va.mp3
‏- `ch_rafe` (כ) → `חָא` → ‏Cha.mp3

---

## 2. ‏קמץ (flat — משותף עם פתח + 10 overrides)

‏עבור 16 אותיות, ה-key של קמץ זהה ל-key של פתח (אותו צליל "a") → מצביע על אותו MP3.
‏עבור 10 אותיות, ה-key שונה (כי `char` ≠ `displayChar` או יש חריג ב-legacy):

| Letter id | App key (קמץ) | Filename | מדוע שונה מפתח? |
|-----------|----------------|----------|-------------------|
| `b` | בָא | Ba.mp3 | פתח='בָּא' (דגש), קמץ ללא דגש |
| `k` | כָא | Ka.mp3 | פתח='כָּא' (דגש), קמץ ללא דגש |
| `p` | פָא | Pa.mp3 | פתח='פָּא' (דגש), קמץ ללא דגש |
| `tav` | תָא | Ta.mp3 | פתח='טָא' (חריג shared), קמץ משתמש ב-char='ת' |
| `z` | זָא | Za.mp3 | פתח='זַה' (חריג), קמץ standard |
| `tz` | צָא | Tsa.mp3 | פתח='[Israeli accent] צַה' (חריג), קמץ standard |
| `q` | קָא | Ka.mp3 | פתח='כָּא' (shared), קמץ משתמש ב-char='ק' |
| `aa` | עָא | A.mp3 | פתח='אָא' (shared), קמץ משתמש ב-char='ע' |
| `sh`+`sin` | שָא | Sha.mp3 | פתח='שָׁא' (עם שיניים), קמץ ללא שיניים |
| `f_rafe` | `Fָא` | Fa.mp3 | פתח='Fa' (Latin), קמץ עוקב לוגיקת חוקית (Latin F + נקודה עברית) |

**ל-Eleven לא נשלח כלום בייצור — אין קבצים ייעודיים לקמץ**. כל ה-keys שלמעלה ממופים ל-MP3 קיימים של פתח (ע"י אופי ההבחנה הצליל זהה במבטא ישראלי).

---

## 3. עיצור (שווא נח, `none`, flat)

‏23 קבצים. ‏יוצרו בסבב 2.

| Letter id | App key | Speak ל-Eleven | Filename | הערות |
|-----------|---------|------------------|----------|--------|
| `a` | אְ | — | (NEEDS_DECISION) | ממתין: גרונית + עיצור = בלתי-מובן ב-Sarah |
| `b` | בְ | | B.mp3 | |
| `g` | גְ | `[Israeli accent] גְ` | G.mp3 | |
| `d` | דְ | | D.mp3 | |
| `h` | הְ | | H.mp3 | |
| `v` | וְ | | V.mp3 | |
| `z` | זְ | `[Israeli accent] זְ` | Z.mp3 | |
| `ch` | חְ | | Ch.mp3 | |
| `t` | טְ | `[Israeli accent] טְ` | T.mp3 | |
| `y` | יְ | `[Israeli accent] יְ` | Y.mp3 | |
| `k` | כְ | `[Israeli accent] כְּ` | K.mp3 | |
| `l` | לְ | | L.mp3 | |
| `mm` | מְ | `[Israeli accent] מְ` | M.mp3 | |
| `nn` | נְ | | N.mp3 | |
| `s` | סְ | `[Israeli accent] סְ` | S.mp3 | |
| `p` | פְ | | P.mp3 | |
| `tz` | צְ | `[Israeli accent] צְ` | Tz.mp3 | |
| `r` | רְ | | R.mp3 | American R |
| `sh` | שְ | | Sh.mp3 | |
| `f_rafe` | `Fְ` | F | F.mp3 | Latin F + שווא |
| `aa` | עְ | — | (NEEDS_DECISION) | ממתין: גרונית + עיצור |

**שותפים בקבצים:**
‏- `q` (ק) → `קְ` → ‏K.mp3
‏- `tav` (ת) → `תְ` → ‏T.mp3
‏- `sin` (שׂ) → `שְ` → ‏Sh.mp3 (לא נפרד מ-sh — חוסר עקביות מודעת)
‏- `v_rafe` (ב) → `וְ` → ‏V.mp3
‏- `ch_rafe` (כ) → `חְ` → ‏Ch.mp3

---

## 4. ‏חיריק (`hirik/` — 23 קבצים)

‏Suffix: `ִי` (חיריק + יוד). ‏יוצר בסבב 3.

| Letter | App key | Speak ל-Eleven | Filename | Variant נבחר | הערות |
|--------|---------|------------------|----------|----------------|--------|
| א (a) | אִי | | hirik/Ai.mp3 | | |
| בּ (b) | בִּי | | hirik/Bi.mp3 | | |
| ג (g) | גִי | | hirik/Gi.mp3 | | |
| ד (d) | דִי | | hirik/Di.mp3 | | |
| ה (h) | הִי | | hirik/Hi.mp3 | | (לא נבדק לאחרונה) |
| ו (v) | וִי | | hirik/Vi.mp3 | | `[short] וִי` ב-variant |
| ז (z) | זִי | | hirik/Zi.mp3 | | |
| ח (ch) | חִי | `חִ` | hirik/Chi.mp3 | **‏Chi-v6-chi-only.mp3** | override: ללא יוד (Sarah מבלעת/מאריכה) |
| ט (t) | טִי | | hirik/Ti.mp3 | | |
| י (y) | יִי | | hirik/Yi.mp3 | | |
| כּ (k) | כִּי | | hirik/Ki.mp3 | | |
| ל (l) | לִי | | hirik/Li.mp3 | | |
| מ (mm) | מִי | | hirik/Mi.mp3 | | |
| נ (nn) | נִי | | hirik/Ni.mp3 | | |
| ס (s) | סִי | | hirik/Si.mp3 | | |
| ע (aa) | עִי | | hirik/Aai.mp3 | | filename = "Aai" (acoustically `עִיא`) |
| פּ (p) | פִּי | | hirik/Pi.mp3 | | |
| צ (tz) | צִי | `tsee` | hirik/Tsai.mp3 | **‏Tsai-v7-accent-noniqqud.mp3** | override: Latin transliteration |
| ק (q) | קִי | | hirik/Qi.mp3 | | |
| ר (r) | רִי | | hirik/Ri.mp3 | | American R |
| שׁ (sh) | שִׁי | | hirik/Shi.mp3 | | |
| תּ (tav) | תִּי | | hirik/Tavi.mp3 | | (shared sound with Ti) |
| F (f_rafe) | `Fִי` | Fi | hirik/Fi.mp3 | | Latin override |

**שותפים בקבצים:**
‏- `sin` (שׂ) → ‏hirik/Sini.mp3 (לא בטבלה — shared sound עם sh; filename ייחודי)
‏- `v_rafe` (ב) → ‏hirik/Vri.mp3 (shared sound עם Vi)
‏- `ch_rafe` (כ) → ‏hirik/Chri.mp3 (shared sound עם Chi)

---

## 5. ‏סגול (`segol/` — 23 קבצים)

‏Suffix: `ֶא` (סגול + אלף). הסיומת `א` מונעת מהמודל לבלוע ניקוד קצר.

| Letter | App key | Speak ל-Eleven | Filename | הערות |
|--------|---------|------------------|----------|--------|
| א (a) | אֶא | | segol/Ae.mp3 | silent aleph + eh |
| בּ (b) | בֶּא | | segol/Be.mp3 | |
| ג (g) | גֶא | | segol/Ge.mp3 | |
| ד (d) | דֶא | | segol/De.mp3 | |
| ה (h) | הֶא | | segol/He.mp3 | |
| ו (v) | וֶא | | segol/Ve.mp3 | |
| ז (z) | זֶא | | segol/Ze.mp3 | |
| ח (ch) | חֶא | | segol/Che.mp3 | |
| ט (t) | טֶא | | segol/Te.mp3 | |
| י (y) | יֶא | | segol/Ye.mp3 | |
| כּ (k) | כֶּא | | segol/Ke.mp3 | |
| ל (l) | לֶא | | segol/Le.mp3 | |
| מ (mm) | מֶא | | segol/Me.mp3 | |
| נ (nn) | נֶא | | segol/Ne.mp3 | |
| ס (s) | סֶא | | segol/Se.mp3 | |
| ע (aa) | עֶא | | segol/Aae.mp3 | |
| פּ (p) | פֶּא | | segol/Pe.mp3 | |
| צ (tz) | צֶא | `tse` | segol/Tsae.mp3 | override: Latin |
| ק (q) | קֶא | | segol/Qe.mp3 | |
| ר (r) | רֶא | | segol/Re.mp3 | American R |
| שׁ (sh) | שֶׁא | | segol/She.mp3 | |
| תּ (tav) | תֶּא | | segol/Tave.mp3 | |
| F (f_rafe) | `Fֶא` | Fe | segol/Fe.mp3 | override: Latin. ⚠️ Gemini judge: "Fay" (לא נבדק ידנית) |

**שותפים בקבצים:**
‏- `sin` (שׂ) → ‏segol/Sine.mp3
‏- `v_rafe` → ‏segol/Vre.mp3
‏- `ch_rafe` → ‏segol/Chre.mp3

---

## 6. ‏צירה (`tzere/` — 23 קבצים)

‏Suffix: `ֵא`. ‏צלילית **זהה לסגול** במבטא ישראלי — קבצים נפרדים נשמרו.

| Letter | App key | Speak ל-Eleven | Filename | הערות |
|--------|---------|------------------|----------|--------|
| א (a) | אֵא | | tzere/Aei.mp3 | |
| בּ (b) | בֵּא | | tzere/Bei.mp3 | |
| ג (g) | גֵא | | tzere/Gei.mp3 | |
| ד (d) | דֵא | | tzere/Dei.mp3 | |
| ה (h) | הֵא | | tzere/Hei.mp3 | |
| ו (v) | וֵא | | tzere/Vei.mp3 | |
| ז (z) | זֵא | | tzere/Zei.mp3 | ❌ **bad** — להחליף ב-segol/Ze.mp3 (זהה צלילית) |
| ח (ch) | חֵא | | tzere/Chei.mp3 | |
| ט (t) | טֵא | | tzere/Tei.mp3 | |
| י (y) | יֵא | | tzere/Yei.mp3 | |
| כּ (k) | כֵּא | | tzere/Kei.mp3 | |
| ל (l) | לֵא | | tzere/Lei.mp3 | |
| מ (mm) | מֵא | | tzere/Mei.mp3 | |
| נ (nn) | נֵא | | tzere/Nei.mp3 | |
| ס (s) | סֵא | | tzere/Sei.mp3 | |
| ע (aa) | עֵא | | tzere/Aaei.mp3 | |
| פּ (p) | פֵּא | | tzere/Pei.mp3 | |
| צ (tz) | צֵא | `tsei` | tzere/Tsaei.mp3 | override: Latin. ⚠️ Gemini: "say" |
| ק (q) | קֵא | | tzere/Qei.mp3 | |
| ר (r) | רֵא | | tzere/Rei.mp3 | American R |
| שׁ (sh) | שֵׁא | | tzere/Shei.mp3 | |
| תּ (tav) | תֵּא | | tzere/Tavei.mp3 | |
| F (f_rafe) | `Fֵא` | Fei | tzere/Fei.mp3 | override: Latin. ✅ Gemini OK |

**שותפים בקבצים:**
‏- `sin` (שׂ) → ‏tzere/Sinei.mp3 — ❌ **bad** "שֵׁה" — להחליף ב-segol/Sine.mp3 (בכפוף לבדיקת sibling)
‏- `v_rafe` → ‏tzere/Vrei.mp3
‏- `ch_rafe` → ‏tzere/Chrei.mp3

---

## 7. ‏חולם (`holam/` — 23 קבצים)

‏Suffix: `ֹא`. ‏ייחודי צלילית — אין sibling.

| Letter | App key | Speak ל-Eleven | Filename | הערות |
|--------|---------|------------------|----------|--------|
| א (a) | אֹא | | holam/Ao.mp3 | silent aleph + oh |
| בּ (b) | בֹּא | | holam/Bo.mp3 | |
| ג (g) | גֹא | | holam/Go.mp3 | |
| ד (d) | דֹא | | holam/Do.mp3 | |
| ה (h) | הֹא | | holam/Ho.mp3 | |
| ו (v) | וֹא | | holam/Vo.mp3 | |
| ז (z) | זֹא | | holam/Zo.mp3 | |
| ח (ch) | חֹא | | holam/Cho.mp3 | ❌ **bad** — אין sibling, ממתין להקלטה ידנית |
| ט (t) | טֹא | | holam/To.mp3 | |
| י (y) | יֹא | | holam/Yo.mp3 | |
| כּ (k) | כֹּא | | holam/Ko.mp3 | |
| ל (l) | לֹא | | holam/Lo.mp3 | |
| מ (mm) | מֹא | | holam/Mo.mp3 | |
| נ (nn) | נֹא | | holam/No.mp3 | |
| ס (s) | סֹא | | holam/So.mp3 | ⏭️ skip — נשמע "צו". אין sibling |
| ע (aa) | עֹא | | holam/Aao.mp3 | |
| פּ (p) | פֹּא | | holam/Po.mp3 | |
| צ (tz) | צֹא | `tso` | holam/Tsao.mp3 | override: Latin. ✅ |
| ק (q) | קֹא | | holam/Qo.mp3 | |
| ר (r) | רֹא | | holam/Ro.mp3 | American R |
| שׁ (sh) | שֹׁא | | holam/Sho.mp3 | |
| תּ (tav) | תֹּא | | holam/Tavo.mp3 | |
| F (f_rafe) | `Fֹא` | Fo | holam/Fo.mp3 | override: Latin. ✅ |

**שותפים בקבצים:**
‏- `sin` (שׂ) → ‏holam/Sino.mp3 — ❌ **bad** — אין sibling
‏- `v_rafe` → ‏holam/Vro.mp3
‏- `ch_rafe` → ‏holam/Chro.mp3 — ❌ **bad** — אין sibling

---

## 8. ‏שורוק (`shuruk/` — 23 קבצים)

‏Suffix: `וּ` (vav + dagesh). ‏7 variants נבחרו ע"י המשתמש בסבב 5.

| Letter | App key | Speak ל-Eleven | Filename | Variant נבחר | הערות |
|--------|---------|------------------|----------|----------------|--------|
| א (a) | אוּ | `oo` | shuruk/Au.mp3 | **‏Au-v3-oo.mp3** | variant override: pure "oo" |
| בּ (b) | בּוּ | | shuruk/Bu.mp3 | | |
| ג (g) | גוּ | `goo` | shuruk/Gu.mp3 | **‏Gu-v2-space.mp3** | |
| ד (d) | דוּ | | shuruk/Du.mp3 | | |
| ה (h) | הוּ | `hoo` | shuruk/Hu.mp3 | **‏Hu-v2-hoo.mp3** | |
| ו (v) | ווּ | `voo` | shuruk/Vu.mp3 | **‏Vu-v2-voo.mp3** | original `ווּ` יצא Viu |
| ז (z) | זוּ | | shuruk/Zu.mp3 | | |
| ח (ch) | חוּ | `חֻ` | shuruk/Chu.mp3 | | override: no waw (kubutz-style) |
| ט (t) | טוּ | | shuruk/Tu.mp3 | | |
| י (y) | יוּ | | shuruk/Yu.mp3 | | |
| כּ (k) | כּוּ | | shuruk/Ku.mp3 | | |
| ל (l) | לוּ | | shuruk/Lu.mp3 | | |
| מ (mm) | מוּ | | shuruk/Mu.mp3 | | |
| נ (nn) | נוּ | | shuruk/Nu.mp3 | | |
| ס (s) | סוּ | `soo` | shuruk/Su.mp3 | | variant: was 0.37s |
| ע (aa) | עוּ | | shuruk/Aau.mp3 | | silent ayin + oo |
| פּ (p) | פּוּ | | shuruk/Pu.mp3 | | |
| צ (tz) | צוּ | `tsoo` | shuruk/Tsau.mp3 | | override: Latin |
| ק (q) | קוּ | | shuruk/Qu.mp3 | | |
| ר (r) | רוּ | | shuruk/Ru.mp3 | | American R |
| שׁ (sh) | שׁוּ | | shuruk/Shu.mp3 | | |
| תּ (tav) | תּוּ | | shuruk/Tavu.mp3 | | |
| F (f_rafe) | `Fוּ` | `foo` | shuruk/Fu.mp3 | **‏Fu-v2-foo.mp3** | override: Latin |

**שותפים בקבצים:**
‏- `sin` (שׂ) → ‏shuruk/Sinu.mp3 — ❌ **bad** — להחליף ב-kubutz/Sinuu.mp3 (בכפוף לבדיקת sibling)
‏- `v_rafe` → ‏shuruk/Vru.mp3
‏- `ch_rafe` → ‏shuruk/Chru.mp3

---

## 9. ‏קובוץ (`kubutz/` — 23 קבצים)

‏Suffix: `ֻ` (קצר, ללא אות-עזר). ‏צלילית **זהה לשורוק** — קבצים נפרדים נשמרו.

| Letter | App key | Speak ל-Eleven | Filename | הערות |
|--------|---------|------------------|----------|--------|
| א (a) | אֻ | | kubutz/Auu.mp3 | |
| בּ (b) | בֻּ | | kubutz/Buu.mp3 | |
| ג (g) | גֻ | | kubutz/Guu.mp3 | ❌ **bad** "ג'וּ" — להחליף ב-shuruk/Gu.mp3 (אחרי החלפת variant) |
| ד (d) | דֻ | | kubutz/Duu.mp3 | |
| ה (h) | הֻ | | kubutz/Huu.mp3 | |
| ו (v) | וֻ | | kubutz/Vuu.mp3 | ❌ **bad** — להחליף ב-shuruk/Vu.mp3 (אחרי החלפת variant) |
| ז (z) | זֻ | | kubutz/Zuu.mp3 | ⏭️ skip — להחליף ב-shuruk/Zu.mp3 (sibling ✅) |
| ח (ch) | חֻ | | kubutz/Chuu.mp3 | |
| ט (t) | טֻ | | kubutz/Tuu.mp3 | |
| י (y) | יֻ | | kubutz/Yuu.mp3 | |
| כּ (k) | כֻּ | | kubutz/Kuu.mp3 | |
| ל (l) | לֻ | | kubutz/Luu.mp3 | |
| מ (mm) | מֻ | | kubutz/Muu.mp3 | |
| נ (nn) | נֻ | | kubutz/Nuu.mp3 | |
| ס (s) | סֻ | | kubutz/Suu.mp3 | |
| ע (aa) | עֻ | | kubutz/Aauu.mp3 | |
| פּ (p) | פֻּ | | kubutz/Puu.mp3 | |
| צ (tz) | צֻ | `tsoo` | kubutz/Tsauu.mp3 | override: Latin. ✅ |
| ק (q) | קֻ | | kubutz/Quu.mp3 | |
| ר (r) | רֻ | | kubutz/Ruu.mp3 | American R |
| שׁ (sh) | שֻׁ | | kubutz/Shuu.mp3 | |
| תּ (tav) | תֻּ | | kubutz/Tavuu.mp3 | |
| F (f_rafe) | `Fֻ` | Fuu | kubutz/Fuu.mp3 | override: Latin. ✅ |

**שותפים בקבצים:**
‏- `sin` (שׂ) → ‏kubutz/Sinuu.mp3 (לא נבדק)
‏- `v_rafe` → ‏kubutz/Vruu.mp3
‏- `ch_rafe` → ‏kubutz/Chruu.mp3

---

## 10. ‏שווא (`shva`)

‏Suffix: `ְ`. **‏אין קבצי MP3** — fallback ל-Web Speech ב-runtime.

‏ב-`makePair` הצליל יוצא זהה לעיצור (`none`) אבל ‏ה-key שונה (`בְ` עבור `none` לעומת `בְ` עבור `shva` — בעצם זהים). זה בעצם תאונה — שני הניקודים מייצרים את אותו suffix.

---

## הקבצים הבעייתיים — סיכום

| קובץ | סיבה | פתרון |
|------|------|---------|
| ‏hirik/Chi.mp3 | בעיה ב-master | החלפה ב-Chi-v6-chi-only.mp3 (variant) |
| ‏hirik/Tsai.mp3 | בעיה ב-master | החלפה ב-Tsai-v7-accent-noniqqud.mp3 |
| ‏tzere/Zei.mp3 | בעיה | החלפה ב-segol/Ze.mp3 (sibling צלילית) |
| ‏tzere/Sinei.mp3 | "שֵׁה" | החלפה ב-segol/Sine.mp3 (sibling — בכפוף לבדיקה) |
| ‏holam/Cho.mp3 | בעיה | אין פתרון — להקלטה ידנית |
| ‏holam/Sino.mp3 | בעיה | אין פתרון — להקלטה ידנית |
| ‏holam/Chro.mp3 | בעיה | אין פתרון — להקלטה ידנית |
| ‏holam/So.mp3 | נשמע "צו" (skip) | אין פתרון |
| ‏shuruk/Au.mp3 | בעיה ב-master | החלפה ב-Au-v3-oo.mp3 (variant) |
| ‏shuruk/Gu.mp3 | בעיה ב-master | החלפה ב-Gu-v2-space.mp3 |
| ‏shuruk/Hu.mp3 | בעיה ב-master | החלפה ב-Hu-v2-hoo.mp3 |
| ‏shuruk/Vu.mp3 | בעיה ב-master | החלפה ב-Vu-v2-voo.mp3 |
| ‏shuruk/Fu.mp3 | בעיה ב-master | החלפה ב-Fu-v2-foo.mp3 |
| ‏shuruk/Sinu.mp3 | בעיה | החלפה ב-kubutz/Sinuu.mp3 (sibling — בכפוף לבדיקה) |
| ‏kubutz/Guu.mp3 | "ג'וּ" | החלפה ב-shuruk/Gu.mp3 (אחרי החלפת variant) |
| ‏kubutz/Vuu.mp3 | בעיה | החלפה ב-shuruk/Vu.mp3 (אחרי החלפת variant) |
| ‏kubutz/Zuu.mp3 | skip | החלפה ב-shuruk/Zu.mp3 (sibling ✅) |

**סך הכל:**
‏- 7 variant choices → החלפת תוכן master ב-variant
‏- 6 sibling substitutions → העתקת קובץ אחיו (4 בטוחים, 2 בכפוף לבדיקה)
‏- 3 חסרי-תקנה (holam/Cho, holam/Sino, holam/Chro, ו-holam/So) → להקלטה ידנית עתידית
