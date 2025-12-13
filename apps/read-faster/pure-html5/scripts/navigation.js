function showScreen(screenId) {
	// הסתרת כל המסכים
	document.querySelectorAll('.screen').forEach((screen) => {
		screen.classList.remove('active');
	});

	// הצגת המסך הרצוי
	document.getElementById(screenId + 'Screen').classList.add('active');
}

function switchToPractice() {
	showScreen('practice');
}

function switchToHome() {
	showScreen('home');
}

let isTransitioning = false;

function handleTransition(callback) {
	if (!isTransitioning) {
		isTransitioning = true;
		callback();
		setTimeout(() => {
			isTransitioning = false;
		}, 300);
	}
}

function showNextWord() {
	handleTransition(() => {
		const wordCard = document.querySelector('.word-card');
		wordCard.classList.add('next');

		setTimeout(() => {
			if (state.currentWordIndex < state.currentSetWords.length - 1) {
				state.currentWordIndex++;
				updateDisplay();
			} else {
				finishSet();
			}
			wordCard.classList.remove('next');
		}, 300);
	});
}

function showPreviousWord() {
	handleTransition(() => {
		if (state.currentWordIndex > 0) {
			const wordCard = document.querySelector('.word-card');
			wordCard.classList.add('prev');

			setTimeout(() => {
				state.currentWordIndex--;
				updateDisplay();
				wordCard.classList.remove('prev');
			}, 300);
		}
	});
}

// טיפול במקשי מקלדת
function handleKeyPress(event) {
	if (document.getElementById('practiceScreen').classList.contains('active')) {
		if (event.key === 'ArrowLeft') {
			showNextWord();
		} else if (event.key === 'ArrowRight') {
			showPreviousWord();
		} else if (event.key === ' ' && !event.repeat) {
			showWord();
			event.preventDefault(); // מניעת גלילה
		}
	}
}

// הוספת מאזין לשחרור מקשים
document.addEventListener('keyup', (event) => {
	if (event.key === ' ' && document.getElementById('practiceScreen').classList.contains('active')) {
		hideWord();
	}
});

// הוספת מאזינים לכפתור הצגת המילה
document.addEventListener('DOMContentLoaded', () => {
	const showWordBtn = document.querySelector('.show-word-btn');

	// לחיצה על הכפתור
	showWordBtn.addEventListener('mousedown', () => {
		showWord();
	});

	// שחרור הכפתור
	showWordBtn.addEventListener('mouseup', () => {
		hideWord();
	});

	// עזיבת העכבר מהכפתור
	showWordBtn.addEventListener('mouseleave', () => {
		hideWord();
	});

	// תמיכה במכשירים ניידים
	showWordBtn.addEventListener('touchstart', (e) => {
		e.preventDefault();
		showWord();
	});

	showWordBtn.addEventListener('touchend', () => {
		hideWord();
	});
});
