/**
 * Registry System
 * Auto-registration for components and pages using decorators
 */

import type { ComponentConstructor, PageConstructor } from "../types";
import type { IModule } from "@sygnal/sse";

// Global registries
const componentRegistry = new Map<string, ComponentConstructor>();
const pageRegistry = new Map<string, PageConstructor>();

/**
 * Component Decorator
 * Automatically registers a component class with the given name
 *
 * @example
 * @component('my-component')
 * export class MyComponent implements IModule {
 *   constructor(elem: HTMLElement) {}
 *   setup() {}
 *   async exec() {}
 * }
 */
export function component(name: string) {
  return function <T extends ComponentConstructor>(constructor: T) {
    componentRegistry.set(name, constructor);
    console.log(`[Registry] Component registered: "${name}"`);
    return constructor;
  };
}

/**
 * Page Decorator
 * Automatically registers a page class with the given route
 *
 * @example
 * @page('/')
 * export class HomePage implements IModule {
 *   setup() {}
 *   async exec() {}
 * }
 */
export function page(route: string) {
  return function <T extends PageConstructor>(constructor: T) {
    pageRegistry.set(route, constructor);
    console.log(`[Registry] Page registered: "${route}"`);
    return constructor;
  };
}

/**
 * Get a component constructor by name
 */
export function getComponent(name: string): ComponentConstructor | undefined {
  return componentRegistry.get(name);
}

/**
 * Get all registered components
 */
export function getAllComponents(): Map<string, ComponentConstructor> {
  return new Map(componentRegistry);
}

/**
 * Get a page constructor by route
 */
export function getPage(route: string): PageConstructor | undefined {
  return pageRegistry.get(route);
}

/**
 * Get all registered pages as a routes object
 */
export function getAllPages(): Record<string, PageConstructor> {
  const routes: Record<string, PageConstructor> = {};
  pageRegistry.forEach((constructor, route) => {
    routes[route] = constructor;
  });
  return routes;
}

/**
 * Get registry statistics
 */
export function getRegistryStats() {
  return {
    components: componentRegistry.size,
    pages: pageRegistry.size,
    componentNames: Array.from(componentRegistry.keys()),
    pageRoutes: Array.from(pageRegistry.keys()),
  };
}
