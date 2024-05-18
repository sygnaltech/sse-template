
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

