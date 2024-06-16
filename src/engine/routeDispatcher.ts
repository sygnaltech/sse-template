/*
 * Sygnal
 * Route Dispatcher
 * 
 */

import { Site } from "../site";


 

export interface IRouteHandler {

    setup(): void;
    
    exec(): void; 
  
}

  
type RouteHandler = () => void;
type RouteHandlerClass = { new (): IRouteHandler };

export interface Routes {
    [path: string]: RouteHandlerClass;
}

export class RouteDispatcher {

    routes!: Routes;

    constructor() {
    }

    matchRoute(path: string): RouteHandlerClass | null {
        for (const route in this.routes) {
            if (route.endsWith('*')) {
                // If the route ends with *, treat it as a wildcard
                const baseRoute = route.slice(0, -1); // Remove the * from the end
                if (path.startsWith(baseRoute)) {
                    return this.routes[route];
                }
            } else if (route === path) {
                // Exact match
                return this.routes[route];
            }
        }
        return null; // No matching route found
    }
    
    setupRoute() {

        // Pre-init site-level
        (new Site().setup());

        // Pre-init route-level
        const path = window.location.pathname;
        const HandlerClass = this.matchRoute(path);
        if (HandlerClass) {
            const handlerInstance = new HandlerClass();
            handlerInstance.setup(); 
        } else {
//            console.log('No specific function for this path.');
        }
    }

    execRoute() {

        // Init site-level
        (new Site().exec());

        // Init route-level
        const path = window.location.pathname;
        const HandlerClass = this.matchRoute(path);
        if (HandlerClass) {
            const handlerInstance = new HandlerClass();
            handlerInstance.exec(); 
        } else {
//            console.log('No specific function for this path.');
        }
    }
    
}