/*
 * Loader  
 * Main entry point
 * 
 */

import Cookies from 'js-cookie';
import { getCurrentScriptUrl, getQueryParam, loadScript, prependToTitle, replaceCSSLink } from './util';



function initEngine() {

    console.log("Init engine.");

    // Process any engine mode commands 
    const engineModeCommand = getQueryParam('engine.mode');
    switch(engineModeCommand) {
        case 'dev':
            Cookies.set('siteEngineMode', 'dev', { expires: 7 });
            break;
        case 'prod':
            Cookies.remove('siteEngineMode');
            break;
        default:
            // Do nothing, keep existing engine state 
            break;
    }

    // Get current engine mode
    const engineMode = Cookies.get('siteEngineMode') || "prod";

    /**
     * ENGINE MODE
     */

    switch(engineMode) {
        case 'dev':
            invokeDebugMode(); 
            break;
        case 'prod':
        default:
            const scriptUrl = getCurrentScriptUrl();
            if (scriptUrl) {
    
                const engineScriptUrl = scriptUrl.replace('init.js', 'index.js');
                
                loadScript(engineScriptUrl);
                break;
            } 
    }

}

initEngine();


function invokeDebugMode() {

    // Prepend to the document title
    prependToTitle("🅳🅴🆅 ➜ ");

    // Handle scripts
    const scripts = document.querySelectorAll<HTMLScriptElement>('script');
    scripts.forEach(script => {
        const devSrc = script.getAttribute('dev-src');
        if (devSrc) {
            loadScript(devSrc);
        }
    });

    // Handle CSS
    const links = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
    links.forEach(link => {
        const devHref = link.getAttribute('dev-src');
        if (devHref) {
            replaceCSSLink(link, devHref);
        }
    });

    // // Load additional scripts and CSS based on the mode
    // if (debugMode) {
    //     loadScript('https://cdn.jsdelivr.net/your-library/debug/library.js');
    //     loadCSS('https://cdn.jsdelivr.net/your-library/debug/styles.css');
    // } else {
    //     loadScript('https://cdn.jsdelivr.net/your-library/prod/library.js');
    //     loadCSS('https://cdn.jsdelivr.net/your-library/prod/styles.css');
    // }

}

//});
