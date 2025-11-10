# SSE2 Template - Webflow Site Engine Starter

A TypeScript-based template for building custom Webflow site extensions using the [Sygnal Site Engine (SSE2)](https://engine.sygnal.com/) framework.

## Features

- **TypeScript** - Type-safe development with modern ES6+ features
- **SCSS Support** - Write maintainable styles with variables, nesting, and mixins
- **Fast Build System** - TypeScript type checking + esbuild bundler, Dart Sass for SCSS
- **Watch Mode** - Auto-rebuild on file changes during development
- **Component System** - Reusable, attribute-based components with automatic context detection
- **Route Management** - Page-based architecture with automatic Webflow context
- **Source Maps** - Debug TypeScript and SCSS in browser DevTools
- **Development Server** - Local testing with hot reload

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Project

**Update `package.json`:**
- Set `name` to your project name
- Set `version` appropriately

**Update `src/index.ts`:**
- Edit `SITE_NAME` constant
- Edit `VERSION` constant

### 3. Build

```bash
npm run build       # Development build with type checking
npm run build:prod  # Production build with minification
```

This performs type checking, bundles all TypeScript into a single `dist/index.js`, and compiles SCSS files to `dist/`.

### 4. Development

```bash
npm run watch    # Start watch mode for auto-rebuild
npm run serve    # Start local dev server (http://127.0.0.1:3000)
```

Run both commands in separate terminals for the best development experience.

## Project Structure

```
sse-template/
├── src/
│   ├── index.ts              # Main entry point
│   ├── site.ts               # Site-level module
│   ├── routes.ts             # Route & component imports
│   ├── types.ts              # Template-specific types
│   ├── version.ts            # Version constant
│   ├── site.scss             # Global styles
│   ├── pages/
│   │   ├── home.ts          # Home page module
│   │   ├── blog.ts          # Blog page (wildcard example)
│   │   └── about.ts         # About page (multi-route example)
│   └── components/
│       ├── test.ts          # Test component
│       └── example.ts       # Example component
├── dist/                     # Compiled output (git-ignored)
├── build.js                  # Build script (tsc + esbuild + sass)
├── generate-imports.js       # Optional: Auto-generate imports
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
├── MIGRATION.md             # Migration guide for v0.3.0+
└── README.md                # This file
```

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Development build with type checking + bundling |
| `npm run build:prod` | Production build with minification (for deployment) |
| `npm run watch` | Watch mode - auto-rebuild TypeScript and SCSS |
| `npm run typecheck` | Run TypeScript type checking only |
| `npm run serve` | Start local dev server on port 3000 |
| `npm run format` | Format TypeScript and SCSS with Prettier |
| `npm run clean` | Remove dist directory |

## Working with SCSS

### Adding Styles

1. Create `.scss` files anywhere in the `src/` directory
2. The build process automatically compiles them to `dist/` with the same folder structure
3. Output is compressed (minified) for production

**Example:**
```
src/site.scss       → dist/site.css
src/pages/home.scss → dist/pages/home.css
```

### Using Modern Sass Features

```scss
@use "sass:color";
@use "sass:math";

// Variables
$primary: #007bff;
$spacing: 1rem;

// Nesting
.component {
  padding: $spacing;

  &:hover {
    background: color.scale($primary, $lightness: 80%);
  }
}

// Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Loading CSS in Webflow

The SSE framework can auto-load CSS files. See `src/site.ts` for an example:

```typescript
Page.loadEngineCSS("site.css");
```

## Adding Pages

Pages are automatically discovered using the `@page` decorator. Just create and import!

### 1. Create a page module in `src/pages/`:

```typescript
// src/pages/about.ts
import { PageBase, page } from '@sygnal/sse-core';

@page('/about')  // ← Decorator auto-registers this route!
export class AboutPage extends PageBase {

  protected onPrepare(): void {
    // Synchronous setup - called during <head> load
    // Access Webflow page context automatically
    console.log('Page ID:', this.pageInfo.pageId);
    console.log('Collection:', this.pageInfo.collectionId);
  }

  protected async onLoad(): Promise<void> {
    // Asynchronous execution - called after DOM ready
    console.log('About page loaded');
    console.log('Current path:', this.pageInfo.path);
  }
}
```

### 2. Import in `src/routes.ts` (under PAGES section):

```typescript
// ============================================================
// PAGES - Import all pages to trigger @page decorator
// ============================================================
import "./pages/home";
import "./pages/about";  // ← Add your import here!
```

The route is automatically registered. No manual route mapping needed!

**Note:** All pages and components are imported in `routes.ts` - this is the central registry location.

### Automatic Webflow Context

When you extend `PageBase`, your page automatically gets access to `this.pageInfo`:

```typescript
protected async onLoad(): Promise<void> {
  // All available automatically:
  console.log(this.pageInfo.path);         // Current path
  console.log(this.pageInfo.url);          // Full URL
  console.log(this.pageInfo.pageId);       // Webflow page ID
  console.log(this.pageInfo.siteId);       // Webflow site ID
  console.log(this.pageInfo.collectionId); // CMS collection ID (if applicable)
  console.log(this.pageInfo.itemId);       // CMS item ID (if applicable)
  console.log(this.pageInfo.itemSlug);     // CMS item slug (if applicable)
  console.log(this.pageInfo.queryParams);  // URLSearchParams object
  console.log(this.pageInfo.hash);         // URL hash
  console.log(this.pageInfo.domain);       // Webflow domain
  console.log(this.pageInfo.lang);         // Page language
}
```

### Multiple Routes Per Page

You can use multiple `@page` decorators on a single class to handle multiple routes:

```typescript
// src/pages/about.ts
import { PageBase, page } from '@sygnal/sse-core';

@page('/about')      // All three routes
@page('/about-us')   // use the same
@page('/team')       // page class!
export class AboutPage extends PageBase {

  protected onPrepare(): void {
    console.log('Preparing about page...');
  }

  protected async onLoad(): Promise<void> {
    // Check which route was accessed via pageInfo
    const currentPath = this.pageInfo.path;

    if (currentPath === '/team') {
      // Show team-specific content
    }
  }
}
```

**Use cases:**
- Route aliases (`/shop`, `/store`, `/products`)
- Localized URLs (`/en/contact`, `/es/contacto`)
- Legacy URL support
- Similar pages with shared logic

### Wildcard Routes

Wildcard routes are supported using `*` for dynamic paths:

```typescript
// src/pages/blog.ts
import { PageBase, page } from '@sygnal/sse-core';

@page('/blog/*')  // ← Matches /blog/post-1, /blog/category/tech, etc.
export class BlogPage extends PageBase {

  protected onPrepare(): void {
    console.log('Blog page preparing...');
  }

  protected async onLoad(): Promise<void> {
    // Access the full path via pageInfo
    const fullPath = this.pageInfo.path;
    const slug = fullPath.replace('/blog/', '');

    console.log('Blog slug:', slug);

    // If this is a Webflow CMS collection page
    if (this.pageInfo.itemSlug) {
      console.log('CMS Item Slug:', this.pageInfo.itemSlug);
      console.log('Collection ID:', this.pageInfo.collectionId);
    }
  }
}
```

Routes are matched in the order they're registered, with exact matches taking precedence over wildcards.

## Adding Components

Components are automatically discovered using the `@component` decorator and extend `ComponentBase` for automatic element context.

### 1. Create a component class in `src/components/`:

```typescript
// src/components/my-component.ts
import { ComponentBase, component, PageBase } from '@sygnal/sse-core';

@component('my-component')  // ← Decorator auto-registers this component!
export class MyComponent extends ComponentBase {

  protected onPrepare(): void {
    // Synchronous setup - runs before DOM ready
    // Access element and context automatically
    console.log('Component name:', this.context.name);
    console.log('Component ID:', this.context.id);
    console.log('Data attributes:', this.context.dataAttributes);
  }

  protected async onLoad(): Promise<void> {
    // Asynchronous execution - runs after DOMContentLoaded
    console.log('MyComponent initialized on:', this.element);

    // Access current page info via singleton
    const page = PageBase.getCurrentPage();
    if (page) {
      console.log('Component on page:', page.pageInfo.pageId);
      console.log('Collection item:', page.pageInfo.itemSlug);
    }

    // Add event listeners
    this.element.addEventListener('click', () => {
      console.log('Component clicked!');
    });
  }
}
```

### 2. Import in `src/routes.ts` (under COMPONENTS section):

```typescript
// ============================================================
// COMPONENTS - Import all components to trigger @component decorator
// ============================================================
import "./components/test";
import "./components/my-component";  // ← Add your import here!
```

### 3. Use in Webflow:

```html
<div data-component="my-component" data-component-id="nav-main">
  <!-- Component content -->
</div>
```

The component is automatically discovered and instantiated!

### Automatic Component Context

When you extend `ComponentBase`, your component automatically gets:

- `this.element` - The HTMLElement the component is bound to
- `this.context.name` - Component name from `data-component` attribute
- `this.context.id` - Component ID from `data-component-id` attribute (if present)
- `this.context.dataAttributes` - All data-* attributes on the element

### Accessing Page Info from Components

Components can access the current page via the singleton pattern:

```typescript
protected async onLoad(): Promise<void> {
  const page = PageBase.getCurrentPage();

  if (page) {
    // Access all page info
    console.log('Page ID:', page.pageInfo.pageId);
    console.log('Collection:', page.pageInfo.collectionId);
    console.log('Item Slug:', page.pageInfo.itemSlug);

    // Component logic based on page context
    if (page.pageInfo.collectionId === 'products') {
      // Product-specific component behavior
    }
  }
}
```

### Component Features

- **Auto-discovery**: Components are automatically found and initialized
- **Type-safe**: Full TypeScript support with strict typing
- **Component Manager**: All instances registered in `window.componentManager`
- **Error handling**: Graceful error handling with console warnings
- **Lifecycle hooks**: `onPrepare()` and `onLoad()` methods for different initialization phases
- **Automatic context**: Element and data attributes automatically detected

### Accessing Component Instances

```typescript
// Get all instances of a specific component type
const myComponents = window.componentManager.getComponentsByType<MyComponent>('my-component');

// Get all registered component types
const types = window.componentManager.getComponentTypes();

// Get total count
const total = window.componentManager.getTotalCount();
```

## Integration with Webflow

Add to your Webflow site's **Custom Code** section (before `</head>` or before `</body>`):

### Production (CDN)

Replace `REPO` with your GitHub repository name and update the version number:

```html
<!-- Site Engine -->
<script
  src="https://cdn.jsdelivr.net/gh/sygnaltech/REPO@0.1.0/dist/index.js"
  dev-src="http://127.0.0.1:3000/dist/index.js"
></script>
```

### Development (Local)

```html
<!-- Site Engine -->
<script src="http://127.0.0.1:3000/dist/index.js"></script>
```

### Development Mode Toggle

The SSE framework supports query parameters for switching modes:

- `?engine.mode=dev` - Force development mode
- `?engine.mode=prod` - Force production mode

## Build System

The template uses a hybrid build approach combining TypeScript's type checking with esbuild's fast bundling.

### Build Process

1. **Type Check** - TypeScript compiler validates all types (`tsc --noEmit`)
2. **Bundle** - esbuild bundles `src/index.ts` and all imports into single `dist/index.js`
3. **SCSS Compile** - Dart Sass compiles all `.scss` files to `.css`

### Development vs Production

**Development Build** (`npm run build`):
- Full type checking
- Unminified output for easier debugging
- Source maps included
- ~15KB bundle size

**Production Build** (`npm run build:prod`):
- Full type checking
- Minified output
- Source maps included
- ~6.8KB bundle size (smaller, faster loading)

### Watch Mode

```bash
npm run watch
```

- TypeScript auto-rebuilds on file changes (no type check in watch for speed)
- SCSS auto-compiles on file changes
- Runs continuously until stopped

### Why This Approach?

- **tsc** provides comprehensive type checking
- **esbuild** provides extremely fast bundling
- **Single bundle** (`dist/index.js`) loads all dependencies
- No duplicate code (all imports bundled once)
- Best of both worlds: safety + speed

## Architecture

### Two-Phase Lifecycle

The SSE framework uses a two-phase initialization:

1. **`onPrepare()`** - Runs synchronously during `<head>` load, before DOM is ready
   - Good for: Configuration, early initialization, reading data attributes

2. **`onLoad()`** - Runs asynchronously after `DOMContentLoaded`
   - Good for: DOM manipulation, event binding, API calls

### Base Class Pattern

All pages extend `PageBase` and components extend `ComponentBase`:

```typescript
// Pages get automatic Webflow context
export abstract class PageBase {
  protected pageInfo: WebflowPageInfo;  // Auto-populated
  protected abstract onPrepare(): void;
  protected abstract onLoad(): Promise<void>;
}

// Components get automatic element context
export abstract class ComponentBase {
  protected element: HTMLElement;       // Auto-provided
  protected context: ComponentContext;  // Auto-populated
  protected abstract onPrepare(): void;
  protected abstract onLoad(): Promise<void>;
}
```

### Component Discovery

Components are automatically discovered via the `data-component` attribute and instantiated by the framework.

## Dependencies

### Production
- **@sygnal/sse-core** - SSE framework core with PageBase and ComponentBase
- **gsap** - Animation library (optional)
- **js-cookie** - Cookie handling utility

### Development
- **esbuild** - Fast JavaScript bundler
- **sass** - Dart Sass compiler
- **typescript** - TypeScript compiler
- **prettier** - Code formatter
- **serve** - Development server

## Learn More

- [SSE Documentation](https://engine.sygnal.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Sass Documentation](https://sass-lang.com/documentation/)

## Testing

Test Project: https://webflow.com/dashboard/sites/sygnal-site-engine/general

## License

See package.json for license information.
