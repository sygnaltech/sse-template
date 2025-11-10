/**
 * Page | Blog
 * Handles all /blog/* routes with wildcard matching
 */

import { PageBase, page } from "@sygnal/sse-core";

@page('/blog/*')  // ← Wildcard route - matches /blog/post-1, /blog/category/tech, etc.
export class BlogPage extends PageBase {

  protected onPrepare(): void {
    // Synchronous setup - called during <head> load
    console.log('Blog page preparing...', this.pageInfo.path);
  }

  protected async onLoad(): Promise<void> {
    // Get the full path for dynamic routing
    const fullPath = this.pageInfo.path;
    const blogSlug = fullPath.replace('/blog/', '');

    console.log('Blog page loaded');
    console.log('Blog slug:', blogSlug);

    // You can parse the slug and load dynamic content
    // e.g., /blog/my-post-title -> slug = 'my-post-title'
    // e.g., /blog/category/tech -> slug = 'category/tech'
    
    // Access Webflow CMS data if this is a CMS collection
    if (this.pageInfo.itemSlug) {
      console.log('CMS Item Slug:', this.pageInfo.itemSlug);
      console.log('Collection ID:', this.pageInfo.collectionId);
    }
  }

}
