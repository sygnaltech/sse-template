
/*
 * Site
 */

import { IRouteHandler } from "./engine/routeDispatcher";
import { loadCSS, loadEngineCSS } from "./engine/core";

// import gsap from 'gsap'; 
 

export class Site implements IRouteHandler {

  constructor() {
  }

  setup() {

    loadEngineCSS("site.css"); 
   
  }

  exec() {

  }

}
