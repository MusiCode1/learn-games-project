import { DriveManager } from '../plugins/drive.plugin.js';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';

// פונקציה ראשית לניסוי
async function testDriveDownload(fileId: string) {
    try {
        console.log('מתחיל בדיקת הורדה מגוגל דרייב...');

        // יצירת מופע של DriveManager
        const driveManager = new DriveManager({
            credentials: path.join(process.cwd(), 'credentials.json')
        });

        // קבלת מטא-דאטה של הקובץ
        console.log('מקבל מידע על הקובץ...');
        const metadata = await driveManager.getVideoMetadata(fileId);
        console.log('מידע על הקובץ:', metadata);

        // יצירת שם קובץ לשמירה
        const outputFileName = `download-${metadata.name}`;
        const outputPath = path.join(process.cwd(), 'downloads', outputFileName);

        // קבלת סטרים של הקובץ
        console.log('מתחיל הורדת הקובץ...');
        const videoStream = await driveManager.getVideoStream(fileId);

        // יצירת סטרים לכתיבה
        const writeStream = createWriteStream(outputPath);

        // הורדת הקובץ באמצעות pipeline
        await pipeline(videoStream, writeStream);

        console.log(`הקובץ הורד בהצלחה ל: ${outputPath}`);
        
    } catch (error) {
        console.error('שגיאה בהורדת הקובץ:', error);
        process.exit(1);
    }
}

// בדיקה שהתקבל מזהה קובץ כפרמטר
if (process.argv.length < 3) {
    console.error('נא לספק מזהה קובץ מגוגל דרייב');
    process.exit(1);
}

const fileId = process.argv[2];
testDriveDownload(fileId);
