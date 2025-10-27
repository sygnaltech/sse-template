/**
 * Component | Example
 * A more detailed example showing component capabilities
 */

import { IModule } from "@sygnal/sse";
import { component } from "@sygnal/sse";

@component('example')
export class ExampleComponent implements IModule {
  private elem: HTMLElement;
  private isActive: boolean = false;

  constructor(elem: HTMLElement) {
    this.elem = elem;
  }

  setup(): void {
    // Read data attributes
    const initialState = this.elem.dataset.initialState;
    if (initialState === 'active') {
      this.isActive = true;
    }
  }

  async exec(): Promise<void> {
    // Apply initial state
    if (this.isActive) {
      this.elem.classList.add('active');
    }

    // Bind events
    this.bindEvents();

    // Example: Fetch data from API
    // const data = await this.fetchData();
  }

  private bindEvents(): void {
    this.elem.addEventListener('click', this.handleClick.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    this.isActive = !this.isActive;
    this.elem.classList.toggle('active', this.isActive);

    // Emit custom event
    this.elem.dispatchEvent(new CustomEvent('exampleToggle', {
      detail: { isActive: this.isActive },
      bubbles: true
    }));
  }

  // Example async method
  private async fetchData(): Promise<unknown> {
    try {
      const response = await fetch('/api/data');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return null;
    }
  }
}
