# קבצי TTS — איפה האות?

תיקייה זו מכילה את ה-master copy של 20 קבצי MP3 שמשמשים את המשחק להקראת אותיות. כל קובץ עבר אישור איכותי ידני לפני שהועלה ל-CDN.

**קבצי MP3 לא מוכנסים לגיט** (לפי `.gitignore` ברמת השורש). מקור האמת הוא R2 (`tzlev-static`); התיקייה המקומית היא רק לסקירה.

---

## איפה הקבצים בייצור

```
https://static.tzlev.ovh/shared/tts/find-letter/<name>.mp3
```

R2 bucket: `tzlev-static`, prefix: `shared/tts/find-letter/`.

---

## טבלת המיפוי

| קובץ | speak (ב-`letters.ts`) | אותיות במשחק |
|------|-----------------------|---------------|
| `A.mp3` | `אָא` | א, ע |
| `Ba.mp3` | `בָּא` | בּ דגושה |
| `Cha.mp3` | `חָא` | ח, כ רפה |
| `Da.mp3` | `דָא` | ד |
| `Fa.mp3` | `Fa` ⚠ תעתיק לטיני | פ רפה |
| `Ga.mp3` | `גָא` | ג |
| `Ha.mp3` | `הָא` | ה |
| `Ka.mp3` | `כָּא` | כּ דגושה, ק (אוחדו) |
| `La.mp3` | `לָא` | ל |
| `Ma.mp3` | `מָא` | מ |
| `Na.mp3` | `נָא` | נ |
| `Pa.mp3` | `פָּא` | פּ דגושה |
| `Ra.mp3` | `רָא` | ר (American R — פשרה, ראה הערות) |
| `Sa.mp3` | `סָא` | ס, שׂ |
| `Sha.mp3` | `שָׁא` | שׁ |
| `Ta.mp3` | `טָא` | ט, ת (אוחדו) |
| `Tsa.mp3` | `[Israeli accent] צַה` ⚠ עם tag | צ |
| `Va.mp3` | `וָא` | ו, ב רפה |
| `Ya.mp3` | `יָא` | י |
| `Za.mp3` | `זַה` | ז |

המיפוי המקובל (`speak → filename`) נמצא ב-`src/lib/utils/letters.ts` תחת `TTS_FILES`.

---

## הגדרות יצירה

כל הקבצים נוצרו עם:

- **Provider**: ElevenLabs
- **Voice**: Sarah (`EXAVITQu4vr4xnSDxMaL`)
- **Model**: `eleven_v3`
- **שפה**: עברית (חוץ מ-`Fa` שהוא לטיני, ו-`Tsa` שכולל audio tag של ElevenLabs v3)

---

## הערות חשובות

### למה Fa באנגלית?
Sarah/eleven_v3 מתעלם באופן עקבי מהבחנת דגש/רפה של פ' בעברית — כל וריאנט עברי (`פָא`, `פָה`, `פִיל`, `אַף`) יצא Pa או צליל שגוי אחר. תעתיק לטיני `Fa` עוקף את הבעיה כי המודל קורא את ההברה כפי שהיא נכתבת.

### למה Tsa עם `[Israeli accent]`?
בלי ה-tag, `צָא` נשמע כמו "Sa" (ElevenLabs מבטל את ה-"ts"). ה-tag מאלץ הגייה ישראלית שמשמרת את הצליל "ts".

### Ra (American R) — פשרה
ניסינו וריאנטים רבים (`רֵישׁ`, `רַעַשׁ`, `רַע`, גם עם `[Israeli accent]`) — כולם יצאו אמריקאיים, לשוניים או סלאביים. אף אחד לא ר' גרונית ישראלית. נשארנו עם `רָא` (American R) כפשרה. אופציה עתידית: לנסות קול אחר (לא Sarah) או ספק אחר.

---

## איך להוסיף קובץ חדש (לאות חדשה / ניקוד חדש)

1. **ייצר קובץ** דרך הפרוקסי AAC עם הפרמטרים למעלה (Sarah/eleven_v3).
   ```sh
   curl -X POST https://aac-proxy.aybritman.workers.dev/v1/tts \
       -H "Content-Type: application/json" \
       -d '{"text":"<speak text>","provider":"elevenlabs","voiceId":"EXAVITQu4vr4xnSDxMaL","modelId":"eleven_v3","lang":"he-IL"}'
   # תקבל hash. אחר כך:
   curl -o NewLetter.mp3 https://aac-proxy.aybritman.workers.dev/v1/tts/<hash>
   ```
2. **האזן** ידנית. אם לא תקין — נסה speak אחר או tag.
3. **שמור** את הקובץ בתיקייה הזו לבדיקות עתידיות (לא נכנס לגיט).
4. **העלה ל-R2**:
   ```sh
   bunx wrangler r2 object put --remote "tzlev-static/shared/tts/find-letter/NewLetter.mp3" \
       --file NewLetter.mp3 --content-type "audio/mpeg"
   ```
5. **עדכן `letters.ts`**:
   - אם זו אות חדשה: הוסף ל-`BASE_LETTERS`/`CONFUSING_LETTERS`/`RAFE_LETTERS` עם `speak: '<speak text>'`.
   - הוסף שורה ל-`TTS_FILES`: `'<speak text>': 'NewLetter.mp3'`.
6. **הרץ בדיקות**: `bun run test:run`. בדיקה #22 תוודא שכל ה-`speak` ממופים.

---

## גיבוי

ה-bucket `tzlev-static` ב-Cloudflare R2 הוא מקור האמת. אם הקבצים אובדים שם:

1. ייצר מחדש דרך הפרוקסי (כל הצירופים דטרמיניסטיים — אותו hash תמיד מחזיר אותו אודיו, **כל עוד הפרוקסי משתמש באותם פרמטרים**).
2. אם ElevenLabs שינה משהו במודל — המבנה החדש לא יהיה זהה. נסקור מחדש.
