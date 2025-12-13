function initializeApp() {
	calculateTotalSets();
	loadProgress();
	setupEventListeners();
	showScreen('home');
}

function setupEventListeners() {
	// כפתורי ניווט
	document.querySelector('.prev-btn').addEventListener('click', showPreviousWord);
	document.querySelector('.next-btn').addEventListener('click', showNextWord);

	// כפתור התחלה
	document.querySelector('.start-btn').addEventListener('click', startNewSet);

	// שינוי מספר מילים בסט
	document.getElementById('wordsPerSet').addEventListener('change', (e) => {
		const value = parseInt(e.target.value);
		if (value > 0 && value <= state.totalWords) {
			state.wordsPerSet = value;
			calculateTotalSets();
			// עדכון ערך ברירת המחדל של מספר הסט
			const setNumberInput = document.getElementById('setNumber');
			if (parseInt(setNumberInput.value) > state.totalSets) {
				setNumberInput.value = '1';
				state.currentSet = 1;
			}
		} else {
			e.target.value = state.wordsPerSet;
		}
	});

	// שינוי מספר סט
	const setNumberInput = document.getElementById('setNumber');
	setNumberInput.addEventListener('focus', (e) => {
		e.target.value = '';
	});

	setNumberInput.addEventListener('change', (e) => {
		const value = parseInt(e.target.value);
		if (!validateSetNumber(value)) {
			e.target.value = state.currentSet;
		}
	});

	setNumberInput.addEventListener('blur', (e) => {
		if (e.target.value === '') {
			e.target.value = state.currentSet;
		}
	});

	// מקשי מקלדת
	document.addEventListener('keydown', handleKeyPress);
}

function startNewSet() {
	const setNumberInput = document.getElementById('setNumber');
	const selectedSet = parseInt(setNumberInput.value);

	if (validateSetNumber(selectedSet)) {
		state.currentSet = selectedSet;
		state.currentWordIndex = 0;
		loadCurrentSetWords();
		updateDisplay();
		switchToPractice();
	} else {
		alert('מספר סט לא תקין. אנא בחר מספר בין 1 ל-' + state.totalSets);
		setNumberInput.value = state.currentSet;
	}
}

function finishSet() {
	if (state.currentSet < state.totalSets) {
		state.currentSet++;
		saveProgress();
		switchToHome();
	} else {
		// סיום כל הסטים
		alert('כל הכבוד! סיימת את כל הסטים!');
		state.currentSet = 1;
		saveProgress();
		switchToHome();
	}
}

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', initializeApp);
