/**
 * SITE
 * Main entry point
 *
 * https://engine.sygnal.com/
 *
 * ENGINE MODE
 * ?engine.mode=dev
 * ?engine.mode=prod
 */

import { VERSION } from "./version";
import { routeDispatcher } from "./routes";
import { initSSE } from "@sygnal/sse";
import { ComponentManager } from "./engine/component-manager";
import { getComponent, getRegistryStats } from "./engine/registry";
import type { SiteGlobalData } from "./types";

// Import all components to trigger decorator registration
import "./components/test";
import "./components/example";
// Add more component imports here as you create them
// import "./components/my-component";

// Global vars
const SITE_NAME = 'Site';

// Extend the Window interface to include globals
// as a TypeScript accessibility convenience
declare global {
    interface Window {
        // fsAttributes
        fsAttributes: [string, (filterInstances: unknown[]) => void][];

        // Site global data
        Site: SiteGlobalData;

        // Webflow object
        Webflow: {
            require: (module: string) => {
                destroy: () => void;
                init: () => void;
            };
        };

        // SA5 library (if using Sygnal Attributes)
        sa5: unknown;

        // Component manager instance
        componentManager: ComponentManager;
    }
}

window.componentManager = new ComponentManager();

// Init SSE Engine
initSSE();

/**
 * Perform setup - synchronous initialization
 */
const setup = () => {
    console.log(`${SITE_NAME} package init v${VERSION}`);

    // Log auto-discovered registry stats
    const stats = getRegistryStats();
    console.log(`[Registry] Discovered ${stats.pages} page(s) and ${stats.components} component(s)`);

    routeDispatcher().setupRoute();
}

/**
 * Perform exec - asynchronous execution after DOM ready
 */
const exec = () => {
    routeDispatcher().execRoute();

    // Initialize components
    initializeComponents();
}

/**
 * Initialize all components found in the DOM
 * Auto-discovers components using @component decorator
 */
function initializeComponents(): void {
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
            console.warn(`Unknown component type: "${componentName}". Did you add the @component decorator and import it?`, element);
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
 * Initialize
 */

// Perform setup, sync
setup();

// Perform exec, async
if (document.readyState !== 'loading') {
    exec();
} else {
    document.addEventListener("DOMContentLoaded", exec);
}
