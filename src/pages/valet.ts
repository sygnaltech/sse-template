/**
 * Page | Valet
 * Handles all /valet/* routes
 *
 * Finds elements with [sse:item-active] and marks matching
 * [sse-item] elements with the [sse:active] attribute.
 */

import { PageBase, page } from "@sygnal/sse-core";

@page('/valet/*')
export class ValetPage extends PageBase {

  protected onPrepare(): void {
  }

  protected async onLoad(): Promise<void> {

    // Find all elements with [sse:item-active] and collect their values
    const activeItems = document.querySelectorAll('[sse\\:item-active]');
    console.log(`[valet] Found ${activeItems.length} [sse:item-active] element(s)`);

    const activeSlugs: string[] = [];

    activeItems.forEach((el) => {
      const value = el.getAttribute('sse:item-active');
      if (value) {
        activeSlugs.push(value);
        console.log(`[valet] Active slug: "${value}"`);
      }
    });

    console.log(`[valet] ${activeSlugs.length} active slug(s) to match`);

    // For each active slug, find matching [sse-item] elements and add [sse:active]
    for (const slug of activeSlugs) {
      const matches = document.querySelectorAll(`[sse\\:item="${slug}"]`);
      console.log(`[valet] Slug "${slug}" matched ${matches.length} [sse:item] element(s)`);
      matches.forEach((el) => {
        el.setAttribute('sse:active', '');
        console.log(`[valet] Set [sse:active] on`, el);
      });
    }

  }

}
