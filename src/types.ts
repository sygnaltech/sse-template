/**
 * Type definitions for SSE Template
 */

import { IModule } from "@sygnal/sse";

/**
 * Component constructor that takes an HTMLElement
 */
export type ComponentConstructor = new (element: HTMLElement) => IModule;

/**
 * Page constructor (no arguments)
 */
export type PageConstructor = new () => IModule;

/**
 * Component registry map - maps component names to their constructors
 */
export type ComponentRegistry = {
  [componentName: string]: ComponentConstructor;
};

/**
 * Page registry map - maps routes to page constructors
 */
export type PageRegistry = {
  [route: string]: PageConstructor;
};

/**
 * Site global data interface
 * Extend this with your custom site-wide data properties
 */
export interface SiteGlobalData {
  // Add your site-specific properties here
  // Example:
  // user?: { id: string; name: string };
  // config?: { apiUrl: string };
}
