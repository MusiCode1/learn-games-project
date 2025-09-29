import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import injectScriptPlugin from './vite-plugin/vite-plugin-inject-script';
import vercel from "vite-plugin-vercel";
// יצירת פלאגין מותאם אישית לטיפול בבקשות פרה-פלייט
function privateNetworkSupport() {
    return {
        name: 'private-network-support',
        configureServer: function (server) {
            server.middlewares.use(function (req, res, next) {
                var method = req.method || '';
                if (method.toUpperCase() === 'OPTIONS') {
                    res.setHeader('Access-Control-Allow-Private-Network', 'true');
                }
                next();
            });
        }
    };
}
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        svelte({}),
        cssInjectedByJsPlugin(),
        privateNetworkSupport(),
        injectScriptPlugin(),
        vercel()
    ],
    build: {
        outDir: 'dist',
        /* cssCodeSplit: false, */
        lib: {
            entry: 'src/main.ts',
            formats: ['es'],
            fileName: 'main'
        },
        rollupOptions: {
            output: {}
        }
    },
    server: {
        port: 443,
        host: '0.0.0.0', //'dev-server.dev',
        https: {
            key: 'dev-cert/dev-server.dev-key.pem',
            cert: 'dev-cert/dev-server.dev.pem'
        },
        cors: {
            origin: ['https://gingim.net', 'https://www.googleapis.com'],
            credentials: true
        },
        headers: {
            'Access-Control-Allow-Private-Network': 'true',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true'
        }
    },
    // הוספת תמיכה בקבצים מתיקיית temp
    //publicDir: 'temp'
});
