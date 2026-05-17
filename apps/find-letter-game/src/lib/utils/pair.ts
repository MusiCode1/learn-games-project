/**
 * פונקציות ליצירת LetterVowelPair מ-Letter + Vowel.
 *
 * עקרון:
 *   - `makePair(letter, patah)` מחזיר pair שה-id, display, speak שלו
 *     **זהים בדיוק** ל-LetterCard.id/display/speak הישן.
 *     זה שומר על תאימות עם selectedLetterIds, PHONETIC_SIMILARITY_PAIRS ו-TTS_FILES.
 *
 *   - `generateDeck()` מייצר מכפלה קרטזית מסוננת של Letters × Vowels.
 *
 * מסמך תכנון: docs/plans/vowels-support-plan.md §3, §7
 * Brief: docs/plans/briefs/phase-1-letter-vowel-refactor-brief.md §Sub-phase 1.2
 */

import type { LetterGroup } from './letters';
import type { Letter } from '../data/letters';
import type { Vowel, VowelCode } from '../data/vowels';
import { LETTERS_BY_LEGACY_ID } from '../data/letters';
import { VOWELS_BY_CODE } from '../data/vowels';

export interface LetterVowelPair {
	/**
	 * id מורכב:
	 *   - patah → letter.legacyCardId (תאימות עם selectedLetterIds וה-similarity)
	 *   - אחר  → `${letter.id}__${vowel.code}`
	 */
	id: string;
	letter: Letter;
	vowel: Vowel;
	/** display: letter.legacyDisplayPatah עבור patah, אחרת letter.displayChar + vowel.mark */
	display: string;
	/** speak: letter.legacySpeakPatah עבור patah, אחרת letter.displayChar + vowel.speakSuffix */
	speak: string;
	/** לתאימות עם קוד legacy שמצפה ל-LetterCard */
	group: LetterGroup;
}

/**
 * בונה LetterVowelPair מ-Letter ו-Vowel.
 *
 * עבור patah: משתמש ב-legacySpeakPatah ו-legacyDisplayPatah — ערכים ישנים מדויקים.
 * עבור שאר: בונה דינמית מ-displayChar + suffix.
 */
export function makePair(letter: Letter, vowel: Vowel): LetterVowelPair {
	const id =
		vowel.code === 'patah' ? letter.legacyCardId : `${letter.id}__${vowel.code}`;

	// עבור patah — משתמש בערכים legacy כדי לשמור תאימות מלאה עם TTS_FILES
	const speak =
		vowel.code === 'patah'
			? letter.legacySpeakPatah
			: letter.displayChar + vowel.speakSuffix;

	const display =
		vowel.code === 'patah'
			? letter.legacyDisplayPatah
			: letter.displayChar + vowel.mark;

	return { id, letter, vowel, display, speak, group: letter.group };
}

/**
 * מחזיר true אם צירוף letter+vowel תקף.
 * בפאזה 1: תמיד true (אין סופיות).
 * בפאזה 4: יסנן out סופיות + (שווא/none).
 */
export function isValidCombination(letter: Letter, vowel: Vowel): boolean {
	// בעתיד: if (letter.isFinalForm && (vowel.code === 'shva' || vowel.code === 'none')) return false;
	void vowel; // suppress unused param warning
	void letter;
	return true;
}

/**
 * מייצר deck מלא מ-selectedLetterIds × selectedVowels.
 *
 * @param selectedLetterIds - מזהי LetterCard ישנים (legacyCardId) — מ-settings.selectedLetterIds
 * @param selectedVowels - מערך VowelCode — מ-settings.selectedVowels
 * @returns מכפלה קרטזית מסוננת של LetterVowelPair
 */
export function generateDeck(
	selectedLetterIds: string[],
	selectedVowels: VowelCode[]
): LetterVowelPair[] {
	const pairs: LetterVowelPair[] = [];

	for (const letterId of selectedLetterIds) {
		const letter = LETTERS_BY_LEGACY_ID.get(letterId);
		if (!letter) continue; // מזהה לא קיים — דלג

		for (const vowelCode of selectedVowels) {
			const vowel = VOWELS_BY_CODE[vowelCode];
			if (!vowel) continue; // vowel לא קיים — דלג

			if (!isValidCombination(letter, vowel)) continue;

			pairs.push(makePair(letter, vowel));
		}
	}

	return pairs;
}
