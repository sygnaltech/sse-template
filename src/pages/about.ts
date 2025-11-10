/**
 * Page | About
 * Handles multiple routes for the same page
 */

import { PageBase, page } from "@sygnal/sse-core";

// Multiple decorators - same page handles multiple routes!
@page('/about')
@page('/about-us')
@page('/team')
export class AboutPage extends PageBase {

  protected onPrepare(): void {
    // Synchronous setup - called during <head> load
    console.log('About page preparing...', this.pageInfo.path);
  }

  protected async onLoad(): Promise<void> {
    // You can check which route was accessed via pageInfo
    const currentPath = this.pageInfo.path;

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
