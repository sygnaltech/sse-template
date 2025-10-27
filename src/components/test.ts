/**
 * Component | Test
 * Example component demonstrating the IModule pattern
 */

import { IModule } from "@sygnal/sse";
import { component } from "@sygnal/sse";

@component('test')
export class TestComponent implements IModule {
  private elem: HTMLElement;

  constructor(elem: HTMLElement) {
    this.elem = elem;
  }

  setup(): void {
    // Synchronous setup - runs before DOM is ready
    // Good for: configuration, variable initialization
  }

  async exec(): Promise<void> {
    // Asynchronous execution - runs after DOM is ready
    // Good for: DOM manipulation, event binding, API calls

    console.log('TestComponent initialized on element:', this.elem);

    // Example: Access sa5 if available
    if (window.sa5) {
      // Use sa5 functionality here
    }

    // Example: Add event listener
    this.elem.addEventListener('click', () => {
      console.log('TestComponent clicked!');
    });
  }
}
