import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'path';
import 'dotenv/config';

type Mode = 'development' | 'preview' | 'production';

const r = path.resolve;

interface Replacement {
  search: string | RegExp;
  replace: string;
}

interface FileReplacement {
  sourcePath: string;
  destinationPath: string;
  replacements: Replacement[];
}

function replaceInFiles(fileReplacements: FileReplacement[]) {
  for (const { sourcePath, destinationPath, replacements } of fileReplacements) {
    const originalContent = fs.readFileSync(sourcePath, 'utf-8');

    let newContent = originalContent;
    for (const { search, replace } of replacements) {
      newContent = newContent.replace(search, replace);
    }

    fs.writeFileSync(destinationPath, newContent);
  }
}

export default function injectScriptPlugin(): Plugin {
  return {
    name: 'inject-script-plugin',
    configResolved(config) {
      const mode = (config.env.VITE_VERCEL_ENV || config.mode) as Mode;
      const domain = process.env.PRJ_DOMAIN as string;
      const urlPath: string = (mode === 'development') ? 'src/' : '';

      const baseUrl = `https://${domain}/`,
        injectFile = baseUrl + 'i.js',
        mainFile = baseUrl + urlPath + (mode === 'development' ? 'main.ts' : 'main.js');

      const replacements = [
        { search: '@theUrl', replace: mainFile },
        { search: '@mode', replace: mode },
        { search: '@injectFileUrl', replace: injectFile }
      ];

      replaceInFiles([{
        sourcePath: r('vite-plugin/i.js'),
        destinationPath: r('public/i.js'),
        replacements
      }, {
        sourcePath: r('vite-plugin/gingim-booster-inject.js'),
        destinationPath: r('public/gingim-booster-inject.js'),
        replacements
      },]);
    },
  };
}