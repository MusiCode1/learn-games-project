import { mount } from 'svelte';
import './app.css';
import type { Config, PlayerControls, SettingsController } from '../types';
import App from './Main.svelte';
import SettingsPage from './SettingsPage.svelte';
import { log } from '../lib/logger.svelte';

interface MountOptions {
  elementId: string;
  component: any;
  props?: any;
  styles?: Partial<CSSStyleDeclaration>;
}

const defaultOptions: { styles: Partial<CSSStyleDeclaration> } = {
  styles: {
    zIndex: '9999999',
    position: 'absolute'
  }
};

export function mountComponent(options: MountOptions): Record<string, any> {
  const mergedOptions = { ...defaultOptions, ...options };
  const { elementId, component, props = {}, styles = {} } = mergedOptions;

  // יצירת אלמנט אם לא קיים
  if (!document.getElementById(elementId!)) {
    const element = document.createElement('div');
    element.id = elementId!;
    Object.assign(element.style, styles);
    document.body.append(element);
  }

  // הרכבת הקומפוננטה
  return mount(component, {
    target: document.getElementById(elementId!)!,
    props
  });
}

/**
 * מאתחל את נגן הווידאו - יוצר את האלמנט בדף, מאתחל את הממשק ומגדיר משתנים גלובליים
 * @param config קונפיגורציית המערכת
 * @param defaultConfig קונפיגורציית ברירת מחדל
 * @returns בקר נגן הווידאו
 */
export function initializeVideoPlayer(config: Config, defaultConfig: Config): PlayerControls {
  const app = mountComponent({
    elementId: 'playerRoot',
    component: App,
    props: { config }
  });

  const playerControls = {
    ...app.modalController,
    get video() {
      return app.modalController.getVideo();
    }
  };

  // מגדיר משתנים גלובליים לצורך דיבוג
  window.playerControls = playerControls;
  window.videoUrls = config.videoUrls;
  window.defaultConfig = defaultConfig;

  log('video element is loaded!');

  return playerControls;
}

/**
 * מאתחל את דף ההגדרות
 * @param config קונפיגורציית המערכת
 * @returns מופע הקומפוננטה
 */
export function initializeSettings(config: Config): SettingsController {
  const settingsApp = mountComponent({
    elementId: 'settingsRoot',
    component: SettingsPage,
    props: { config },
    styles: {
      ...defaultOptions.styles,
      zIndex: '99998',
    }
  });



  const settingsController = {
    ...settingsApp.settingsController
  };

  // מגדיר משתנה גלובלי לצורך דיבוג
  window.settingsController = settingsController;

  log('settings element is loaded!');

  return settingsController;
}
