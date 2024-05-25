(() => {
  // node_modules/js-cookie/dist/js.cookie.mjs
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target;
  }
  var defaultConverter = {
    read: function(value) {
      if (value[0] === '"') {
        value = value.slice(1, -1);
      }
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    },
    write: function(value) {
      return encodeURIComponent(value).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent
      );
    }
  };
  function init(converter, defaultAttributes) {
    function set(name, value, attributes) {
      if (typeof document === "undefined") {
        return;
      }
      attributes = assign({}, defaultAttributes, attributes);
      if (typeof attributes.expires === "number") {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }
      name = encodeURIComponent(name).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      var stringifiedAttributes = "";
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue;
        }
        stringifiedAttributes += "; " + attributeName;
        if (attributes[attributeName] === true) {
          continue;
        }
        stringifiedAttributes += "=" + attributes[attributeName].split(";")[0];
      }
      return document.cookie = name + "=" + converter.write(value, name) + stringifiedAttributes;
    }
    function get(name) {
      if (typeof document === "undefined" || arguments.length && !name) {
        return;
      }
      var cookies = document.cookie ? document.cookie.split("; ") : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split("=");
        var value = parts.slice(1).join("=");
        try {
          var found = decodeURIComponent(parts[0]);
          jar[found] = converter.read(value, found);
          if (name === found) {
            break;
          }
        } catch (e) {
        }
      }
      return name ? jar[name] : jar;
    }
    return Object.create(
      {
        set,
        get,
        remove: function(name, attributes) {
          set(
            name,
            "",
            assign({}, attributes, {
              expires: -1
            })
          );
        },
        withAttributes: function(attributes) {
          return init(this.converter, assign({}, this.attributes, attributes));
        },
        withConverter: function(converter2) {
          return init(assign({}, this.converter, converter2), this.attributes);
        }
      },
      {
        attributes: { value: Object.freeze(defaultAttributes) },
        converter: { value: Object.freeze(converter) }
      }
    );
  }
  var api = init(defaultConverter, { path: "/" });

  // src/util.ts
  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }
  function loadScript(url) {
    const script = document.createElement("script");
    script.src = url;
    console.log("loading script", url);
    document.body.appendChild(script);
  }
  function replaceCSSLink(element, newHref) {
    element.href = newHref;
  }
  function prependToTitle(text) {
    document.title = `${text}${document.title}`;
  }
  function getCurrentScriptUrl() {
    if (document.currentScript) {
      const currentScript = document.currentScript;
      return currentScript.src;
    }
    console.error("document.currentScript is not supported in this browser.");
    return null;
  }

  // src/init.ts
  function initEngine() {
    console.log("Init engine.");
    const engineModeCommand = getQueryParam("engine.mode");
    switch (engineModeCommand) {
      case "dev":
        api.set("siteEngineMode", "dev", { expires: 7 });
        break;
      case "prod":
        api.remove("siteEngineMode");
        break;
      default:
        break;
    }
    const engineMode = api.get("siteEngineMode") || "prod";
    switch (engineMode) {
      case "dev":
        invokeDebugMode();
        break;
      case "prod":
      default:
        const scriptUrl = getCurrentScriptUrl();
        if (scriptUrl) {
          console.log("Current script URL:", scriptUrl);
          const engineScriptUrl = scriptUrl.replace("init.js", "index.js");
          console.log("New script URL:", engineScriptUrl);
          loadScript(engineScriptUrl);
          break;
        }
    }
  }
  initEngine();
  function invokeDebugMode() {
    prependToTitle("\u{1F173}\u{1F174}\u{1F185} \u279C ");
    const scripts = document.querySelectorAll("script");
    scripts.forEach((script) => {
      const devSrc = script.getAttribute("dev-src");
      if (devSrc) {
        loadScript(devSrc);
      }
    });
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach((link) => {
      const devHref = link.getAttribute("dev-src");
      if (devHref) {
        replaceCSSLink(link, devHref);
      }
    });
  }
})();
/*! js-cookie v3.0.5 | MIT */
//# sourceMappingURL=init.js.map
