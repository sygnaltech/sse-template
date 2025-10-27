/**
 * Page | Blog
 * Handles all /blog/* routes with wildcard matching
 */

import { IModule, page } from "@sygnal/sse";

@page('/blog/*')  // ← Wildcard route - matches /blog/post-1, /blog/category/tech, etc.
export class BlogPage implements IModule {

  constructor() {
  }

  setup(): void {
    // Synchronous setup
  }

  async exec(): Promise<void> {
    // Get the full path for dynamic routing
    const fullPath = window.location.pathname;
    const blogSlug = fullPath.replace('/blog/', '');

    console.log('Blog page loaded');
    console.log('Blog slug:', blogSlug);

    // You can parse the slug and load dynamic content
    // e.g., /blog/my-post-title -> slug = 'my-post-title'
    // e.g., /blog/category/tech -> slug = 'category/tech'
  }

}
