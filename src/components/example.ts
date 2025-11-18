/**
 * Component | Example
 * A more detailed example showing component capabilities
 */

import { ComponentBase, component, PageBase } from "@sygnal/sse-core";

@component('example')
export class ExampleComponent extends ComponentBase {
  private isActive: boolean = false;

  protected onPrepare(): void {
    // Synchronous setup - called during <head> load
    // Read data attributes
    const initialState = this.element.dataset.initialState;
    if (initialState === 'active') {
      this.isActive = true;
    }
  }

  protected async onLoad(): Promise<void> {
    // Asynchronous execution - called after DOM ready
    
    // Apply initial state
    if (this.isActive) {
      this.element.classList.add('active');
    }

    // Access page info via singleton
    const page = PageBase.getCurrentPage();
    if (page) {
      console.log('Example component on page:', page.getPageInfo().pageId);
      console.log('Collection item:', page.getPageInfo().itemSlug);
    }

    // Bind events
    this.bindEvents();

    // Example: Fetch data from API
    // const data = await this.fetchData();
  }

  private bindEvents(): void {
    this.element.addEventListener('click', this.handleClick.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    this.isActive = !this.isActive;
    this.element.classList.toggle('active', this.isActive);

    // Emit custom event
    this.element.dispatchEvent(new CustomEvent('exampleToggle', {
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
