# מימוש העברת פרופס בין קומפוננטות

> **הערה חשובה**: המימוש המוצג במסמך זה משתמש בתחביר של Svelte 4. בפועל, המימוש צריך להשתמש ברונות (Runes) של Svelte 5, כלומר להשתמש ב-`$state`, `$derived` ו-`$effect` במקום בתחביר הריאקטיבי הישן, ולהשתמש ב-`$props` במקום ב-`export let`. כמו כן, יש להשתמש ב-`onclick` במקום ב-`on:click` ובשאר השינויים הנדרשים בסוולט 5.

## מצב נוכחי

כיום, הפרופס מועברים בין הקומפוננטות באופן לא אחיד ומסורבל:

- קומפוננטת `PracticeScreen` מקבלת כ-20 פרמטרים נפרדים
- אין מבנה אחיד להעברת הפרופס
- קשה לעקוב אחרי זרימת המידע בין הקומפוננטות
- קשה להבין אילו פרמטרים נדרשים לכל קומפוננטה

דוגמה למצב הנוכחי:

```jsx
<PracticeScreen
	word={currentWord}
	{wordIndex}
	totalWords={words.length}
	isFirst={wordIndex === 0}
	isLast={wordIndex === words.length - 1}
	{isWordVisible}
	{isImageVisible}
	{direction}
	{lastDirection}
	{hideAfterSeconds}
	{currentSet}
	{totalSets}
	{currentRepetition}
	{totalRepetitions}
	onNext={handleNext}
	onPrev={handlePrev}
	onFinish={handleFinish}
	onExit={handleExit}
	onImageCardClick={handleImageCardClick}
	onWordCardClick={handleWordCardClick}
/>
```

## פתרון מוצע

אנו מציעים לארגן את הפרופס בצורה היררכית ואחידה, בהתאם לטיפוסים שהגדרנו:

```svelte
<PracticeScreen
	state={{
		user: {
			progress: settings
		},
		practice: {
			session: {
				words: currentWords,
				currentIndex: wordIndex,
				wordsPerRepetition: settings.wordsPerSet,
				totalRepetitions: settings.repetitionsPerSet
			},
			ui: {
				isWordVisible,
				isImageVisible,
				direction,
				lastDirection
			}
		}
	}}
	handlers={{
		onNext: handleNext,
		onPrev: handlePrev,
		onFinish: handleFinish,
		onExit: handleExit,
		onImageCardClick: handleImageCardClick,
		onWordCardClick: handleWordCardClick
	}}
/>
```

## יתרונות הפתרון

1. **אחידות** - כל הקומפוננטות מקבלות את אותו מבנה בסיסי של פרופס
2. **ארגון לוגי** - הפרופס מאורגנים לפי תחומי אחריות: state (נתונים) ו-handlers (פונקציות)
3. **קלות תחזוקה** - קל יותר להבין אילו פרמטרים נדרשים לכל קומפוננטה
4. **הרחבה פשוטה** - קל להוסיף פרמטרים חדשים בלי לשנות את המבנה הבסיסי
5. **תאימות לטיפוסים** - הפרופס תואמים את הטיפוסים שהגדרנו

## מימוש מפורט

### 1. עדכון הקומפוננטות לקבלת הפרופס החדשים

#### PracticeScreen

```svelte
<!-- src/lib/components/screens/PracticeScreen.svelte -->
<script lang="ts">
  import type { PracticeScreenProps } from '$lib/types';

  // קבלת הפרופס במבנה החדש
  export let state: PracticeScreenProps['state'];
  export let handlers: PracticeScreenProps['handlers'];

  // חילוץ ערכים מהפרופס לשימוש בקומפוננטה
  $: currentWord = state.practice.session.words[state.practice.session.currentIndex] || {};
  $: isFirst = state.practice.session.currentIndex === 0;
  $: isLast = state.practice.session.currentIndex === state.practice.session.words.length - 1;
  $: hideAfterSeconds = state.user.progress.hideAfterSeconds;
</script>

<!-- שימוש בערכים שחולצו מהפרופס -->
<div class="practice-screen">
  <WordCard
    word={currentWord.text}
    isVisible={state.practice.ui.isWordVisible}
    direction={state.practice.ui.direction}
    lastDirection={state.practice.ui.lastDirection}
    onclick={handlers.onWordCardClick}
  />

  {#if currentWord.image}
    <ImageCard
      src={currentWord.image}
      isVisible={state.practice.ui.isImageVisible}
      onclick={handlers.onImageCardClick}
    />
  {/if}

  <div class="controls">
    <Button
      disabled={isFirst}
      onclick={handlers.onPrev}
      text="הקודם"
    />

    <Button
      disabled={isLast}
      onclick={handlers.onNext}
      text="הבא"
    />

    {#if isLast}
      <Button
        onclick={handlers.onFinish}
        text="סיום"
      />
    {/if}

    <Button
      onclick={handlers.onExit}
      text="יציאה"
    />
  </div>

  <Progress
    current={state.practice.session.currentIndex + 1}
    total={state.practice.session.words.length}
    currentSet={state.user.progress.currentSet}
    totalSets={calculateTotalSets(state.user.progress.level, state.user.progress.wordsPerSet)}
    currentRepetition={1} <!-- יש להוסיף מעקב אחרי חזרות -->
    totalRepetitions={state.practice.session.totalRepetitions}
  />
</div>
```

#### PracticeSettingsScreen

```svelte
<!-- src/lib/components/screens/PracticeSettingsScreen.svelte -->
<script lang="ts">
	import type { PracticeSettingsProps } from '$lib/types';

	// קבלת הפרופס במבנה החדש
	export let state: PracticeSettingsProps['state'];
	export let handlers: PracticeSettingsProps['handlers'];
	export let maxLevel: PracticeSettingsProps['maxLevel'];

	// סטייט מקומי לערכים שמשתנים בטופס
	const localState = $state({
		selectedWordsPerSet: state.user.progress.wordsPerSet,
		selectedSet: state.user.progress.currentSet,
		selectedRepetitions: state.user.progress.repetitionsPerSet,
		hideAfterSeconds: state.user.progress.hideAfterSeconds,
		selectedLevel: state.user.progress.level
	});

	// פונקציה לטיפול בשליחת הטופס
	function handleSubmit() {
		handlers.onStartPractice({
			wordsPerSet: localState.selectedWordsPerSet,
			currentSet: localState.selectedSet,
			repetitionsPerSet: localState.selectedRepetitions,
			hideAfterSeconds: localState.hideAfterSeconds,
			level: localState.selectedLevel
		});
	}
</script>

<div class="settings-screen">
	<h1>הגדרות תרגול</h1>

	<form on:submit|preventDefault={handleSubmit}>
		<!-- טופס הגדרות -->
		<div class="form-group">
			<label for="level">רמה:</label>
			<select id="level" bind:value={localState.selectedLevel}>
				{#each Array(maxLevel) as _, i}
					<option value={i + 1}>רמה {i + 1}</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="set">סט:</label>
			<input
				type="number"
				id="set"
				min="1"
				max={calculateTotalSets(localState.selectedLevel, localState.selectedWordsPerSet)}
				bind:value={localState.selectedSet}
			/>
		</div>

		<div class="form-group">
			<label for="wordsPerSet">מילים בסט:</label>
			<input
				type="number"
				id="wordsPerSet"
				min="1"
				max="20"
				bind:value={localState.selectedWordsPerSet}
			/>
		</div>

		<div class="form-group">
			<label for="repetitions">חזרות:</label>
			<input
				type="number"
				id="repetitions"
				min="1"
				max="10"
				bind:value={localState.selectedRepetitions}
			/>
		</div>

		<div class="form-group">
			<label for="hideAfter">הסתרה אחרי (שניות):</label>
			<input
				type="number"
				id="hideAfter"
				min="0"
				max="10"
				step="0.5"
				bind:value={localState.hideAfterSeconds}
			/>
		</div>

		<div class="buttons">
			<Button type="submit" text="התחל תרגול" />

			<Button onclick={handlers.onBack} text="חזרה" />
		</div>
	</form>
</div>
```

#### PracticeCompletionScreen

```svelte
<!-- src/lib/components/screens/PracticeCompletionScreen.svelte -->
<script lang="ts">
	import type { PracticeCompletionProps } from '$lib/types';

	// קבלת הפרופס במבנה החדש
	export let state: PracticeCompletionProps['state'];
	export let handlers: PracticeCompletionProps['handlers'];

	// חילוץ ערכים מהפרופס לשימוש בקומפוננטה
	$: totalWords = state.practice.session.words.length;
	$: repetitions = state.practice.session.totalRepetitions;
	$: currentSet = state.user.progress.currentSet;
	$: totalSets = calculateTotalSets(state.user.progress.level, state.user.progress.wordsPerSet);
</script>

<div class="completion-screen">
	<h1>סיימת את הסט!</h1>

	<div class="summary">
		<p>תרגלת {totalWords} מילים</p>
		<p>ביצעת {repetitions} חזרות</p>
		<p>השלמת את סט {currentSet} מתוך {totalSets}</p>
	</div>

	<div class="buttons">
		<Button onclick={handlers.onNextSet} text="לסט הבא" disabled={currentSet >= totalSets} />

		<Button onclick={handlers.onRepeatSet} text="חזרה על הסט" />

		<Button onclick={handlers.onHome} text="חזרה לדף הבית" />
	</div>
</div>
```

### 2. עדכון הדפים שמשתמשים בקומפוננטות

#### דף התרגול

```svelte
<!-- src/routes/practice/level/[level]/set/[set]/word/[word]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { appState, updateSettings } from '$lib/state/appState';
	import { navigateToPractice, navigateToCompletion, navigateToHome } from '$lib/navigation';
	import { match } from '$lib/utils/result';
	import PracticeScreen from '$lib/components/screens/PracticeScreen.svelte';

	// קריאת הפרמטרים מה-URL
	const level = parseInt($page.params.level, 10);
	const set = parseInt($page.params.set, 10);
	const word = parseInt($page.params.word, 10);

	// קריאה מהסטייט הגלובלי
	const settings = appState.user.progress;

	// עדכון הסטייט הגלובלי לפי הפרמטרים מה-URL
	if (settings.level !== level || settings.currentSet !== set) {
		const result = updateSettings({
			level,
			currentSet: set
		});

		match(
			result,
			() => {
				// עדכון מוצלח
			},
			(error) => {
				console.error('שגיאה בעדכון ההגדרות:', error);
			}
		);
	}

	// יצירת סטייט מקומי
	const state = $state({
		session: {
			words: [], // יאותחל בהמשך
			currentIndex: word - 1, // אינדקס המילה הנוכחית (0-based)
			wordsPerRepetition: settings.wordsPerSet,
			totalRepetitions: settings.repetitionsPerSet
		},
		ui: {
			isWordVisible: true,
			isImageVisible: false,
			direction: null,
			lastDirection: 'next'
		}
	});

	// טעינת המילים לסט הנוכחי
	onMount(() => {
		const result = getCurrentSetWords();
		match(
			result,
			(words) => {
				state.session.words = words;
			},
			(error) => {
				console.error('שגיאה בטעינת המילים:', error);
			}
		);
	});

	// פונקציות טיפול באירועים
	function handleNext() {
		// עדכון הסטייט המקומי
		state.ui.direction = 'next';
		state.ui.lastDirection = 'next';

		// ניווט למילה הבאה
		const result = navigateToPractice(level, set, word + 1);
		match(
			result,
			() => {
				// ניווט מוצלח
			},
			(error) => {
				console.error('שגיאה בניווט:', error);
			}
		);
	}

	function handlePrev() {
		// עדכון הסטייט המקומי
		state.ui.direction = 'prev';
		state.ui.lastDirection = 'prev';

		// ניווט למילה הקודמת
		const result = navigateToPractice(level, set, word - 1);
		match(
			result,
			() => {
				// ניווט מוצלח
			},
			(error) => {
				console.error('שגיאה בניווט:', error);
			}
		);
	}

	function handleFinish() {
		// ניווט לדף הסיום
		const result = navigateToCompletion(level, set);
		match(
			result,
			() => {
				// ניווט מוצלח
			},
			(error) => {
				console.error('שגיאה בניווט:', error);
			}
		);
	}
</script>

<!-- העברת הפרופס במבנה החדש -->
<PracticeScreen
	state={{
		user: {
			progress: settings
		},
		practice: {
			session: state.session,
			ui: state.ui
		}
	}}
	handlers={{
		onNext: handleNext,
		onPrev: handlePrev,
		onFinish: handleFinish,
		onExit: () => navigateToHome(),
		onImageCardClick: () => (state.ui.isImageVisible = !state.ui.isImageVisible),
		onWordCardClick: () => (state.ui.isWordVisible = !state.ui.isWordVisible)
	}}
/>
```

## יתרונות נוספים

1. **הפרדת אחריות** - הפרדה ברורה בין נתונים (state) לפונקציות (handlers)
2. **קריאות** - קל יותר להבין את המבנה של הפרופס ואת היחסים בין הקומפוננטות
3. **תחזוקה** - קל יותר לעדכן את הפרופס בלי לשבור את הקומפוננטות
4. **בדיקות** - קל יותר לכתוב בדיקות לקומפוננטות עם מבנה פרופס אחיד
5. **תיעוד** - הטיפוסים מהווים תיעוד של הפרופס הנדרשים לכל קומפוננטה

## אתגרים ופתרונות

### אתגר 1: מעבר חלק מהמצב הנוכחי למצב החדש

**פתרון**: נבצע את המעבר בשלבים:

1. נוסיף את הטיפוסים החדשים
2. נעדכן את הקומפוננטות לתמיכה בפרופס החדשים, תוך שמירה על תמיכה בפרופס הישנים
3. נעדכן את הדפים שמשתמשים בקומפוננטות להעברת הפרופס במבנה החדש
4. נסיר את התמיכה בפרופס הישנים

### אתגר 2: שמירה על ביצועים

**פתרון**: נשתמש ב-memoization כדי למנוע חישובים מיותרים:

```svelte
<script>
	// ...

	// חישוב ערכים נגזרים פעם אחת בלבד
	$: derivedValues = $derived(() => {
		return {
			isFirst: state.practice.session.currentIndex === 0,
			isLast: state.practice.session.currentIndex === state.practice.session.words.length - 1,
			currentWord: state.practice.session.words[state.practice.session.currentIndex] || {}
		};
	});
</script>
```

### אתגר 3: טיפול בערכים חסרים

**פתרון**: נשתמש בערכי ברירת מחדל וב-optional chaining:

```svelte
<script>
	// ...

	// ערכי ברירת מחדל
	const defaultState = {
		user: {
			progress: {
				wordsPerSet: 5,
				currentSet: 1,
				repetitionsPerSet: 3,
				hideAfterSeconds: 2,
				level: 1
			}
		},
		practice: {
			session: {
				words: [],
				currentIndex: 0,
				wordsPerRepetition: 5,
				totalRepetitions: 3
			},
			ui: {
				isWordVisible: true,
				isImageVisible: false,
				direction: null,
				lastDirection: 'next'
			}
		}
	};

	// מיזוג עם ערכי ברירת מחדל
	$: mergedState = {
		user: {
			progress: { ...defaultState.user.progress, ...state?.user?.progress }
		},
		practice: {
			session: { ...defaultState.practice.session, ...state?.practice?.session },
			ui: { ...defaultState.practice.ui, ...state?.practice?.ui }
		}
	};
</script>
```
