import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import crypto from "crypto";

const SOURCE_DIR = "assets";
const BUCKET_NAME = "tzlev-static";
const MANIFEST_FILE = path.join(SOURCE_DIR, ".sync-manifest.json");

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Error: Source directory "${SOURCE_DIR}" does not exist.`);
  process.exit(1);
}

// Load manifest
let manifest = {};
if (fs.existsSync(MANIFEST_FILE)) {
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));
  } catch {
    console.warn("Warning: Could not parse manifest file, starting fresh.");
  }
}

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("md5");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}

function getFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (!entry.startsWith(".")) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getFiles(SOURCE_DIR);
console.log(`Found ${files.length} files to scan...`);

let successCount = 0;
let skippedCount = 0;
let errorCount = 0;

for (const file of files) {
  const relativeKey = path.relative(SOURCE_DIR, file).replace(/\\/g, "/");
  const currentHash = getFileHash(file);

  if (manifest[relativeKey] === currentHash) {
    skippedCount++;
    continue;
  }

  console.log(`Uploading: ${relativeKey}...`);
  try {
    execSync(
      `bun x wrangler r2 object put ${BUCKET_NAME}/${relativeKey} --file "${file}" --remote`,
      { stdio: "inherit" }
    );
    manifest[relativeKey] = currentHash;
    successCount++;
  } catch {
    console.error(`Failed to upload ${relativeKey}`);
    errorCount++;
  }
}

// Save updated manifest
try {
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), "utf-8");
} catch (e) {
  console.error("Failed to save sync manifest:", e);
}

console.log(`\nSync Complete!`);
console.log(`Uploaded: ${successCount}`);
console.log(`Skipped: ${skippedCount}`);
console.log(`Failed: ${errorCount}`);
