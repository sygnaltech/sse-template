
/*
 * Site
 */

import { IRouteHandler } from "./engine/routeDispatcher";
import { loadCSS } from "./engine/core";

// import gsap from 'gsap'; 
 

export class Site implements IRouteHandler {

  constructor() {
  }

  setup() {

    // Get current script path up to index.js
    // /css/index.css 

    const currentScript = document.currentScript as HTMLScriptElement;
    
    if (!currentScript) {
      console.log('Could not determine the current script.');
      return;
    }

    const fullUrl = new URL(currentScript.src);
    const pathWithoutFile = fullUrl.origin + fullUrl.pathname.substring(0, fullUrl.pathname.lastIndexOf('/') + 1);
    console.log('Current script URL without file name:', pathWithoutFile);

console.log("installing site CSS")

    // important - DEV, TEST, PROD
    loadCSS(pathWithoutFile + "css/index.css"); 
   
  }

  exec() {

    console.log("Site."); 

    // const elements: NodeListOf<Element> = document.querySelectorAll(`.${item.className}`);
    // console.log("Making elements visible", elements);
    // gsap.to(elements, { display: 'block' });

  }

}
