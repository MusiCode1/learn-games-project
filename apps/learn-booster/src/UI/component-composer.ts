
// Renamed from bootstrap.ts to component-composer.ts to reflect its role as a Svelte component composer

import { mount } from 'svelte';
import './app.css';
import type { Component } from 'svelte';

import type { Props, Exports } from '../types';


interface MountComponenttOptions {
  elementId: string;
  component: Component;
  props?: Props;
  styles?: Partial<CSSStyleDeclaration>;
}

export const defaultOptions: Partial<MountComponenttOptions> = {
  elementId: 'root',
  styles: {
    zIndex: '9999999',
    position: 'absolute'
  }
};

export function mountComponent(options: MountComponenttOptions): Exports {
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
