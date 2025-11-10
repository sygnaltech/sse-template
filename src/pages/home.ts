/**
 * Page | Home
 * Home page module for the root route
 */

import { PageBase, page } from "@sygnal/sse-core";

@page('/')
export class HomePage extends PageBase {

  protected onPrepare(): void {
    // Synchronous setup - called during <head> load
    // Access page context via this.pageInfo
    console.log('HomePage preparing...', this.pageInfo.pageId);
  }

  protected async onLoad(): Promise<void> {
    // Asynchronous execution - called after DOM ready
    console.log('HomePage initialized');
  }

}
