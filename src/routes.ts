/**
 * Route Dispatcher
 * Auto-discovers and registers all pages using the @page decorator
 *
 * https://engine.sygnal.com/
 *
 * ENGINE MODE
 * ?engine.mode=dev
 * ?engine.mode=prod
 */

import { RouteDispatcher } from "@sygnal/sse";
import { Site } from "./site";
import { getAllPages } from "./engine/registry";

// Import all pages to trigger decorator registration
import "./pages/home";
// Add more page imports here as you create them
// import "./pages/about";

export const routeDispatcher = (): RouteDispatcher => {
    const dispatcher = new RouteDispatcher(Site);

    // Auto-discovered routes from @page decorators
    dispatcher.routes = getAllPages();

    return dispatcher;
}
