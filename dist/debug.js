(() => {
  // src/debug.ts
  var DEFAULT_APP_NAME = "Site";
  var Debug = class {
    constructor(label, appName = DEFAULT_APP_NAME) {
      this._localStorageDebugFlag = "debug-mode";
      this._appName = DEFAULT_APP_NAME;
      this._enabled = false;
      this._appName = appName;
      this._label = label;
    }
    get persistentDebug() {
      return Boolean(localStorage.getItem(this._localStorageDebugFlag));
    }
    set persistentDebug(active) {
      if (active) {
        localStorage.setItem(this._localStorageDebugFlag, "true");
        console.debug(`${this._appName} debug enabled (persistent).`);
      } else {
        localStorage.removeItem(this._localStorageDebugFlag);
        console.debug(`${this._appName} debug disabled (persistent).`);
      }
    }
    get enabled() {
      var wfuDebugValue = Boolean(localStorage.getItem(this._localStorageDebugFlag));
      wfuDebugValue = wfuDebugValue || this._enabled;
      return wfuDebugValue;
    }
    set enabled(active) {
      this._enabled = active;
    }
    group(name) {
      if (this.enabled)
        console.group(name);
    }
    groupEnd() {
      if (this.enabled)
        console.groupEnd();
    }
    debug(...args) {
      if (this.enabled)
        console.debug(this._label, ...args);
    }
  };
})();
//# sourceMappingURL=debug.js.map
