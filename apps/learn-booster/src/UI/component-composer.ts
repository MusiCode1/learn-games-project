// Renamed from bootstrap.ts to component-composer.ts to reflect its role as a Svelte component composer

import { mount, unmount } from 'svelte';
import './app.css';
import type { Config, ConfigOverrides, PlayerControls, SettingsController } from '../types';
import App from './VideoMain.svelte';
import SettingsPage from './SettingsMain.svelte';
import { log } from '../lib/logger.svelte';
import { initializeConfig, getAllConfig, updateConfig, convertNewConfigToOld } from '../lib/config-manager';
import { injectCodeToGame, handleGameTurn } from '../lib/game-handler';

interface MountComponenttOptions {
  elementId: string;
  component: any;
  props?: any;
  styles?: Partial<CSSStyleDeclaration>;
}

const defaultOptions: Partial<MountComponenttOptions> = {
  elementId: 'root',
  styles: {
    zIndex: '9999999',
    position: 'absolute'
  }
};

export function mountComponent(options: MountComponenttOptions): Record<string, any> {
  const mergedOptions = { ...defaultOptions, ...options };
  const { elementId, component, props = {}, styles = {} } = mergedOptions;

  let rootElement =
    document.getElementById(elementId) as HTMLDivElement;

  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = elementId!;
    Object.assign(rootElement.style, styles);
    document.body.append(rootElement);

  } else {
    const existingComponent =
      rootElement.querySelector('.gingim-booster');
    if (existingComponent) {
      existingComponent.remove();
    }
  }

  const targetElement = document.createElement('div');
  targetElement.classList.add('gingim-booster');
  rootElement.append(targetElement);
  rootElement = targetElement;

  return mount(component, {
    target: targetElement,
    props,

  });
}

function initializeVideoPlayer(config: Config) {
  // המרה למבנה הישן עבור תאימות עם קומפוננטות קיימות
  const oldConfig = convertNewConfigToOld(config);
  
  const app = mountComponent({
    elementId: 'playerRoot',
    component: App,
    props: { config: oldConfig }
  });

  const playerControls = {
    ...app.modalController,
    get video() {
      return app.modalController.getVideo();
    }
  };

  window.app = app;
  window.playerControls = playerControls;
  window.videoUrls = oldConfig.videoUrls;

  log('video element is loaded!');

  return { playerControls, app };
}

/**
 * מאתחל את דף ההגדרות
 * @returns מופע הקומפוננטה
 * @throws {Error} אם הקונפיגורציה חסרה או שגויה
 */
export async function loadSettingsElement() {
  try {
    // שימוש בהגדרות שכבר אותחלו ב-main.ts
    const config = getAllConfig();
    return initializeSettings(config);
  } catch (error) {
    log('Failed to initialize settings:', error);
    throw new Error('Failed to initialize settings: ' + (error as Error).message);
  }
}


// TODO: ליצור פונקציית בדיקת תקינות ההגדרות
export async function loadVideoElement(configOverrides: ConfigOverrides = {}) {
  // אם יש דריסות הגדרות, מעדכנים את ההגדרות
  if (Object.keys(configOverrides).length > 0) {
    await initializeConfig({...window.config, ...configOverrides}, import.meta.url, import.meta.env.DEV);
  }
  
  // קבלת ההגדרות העדכניות
  const config = getAllConfig();

  if (!config.rewardDisplayDurationMs) {
    const error = new Error('Invalid configuration: missing rewardDisplayDurationMs field that defines video display duration in milliseconds');
    log('Error:', error.message);
    throw error;
  }

  if (config.rewardType === 'video' && (!config.video.videos || config.video.videos.length === 0)) {
    const error = new Error('Invalid configuration: missing or empty videos list');
    log('Error:', error.message);
    throw error;
  }

  let playerControls: PlayerControls;
  let app: any;
  try {
    ({ app, playerControls } = initializeVideoPlayer(config));
  } catch (error) {
    log('Failed to initialize video player:', error);
    throw new Error('Failed to initialize video player: ' + (error as Error).message);
  }

  if (!configOverrides?.system?.disableGameCodeInjection) {
    // המרה למבנה הישן עבור תאימות עם פונקציות קיימות
    const oldConfig = convertNewConfigToOld(config);
    injectCodeToGame(playerControls, oldConfig);
  }

  return { playerControls, app };
}

function initializeSettings(config: Config): SettingsController {
  const handleShowVideo = async () => {
    const { playerControls, app } = await loadVideoElement({
      system: {
        enableHideModalButton: true,
        disableGameCodeInjection: true,
      }
    });

    // המרה למבנה הישן עבור תאימות עם פונקציות קיימות
    const oldConfig = convertNewConfigToOld(config);
    
    handleGameTurn({
      playerControls,
      config: oldConfig
    }).then(() => {
      unmount(app);
    });
  };
  // המרה למבנה הישן עבור תאימות עם קומפוננטות קיימות
  const oldConfig = convertNewConfigToOld(config);
  
  const settingsApp = mountComponent({
    elementId: 'settingsRoot',
    component: SettingsPage,
    props: { config: oldConfig, handleShowVideo },
    styles: {
      ...defaultOptions.styles,
      zIndex: '99998'
    }
  });

  const settingsController = {
    ...settingsApp.settingsController
  };

  window.settingsController = settingsController;

  log('settings element is loaded!');

  return settingsController;
}