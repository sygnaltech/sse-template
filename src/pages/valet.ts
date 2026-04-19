/**
 * Page | Valet
 * Handles all /valet/* routes
 *
 * 1. Finds elements with [sse:item-active] and marks matching
 *    [sse:item] elements with the [sse:active] attribute.
 * 2. Within each [sse:section], sorts active items to the top.
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

    // For each active slug, find matching [sse:item] elements and add [sse:active]
    for (const slug of activeSlugs) {
      const matches = document.querySelectorAll(`[sse\\:item="${slug}"]`);
      console.log(`[valet] Slug "${slug}" matched ${matches.length} [sse:item] element(s)`);
      matches.forEach((el) => {
        el.setAttribute('sse:active', '');
        console.log(`[valet] Set [sse:active] on`, el);
      });
    }

    // Sort active items to the top within each [sse:section]
    this.sortActiveItemsInSections();

  }

  private sortActiveItemsInSections(): void {
    const sections = document.querySelectorAll('[sse\\:section]');
    console.log(`[valet] Found ${sections.length} [sse:section] element(s) to sort`);

    sections.forEach((section, sectionIdx) => {
      const sectionLabel = section.getAttribute('sse:section') || `#${sectionIdx}`;

      // Find each [sse:item] in this section and determine its sortable "card"
      // (the nearest common-parent child that represents the item in the list).
      const items = Array.from(section.querySelectorAll('[sse\\:item]'));
      if (items.length === 0) {
        console.log(`[valet] Section "${sectionLabel}": no [sse:item] elements, skipping`);
        return;
      }

      // Group items by their grid container — the grid is the ancestor whose
      // children are the sortable cards. We find it by walking up from each
      // item until we reach a parent with multiple siblings (still inside the
      // section).
      const grids = new Map<Element, HTMLElement[]>();

      items.forEach((item) => {
        let card = item as HTMLElement;
        while (card.parentElement && section.contains(card.parentElement) && card.parentElement !== section) {
          if (card.parentElement.children.length > 1) break;
          card = card.parentElement;
        }
        const grid = card.parentElement;
        if (!grid) return;
        const list = grids.get(grid) || [];
        list.push(card);
        grids.set(grid, list);
      });

      grids.forEach((cards, grid) => {
        // Dedupe (in case multiple sse:item elements live in the same card)
        const unique = Array.from(new Set(cards));

        const isActive = (card: HTMLElement) =>
          card.hasAttribute('sse:active') || card.querySelector('[sse\\:active]') !== null;

        // Stable sort: active first
        unique.sort((a, b) => {
          const aActive = isActive(a);
          const bActive = isActive(b);
          if (aActive === bActive) return 0;
          return aActive ? -1 : 1;
        });

        // Re-append in sorted order
        unique.forEach((card) => grid.appendChild(card));

        const activeCount = unique.filter(isActive).length;
        console.log(
          `[valet] Section "${sectionLabel}": sorted ${unique.length} cards (${activeCount} active)`
        );
      });
    });
  }

}
