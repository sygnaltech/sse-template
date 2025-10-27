/**
 * Page | About
 * Handles multiple routes for the same page
 */

import { IModule } from "@sygnal/sse";
import { page } from "@sygnal/sse";

// Multiple decorators - same page handles multiple routes!
@page('/about')
@page('/about-us')
@page('/team')
export class AboutPage implements IModule {

  constructor() {
  }

  setup(): void {
    // Synchronous setup
  }

  async exec(): Promise<void> {
    // You can check which route was accessed
    const currentPath = window.location.pathname;

    console.log('About page loaded via:', currentPath);

    // Optionally handle different routes differently
    switch (currentPath) {
      case '/about':
        console.log('Main about page');
        break;
      case '/about-us':
        console.log('About us variation');
        break;
      case '/team':
        console.log('Team page');
        break;
    }
  }

}
