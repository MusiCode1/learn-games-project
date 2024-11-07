/** @type {import('vite').UserConfig} */
export default {

    build:{
        outDir: 'docs'
    },
    server: {
        cors: {
            origin: false,
            methods: ['GET', 'POST', 'OPTIONS']
        }
    }
  }