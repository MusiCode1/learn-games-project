/** @type {import('vite').UserConfig} */
export default {
    server: {
        cors: {
            origin: 'https://gingim.net',
            methods: ['GET', 'POST', 'OPTIONS']
        }
    }
  }