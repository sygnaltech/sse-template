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
import { routeDispatcher, initializeComponents, logRegistryStats } from "./routes";
import { initSSE } from "@sygnal/sse";
import { ComponentManager } from "./engine/component-manager";
import type { SiteGlobalData } from "./types";

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
    logRegistryStats();

    // Setup routes
    routeDispatcher().setupRoute();
}

/**
 * Perform exec - asynchronous execution after DOM ready
 */
const exec = () => {
    // Execute route
    routeDispatcher().execRoute();

    // Initialize all components
    initializeComponents();
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
