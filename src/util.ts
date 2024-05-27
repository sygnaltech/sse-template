

// Determine Webflow breakpoint?


// Utility function to get a query parameter value by name
export function getQueryParam(name: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}


// Add a new async script to the page
// at the end of the body
export function loadScript(url: string): void {
    const script = document.createElement('script');
    script.src = url;
//    script.async = true;
    document.body.appendChild(script);
}

// Add a new CSS file to the page
export function loadCSS(url: string): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

// Replace an existing script source
export function replaceScriptSource(element: HTMLScriptElement, newSrc: string): void {
    element.src = newSrc;
}

// Replace an existing CSS source
export function replaceCSSLink(element: HTMLLinkElement, newHref: string): void {
    element.href = newHref;
}

// Function to prepend text to the document title in development mode
export function prependToTitle(text: string): void {
    document.title = `${text}${document.title}`;
}

// Function to get the current script URL
export function getCurrentScriptUrl(): string | null {
    // Check if document.currentScript is supported
    if (document.currentScript) {
        // Cast to HTMLScriptElement and get the src attribute
        const currentScript = document.currentScript as HTMLScriptElement;
        return currentScript.src;
    }
    // For browsers that do not support document.currentScript
    console.error("document.currentScript is not supported in this browser.");
    return null;
}


export function findAncestorWithAttribute(element: HTMLElement, attributeName: string): HTMLElement | null {
    let currentElement: HTMLElement | null = element;

    while (currentElement) {
        if (currentElement.hasAttribute(attributeName)) {
            return currentElement;
        }
        currentElement = currentElement.parentElement;
    }

    return null;
}

export function getAncestorAttributeValue(element: HTMLElement, attributeName: string): string | null {
    let currentElement: HTMLElement | null = element;

    while (currentElement) {
        if (currentElement.hasAttribute(attributeName)) {
            return currentElement.getAttribute(attributeName);
        }
        currentElement = currentElement.parentElement;
    }

    return null;
}

export function hasAncestorWithAttribute(element: HTMLElement, attributeName: string): boolean {
    return findAncestorWithAttribute(element, attributeName) !== null;
}

export function convertToPixels(value: string, contextElement: HTMLElement = document.documentElement): number {
    // Parse the numeric value and unit, including negative values
    const match = value.match(/^(-?\d+\.?\d*)(rem|em|px|vh|vw|%)$/);
    if (!match) throw new Error('Invalid value format');

    const [, amountStr, unit] = match;
    const amount = parseFloat(amountStr);

    // Convert based on the unit
    switch (unit) {
        case 'px':
            return amount;
        case 'rem':
            return amount * parseFloat(getComputedStyle(document.documentElement).fontSize);
        case 'em':
            // For 'em', it's relative to the font-size of the context element.
            return amount * parseFloat(getComputedStyle(contextElement).fontSize);
        case 'vh':
            return amount * window.innerHeight / 100;
        case 'vw':
            return amount * window.innerWidth / 100;
        case '%':
            // For %, it's relative to the parent element's size. This can be tricky as it depends on the property (width, height, font-size, etc.).
            // In this example, we'll use it relative to the width of the context element, but you might need to adjust based on your specific use case.
            return amount * contextElement.clientWidth / 100;
        default:
            throw new Error('Unsupported unit');
    }
}


/*
// Example usage:
const pixelValue = convertToPixels("10vh");
console.log(pixelValue);
*/

async function getResponseHeader(headerName: string, url: string | undefined = undefined): Promise<string | undefined> {

    const headers: Headers | undefined = await getResponseHeaders(url);

    if(!headers)
        return undefined;

    if(!headers.has(headerName)) 
        return undefined;

    return headers[headerName];

}

// Function to check if the reverse proxy header is present
async function getResponseHeaders(url: string | undefined = undefined): Promise<Headers | undefined> {
    try {

        if(!url) {
            url = window.location.href
        }

        const response = await fetch(url, {
            method: 'HEAD', // Only fetch headers
        });

        return response.headers;

    } catch (error) {
        console.error('Error checking reverse proxy header:', error);
    }

    return undefined;
}

