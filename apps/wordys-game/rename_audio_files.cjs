
const fs = require('fs');
const path = require('path');

const wordsFilePath = String.raw`d:\UserProjects\ThzoharHalev\learn-games-project\apps\wordys-game\src\lib\data\words.ts`;
const audioDirPath = String.raw`d:\UserProjects\ThzoharHalev\learn-games-project\apps\wordys-game\wordys-assets-source\audio`;

try {
    const wordsContent = fs.readFileSync(wordsFilePath, 'utf8');
    const audioFiles = fs.readdirSync(audioDirPath);

    const regex = /id:\s*'([^']+)',\s*word:\s*'([^']+)'/g;
    let match;
    const mapping = [];

    while ((match = regex.exec(wordsContent)) !== null) {
        mapping.push({ id: match[1], word: match[2] });
    }

    let renameCount = 0;
    
    mapping.forEach(item => {
        const wavName = `${item.word}.wav`;
        const mp3Name = `${item.word}.mp3`;
        
        let foundFile = null;
        if (audioFiles.includes(wavName)) foundFile = wavName;
        else if (audioFiles.includes(mp3Name)) foundFile = mp3Name;

        if (foundFile) {
            const ext = path.extname(foundFile);
            const newName = `${item.id}${ext}`;
            const oldPath = path.join(audioDirPath, foundFile);
            const newPath = path.join(audioDirPath, newName);
            
            // Check if target already exists to avoid overwriting accidentally without knowing
            if (fs.existsSync(newPath)) {
                console.log(`Skipping ${foundFile} -> ${newName} (Target exists)`);
            } else {
                fs.renameSync(oldPath, newPath);
                console.log(`Renamed: ${foundFile} -> ${newName}`);
                renameCount++;
            }
        }
    });

    console.log(`Successfully renamed ${renameCount} files.`);

} catch (err) {
    console.error("Error executing rename:", err);
    process.exit(1);
}
