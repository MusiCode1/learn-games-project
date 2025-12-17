/**
 * סקריפט ליצירת קבצי סאונד עם Gemini TTS
 *
 * שימוש:
 *   bun run scripts/generate-sounds.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// --- Configuration ---
const VOICE_NAME = "Charon";
const MODEL_NAME = "gemini-2.5-pro-preview-tts";
const GENERATION_DELAY_MS = 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(APP_ROOT, "../..");
const OUTPUT_DIR = path.resolve(APP_ROOT, "static/sounds");

// Load envs
dotenv.config({ path: path.resolve(APP_ROOT, ".env.local") });
dotenv.config({ path: path.resolve(APP_ROOT, ".env") });
dotenv.config({ path: path.resolve(REPO_ROOT, ".env.local") });
dotenv.config({ path: path.resolve(REPO_ROOT, ".env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is not set.");
  process.exit(1);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- WAV Conversion Helpers ---

interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

function convertToWav(rawData: string, mimeType: string) {
  const options = parseMimeType(mimeType);
  const wavHeader = createWavHeader(rawData.length, options);
  const buffer = Buffer.from(rawData, "base64");
  return Buffer.concat([wavHeader, buffer]);
}

function parseMimeType(mimeType: string) {
  const options: WavConversionOptions = {
    numChannels: 1,
    sampleRate: 24000,
    bitsPerSample: 16,
  };

  if (!mimeType) return options;

  const parts = mimeType.split(";");
  const [fileType] = parts;
  const [_, format] = fileType.split("/");

  if (format && format.startsWith("l")) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of parts.slice(1)) {
    const [key, value] = param.trim().split("=");
    if (key === "rate") {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options;
}

function createWavHeader(dataLength: number, options: WavConversionOptions) {
  const { numChannels, sampleRate, bitsPerSample } = options;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

async function generateAudio(text: string, outputPath: string, retryCount = 0) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

  const promptText =
    "Please say the following Hebrew text clearly, calmly, and authoritatively. " +
    "Do not add any introductory text. Just say it.\n" +
    "Text: " +
    text;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      responseModalities: ["audio"],
      temperature: 1,
      speech_config: {
        voice_config: {
          prebuilt_voice_config: {
            voice_name: VOICE_NAME,
          },
        },
      },
    },
  };

  console.log(`🎤 Generating audio for: "${text}"...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryDelay = 60000;
        console.log(`⏳ Rate limited. Waiting ${retryDelay / 1000}s...`);
        await delay(retryDelay);
        return generateAudio(text, outputPath, retryCount + 1);
      }
      if (response.status === 500) {
        await delay(5000);
        return generateAudio(text, outputPath, retryCount + 1);
      }

      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const inlineData = candidate?.content?.parts?.[0]?.inlineData;

    if (!inlineData || !inlineData.data) {
      throw new Error("No audio data found in response.");
    }

    const mimeType = inlineData.mimeType;
    console.log(`ℹ️  Received mimeType: ${mimeType}`);

    let buffer: Buffer;

    if (
      !mimeType ||
      mimeType.toLowerCase().startsWith("audio/l16") ||
      mimeType.toLowerCase().startsWith("audio/lpcm")
    ) {
      buffer = convertToWav(
        inlineData.data,
        mimeType || "audio/l16; rate=24000"
      );
    } else {
      buffer = Buffer.from(inlineData.data, "base64");
    }

    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Saved to: ${path.basename(outputPath)}`);
  } catch (error: any) {
    if (
      retryCount < 3 &&
      (error.message?.includes("429") || error.message?.includes("500"))
    ) {
      await delay(60000);
      return generateAudio(text, outputPath, retryCount + 1);
    }
    throw error;
  }
}

// הוראות המשחק
const PHRASES = [
  { filename: "put_1_cars.wav", text: "שִׂים קָרוֹן אֶחָד" },
  { filename: "put_2_cars.wav", text: "שִׂים שְׁנֵי קְרוֹנוֹת" },
  { filename: "put_3_cars.wav", text: "שִׂים שְׁלוֹשָׁה קְרוֹנוֹת" },
  { filename: "put_4_cars.wav", text: "שִׂים אַרְבָּעָה קְרוֹנוֹת" },
  { filename: "put_5_cars.wav", text: "שִׂים חֲמִישָּׁה קְרוֹנוֹת" },
  { filename: "add_1_cars.wav", text: "הוֹסֵף עוֹד קָרוֹן אֶחָד" },
  { filename: "add_2_cars.wav", text: "הוֹסֵף עוֹד שְׁנֵי קְרוֹנוֹת" },
  { filename: "add_3_cars.wav", text: "הוֹסֵף עוֹד שְׁלוֹשָׁה קְרוֹנוֹת" },
  { filename: "add_4_cars.wav", text: "הוֹסֵף עוֹד אַרְבָּעָה קְרוֹנוֹת" },
  { filename: "how_many.wav", text: "כַּמָּה קְרוֹנוֹת יֵשׁ עַכְשָׁיו?" },
  { filename: "correct.wav", text: "נָכוֹן! כָּל הַכָּבוֹד!" },
  { filename: "wrong.wav", text: "לֹא נָכוֹן. נַסֵּה שׁוּב." },
  { filename: "lets_see_together.wav", text: "בּוֹא נִרְאֶה יַחַד" },
];

async function main() {
  console.log(`📂 Creating sounds for train-addition-game...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`📁 Creating output directory...`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const phrase of PHRASES) {
    const outputPath = path.join(OUTPUT_DIR, phrase.filename);

    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping (exists): ${phrase.filename}`);
      skipCount++;
      continue;
    }

    try {
      await generateAudio(phrase.text, outputPath);
      successCount++;
      await delay(GENERATION_DELAY_MS);
    } catch (error: any) {
      console.error(`❌ Failed to generate "${phrase.text}":`, error.message);
      failCount++;
    }
  }

  console.log("\n--- Summary ---");
  console.log(`✅ Generated: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

main().catch(console.error);
