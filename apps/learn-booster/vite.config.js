import { defineConfig } from 'vite';


export default defineConfig({

    

    build: {
        outDir: 'docs/js',

        /* rollupOptions: {
            input: {
                main: 'src/main.js',
                'app-booster': 'src/app-booster.js'
            },
            output: {
                entryFileNames: '[name].js',
                manualChunks: undefined
            }
        }, */
        lib: {
            entry: {
                main: 'src/main.js',
                'app-booster': 'src/app-booster.js'
            },
            formats: ['es']
        }
    },

    server: {
        cors: {
            origin: false,
            methods: ['GET', 'POST', 'OPTIONS']
        }
    }
});