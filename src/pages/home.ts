/**
 * Page | Home
 * Home page module for the root route
 */

import { IModule, page } from "@sygnal/sse";

@page('/')
export class HomePage implements IModule {

  constructor() {
  }

  setup(): void {
    // Synchronous setup
  }

  async exec(): Promise<void> {
    // Asynchronous execution
    console.log('HomePage initialized');
  }

}
