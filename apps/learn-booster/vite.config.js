

/** @type {import('vite').UserConfig} */
export default {

    build: {
        outDir: 'docs',
        rollupOptions: {
            input: {
                main: 'src/main.js',
                'app-booster': 'src/app-booster.js'
            }
        },
        server: {
            cors: {
                origin: false,
                methods: ['GET', 'POST', 'OPTIONS']
            }
        }
    }
}