import * as fs from "fs";
import * as path from "path";

// הגדרות סוגי קבצים להכללה ואי הכללה
const includedExtensions = [".md", ".ts", ".js", ".txt"];
const excludedExtensions = [".log", ".tmp", ".bak"];
const excludedFiles = [
    "ignore-me.txt",
    "exclude-this.md",
    "game-configs.js",
    "output.md",
    "export-code-to-md.ts"];  // דוגמאות לקבצים להחרגה

// פונקציה לאיסוף קבצים מתיקיות מוגדרות בלבד
function collectFiles(dir: string, allowedDirs: string[]): string[] {
    let files: string[] = [];

    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // סרוק את התיקיות המותרות בלבד
            if (allowedDirs.includes(entry.name)) {
                files = files.concat(collectFiles(fullPath, allowedDirs));
            }
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);

            // כלול את הקובץ אם הוא עומד בתנאים
            if (
                includedExtensions.includes(ext) &&
                !excludedExtensions.includes(ext) &&
                !excludedFiles.includes(entry.name)
            ) {
                files.push(fullPath);
            }
        }
    });

    return files;
}

// פונקציה ליצירת תוכן Markdown
function generateMarkdown(files: string[], rootDir: string): string {
    let markdown = "";

    files.sort().forEach((filePath) => {
        const relativePath = path.relative(rootDir, filePath);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const fileExtension = path.extname(filePath).substring(1); // לדוגמה: "ts" עבור קובץ TypeScript

        // הוספת הכותרת והקוד במבנה Markdown
        markdown += `# ${relativePath}\n\n`;
        markdown += `\`\`\`${fileExtension}\n${fileContent}\n\`\`\`\n\n`;
    });

    return markdown;
}

// פונקציה ראשית לייצוא תוכן לקובץ Markdown
function exportToMarkdown(rootDir: string, allowedDirs: string[], outputFile: string) {
    const files = collectFiles(rootDir, allowedDirs);
    const markdownContent = generateMarkdown(files, rootDir);
    fs.writeFileSync(outputFile, markdownContent, "utf-8");
    console.log(`Markdown file created: ${outputFile}`);
}

// קריאה לפונקציה הראשית עם דוגמאות לתיקיות מותרות ותיקיית הפרויקט
const rootDirectory = ".";  // שורש הפרויקט
const allowedDirectories = ["src"];  // התיקיות שכוללות קבצים לייצוא
const outputMarkdownFile = "output.md";  // שם קובץ ה-Markdown הסופי

exportToMarkdown(rootDirectory, allowedDirectories, outputMarkdownFile);
