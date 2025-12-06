import fs from 'fs';
import path from 'path';

const SOURCE_DIR = 'static/images';
const TARGET_DIR = 'wordys-assets-source/cards';
const WORDS_FILE = 'src/lib/data/words.ts';

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 1. Scan for images
function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = getFiles(SOURCE_DIR);
const mapping = new Map(); // oldPath -> newPath
const usageCount = new Map(); // fileName -> count

console.log(`Found ${files.length} images.`);

// 2. Check for collisions and Plan Move
files.forEach(file => {
    const filename = path.basename(file);
    if (usageCount.has(filename)) {
        console.warn(`⚠️ Warning: Duplicate filename found: ${filename} (at ${file})`);
        // Handle collision by prepending parent folder name? 
        // For now, let's just warn. We might overwrite or need manual fix.
    }
    usageCount.set(filename, (usageCount.get(filename) || 0) + 1);

    // Normalize path separators to forward slashes for code replacement
    const relativeOldPath = file.replace(/\\/g, '/').replace('static/', '');
    // e.g. "images/shelf_food/sweets/chocolate.png"

    const newFilename = filename;
    const relativeNewPath = `cards/${newFilename}`;

    mapping.set(relativeOldPath, relativeNewPath);

    // Copy file
    const targetPath = path.join(TARGET_DIR, newFilename);
    fs.copyFileSync(file, targetPath);
    console.log(`✅ Copied: ${filename}`);
});

// 3. Update words.ts
let wordsContent = fs.readFileSync(WORDS_FILE, 'utf-8');
let replacements = 0;

mapping.forEach((newPath, oldPath) => {
    // We are looking for strings that match the old path inside getAssetUrl(...)
    // e.g. getAssetUrl('images/shelf_food/sweets/chocolate.png')

    // Escape for regex
    const escapedOldPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOldPath, 'g');

    if (regex.test(wordsContent)) {
        wordsContent = wordsContent.replace(regex, newPath);
        replacements++;
    }
});

fs.writeFileSync(WORDS_FILE, wordsContent, 'utf-8');
console.log(`🎉 Migration complete! Replaced ${replacements} paths in ${WORDS_FILE}.`);
