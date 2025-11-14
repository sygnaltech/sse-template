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
import { routeDispatcher, initializeComponents, getRegistryStats } from "./routes";
import { initSSE } from "@sygnal/sse-core";
import { ComponentManager } from "@sygnal/sse-core";
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
    }
}

window.componentManager = new ComponentManager();

// Init SSE Engine
initSSE();

// Create dispatcher ONCE to preserve instance state
const dispatcher = routeDispatcher();

/**
 * Perform setup - synchronous initialization
 */
const setup = () => {
    console.log(`${SITE_NAME} package init v${VERSION}`);

    // Log auto-discovered registry stats
    const stats = getRegistryStats();
    console.log(`[Registry] Discovered ${stats.pages} page(s) and ${stats.components} component(s)`);

    // Setup routes
    dispatcher.setupRoute();
}

/**
 * Perform exec - asynchronous execution after DOM ready
 */
const exec = () => {
    // Initialize all components FIRST so they're available in componentManager
    initializeComponents();

    // Execute route AFTER components are registered
    dispatcher.execRoute();
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
