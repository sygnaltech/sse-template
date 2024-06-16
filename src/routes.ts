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

import { HomePage } from "./page/home";
import { RouteDispatcher } from "./engine/routeDispatcher";

export const routeDispatcher = (): RouteDispatcher => {
    
    var routeDispatcher = new RouteDispatcher();
    routeDispatcher.routes = {

        // Site paes
        '/': HomePage,

        // TEST Pages

    };

    return routeDispatcher;
}

