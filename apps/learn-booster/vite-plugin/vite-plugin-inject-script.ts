import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'path';

export default function injectScriptPlugin(): Plugin {
  return {
    name: 'inject-script-plugin',
    configResolved(config) {
      const mode = config.mode;
      const port = config.server.port;
      
      const iJsPath = path.resolve('vite-plugin/i.js');
      const outputPath = path.resolve('public/i.js');

      const originalScript = fs.readFileSync(iJsPath, 'utf-8');
      const prodUrl = '//gingim-booster.vercel.app/main.js';
      const devUrl = `//dev-server.dev:${port}/src/main.ts`;

      const newScript = originalScript.replace('@theUrl', (mode === 'production') ? prodUrl : devUrl);

      fs.writeFileSync(outputPath, newScript);

    }
  };
}