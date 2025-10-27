/*
 * SITE  
 * Main entry point
 * 
 * https://engine.sygnal.com/
 * 
 * ENGINE MODE
 * ?engine.mode=dev
 * ?engine.mode=prod
 * 
 */

import { VERSION } from "./version";
import { routeDispatcher } from "./routes";
import { initSSE } from "@sygnal/sse";
import { ComponentManager } from "./engine/component-manager";
import { TestComponent } from "./components/test";
import type { ComponentRegistry, SiteGlobalData } from "./types";

// Global vars
const SITE_NAME = 'Site';

// // Global object
// window[SITE_NAME] = window[SITE_NAME] || {}; 
// var SiteData = window[SITE_NAME];

/**
 * Component Registry
 * Add all your components here with their corresponding names
 */
const componentRegistry: ComponentRegistry = {
    'test': TestComponent,
    // Add more components here:
    // 'my-component': MyComponent,
};

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

// Perform setup, sync
const setup = () => {
    
    console.log(`${SITE_NAME} package init v${VERSION}`);
    
    routeDispatcher().setupRoute(); 

}

// Perform exec, async
// After DOM content loaded
const exec = () => {

    routeDispatcher().execRoute();

    // Initialize components
    initializeComponents();
}

/**
 * Initialize all components found in the DOM
 * Searches for elements with [sse-component] attribute and instantiates them
 */
function initializeComponents(): void {
    const componentElements = document.querySelectorAll<HTMLElement>('[sse-component]');

    componentElements.forEach(element => {
        const componentName = element.getAttribute('sse-component');

        if (!componentName) {
            console.warn('Component element found without sse-component value:', element);
            return;
        }

        const ComponentClass = componentRegistry[componentName];

        if (!ComponentClass) {
            console.warn(`Unknown component type: "${componentName}". Did you register it in the componentRegistry?`, element);
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
        console.log(`Initialized ${totalComponents} component(s):`, window.componentManager.getComponentTypes());
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