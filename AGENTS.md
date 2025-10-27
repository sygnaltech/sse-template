# SSE Template - Technical Overview for AI Agents

## Purpose

This template repository serves as a basis for **monorepo site packages** for Webflow websites. Each website project clones this template and customizes it with site-specific pages, components, and routing logic.

## Core Principles

- **TypeScript & SCSS** - Type-safe development with modern styling
- **Efficient page-level routing** - Route dispatcher system for SPA-like navigation
- **Component detection** - Attribute-based component discovery and instantiation
- **TypeScript classes** - All pages and components implement `IModule` interface
- **Single entry point** - Only `dist/index.js` is loaded via CDN in Webflow

## Deployment Pattern

### How Sites Are Built and Deployed

1. Clone this template for each new website project
2. Customize pages, components, and routes for that specific site
3. Build produces a **single bundle**: `dist/index.js`
4. Commit to GitHub repository
5. Webflow loads via CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/username/site-name@version/dist/index.js"></script>
```

**CRITICAL**: Only `dist/index.js` is loaded. All dependencies, pages, components, and routing logic must be bundled into this single file.

## Tech Stack

### Build System (tsc + esbuild Hybrid)

**Why this approach:**
- TypeScript compiler (`tsc`) provides comprehensive type checking
- esbuild provides extremely fast bundling
- Single bundle output eliminates code duplication
- Type safety during development, speed during builds

**Build Process:**
1. **Type Check** - `tsc --noEmit` validates all types (development builds only)
2. **Bundle** - esbuild bundles `src/index.ts` → `dist/index.js` (single file)
3. **SCSS** - Dart Sass compiles `src/**/*.scss` → `dist/**/*.css`

**Build Script**: [`build.js`](build.js)
- Development: 15KB unminified with source maps
- Production: 6.8KB minified with source maps
- Watch mode: Auto-rebuild on file changes (skips type check for speed)

### Dependencies

**Production:**
- `@sygnal/sse` - Core SSE framework (from ../sse-core)
- `gsap` - Animation library (optional)
- `js-cookie` - Cookie utilities

**Development:**
- `typescript` - Type checking and compilation
- `esbuild` - Fast JavaScript bundler
- `sass` - SCSS compilation
- `prettier` - Code formatting
- `serve` - Local development server

## Architecture

### Entry Point Flow

**`src/index.ts`** (only file loaded in Webflow):
1. Imports `routes.ts` (which imports all pages and components)
2. Initializes SSE framework
3. Sets up global window interfaces
4. Executes two-phase lifecycle:
   - `setup()` - Synchronous, runs at `</head>`, calls `logRegistryStats()` and `routeDispatcher().setupRoute()`
   - `exec()` - Async, runs after DOMContentLoaded, calls `routeDispatcher().execRoute()` and `initializeComponents()`

**`src/routes.ts`** (central registry):
1. Imports all pages to trigger `@page` decorators
2. Imports all components to trigger `@component` decorators
3. Exports `routeDispatcher()` for route management
4. Exports `initializeComponents()` for component activation
5. Exports `logRegistryStats()` for debugging

**One place for all module registration** - just add imports to `routes.ts`

### Component System (Decorator-Based Auto-Discovery)

**Using `@component` Decorator:**

```typescript
// src/components/my-component.ts
import { component } from "../engine/registry";

@component('my-component')  // ← Auto-registers with this name
export class MyComponent implements IModule {
  constructor(elem: HTMLElement) { /* ... */ }
}
```

**Then just import in `src/routes.ts`:**

```typescript
// Under COMPONENTS section
import "./components/my-component";  // Decorator runs, component registered
```

**How it works:**
1. Class decorator `@component(name)` registers component at module load
2. Find all elements with `[sse-component]` attribute in DOM
3. Get component name from attribute value
4. Lookup constructor in auto-discovered registry
5. Instantiate with element reference
6. Register in ComponentManager
7. Execute component

**Benefits:**
- Component name lives with the class (co-located)
- No manual registry maintenance
- Auto-discovery at import time
- Full TypeScript type safety
- Consistent with page registration pattern

### Routing System (Decorator-Based Auto-Discovery)

**Using `@page` Decorator:**

```typescript
// src/pages/about.ts
import { page } from "../engine/registry";

@page('/about')  // ← Auto-registers with this route
export class AboutPage implements IModule {
  constructor() { /* ... */ }
}
```

**Then just import in `src/routes.ts`:**

```typescript
import "./pages/about";  // Decorator runs, route registered

export const routeDispatcher = (): RouteDispatcher => {
    const dispatcher = new RouteDispatcher(Site);
    dispatcher.routes = getAllPages();  // Auto-discovered routes
    return dispatcher;
}
```

**Route flow:**
1. Class decorator `@page(route)` registers page at module load
2. `getAllPages()` returns all auto-discovered routes
3. `setup()` calls `routeDispatcher().setupRoute()` (synchronous)
4. `exec()` calls `routeDispatcher().execRoute()` (async)
5. Current route determines which page module executes

### Module Interface

All pages and components implement `IModule`:

```typescript
interface IModule {
  setup(): void;              // Sync, runs early
  exec(): Promise<void>;      // Async, runs after DOM ready
}
```

**Two-phase lifecycle:**
- **`setup()`** - Before DOM ready, no DOM access, good for config
- **`exec()`** - After DOMContentLoaded, good for DOM manipulation, events, API calls

### Component Manager

**`src/engine/component-manager.ts`** - Global registry for component instances:

```typescript
window.componentManager.registerComponent(type, instance);
window.componentManager.getComponentsByType<T>(type): T[];
window.componentManager.getComponentTypes(): string[];
window.componentManager.getTotalCount(): number;
```

Allows querying all instances of a component type at runtime.

### Registry System

**`src/engine/registry.ts`** - Decorator-based auto-discovery:

**Decorators:**
- `@component(name)` - Auto-register component classes
- `@page(route)` - Auto-register page classes

**Registry Functions:**
- `getComponent(name)` - Get component constructor by name
- `getAllComponents()` - Get all registered components
- `getPage(route)` - Get page constructor by route
- `getAllPages()` - Get all registered pages
- `getRegistryStats()` - Get discovery statistics

### Type Definitions

**`src/types.ts`** - Centralized type definitions:
- `ComponentConstructor` - Type for component class constructors (takes HTMLElement)
- `PageConstructor` - Type for page class constructors (no arguments)
- `ComponentRegistry` - Type-safe component name → constructor mapping
- `PageRegistry` - Type-safe route → page constructor mapping
- `SiteGlobalData` - Interface for site-wide global data

## File Structure

```
src/
├── index.ts              # Entry point - ONLY file loaded in Webflow
│                         # Imports routes.ts and manages initialization
├── routes.ts             # **CENTRAL REGISTRY** - All pages & components imported here
│                         # Exports routeDispatcher() and initializeComponents()
├── site.ts               # Site-level module (global functionality)
├── types.ts              # TypeScript type definitions
├── version.ts            # Version constant
├── site.scss             # Global styles
├── pages/
│   ├── home.ts          # Page modules with @page decorator
│   └── blog.ts          # Example wildcard page
├── components/
│   ├── test.ts          # Components with @component decorator
│   └── example.ts       # Detailed component example
└── engine/
    ├── component-manager.ts  # Component instance registry
    └── registry.ts           # Decorator-based auto-discovery system

dist/
├── index.js             # SINGLE BUNDLE - everything included
├── index.js.map         # Source map for debugging
├── site.css             # Compiled styles
└── site.css.map         # CSS source map
```

## Critical Design Decisions

### 1. Single Bundle Architecture

**Why:** Webflow loads only one file via CDN. All code must be in `dist/index.js`.

**Implication:** Use esbuild with `bundle: true` and single entry point. Don't generate multiple JS files.

### 2. Decorator-Based Auto-Discovery

**Why:** Co-locate component/page names with their classes. Consistent pattern for both.

**Implication:**
- Use `@component(name)` and `@page(route)` decorators
- Component/page name lives with the class definition
- Just import files to trigger registration
- TypeScript experimental decorators must be enabled
- Slightly larger bundle (~1.5KB) but much better DX

### 3. No Type Declarations Generated

**Why:** This is deployed as a bundled script, not consumed as a library.

**Implication:** Don't need `.d.ts` files. Use `tsc --noEmit` for type checking only.

### 4. Component Manager is Global

**Why:** Allows querying component instances from anywhere in the codebase.

**Implication:** `window.componentManager` available globally, properly typed in `declare global`.

### 5. Development vs Production Builds

**Why:** Development needs readable code for debugging, production needs small file size.

**Implication:**
- `npm run build` - Unminified, type-checked, source maps
- `npm run build:prod` - Minified, type-checked, source maps (for deployment)

## Core Engine (`../sse-core`)

The SSE framework is maintained separately and should contain **nothing project-specific**. It provides:
- `IModule` interface
- `RouteDispatcher` class
- `Page` utilities (e.g., `loadEngineCSS()`)
- `initSSE()` initialization
- Other shared utilities

Updates to sse-core should be framework improvements that benefit all projects.

## Common Tasks

### Adding a New Page

1. Create `src/pages/about.ts` with `@page('/about')` decorator
2. Add import to `src/routes.ts`: `import "./pages/about";`
3. Build and deploy

**Example (Exact Route):**
```typescript
import { IModule } from '@sygnal/sse';
import { page } from '../engine/registry';

@page('/about')
export class AboutPage implements IModule {
  constructor() {}
  setup(): void {}
  async exec(): Promise<void> {}
}
```

**Example (Wildcard Route):**
```typescript
import { IModule } from '@sygnal/sse';
import { page } from '../engine/registry';

@page('/blog/*')  // Matches /blog/post-1, /blog/category/tech, etc.
export class BlogPage implements IModule {
  constructor() {}
  setup(): void {}
  async exec(): Promise<void> {
    const slug = window.location.pathname.replace('/blog/', '');
    // Handle dynamic routing based on slug
  }
}
```

**Wildcard Matching:**
- Routes ending with `*` are treated as wildcard routes
- `'/blog/*'` matches `/blog/anything`, `/blog/nested/path`, etc.
- Exact matches take precedence over wildcards
- Useful for dynamic content (blog posts, product pages, etc.)

**Multiple Routes Per Page:**
You can stack multiple `@page` decorators on a single class:

```typescript
@page('/about')
@page('/about-us')
@page('/team')
export class AboutPage implements IModule {
  async exec(): Promise<void> {
    const path = window.location.pathname;
    // Handle different routes as needed
  }
}
```

Use cases:
- Route aliases (e.g., `/shop`, `/store`)
- Localized URLs (e.g., `/en/contact`, `/es/contacto`)
- Legacy URL support
- Similar pages sharing logic

### Adding a New Component

1. Create `src/components/my-component.ts` with `@component('my-component')` decorator
2. Add import to `src/routes.ts` under COMPONENTS section: `import "./components/my-component";`
3. Use in Webflow: `<div sse-component="my-component">`
4. Build and deploy

**Example:**
```typescript
import { IModule } from '@sygnal/sse';
import { component } from '../engine/registry';

@component('my-component')
export class MyComponent implements IModule {
  constructor(elem: HTMLElement) {}
  setup(): void {}
  async exec(): Promise<void> {}
}
```

### Debugging Type Errors

```bash
npm run typecheck  # Run type checking without building
```

TypeScript strict mode is enabled. All types must be properly defined.

### Optimizing Bundle Size

- Bundle size matters for CDN load time
- Production build minifies to ~8.3KB (gzips to ~3KB)
- Decorator overhead: ~1.5KB (worth it for developer experience)
- Monitor bundle size with each build
- Consider code splitting if bundle grows significantly (though single bundle is preferred)

## Things to Remember

1. **Only `index.ts` is loaded** - Everything must be imported directly or indirectly from this file
2. **`routes.ts` is the central registry** - ALL pages and components imported here (not index.ts)
3. **Decorators require imports** - Files with `@component` or `@page` must be imported in routes.ts
4. **Component names are strings** - Use descriptive kebab-case names in decorators
5. **Two-phase lifecycle** - Use `setup()` for early init, `exec()` for DOM manipulation
6. **Build before deploy** - Always run `npm run build:prod` before pushing to GitHub
7. **Version bumps matter** - CDN caches by version, bump version in package.json for updates
8. **Source maps included** - Debugging works in production via source maps
9. **Strict TypeScript** - All code must pass type checking before bundling
10. **Experimental decorators enabled** - Required in tsconfig.json for decorator support

## Performance Considerations

- **Bundle size**: Keep under 10KB minified (currently 8.3KB with decorators)
- **Lazy loading**: Not currently implemented (single bundle approach)
- **Tree shaking**: esbuild automatically removes unused code
- **Minification**: Production builds are minified
- **Source maps**: Separate file, doesn't affect bundle size
- **SCSS compilation**: Compressed output, separate CSS file

## Testing Strategy

Currently no automated tests. Manual testing workflow:
1. `npm run watch` - Start watch mode
2. `npm run serve` - Start local server
3. Test in browser at `http://127.0.0.1:3000`
4. View in Webflow with `dev-src` attribute pointing to local server

Future: Consider adding Jest or Vitest for unit tests.
