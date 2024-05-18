/*
 * Sygnal
 * Route Dispatcher
 * 
 */

type RouteHandler = () => void;

export interface Routes {
    [path: string]: RouteHandler;
}

// Example routes
const routes: Routes = {
    '/': () => {
        console.log('This is the homepage.');
    },
    '/about': () => {
        console.log('This is the about page.');
    },
    '/contact/*': () => {
        console.log('This is the contact page.');
    },
};

export class RouteDispatcher {

    routes: Routes;

    constructor() {
//        this.routes = {};
    }

    matchRoute(path: string): RouteHandler | null {
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
    
    dispatchRoute() {
        const path = window.location.pathname;
        const handler = this.matchRoute(path);
        if (handler) {
            handler();
        } else {
            console.log('No specific function for this path.');
            // Default function or behavior for unspecified paths
        }
    }
    
    
}