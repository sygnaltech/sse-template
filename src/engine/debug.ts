
/*
 * Sygnal Debug
 * 
 * Sygnal Technology Group
 * http://sygnal.com
 * 
 * Debug Utilities
 * 
 * Stack is;
 * r-proxy
 * localstorage
 * chrome tool
 */

const DEFAULT_APP_NAME = 'Site'; 

export class Debug {

    private _localStorageDebugFlag: string = 'debug-mode';
    private _appName: string = DEFAULT_APP_NAME;

    private _enabled: boolean = false;
    private _label: string;

    // Get or set WFU persistent debug state
    // which is stored in localStorage. 
    get persistentDebug(): boolean {
        return Boolean(localStorage.getItem(this._localStorageDebugFlag)); 
    }
    set persistentDebug(active: boolean) {
        if (active) {
            localStorage.setItem(this._localStorageDebugFlag, "true");
            console.debug (`${this._appName} debug enabled (persistent).`);
        } else {
            localStorage.removeItem(this._localStorageDebugFlag); 
            console.debug (`${this._appName} debug disabled (persistent).`);
        }
    }

    // Enable/disable debugging 
    get enabled(): boolean {

        // localStorage is checked for a debug flag, to enable remote debug enabling 
        // Any non-null string value will resolve to TRUE here, including the string "false" 
        var wfuDebugValue = Boolean(localStorage.getItem(this._localStorageDebugFlag)); 

        // Or this with the current debug state
        // If either is enabled, debugging is on 
        wfuDebugValue = wfuDebugValue || this._enabled; 

        return wfuDebugValue;
    }
    set enabled(active: boolean) {
        this._enabled = active;
    }


    // Initialize
    constructor(label: string, appName: string = DEFAULT_APP_NAME) {

        // Save the label, for console logging
        this._appName = appName;
        this._label = label;

    }

    // Start a console log group
    group(name) {
        if (this.enabled)
            console.group(name);
    }

    // End a console log group
    groupEnd() {
        if (this.enabled)
            console.groupEnd();
    }

    // Log debug data to the console
    debug(...args: any[]): void {

        if (this.enabled)
            // Unlimited arguments in a JavaScript function
            // https://stackoverflow.com/a/6396066
            console.debug(this._label, ...args); 
            
    }

}


