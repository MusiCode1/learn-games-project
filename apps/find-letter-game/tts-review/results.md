# תוצאות סקירת TTS

---

## סבוב 5 — סקירה ידנית של כל הקבצים (2026-05-28)

**סקירה אנושית** של כל קבצי ה-TTS דרך ה-HTML viewer (`tts-review/batch/all.html`) — לאחר הסרת חטף-פתח וחטף-סגול מהקוד.

### סיכום

| | |
|--|--|
| נסקרו | 126 / 156 |
| ✅ OK | 115 |
| ❌ בעייתיים | 9 |
| ⏭️ דילגתי | 2 |
| 👑 variant choices | 7 |
| לא נסקרו | ~30 (רוב kubutz, כמה ב-segol) |

### Variant choices (7) — בוצעה החלפה ב-master

| ‏Master שהוחלף | Variant נבחר |
|----------------|----------------|
| ‏hirik/Chi.mp3 | ‏Chi-v6-chi-only.mp3 |
| ‏hirik/Tsai.mp3 | ‏Tsai-v7-accent-noniqqud.mp3 |
| ‏shuruk/Au.mp3 | ‏Au-v3-oo.mp3 |
| ‏shuruk/Gu.mp3 | ‏Gu-v2-space.mp3 |
| ‏shuruk/Hu.mp3 | ‏Hu-v2-hoo.mp3 |
| ‏shuruk/Vu.mp3 | ‏Vu-v2-voo.mp3 |
| ‏shuruk/Fu.mp3 | ‏Fu-v2-foo.mp3 |

**טכני:** רק 1 (`shuruk/Gu`) נדרש upload — היתר כבר היו עם content זהה ל-variant ב-R2 מהריצה הקודמת.

### Sibling substitutions (4) — החלפה ב-master מתיקייה אחות

| בעייתי | הוחלף ב- | רציונל |
|---------|-----------|----------|
| ‏tzere/Zei.mp3 | ‏segol/Ze.mp3 | sibling phonetic (סגול = צירה במבטא ישראלי) |
| ‏kubutz/Guu.mp3 | ‏shuruk/Gu.mp3 (אחרי החלפת variant) | sibling phonetic (שורוק = קובוץ) |
| ‏kubutz/Vuu.mp3 | ‏shuruk/Vu.mp3 (אחרי החלפת variant) | sibling phonetic |
| ‏kubutz/Zuu.mp3 (skip) | ‏shuruk/Zu.mp3 | sibling phonetic |

### בעיות שנותרו ללא פתרון (4)

| קובץ | סיבה |
|------|--------|
| ‏holam/Cho.mp3 | אין sibling — חולם ייחודי צלילית |
| ‏holam/Sino.mp3 | אין sibling |
| ‏holam/Chro.mp3 | אין sibling |
| ‏holam/So.mp3 (skip) | אין sibling — נשמע "צו" |

**ל-future:** להקליט ידנית או לנסות re-record דרך ElevenLabs עם prompt שונה.

### Sibling שלא נבדקו (2) — לא הוחלפו

| בעייתי | sibling פוטנציאלי | סטטוס |
|---------|---------------------|--------|
| ‏tzere/Sinei.mp3 ("שֵׁה") | ‏segol/Sine.mp3 | sibling לא נסקר |
| ‏shuruk/Sinu.mp3 | ‏kubutz/Sinuu.mp3 | sibling לא נסקר |

**ל-future:** המשתמש יוכל לבדוק את ה-siblings ולהחליט.

### מה הועלה ל-R2

‏הרצנו `bun run sync:assets` — 6 קבצים בעצם עלו חדשים, היתר היו כבר עם content זהה ל-variant מהריצה הקודמת.

ETag מאומת ב-CDN: `https://static.tzlev.ovh/shared/tts/find-letter/hirik/Chi.mp3` → ETag = MD5 של Chi-v6.

---

## סבוב 4 — Batch ניקודים (2026-05-18)

### חיריק (Pilot) — הושלם

| | |
|--|--|
| סטטוס | ✅ הושלם, 22/26 OK |
| בעיות שנפתרו | Chi.mp3: `חִ` (ללא יוד) → OK; Tsai.mp3: `tsee` (לטיני) → OK |
| Re-produced | Vi.mp3, Vri.mp3 (`[short] וִי`), Aai.mp3 (`עִיא`), Hi.mp3 (`הִי `) |
| לבדיקה ידנית | Vi, Vri, Aai, Hi (Gemini timeout — בדוק ב-HTML) |

### 7 ניקודים נוספים — הופקו, ממתינים לאישור ידני

| ניקוד | קבצים | Override files (Gemini OK) | PROBLEM |
|-------|-------|---------------------------|---------|
| סגול | 26 | Tsae.mp3 ✅ | Fe.mp3 ❌ (נשמע "Fay") |
| צירה | 26 | Fei.mp3 ✅ | Tsaei.mp3 ❌ (נשמע "say") |
| חולם | 26 | Fo.mp3 ✅ Tsao.mp3 ✅ | — |
| שורוק | 26 | Fu.mp3 ✅ Tsau.mp3 ✅ | — |
| קובוץ | 26 | Fuu.mp3 ✅ Tsauu.mp3 ✅ | — |
| חטף פתח | 26 | Fah.mp3 ✅ Tsaah.mp3 ✅ | — |
| חטף סגול | 26 | Feh.mp3 ✅ Tsaeh.mp3 ✅ | — |

שאר הקבצים (>150) לא נבדקו ע"י Gemini (rate-limited) — לבדיקה ידנית ב-HTML.
URL: https://musicode-find-letter-tts.nue.tuns.sh/all.html

---

## סבוב 2 — English speak (ישן)

הפעם ה-`speak` הוא תעתיק לטיני (אנגלית). מטרה: לתקן Fa שהיה Pa, ולנסות Ra/Tsa/Za.

מלא ליד כל קובץ את **מה ששמעת בפועל**. תקין = "✅" או "תקין".

---

### A.mp3
speak: `A`  
letters: א, ע
actual: 

### Ba.mp3
speak: `Ba`  
letters: בּ דגושה
actual: 

### Cha.mp3
speak: `Cha`  
letters: ח, כ רפה
actual: 

### Da.mp3
speak: `Da`  
letters: ד
actual: 

### Fa.mp3
speak: `Fa`  
letters: פ רפה
actual: 

### Ga.mp3
speak: `Ga`  
letters: ג
actual: 

### Ha.mp3
speak: `Ha`  
letters: ה
actual: 

### Ka.mp3
speak: `Ka`  
letters: כּ דגושה, ק
actual: 

### La.mp3
speak: `La`  
letters: ל
actual: 

### Ma.mp3
speak: `Ma`  
letters: מ
actual: 

### Na.mp3
speak: `Na`  
letters: נ
actual: 

### Pa.mp3
speak: `Pa`  
letters: פּ דגושה
actual: 

### Ra.mp3
speak: `Ra`  
letters: ר
actual: 

### Sa.mp3
speak: `Sa`  
letters: ס, שׂ
actual: 

### Sha.mp3
speak: `Sha`  
letters: שׁ
actual: 

### Ta.mp3
speak: `Ta`  
letters: ט, ת
actual: 

### Tsa.mp3
speak: `Tsa`  
letters: צ
actual: 

### Va.mp3
speak: `Va`  
letters: ו, ב רפה
actual: 

### Ya.mp3
speak: `Ya`  
letters: י
actual: 

### Za.mp3
speak: `Za`  
letters: ז
actual: 
