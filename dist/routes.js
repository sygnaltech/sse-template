"use strict";
(() => {
  // src/page/home.ts
  var HomePage = class {
    constructor() {
    }
    setup() {
    }
    exec() {
    }
  };

  // src/engine/core.ts
  function loadCSS(url) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }
  function loadEngineCSS(cssFileName) {
    const currentScript = document.currentScript;
    if (currentScript) {
      const scriptURL = new URL(currentScript.src);
      const origin = scriptURL.origin;
      const path = scriptURL.pathname.substring(0, scriptURL.pathname.lastIndexOf("/"));
      const cssURL = `${origin}${path}/css/${cssFileName}`;
      loadCSS(cssURL);
    } else {
      console.error("Unable to determine the currently executing script.");
    }
  }

  // src/site.ts
  var Site = class {
    constructor() {
    }
    setup() {
      loadEngineCSS("site.css");
    }
    exec() {
    }
  };

  // src/engine/routeDispatcher.ts
  var RouteDispatcher = class {
    constructor() {
    }
    matchRoute(path) {
      for (const route in this.routes) {
        if (route.endsWith("*")) {
          const baseRoute = route.slice(0, -1);
          if (path.startsWith(baseRoute)) {
            return this.routes[route];
          }
        } else if (route === path) {
          return this.routes[route];
        }
      }
      return null;
    }
    setupRoute() {
      new Site().setup();
      const path = window.location.pathname;
      const HandlerClass = this.matchRoute(path);
      if (HandlerClass) {
        const handlerInstance = new HandlerClass();
        handlerInstance.setup();
      } else {
      }
    }
    execRoute() {
      new Site().exec();
      const path = window.location.pathname;
      const HandlerClass = this.matchRoute(path);
      if (HandlerClass) {
        const handlerInstance = new HandlerClass();
        handlerInstance.exec();
      } else {
      }
    }
  };

  // src/routes.ts
  var routeDispatcher = () => {
    var routeDispatcher2 = new RouteDispatcher();
    routeDispatcher2.routes = {
      "/": HomePage
    };
    return routeDispatcher2;
  };
})();
//# sourceMappingURL=routes.js.map
