import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import type { Plugin } from 'vite'

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
    svelte(),
    privateNetworkSupport()
  ],

  build: {
    cssCodeSplit: false,
    
    rollupOptions: {
      output: {

      }
    }
  },

  server:{
    host: 'dev-server.dev',
    https:{
      key: 'old-vers/gingim-booster/certs/dev-server.dev-key.pem',
      cert: 'old-vers/gingim-booster/certs/dev-server.dev.pem'
    },
    cors:{
      origin: 'https://gingim.net',
      credentials: true
    },
    headers: {
      'Access-Control-Allow-Private-Network': 'true'
    }
  }
  
})
