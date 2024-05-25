/*
 * Index  
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
import { RouteDispatcher } from "./routeDispatcher";
import { Site } from "./site";
import { VERSION } from "./version";

// Global vars
const SITE_NAME = 'Site';

// Global object
window[SITE_NAME] = window[SITE_NAME] || {}; 
var SiteData = window[SITE_NAME];

// Extend the Window interface to include globals
// as a Typescript accessibility convenience
declare global {
    interface Window {

        // Finsweet attributes
        fsAttributes: [string, (filterInstances: any[]) => void][];

        //   modelsDataSourceElems: NodeListOf<HTMLElement>;
        //   modelsSelectElem: HTMLElement | null;
        //   modelsNavElem: HTMLElement | null; 

    }
}

const init = () => {
    
    console.log(`${SITE_NAME} package init v${VERSION}`);

    // Perform Site-wide actions
    (new Site()).init();

    // Perform Page-specific actions
    var routeDispatcher = new RouteDispatcher();
    routeDispatcher.routes = {
        '/': () => {

            (new HomePage()).init();

        }
    };
    routeDispatcher.dispatchRoute(); 
}

/**
 * Initialize
 */

if (document.readyState !== 'loading') {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}



