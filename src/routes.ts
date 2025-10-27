/**
 * Route Dispatcher & Module Registry
 * Central location for all pages and components auto-discovery
 *
 * https://engine.sygnal.com/
 *
 * ENGINE MODE
 * ?engine.mode=dev
 * ?engine.mode=prod
 */

import { RouteDispatcher } from "@sygnal/sse";
import { Site } from "./site";
import { getAllPages, getComponent, getRegistryStats } from "./engine/registry";

// ============================================================
// PAGES - Import all pages to trigger @page decorator
// ============================================================
import "./pages/home";
import "./pages/blog";
import "./pages/about";
// Add more page imports here as you create them

// ============================================================
// COMPONENTS - Import all components to trigger @component decorator
// ============================================================
import "./components/test";
import "./components/example";
// Add more component imports here as you create them
// import "./components/my-component";

/**
 * Create and configure route dispatcher
 */
export const routeDispatcher = (): RouteDispatcher => {
    const dispatcher = new RouteDispatcher(Site);

    // Auto-discovered routes from @page decorators
    dispatcher.routes = getAllPages();

    return dispatcher;
}

/**
 * Initialize all components found in the DOM
 * Auto-discovers components using @component decorator
 */
export function initializeComponents(): void {
    const componentElements = document.querySelectorAll<HTMLElement>('[sse-component]');

    componentElements.forEach(element => {
        const componentName = element.getAttribute('sse-component');

        if (!componentName) {
            console.warn('Component element found without sse-component value:', element);
            return;
        }

        // Get component from auto-discovered registry
        const ComponentClass = getComponent(componentName);

        if (!ComponentClass) {
            console.warn(`Unknown component type: "${componentName}". Did you add the @component decorator and import it in routes.ts?`, element);
            return;
        }

        try {
            // Instantiate the component
            const componentInstance = new ComponentClass(element);

            // Register with component manager
            window.componentManager.registerComponent(componentName, componentInstance);

            // Execute the component
            componentInstance.exec();
        } catch (error) {
            console.error(`Error initializing component "${componentName}":`, error, element);
        }
    });

    // Log summary
    const totalComponents = window.componentManager.getTotalCount();
    if (totalComponents > 0) {
        console.log(`Initialized ${totalComponents} component instance(s):`, window.componentManager.getComponentTypes());
    }
}

/**
 * Log registry statistics
 */
export function logRegistryStats(): void {
    const stats = getRegistryStats();
    console.log(`[Registry] Discovered ${stats.pages} page(s) and ${stats.components} component(s)`);
}
