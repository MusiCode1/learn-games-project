/**
 * סקריפט ליצירת קבצי אודיו בעברית באמצעות ElevenLabs V3
 *
 * משתמש ב-API של ElevenLabs עם מודל eleven_v3 — הדור האחרון של מודלי TTS,
 * התומך ביותר מ-70 שפות כולל עברית, עם טווח רגשי רחב והבנה הקשרית.
 *
 * דרישות:
 *   - משתנה סביבה ELEVENLABS_API_KEY מוגדר ב-.env או .env.local
 *   - קובץ JSON עם רשימת הטקסטים ליצירה (ראה example-phrases.json)
 *
 * פורמט קובץ הקלט (JSON):
 *   [
 *     { "filename": "hello.mp3", "text": "שלום" },
 *     { "filename": "goodbye.mp3", "text": "להתראות" }
 *   ]
 *
 * שימוש:
 *   bun run scripts/generate-audio-elevenlabs.ts --input phrases.json --output static/sounds
 *   bun run scripts/generate-audio-elevenlabs.ts --input phrases.json --output static/sounds --voice-id JBFqnCBsd6RMkjVDRZzb
 *
 * פרמטרים:
 *   --input   (חובה)  נתיב לקובץ JSON עם הטקסטים
 *   --output  (חובה)  תיקיית יעד לקבצי האודיו
 *   --voice-id (רשות) מזהה קול ב-ElevenLabs (ברירת מחדל: Rachel)
 *   --stability (רשות) יציבות הקול, 0-1 (ברירת מחדל: 0.5)
 *   --similarity (רשות) דמיון לקול המקורי, 0-1 (ברירת מחדל: 0.75)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// --- קביעת נתיבים ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// טעינת משתני סביבה — אותו מנגנון כמו בסקריפטים האחרים בפרויקט
dotenv.config({ path: path.resolve(REPO_ROOT, '.env.local') });
dotenv.config({ path: path.resolve(REPO_ROOT, '.env') });

// --- קבועים ---
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

/** מזהה מודל — חובה V3 בלבד */
const MODEL_ID = 'eleven_v3';

/** פורמט פלט — MP3 באיכות גבוהה */
const OUTPUT_FORMAT = 'mp3_44100_128';

/** קול ברירת מחדל (Rachel — קול נשי באיכות גבוהה) */
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

/** השהייה בין בקשות (ms) — מונע rate limiting */
const REQUEST_DELAY_MS = 1000;

/** מספר ניסיונות מקסימלי בכשלון */
const MAX_RETRIES = 3;

// --- פונקציות עזר ---

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * מחלץ ארגומנטים מ-CLI בפורמט --key value
 * @returns אובייקט עם כל הארגומנטים שנמצאו
 */
function parseArgs(): Record<string, string> {
	const args: Record<string, string> = {};
	const argv = process.argv.slice(2);

	for (let i = 0; i < argv.length; i++) {
		if (argv[i].startsWith('--') && i + 1 < argv.length) {
			const key = argv[i].slice(2);
			args[key] = argv[i + 1];
			i++; // מדלג על הערך
		}
	}

	return args;
}

/**
 * קורא ומפענח את קובץ ה-JSON עם רשימת הטקסטים
 * @param inputPath - נתיב לקובץ JSON
 * @returns מערך של אובייקטים עם filename ו-text
 */
function readPhrases(inputPath: string): Array<{ filename: string; text: string }> {
	const absolutePath = path.resolve(process.cwd(), inputPath);

	if (!fs.existsSync(absolutePath)) {
		console.error(`\u274C קובץ קלט לא נמצא: ${absolutePath}`);
		process.exit(1);
	}

	const raw = fs.readFileSync(absolutePath, 'utf-8');
	const data = JSON.parse(raw);

	// ולידציה בסיסית — כל פריט חייב להכיל filename ו-text
	if (!Array.isArray(data)) {
		console.error('\u274C קובץ הקלט חייב להכיל מערך JSON');
		process.exit(1);
	}

	for (const item of data) {
		if (!item.filename || !item.text) {
			console.error(`\u274C פריט לא תקין בקובץ הקלט — חסר filename או text:`, item);
			process.exit(1);
		}
	}

	return data;
}

/**
 * שולח בקשה ל-ElevenLabs V3 API ושומר את קובץ האודיו
 *
 * ה-API מחזיר audio/mpeg binary שנשמר ישירות לדיסק.
 * במקרה של rate limit (429) או שגיאת שרת (500) — מנסה שוב עד MAX_RETRIES.
 *
 * @param text - הטקסט להמרה לדיבור
 * @param outputPath - נתיב מלא לשמירת קובץ ה-MP3
 * @param voiceId - מזהה הקול ב-ElevenLabs
 * @param stability - יציבות הקול (0-1)
 * @param similarityBoost - דמיון לקול המקורי (0-1)
 * @param retryCount - מספר הניסיון הנוכחי (פנימי)
 */
async function generateAudio(
	text: string,
	outputPath: string,
	voiceId: string,
	stability: number,
	similarityBoost: number,
	retryCount = 0
): Promise<void> {
	// endpoint עם voice_id בנתיב ו-output_format כפרמטר
	const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`;

	const payload = {
		text,
		model_id: MODEL_ID,
		voice_settings: {
			stability,
			similarity_boost: similarityBoost
		}
	};

	console.log(`\uD83C\uDFA4 מייצר אודיו עבור: "${text}"...`);

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'xi-api-key': ELEVENLABS_API_KEY!
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			// rate limit — מחכים דקה ומנסים שוב
			if (response.status === 429) {
				const retryAfter = 60000;
				console.log(`\u23F3 חסימת rate limit. ממתין ${retryAfter / 1000} שניות...`);
				await delay(retryAfter);
				return generateAudio(text, outputPath, voiceId, stability, similarityBoost, retryCount + 1);
			}

			// שגיאת שרת — ממתין 5 שניות ומנסה שוב
			if (response.status === 500 && retryCount < MAX_RETRIES) {
				console.log(`\u26A0\uFE0F שגיאת שרת (500). ניסיון ${retryCount + 1}/${MAX_RETRIES}...`);
				await delay(5000);
				return generateAudio(text, outputPath, voiceId, stability, similarityBoost, retryCount + 1);
			}

			const errText = await response.text();
			throw new Error(`API Error ${response.status}: ${errText}`);
		}

		// התשובה היא binary (audio/mpeg) — שומרים ישירות כ-MP3
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		fs.writeFileSync(outputPath, buffer);
		console.log(`\u2705 נשמר: ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(1)}KB)`);
	} catch (error: any) {
		if (retryCount < MAX_RETRIES && (error.message?.includes('429') || error.message?.includes('500'))) {
			console.log(`\u26A0\uFE0F ניסיון חוזר ${retryCount + 1}/${MAX_RETRIES}...`);
			await delay(10000);
			return generateAudio(text, outputPath, voiceId, stability, similarityBoost, retryCount + 1);
		}
		throw error;
	}
}

// --- פונקציה ראשית ---

async function main() {
	// בדיקת מפתח API
	if (!ELEVENLABS_API_KEY) {
		console.error('\u274C משתנה ELEVENLABS_API_KEY לא מוגדר.');
		console.error('   הוסף אותו ל-.env או .env.local בשורש הפרויקט.');
		process.exit(1);
	}

	// פרסור ארגומנטים
	const args = parseArgs();

	if (!args.input || !args.output) {
		console.error('\u274C שימוש: bun run scripts/generate-audio-elevenlabs.ts --input <file.json> --output <dir>');
		console.error('   פרמטרים נוספים: --voice-id, --stability, --similarity');
		process.exit(1);
	}

	const voiceId = args['voice-id'] || DEFAULT_VOICE_ID;
	const stability = parseFloat(args.stability || '0.5');
	const similarityBoost = parseFloat(args.similarity || '0.75');

	console.log(`\uD83D\uDD27 הגדרות:`);
	console.log(`   מודל: ${MODEL_ID}`);
	console.log(`   פורמט: ${OUTPUT_FORMAT}`);
	console.log(`   Voice ID: ${voiceId}`);
	console.log(`   Stability: ${stability} | Similarity: ${similarityBoost}`);

	// קריאת קובץ הקלט
	const phrases = readPhrases(args.input);
	console.log(`\uD83D\uDCDD נמצאו ${phrases.length} טקסטים לייצור.`);

	// יצירת תיקיית פלט
	const outputDir = path.resolve(process.cwd(), args.output);
	if (!fs.existsSync(outputDir)) {
		console.log(`\uD83D\uDCC1 יוצר תיקיית פלט: ${outputDir}`);
		fs.mkdirSync(outputDir, { recursive: true });
	}

	let successCount = 0;
	let skipCount = 0;
	let failCount = 0;

	for (const phrase of phrases) {
		const outputPath = path.join(outputDir, phrase.filename);

		// דילוג על קבצים קיימים — חוסך זמן וכסף
		if (fs.existsSync(outputPath)) {
			console.log(`\u23ED\uFE0F  דילוג (קיים): ${phrase.filename}`);
			skipCount++;
			continue;
		}

		try {
			await generateAudio(phrase.text, outputPath, voiceId, stability, similarityBoost);
			successCount++;
			await delay(REQUEST_DELAY_MS);
		} catch (error: any) {
			console.error(`\u274C כשלון ביצירת "${phrase.text}":`, error.message);
			failCount++;
		}
	}

	// סיכום
	console.log('\n--- סיכום ---');
	console.log(`\u2705 נוצרו: ${successCount}`);
	console.log(`\u23ED\uFE0F  דולגו: ${skipCount}`);
	console.log(`\u274C נכשלו: ${failCount}`);
}

main().catch(console.error);
