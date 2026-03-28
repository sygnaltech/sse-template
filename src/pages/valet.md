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

### Console Logging

The handler logs each step to the console with a `[valet]` prefix for debugging:

- Count of `sse:item-active` elements found
- Each active slug value
- Number of `sse:item` matches per slug
- Each element that receives `sse:active`
