import fs from 'node:fs';
import path from 'path';
var r = path.resolve;
function replaceInFiles(fileReplacements) {
    for (var _i = 0, fileReplacements_1 = fileReplacements; _i < fileReplacements_1.length; _i++) {
        var _a = fileReplacements_1[_i], sourcePath = _a.sourcePath, destinationPath = _a.destinationPath, replacements = _a.replacements;
        var originalContent = fs.readFileSync(sourcePath, 'utf-8');
        var newContent = originalContent;
        for (var _b = 0, replacements_1 = replacements; _b < replacements_1.length; _b++) {
            var _c = replacements_1[_b], search = _c.search, replace = _c.replace;
            newContent = newContent.replace(search, replace);
        }
        fs.writeFileSync(destinationPath, newContent);
    }
}
export default function injectScriptPlugin() {
    return {
        name: 'inject-script-plugin',
        configResolved: function (config) {
            var mode = (config.env.VITE_VERCEL_ENV || config.mode);
            var domain = config.env.VITE_PRJ_DOMAIN;
            var urlPath = (mode === 'development') ? 'src/' : '';
            var baseUrl = "https://".concat(domain, "/"), injectFile = baseUrl + 'i.js', mainFile = baseUrl + urlPath + (mode === 'development' ? 'main.ts' : 'main.js');
            var replacements = [
                { search: '@theUrl', replace: mainFile },
                { search: '@mode', replace: mode },
                { search: '@injectFileUrl', replace: injectFile }
            ];
            replaceInFiles([{
                    sourcePath: r('vite-plugin/i.js'),
                    destinationPath: r('public/i.js'),
                    replacements: replacements
                }, {
                    sourcePath: r('vite-plugin/gingim-booster-inject.js'),
                    destinationPath: r('public/gingim-booster-inject.js'),
                    replacements: replacements
                },]);
        },
    };
}
