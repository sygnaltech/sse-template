# Page | Valet

**Route:** `/valet/*`

## Business Rule: Active Item Marking

On valet pages, certain items need to be visually marked as "active" based on data attributes in the page. This is a two-step matching process that connects data-source elements to their corresponding display elements.

### How It Works

1. **Identify active slugs** - The page scans for all elements with the `sse:item-active` attribute. The value of each attribute is a slug that represents an active item.

2. **Match display elements** - For each active slug found, the page locates all elements with a matching `sse:item` attribute value.

3. **Mark as active** - Each matched element receives an `sse:active` attribute, which can be used for styling or further logic.

### Attributes

| Attribute | Purpose | Example |
|---|---|---|
| `sse:item-active` | Declares a slug as active. Placed on data-source elements. | `sse:item-active="premium-wash"` |
| `sse:item` | Identifies a display element by slug. | `sse:item="premium-wash"` |
| `sse:active` | Added automatically to matched `sse:item` elements. | `sse:active` (no value) |

### Example

Given this markup:

```html
<!-- Data source declaring active items -->
<div sse:item-active="premium-wash"></div>
<div sse:item-active="interior-detail"></div>

<!-- Display elements -->
<div sse:item="premium-wash">Premium Wash</div>
<div sse:item="basic-wash">Basic Wash</div>
<div sse:item="interior-detail">Interior Detail</div>
```

After the page handler runs:

```html
<div sse:item="premium-wash" sse:active>Premium Wash</div>
<div sse:item="basic-wash">Basic Wash</div>
<div sse:item="interior-detail" sse:active>Interior Detail</div>
```

### Styling

Use the `sse:active` attribute in CSS to style active items:

```css
[sse\:item] {
  opacity: 0.5;
}
[sse\:item][sse\:active] {
  opacity: 1;
}
```

### Sorting Active Items to Top

After marking items as active, the handler also sorts active items to the top of each section.

**Attribute:** `sse:section`

Place `sse:section` on the wrapper element around a group of items to opt that group into sorting. After active tagging runs, items within each section are re-ordered so that any card containing an `sse:active` element moves to the top of its grid, preserving the original order among active items and among non-active items (a stable sort).

The sort operates on the "card" level — the first ancestor of each `sse:item` whose parent contains sibling cards. This works naturally with Webflow CMS collection lists (`.w-dyn-items` > `.w-dyn-item`) without needing extra markup.

**Example:**

```html
<div sse:section="interior-detailing">
  <div class="detail-grid">
    <div class="detail-item"><a sse:item="item-a">Item A</a></div>
    <div class="detail-item"><a sse:item="item-b">Item B</a></div>
    <div class="detail-item"><a sse:item="item-c">Item C</a></div>
  </div>
</div>
```

If `item-b` is marked active, after the handler runs the DOM order becomes `item-b`, `item-a`, `item-c`.

### Console Logging

The handler logs each step to the console with a `[valet]` prefix for debugging:

- Count of `sse:item-active` elements found
- Each active slug value
- Number of `sse:item` matches per slug
- Each element that receives `sse:active`
- Count of `sse:section` wrappers found
- Per-section sort summary (cards sorted, how many were active)
