import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'path';

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

declare global {
  interface String {
    replaceAll(search: string | RegExp, replace: string): string;
  }
}


function replaceInFiles(fileReplacements: FileReplacement[]) {
  for (const { sourcePath, destinationPath, replacements } of fileReplacements) {
    const originalContent = fs.readFileSync(sourcePath, 'utf-8');

    let newContent = originalContent;
    for (const { search, replace } of replacements) {
      newContent = newContent.replaceAll(search, replace);
    }

    fs.writeFileSync(destinationPath, newContent);
  }
}

export default function injectScriptPlugin(): Plugin {
  return {
    name: 'inject-script-plugin',
    configResolved(config) {
      const mode = (config.env.VITE_VERCEL_ENV || config.mode || 'development') as Mode,
        domain = config.env.VITE_PRJ_DOMAIN as string,
        urlPath = (mode === 'development') ? '/src/' : '/',
        mainPath = urlPath + ((mode === 'development') ? 'main.ts' : 'main.js'),
        mainPathWithParam = mainPath + '?withESNext=true';


      // console.log('mainPath:', mainPath, 'urlPath:', urlPath);


      const baseUrl = `https://${domain}`,
        oldMainUrl = baseUrl + mainPath;

      const replacements = [
        { search: '@theUrl', replace: oldMainUrl },
        { search: '@mode', replace: mode },
        { search: '@mainPath', replace: mainPathWithParam }
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