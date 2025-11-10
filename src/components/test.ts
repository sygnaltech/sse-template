/**
 * Component | Test
 * Example component demonstrating the ComponentBase pattern
 */

import { ComponentBase, component } from "@sygnal/sse-core";

@component('test')
export class TestComponent extends ComponentBase {

  protected onPrepare(): void {
    // Synchronous setup - runs before DOM is ready
    // Good for: configuration, variable initialization
    console.log('TestComponent preparing on:', this.context.name);
  }

  protected async onLoad(): Promise<void> {
    // Asynchronous execution - runs after DOM is ready
    // Good for: DOM manipulation, event binding, API calls

    console.log('TestComponent initialized on element:', this.element);
    console.log('Data attributes:', this.context.dataAttributes);

    // Example: Access sa5 if available
    if (window.sa5) {
      // Use sa5 functionality here
    }

    // Example: Add event listener
    this.element.addEventListener('click', () => {
      console.log('TestComponent clicked!');
    });
  }
}
