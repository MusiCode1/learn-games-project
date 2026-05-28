/**
 * produce-batch.ts — batch TTS production for find-letter-game
 *
 * Spec: tts-review/specs-7-vowels.md
 * Vowels: hirik (done), segol, tzere, holam, shuruk, kubutz, hatafPatah, hatafSegol
 *
 * Usage:
 *   bun produce-batch.ts --vowel hirik
 *   bun produce-batch.ts --vowel segol,tzere,holam,shuruk,kubutz,hatafPatah,hatafSegol
 *   bun produce-batch.ts --vowel all
 *
 * Outputs: tts-review/batch/<vowel>/<Filename>.mp3
 * Resume: skips existing files.
 * Rate limit: 500ms between API calls.
 *
 * Overrides (from specs-7-vowels.md):
 *   fa_rafe: always Latin transliteration per vowel
 *   tz (צ): Latin transliteration per vowel (from pilot: tsee worked for hirik)
 *   ch + hirik: חִ (without yod — from pilot: Chi-v6 worked)
 */

import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== Letter definitions =====

interface Letter {
	id: string;
	char: string;
	displayChar: string;
	legacyCardId: string;
	speakChar?: string; // override char for speak (va_rafe='ו', cha_rafe='ח', fa_rafe='F')
	group: string;
}

const ALL_LETTERS: Letter[] = [
	// base — 21 letters
	{ id: 'a',       char: 'א', displayChar: 'א',  legacyCardId: 'a',       group: 'base' },
	{ id: 'b',       char: 'ב', displayChar: 'בּ', legacyCardId: 'ba',      group: 'base' },
	{ id: 'g',       char: 'ג', displayChar: 'ג',  legacyCardId: 'ga',      group: 'base' },
	{ id: 'd',       char: 'ד', displayChar: 'ד',  legacyCardId: 'da',      group: 'base' },
	{ id: 'h',       char: 'ה', displayChar: 'ה',  legacyCardId: 'ha',      group: 'base' },
	{ id: 'v',       char: 'ו', displayChar: 'ו',  legacyCardId: 'va',      group: 'base' },
	{ id: 'z',       char: 'ז', displayChar: 'ז',  legacyCardId: 'za',      group: 'base' },
	{ id: 'ch',      char: 'ח', displayChar: 'ח',  legacyCardId: 'cha',     group: 'base' },
	{ id: 't',       char: 'ט', displayChar: 'ט',  legacyCardId: 'ta',      group: 'base' },
	{ id: 'y',       char: 'י', displayChar: 'י',  legacyCardId: 'ya',      group: 'base' },
	{ id: 'k',       char: 'כ', displayChar: 'כּ', legacyCardId: 'ka',      group: 'base' },
	{ id: 'l',       char: 'ל', displayChar: 'ל',  legacyCardId: 'la',      group: 'base' },
	{ id: 'mm',      char: 'מ', displayChar: 'מ',  legacyCardId: 'ma',      group: 'base' },
	{ id: 'nn',      char: 'נ', displayChar: 'נ',  legacyCardId: 'na',      group: 'base' },
	{ id: 's',       char: 'ס', displayChar: 'ס',  legacyCardId: 'sa',      group: 'base' },
	{ id: 'p',       char: 'פ', displayChar: 'פּ', legacyCardId: 'pa',      group: 'base' },
	{ id: 'tz',      char: 'צ', displayChar: 'צ',  legacyCardId: 'tza',     group: 'base' },
	{ id: 'q',       char: 'ק', displayChar: 'ק',  legacyCardId: 'qa',      group: 'base' },
	{ id: 'r',       char: 'ר', displayChar: 'ר',  legacyCardId: 'ra',      group: 'base' },
	{ id: 'sh',      char: 'ש', displayChar: 'שׁ', legacyCardId: 'sha',     group: 'base' },
	{ id: 'tav',     char: 'ת', displayChar: 'תּ', legacyCardId: 'tav',     group: 'base' },
	// confusing
	{ id: 'sin',     char: 'ש', displayChar: 'שׂ', legacyCardId: 'sa_sin',  group: 'confusing' },
	{ id: 'aa',      char: 'ע', displayChar: 'ע',  legacyCardId: 'aa',      group: 'confusing' },
	// rafe
	{ id: 'v_rafe',  char: 'ב', displayChar: 'ב',  legacyCardId: 'va_rafe',  speakChar: 'ו', group: 'rafe' },
	{ id: 'ch_rafe', char: 'כ', displayChar: 'כ',  legacyCardId: 'cha_rafe', speakChar: 'ח', group: 'rafe' },
	{ id: 'f_rafe',  char: 'פ', displayChar: 'פ',  legacyCardId: 'fa_rafe',  speakChar: 'F', group: 'rafe' },
];

// ===== Vowel config =====

type VowelCode = 'hirik' | 'segol' | 'tzere' | 'holam' | 'shuruk' | 'kubutz' | 'hatafPatah' | 'hatafSegol';

interface VowelConfig {
	code: VowelCode;
	speakSuffix: string;
	dir: string;
}

const VOWEL_CONFIGS: Record<VowelCode, VowelConfig> = {
	hirik:      { code: 'hirik',      speakSuffix: '\u05B4\u05D9', dir: 'hirik'      }, // ִי
	segol:      { code: 'segol',      speakSuffix: '\u05B6\u05D0', dir: 'segol'      }, // ֶא
	tzere:      { code: 'tzere',      speakSuffix: '\u05B5\u05D0', dir: 'tzere'      }, // ֵא
	holam:      { code: 'holam',      speakSuffix: '\u05B9\u05D0', dir: 'holam'      }, // ֹא
	shuruk:     { code: 'shuruk',     speakSuffix: '\u05D5\u05BC', dir: 'shuruk'     }, // וּ
	kubutz:     { code: 'kubutz',     speakSuffix: '\u05BB',        dir: 'kubutz'     }, // ֻ
	hatafPatah: { code: 'hatafPatah', speakSuffix: '\u05B2\u05D0', dir: 'hatafPatah' }, // ֲא
	hatafSegol: { code: 'hatafSegol', speakSuffix: '\u05B1\u05D0', dir: 'hatafSegol' }, // ֱא
};

// ===== Speak computation (per specs-7-vowels.md) =====

/**
 * Latin map for fa_rafe (פ רפה) per vowel — always Latin transliteration.
 */
const FA_RAFE_LATIN: Record<VowelCode, string> = {
	hirik:      'Fi',
	segol:      'Fe',
	tzere:      'Fei',
	holam:      'Fo',
	shuruk:     'Fu',
	kubutz:     'Fu',   // same as shuruk — will verify sharing in judge
	hatafPatah: 'Fa',   // same as patah — will be marked shared in TTS_FILES
	hatafSegol: 'Fe',   // same as segol — will be marked shared
};

/**
 * Latin map for tz (צ) per vowel — Latin transliteration.
 * From pilot: 'tsee' worked for hirik. Same approach for all vowels.
 */
const TZ_LATIN: Record<VowelCode, string> = {
	hirik:      'tsee',
	segol:      'tse',
	tzere:      'tsei',
	holam:      'tso',
	shuruk:     'tsoo',
	kubutz:     'tsoo',
	hatafPatah: 'tsa',
	hatafSegol: 'tse',
};

function computeSpeak(letter: Letter, vowel: VowelConfig): string {
	// fa_rafe: always Latin
	if (letter.id === 'f_rafe') return FA_RAFE_LATIN[vowel.code];

	// tz (צ): Latin transliteration per vowel
	if (letter.id === 'tz') return TZ_LATIN[vowel.code];

	// ch/ch_rafe + hirik: use חִ (without yod) — from pilot Chi-v6
	if ((letter.id === 'ch' || letter.id === 'ch_rafe') && vowel.code === 'hirik') return 'חִ';

	// Default: speakChar (if defined) or displayChar + speakSuffix
	const base = letter.speakChar ?? letter.displayChar;
	return base + vowel.speakSuffix;
}

// ===== Filename computation =====

const FILENAME_BASE: Record<string, string> = {
	'a':        'A',
	'ba':       'B',
	'ga':       'G',
	'da':       'D',
	'ha':       'H',
	'va':       'V',
	'za':       'Z',
	'cha':      'Ch',
	'ta':       'T',
	'ya':       'Y',
	'ka':       'K',
	'la':       'L',
	'ma':       'M',
	'na':       'N',
	'sa':       'S',
	'pa':       'P',
	'tza':      'Tsa',
	'qa':       'Q',
	'ra':       'R',
	'sha':      'Sh',
	'tav':      'Tav',
	'sa_sin':   'Sin',
	'aa':       'Aa',
	'va_rafe':  'Vr',
	'cha_rafe': 'Chr',
	'fa_rafe':  'F',
};

const VOWEL_SUFFIX: Record<VowelCode, string> = {
	hirik:      'i',
	segol:      'e',
	tzere:      'ei',
	holam:      'o',
	shuruk:     'u',
	kubutz:     'uu',
	hatafPatah: 'ah',
	hatafSegol: 'eh',
};

function computeFilename(letter: Letter, vowel: VowelConfig): string {
	const base   = FILENAME_BASE[letter.legacyCardId] ?? letter.id;
	const suffix = VOWEL_SUFFIX[vowel.code];
	return `${base}${suffix}.mp3`;
}

// ===== TTS API =====

const PROXY_BASE = 'https://aac-proxy.aybritman.workers.dev/v1/tts';
const VOICE_ID   = 'EXAVITQu4vr4xnSDxMaL'; // Sarah
const MODEL_ID   = 'eleven_v3';

async function synthesize(speakText: string): Promise<Buffer> {
	const postRes = await fetch(PROXY_BASE, {
		method:  'POST',
		headers: { 'Content-Type': 'application/json' },
		body:    JSON.stringify({ text: speakText, provider: 'elevenlabs',
		                          voiceId: VOICE_ID, modelId: MODEL_ID, lang: 'he-IL' }),
	});
	if (!postRes.ok) throw new Error(`POST ${postRes.status}: ${await postRes.text()}`);

	const { hash } = await postRes.json() as { hash: string };
	if (!hash) throw new Error('no hash');

	const getRes = await fetch(`${PROXY_BASE}/${hash}`);
	if (!getRes.ok) throw new Error(`GET ${getRes.status}: ${await getRes.text()}`);

	return Buffer.from(await getRes.arrayBuffer());
}

function sleep(ms: number): Promise<void> {
	return new Promise(r => setTimeout(r, ms));
}

// ===== Main =====

interface ProduceResult {
	legacyCardId: string;
	filename:     string;
	speakText:    string;
	filePath:     string;
	status:       'produced' | 'skipped' | 'error';
	error?:       string;
}

async function produceBatch(vowelCode: VowelCode): Promise<ProduceResult[]> {
	const vowel   = VOWEL_CONFIGS[vowelCode];
	const outDir  = join(__dirname, 'batch', vowel.dir);
	mkdirSync(outDir, { recursive: true });

	const results: ProduceResult[] = [];
	console.log(`\n=== ${vowelCode} ===  dir: ${outDir}`);

	for (const letter of ALL_LETTERS) {
		const speakText = computeSpeak(letter, vowel);
		const filename  = computeFilename(letter, vowel);
		const filePath  = join(outDir, filename);
		const res: ProduceResult = { legacyCardId: letter.legacyCardId, filename, speakText, filePath, status: 'produced' };

		if (existsSync(filePath)) {
			process.stdout.write(`  SKIP  ${filename}\n`);
			res.status = 'skipped';
			results.push(res);
			continue;
		}

		try {
			process.stdout.write(`  PROD  ${filename}  speak="${speakText}"\n`);
			const buf = await synthesize(speakText);
			writeFileSync(filePath, buf);
			process.stdout.write(`  OK    ${filename} (${buf.length}B)\n`);
			await sleep(500);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			process.stdout.write(`  ERR   ${filename}: ${msg}\n`);
			res.status = 'error';
			res.error  = msg;
		}
		results.push(res);
	}

	const ok  = results.filter(r => r.status === 'produced').length;
	const sk  = results.filter(r => r.status === 'skipped').length;
	const err = results.filter(r => r.status === 'error').length;
	console.log(`\n  → ${ok} produced, ${sk} skipped, ${err} errors\n`);
	return results;
}

// CLI
const vowelArg = process.argv.slice(2).find(a => a.startsWith('--vowel'))
	?.replace('--vowel=', '') ?? process.argv[process.argv.indexOf('--vowel') + 1];

const ALL_VOWELS: VowelCode[] = ['hirik','segol','tzere','holam','shuruk','kubutz','hatafPatah','hatafSegol'];

if (!vowelArg) {
	console.error('Usage: bun produce-batch.ts --vowel <vowel|all>');
	process.exit(1);
}

const vowelList: VowelCode[] = vowelArg === 'all' ? ALL_VOWELS
	: (vowelArg.split(',').map(v => v.trim()) as VowelCode[]);

for (const v of vowelList) {
	if (!VOWEL_CONFIGS[v]) { console.error(`Unknown vowel: "${v}"`); process.exit(1); }
}

console.log(`Producing: ${vowelList.join(', ')}`);
for (const v of vowelList) await produceBatch(v);
console.log('All done.');
