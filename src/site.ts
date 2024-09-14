
/*
 * Site
 */

import { IModule, Page } from "@sygnal/sse";

// import gsap from 'gsap'; 
 

export class Site implements IModule {

  constructor() {
  }

  /**
   * Setup code runs synchronously, inline, at the end of the </head>. 
   * It's used for special init tasks that must be performed early, and which do not require
   * the DOM to be loaded. 
   */
  setup() {

    Page.loadEngineCSS("site.css"); 
   
  }

  /**
   * Exec code runs after the DOM has processed. 
   */
  exec() {

    // Put your site-level custom code here
    // it will have full access to the DOM 

  }

}
