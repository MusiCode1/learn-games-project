# תוצאות סקירת TTS

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
