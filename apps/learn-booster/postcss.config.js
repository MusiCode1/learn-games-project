import tailwindcss from 'tailwindcss';
import prefixer from 'postcss-prefixer';
import autoprefixer from 'autoprefixer';

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: [
    tailwindcss({
    }),
    autoprefixer({})
  ]
}



/* export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
} */
