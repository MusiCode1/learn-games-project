
const fs = require('fs');
const path = require('path');

const wordsFile = String.raw`d:\UserProjects\ThzoharHalev\learn-games-project\apps\wordys-game\src\lib\data\words.ts`;
let content = fs.readFileSync(wordsFile, 'utf8');

// Remove import { getAssetUrl } ...
content = content.replace(/import { getAssetUrl } from '\$lib\/services\/assets';\s*/, '');

// Remove imageUrl: getAssetUrl(...) pattern
// We match:  imageUrl: getAssetUrl('...')
content = content.replace(/,\s*imageUrl: getAssetUrl\('[^']+'\)/g, '');
// Handle case where it might be the last item without comma or different formatting
content = content.replace(/\s*imageUrl: getAssetUrl\('[^']+'\),?/g, '');

fs.writeFileSync(wordsFile, content);
console.log('Cleaned words.ts');
