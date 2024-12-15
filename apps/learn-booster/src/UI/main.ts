import { mount } from 'svelte';

import './app.css';
import type { Config, PlayerControls } from '../types';
import App from './Main.svelte';

export function init(targetElement: string | HTMLElement, config: Config): PlayerControls {

  const target = typeof targetElement === 'string'
    ? document.querySelector(targetElement)
    : targetElement;

  if (!target) {
    throw new Error('Target element not found');
  }

  const app = mount(App, {
    target,
    props: { config }
  });

  const playerControls = {
    ...app.modalController,
    get video() {
      return app.modalController.getVideo();
    }
  };

  return playerControls;
}

export function loadUI(config: Config): PlayerControls {
  let element = '#playerRoot';

  if (!document.getElementById('playerRoot')) {

    const element = document.createElement('div');
    element.id = 'playerRoot';
    element.style.zIndex = '9999999';
    element.style.position = 'absolute';

    document.body.append(element);
  }

  return init(element, config);

}
