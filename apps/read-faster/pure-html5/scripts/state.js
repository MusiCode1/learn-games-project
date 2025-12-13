const state = {
	// הגדרות
	wordsPerSet: 5,
	totalWords: wordList.length,

	// מצב נוכחי
	currentSet: 1,
	currentWordIndex: 0,
	totalSets: 0,

	// נתונים
	words: wordList,
	currentSetWords: []
};

function calculateTotalSets() {
	state.totalSets = Math.ceil(state.totalWords / state.wordsPerSet);
	updateTotalSetsDisplay();
}

function loadCurrentSetWords() {
	const startIndex = (state.currentSet - 1) * state.wordsPerSet;
	state.currentSetWords = state.words.slice(startIndex, startIndex + state.wordsPerSet);
}

function validateSetNumber(setNumber) {
	return setNumber > 0 && setNumber <= state.totalSets;
}

function saveProgress() {
	localStorage.setItem(
		'readFasterProgress',
		JSON.stringify({
			currentSet: state.currentSet,
			wordsPerSet: state.wordsPerSet
		})
	);
}

function loadProgress() {
	const savedProgress = localStorage.getItem('readFasterProgress');
	if (savedProgress) {
		const progress = JSON.parse(savedProgress);
		state.currentSet = progress.currentSet;
		state.wordsPerSet = progress.wordsPerSet;
		document.getElementById('wordsPerSet').value = state.wordsPerSet;
		document.getElementById('setNumber').value = state.currentSet;
	}
}

function setCurrentSet(setNumber) {
	if (validateSetNumber(setNumber)) {
		state.currentSet = setNumber;
		return true;
	}
	return false;
}

// עדכון תצוגה
function updateDisplay() {
	const wordElement = document.querySelector('.word');
	wordElement.textContent = state.currentSetWords[state.currentWordIndex];
	wordElement.classList.add('hidden'); // הסתרת המילה בהתחלה
	updateProgressDisplay();
}

let showWordTimer = null;

function showWord() {
	const wordElement = document.querySelector('.word');
	wordElement.classList.remove('hidden');

	// ביטול הטיימר הקודם אם קיים
	if (showWordTimer) {
		clearTimeout(showWordTimer);
		showWordTimer = null;
	}
}

function hideWord() {
	// הסתר את המילה אחרי 3 שניות
	showWordTimer = setTimeout(() => {
		const wordElement = document.querySelector('.word');
		wordElement.classList.add('hidden');
		showWordTimer = null;
	}, 3000);
}

function updateProgressDisplay() {
	// עדכון מונה מילים
	document.querySelector('.current-word').textContent = state.currentWordIndex + 1;
	document.querySelector('.words-per-set').textContent = state.currentSetWords.length;

	// עדכון מונה סטים
	const currentSetElements = document.querySelectorAll('.current-set');
	currentSetElements.forEach((element) => {
		element.textContent = state.currentSet;
	});
}

function updateTotalSetsDisplay() {
	const totalSetsElements = document.querySelectorAll('.total-sets');
	totalSetsElements.forEach((element) => {
		element.textContent = state.totalSets;
	});
}
