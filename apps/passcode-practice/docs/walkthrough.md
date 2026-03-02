# Passcode Practice — יומן פיתוח

## 2026-03-02 14:00

### גרסה v0.1 — יצירת האפליקציה מאפס

אפליקציית SvelteKit לתרגול הקשת סיסמת אייפד. התלמיד מתאמן על הקשת הסיסמא על לוח ספרות דיגיטלי בסגנון מסך הנעילה של iOS, עם רמז אופציונלי, מחזקים ומשוב קולי.

#### מה בוצע?

**1. תשתית הפרויקט**

- יצירת פרויקט SvelteKit חדש במונורפו תחת `apps/passcode-practice/`
- הגדרת `package.json` עם `learn-booster-kit` כתלות
- הגדרות `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `.npmrc`
- Tailwind CSS v4 עם `@tailwindcss/vite`

**2. Store — הגדרות מורה (`settings.svelte.ts`)**

- שדות: `passcode` (ברירת מחדל `"1234"`), `showHint`, `cooldownMs`, `voiceEnabled`, `speakDigits`, `boosterEnabled`
- שמירה אוטומטית ב-`localStorage` עם `$effect.root`
- `isPasscodeValid` — ולידציה: ספרות בלבד, לפחות 1 תו

**3. Store — מצב משחק (`game-state.svelte.ts`)**

- State Machine: `IDLE → ENTERING → ERROR / SUCCESS → REWARD`
- בדיקה אוטומטית אחרי הקשת כל הספרות (ללא כפתור אישור) — מחקה התנהגות אייפד אמיתי
- `pressDigit`, `backspace`, `clear`, `completeReward`, `reset`
- `winsSinceLastReward` — מוניטור להפעלת מחזק

**4. TTS (`tts.ts`)**

- `speakSuccess`, `speakWrong`, `speakDigit` — הכרזות בעברית
- שרשרת fallback: Fully Kiosk → Web Speech API → שקט

**5. קומפוננטות משותפות (lib/components)**

- `HeaderBar.svelte` — כותרת עם מונה הצלחות, AdminGate לגישה להגדרות

**6. קומפוננטות ספציפיות לראוט (routes/_components)**

- `NumericKeypad.svelte` — לוח 3×4 בסגנון iPad (שורות: 1-2-3, 4-5-6, 7-8-9, ריק-0-מחיקה)
- `PasscodeDots.svelte` — נקודות התקדמות (כמות הנקודות = אורך הסיסמא), אנימציה על שגיאה/הצלחה
- `PasscodeHint.svelte` — כרטיס רמז מעל הלוח (מוצג כשׁ-`showHint=true`)
- `FeedbackOverlay.svelte` — overlay הצלחה (ירוק + כוכבים) / שגיאה (אדום)

**7. עמודים**

- `+layout.svelte` — רקע gradient כהה (slate-800→900) מחקה מסך נעילה iOS, BoosterContainer ב-z-[9999]
- `+page.svelte` — עמוד ראשי: ProgressWidget, PasscodeHint, PasscodeDots, ספירת cooldown, NumericKeypad, FeedbackOverlay
- `settings/+page.svelte` — הגדרות מורה: סיסמא (password + show/hide), showHint, cooldown slider, הגדרות קול, הגדרות מחזק (BoosterKit מלא כולל OverlayTimerSettings)

#### החלטות ארכיטקטורה

- **קומפוננטות ספציפיות לראוט ב-`routes/_components/`**: על פי קונבנציית הפרויקט — קומפוננטות השייכות לראוט אחד בלבד נשמרות בתוך תיקיית הראוט, קומפוננטות משותפות ב-`lib/components/`.
- **בדיקה אוטומטית ללא כפתור Submit**: מחקה התנהגות אייפד אמיתי — לאחר הקשת כל ספרות הסיסמא הבדיקה מתבצעת מיידית.
- **אורך סיסמא דינמי**: `PasscodeDots` רספונסיבי ל-`settings.passcode.length` — תומך בכל אורך (1–8 ספרות) ללא שינוי קוד, רק שינוי הסיסמא בהגדרות.

#### מעקפים ופתרונות

- **`dir="ltr"` על תצוגת הסיסמא**: המסמך הוא RTL (עברית), אך ספרות הסיסמא חייבות להיות LTR כדי שהסדר יהיה נכון (1234 ולא 4321).
- **שגיאות svelte-check ב-`learn-booster-kit`**: 11 שגיאות קיימות מראש בחבילה (fully-kiosk-js types), זהות לשגיאות בפרויקטים אחרים במונורפו — לא מהקוד שלנו.
