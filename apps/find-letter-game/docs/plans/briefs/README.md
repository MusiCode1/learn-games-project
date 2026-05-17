# Briefs — מסמכי handoff ל-Sonnet executor

‏briefs ייעודיים פר פאזה, ‏שמועברים ל-`Task(subagent_type="executor", ...)` ‏לביצוע.

## ‏מבנה brief

‏כל brief חייב לכלול:

### ‏Frontmatter

```yaml
---
phase: phase-1-letter-vowel-refactor
verifier-slice: light          # ‏או heavy לscore 8+
complexity-score: 1            # ‏אופציונלי — תיעוד
---
```

### ‏גוף

1. **‏Context** — ‏הפניה ל-`vowels-support-plan.md` (התכנון האסטרטגי) ‏ול-`sonnet-pitfalls.md` (האזהרות).
2. **‏Scope** — ‏מה כן ומה לא בפאזה הזו.
3. **‏Sub-phases** — ‏פירוט שלבים פנימיים. ‏לכל sub-phase: שם, מטרה, ‏**Testing strategy** (`tdd` / `integration` / `manual` / `none`).
4. **‏Data Flow Bridges table** — ‏כל Producer/Consumer/Mechanism עם file:line.
5. **‏DELETE blocks** — ‏מחיקות עם file:lines קונקרטיים. ‏ב-refactor: אם interface מתחלף — מציין מה נשאר כ-shim ומה נמחק.
6. **‏Anti-patterns** — ‏מתוך `sonnet-pitfalls.md` ‏+ ספציפיים לפאזה.
7. **‏DoD ויזואלי** — ‏screenshots, e2e flows. ‏ב-refactor "ניטרלי למשתמש": ‏לפני/אחרי screenshots דורשים *‏זהות* visuelle.
8. **‏Environment notes** — ports, מיקום dev server, איך להפעיל playwright-cli.
9. **‏Complexity score breakdown** — ‏ראיון checklist ‏ל-score (לדיווח, לא משנה ביצוע).
10. **‏`verifier-slice-light` תזכורת** ‏בסוף — ‏שה-executor יקרא לו לפני סיום.

## ‏Naming convention

```
phase-1-letter-vowel-refactor-brief.md
phase-2-consonant-support-brief.md
phase-3-{vowel-name}-vowel-brief.md
```

## ‏Workflow

```
1. Opus (planner)
   ‏- ‏קורא docs/plans/vowels-support-plan.md ‏ו-sonnet-pitfalls.md
   ‏- ‏מחשב complexity score לפי checklist (recommendations.md סעיף 8)
   ‏- ‏בוחר tier: light (score 0-3) או heavy (score 8+)
   ‏- ‏כותב brief מפורט + Testing strategy לכל sub-phase
   
2. ‏אישור משתמש — האם ה-brief מכסה את הצרכים?

3. Task(subagent_type="executor", prompt="brief: <path>, ...")
   ‏- ‏Sonnet executor מבצע sub-phase by sub-phase
   ‏- ‏מכבד את ה-Testing strategy של כל sub-phase (לא חולק)
   ‏- ‏אם score 4+ ויש phase מסומן verifier-phase ב-brief — ‏קורא אליו

4. Task(subagent_type="verifier-slice-light", prompt="brief: <path>, ...")
   ‏- ‏~15 דק', fresh context
   ‏- ‏דוח ב-../verification/<phase>-report.md

5. Opus — ‏קורא דוח
   ‏- ‏נקי: ‏לסעיף 6
   ‏- ‏באגים: ‏fix iteration → ‏חזרה ל-3

6. אישור משתמש — סגירת הפאזה → commit
```

## ‏Score reference

```
Score → Tier mapping (מ-recommendations.md סעיף 8):
0-3:  light only, ‏ללא verifier-phase
4-7:  light + verifier-phase על 1-2 phases מסוכנים
8+:   heavy + verifier-phase על רוב phases
```

‏הפאזות של פרויקט find-letter / vowels-support **‏כולן בטווח 0-3**:
‏- ‏Pure logic ‏או refactor, ‏עם TDD, ‏ללא cross-package ‏וללא protocols חדשים.

## ‏Archive

‏אחרי סגירת פאזה — ‏ה-brief עובר ל-`archive/` ‏(בתיקייה זו), ‏לא נשאר ב-root של `briefs/`.
