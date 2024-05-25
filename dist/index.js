(() => {
  // src/page/home.ts
  var HomePage = class {
    constructor() {
    }
    init() {
      console.log("Home.");
    }
  };

  // src/routeDispatcher.ts
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
    dispatchRoute() {
      const path = window.location.pathname;
      const handler = this.matchRoute(path);
      if (handler) {
        handler();
      } else {
        console.log("No specific function for this path.");
      }
    }
  };

  // src/site.ts
  var Site = class {
    constructor() {
    }
    init() {
      console.log("Site.");
    }
  };

  // src/version.ts
  var VERSION = "0.1.0";

  // src/index.ts
  var SITE_NAME = "Site";
  window[SITE_NAME] = window[SITE_NAME] || {};
  var SiteData = window[SITE_NAME];
  var init = () => {
    console.log(`${SITE_NAME} package init v${VERSION}`);
    new Site().init();
    var routeDispatcher = new RouteDispatcher();
    routeDispatcher.routes = {
      "/": () => {
        new HomePage().init();
      }
    };
    routeDispatcher.dispatchRoute();
  };
  if (document.readyState !== "loading") {
    console.log("document is already ready, just execute code here");
    init();
  } else {
    console.log("document was not ready, place code here");
    document.addEventListener("DOMContentLoaded", init);
  }
})();
//# sourceMappingURL=index.js.map
