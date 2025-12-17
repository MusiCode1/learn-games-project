# יומן פיתוח - משחק רכבת החיבור

## 17/12/2025 - יצירת הפרויקט

### 🚀 מה נוצר

**תשתית**

- אפליקציית SvelteKit עם Tailwind CSS ו-TypeScript

**לוגיקה**

- `game-state.svelte.ts` - State Machine
- `settings.svelte.ts` - הגדרות מורה
- `tts.ts` - הקראה עם fallback ל-TTS
- `distractors.ts` - יצירת מסיחים

**רכיבי UI**

- TrainCar, TrainTrackArea, DepotArea
- HeaderBar, InstructionPanel, AnswerPanel
- CounterBadge, FeedbackOverlay, AssistOverlay

**קבצים סטטיים**

- SVG: locomotive, car-green, car-blue
- סאונד: 13 קבצי WAV

### ✨ תכונות

- cooldown 10 שניות עם טיימר
- מספרים דינמיים + סימן חיבור
- ספרות 1-10 לבחירה
- אנימציות מושכות
