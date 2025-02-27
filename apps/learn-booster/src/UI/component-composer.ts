// Renamed from bootstrap.ts to component-composer.ts to reflect its role as a Svelte component composer

import { mount, unmount } from 'svelte';
import './app.css';
import type { Config, ConfigOverrides, PlayerControls, SettingsController } from '../types';
import App from './VideoMain.svelte';
import SettingsPage from './SettingsMain.svelte';
import { log } from '../lib/logger.svelte';
import { getConfigs } from '../config';
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

function initializeVideoPlayer(config: Config, defaultConfig?: Config) {
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

  window.app = app;
  window.playerControls = playerControls;
  window.videoUrls = config.videoUrls;
  defaultConfig && (window.defaultConfig = defaultConfig);

  log('video element is loaded!');

  return { playerControls, app };
}

/**
 * מאתחל את דף ההגדרות
 * @returns מופע הקומפוננטה
 * @throws {Error} אם הקונפיגורציה חסרה או שגויה
 */
export async function loadSettingsElement() {
  const { config } = await getConfigs();
  if (!config) {
    const error = new Error('Invalid configuration: configuration object not found. Please verify the configuration file exists and is valid');
    log('Error:', error.message);
    throw error;
  }

  try {
    return initializeSettings(config);
  } catch (error) {
    log('Failed to initialize settings:', error);
    throw new Error('Failed to initialize settings: ' + (error as Error).message);
  }
}


// TODO: ליצור פונקציית בדיקת תקינות ההגדרות
export async function loadVideoElement(configOverrides: ConfigOverrides = {}) {
  const { config } = await getConfigs(configOverrides);

  if (!config?.videoDisplayTimeInMS) {
    const error = new Error('Invalid configuration: missing videoDisplayTimeInMS field that defines video display duration in milliseconds');
    log('Error:', error.message);
    throw error;
  }

  if (!config?.videoUrls?.length) {
    const error = new Error('Invalid configuration: missing or empty videoUrls list');
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

  if (!configOverrides?.systemConfig?.disableGameCodeInjection) {
    injectCodeToGame(playerControls, config);
  }

  return { playerControls, app };
}

function initializeSettings(config: Config): SettingsController {

  const handleShowVideo = async () => {
    const { playerControls, app } = await loadVideoElement({
      systemConfig: {
        enableHideModalButton: true,
        disableGameCodeInjection: true,
      }
    });

    handleGameTurn({
      playerControls,
      config
    }).then(() => {
      unmount(app);
    });
  };
  const settingsApp = mountComponent({
    elementId: 'settingsRoot',
    component: SettingsPage,
    props: { config, handleShowVideo },
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