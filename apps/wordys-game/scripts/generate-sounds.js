import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is one level up from "scripts"
const projectRoot = path.resolve(__dirname, '..');
const staticSoundsDir = path.resolve(projectRoot, 'static/sounds');
const outputDir = path.resolve(projectRoot, 'src/lib/data');
const outputFile = path.join(outputDir, 'sounds.json');

console.log('Using static sounds dir:', staticSoundsDir);
console.log('Output file:', outputFile);

if (!fs.existsSync(staticSoundsDir)) {
    console.warn(`Sounds directory not found: ${staticSoundsDir}`);
    // Create empty list if dir doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    process.exit(0);
}

if (!fs.existsSync(outputDir)) {
    console.log('Creating output directory...');
    fs.mkdirSync(outputDir, { recursive: true });
}

try {
    const files = fs.readdirSync(staticSoundsDir)
        .filter(file => /\.(mp3|wav|ogg)$/i.test(file));

    fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));
    console.log(`Successfully generated sound list with ${files.length} files.`);
} catch (error) {
    console.error('Error generating sounds list:', error);
    process.exit(1);
}
