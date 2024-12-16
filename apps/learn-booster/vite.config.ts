import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import type { Plugin } from 'vite'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// יצירת פלאגין מותאם אישית לטיפול בבקשות פרה-פלייט
function privateNetworkSupport(): Plugin {
  return {
    name: 'private-network-support',
    configureServer(server) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const method = req.method || ''
        if (method.toUpperCase() === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Private-Network', 'true')
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte({}),
    cssInjectedByJsPlugin(),
    privateNetworkSupport()
  ],

  build: {
    outDir: 'docs',
    /* cssCodeSplit: false, */


    lib: {
      entry: 'src/main.ts',
      formats: ['es']
    },

    rollupOptions: {
      output: {

      }
    }
  },

  server: {
    host: 'dev-server.dev',
    https: {
      key: 'dev-cert/dev-server.dev-key.pem',
      cert: 'dev-cert/dev-server.dev.pem'
    },
    cors: {
      origin: 'https://gingim.net',
      credentials: true
    },
    headers: {
      'Access-Control-Allow-Private-Network': 'true'
    }
  }

})
