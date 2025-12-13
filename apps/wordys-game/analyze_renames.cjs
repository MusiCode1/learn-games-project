
const fs = require('fs');
const path = require('path');

const wordsFilePath = String.raw`d:\UserProjects\ThzoharHalev\learn-games-project\apps\wordys-game\src\lib\data\words.ts`;
const audioDirPath = String.raw`d:\UserProjects\ThzoharHalev\learn-games-project\apps\wordys-game\wordys-assets-source\audio`;

try {
    const wordsContent = fs.readFileSync(wordsFilePath, 'utf8');
    const audioFiles = fs.readdirSync(audioDirPath);

    // Regex to find { id: '...', word: '...' }
    // We handle nuances like newlines or spaces
    const regex = /id:\s*'([^']+)',\s*word:\s*'([^']+)'/g;
    let match;
    const mapping = [];

    while ((match = regex.exec(wordsContent)) !== null) {
        mapping.push({ id: match[1], word: match[2] });
    }

    console.log(`Found ${mapping.length} word mappings in words.ts`);

    const plannedRenames = [];
    const missingFiles = [];

    mapping.forEach(item => {
        // Check for wav or mp3
        const wavName = `${item.word}.wav`;
        const mp3Name = `${item.word}.mp3`;
        
        let foundFile = null;
        if (audioFiles.includes(wavName)) foundFile = wavName;
        else if (audioFiles.includes(mp3Name)) foundFile = mp3Name;

        if (foundFile) {
            const ext = path.extname(foundFile);
            plannedRenames.push({
                current: foundFile,
                new: `${item.id}${ext}`
            });
        } else {
            // Check if file already has the ID name (maybe already renamed?)
            const idWav = `${item.id}.wav`;
            if (!audioFiles.includes(idWav)) {
                 missingFiles.push(item.word);
            }
        }
    });

    console.log(`Planned Renames: ${plannedRenames.length}`);
    plannedRenames.forEach(r => console.log(`${r.current} -> ${r.new}`));
    
    if (missingFiles.length > 0) {
        console.log(`\nMissing Audio Files for words:`);
        // Limit output
        missingFiles.slice(0, 10).forEach(w => console.log(w));
        if (missingFiles.length > 10) console.log(`...and ${missingFiles.length - 10} more`);
    }

} catch (err) {
    console.error("Error:", err);
}
