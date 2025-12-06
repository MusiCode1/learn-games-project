import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

const SOURCE_DIR = 'wordys-assets-source';
const BUCKET_NAME = 'wordys-game-assets';
const MANIFEST_FILE = path.join(SOURCE_DIR, 'sync-manifest.json');

if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Error: Source directory ${SOURCE_DIR} does not exist.`);
    process.exit(1);
}

// Load Manifest
let manifest = {};
if (fs.existsSync(MANIFEST_FILE)) {
    try {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
    } catch (e) {
        console.warn('⚠️ Could not parse manifest file, starting fresh.');
    }
}

function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else {
            // Ignore manifest file itself
            if (path.basename(fullPath) !== 'sync-manifest.json') {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = getFiles(SOURCE_DIR);
console.log(`Found ${files.length} files to scan...`);

let successCount = 0;
let skippedCount = 0;
let errorCount = 0;

files.forEach(file => {
    const relativeKey = path.relative(SOURCE_DIR, file).replace(/\\/g, '/');
    const currentHash = getFileHash(file);

    // Check if file is already synced and unchanged
    if (manifest[relativeKey] === currentHash) {
        skippedCount++;
        // console.log(`⏭️ Skipped (unchanged): ${relativeKey}`);
        return;
    }

    console.log(`Uploading: ${relativeKey}...`);
    try {
        execSync(`bun x wrangler r2 object put ${BUCKET_NAME}/${relativeKey} --file "${file}" --remote`, { stdio: 'inherit' });

        // Update manifest only on success
        manifest[relativeKey] = currentHash;
        successCount++;
    } catch (e) {
        console.error(`❌ Failed to upload ${relativeKey}`);
        errorCount++;
    }
});

// Save updated manifest
try {
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
} catch (e) {
    console.error('❌ Failed to save sync manifest:', e);
}

console.log(`\nSync Complete!`);
console.log(`✅ Uploaded: ${successCount}`);
console.log(`⏭️ Skipped: ${skippedCount}`);
console.log(`❌ Failed: ${errorCount}`);
