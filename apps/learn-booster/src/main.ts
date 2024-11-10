import { mount } from 'svelte'
import './app.css'
import App from './Page.svelte'
import '@fontsource/heebo';

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
