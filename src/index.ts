/*
 * Index  
 * Main entry point
 * 
 */

import { HomePage } from "./page/home";
import { RouteDispatcher } from "./routeDispatcher";
import { Site } from "./site";
import { VERSION } from "./version";

// Global vars
const SITE_NAME = 'Site';

// GSAP
// Luxon
// Cookies
// Templatting, like handlebars 
// Howler


// Global object
window[SITE_NAME] = window[SITE_NAME] || {}; 
var SiteData = window[SITE_NAME];

// Extend the Window interface to include fsAttributes
declare global {
    interface Window {
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
 * Bootstrap
 */

if (document.readyState !== 'loading') {
    console.log('document is already ready, just execute code here');
    init();
} else {
    console.log('document was not ready, place code here');
    document.addEventListener("DOMContentLoaded", init);
}



