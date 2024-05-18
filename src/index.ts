/*
 * Index  
 * Main entry point
 * 
 */

import { HomePage } from "./page/home";
import { RouteDispatcher } from "./routeDispatcher";

// Global vars
const SITE_NAME = 'Site';
const VERSION = 'v0.1.0';



// Global object
window[SITE_NAME] = window[SITE_NAME] || {}; 
var Site = window[SITE_NAME];

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
    
    console.log(`${SITE_NAME} package init ${VERSION}`);

    var routeDispatcher = new RouteDispatcher();
    routeDispatcher.routes = {
        '/home': () => {

            (new HomePage()).init();

        }
    };
    routeDispatcher.dispatchRoute(); 
}

document.addEventListener("DOMContentLoaded", init)


