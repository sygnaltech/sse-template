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
1. Imports and initializes SSE framework
2. Defines component registry (type-safe mapping)
3. Sets up global window interfaces
4. Executes two-phase lifecycle:
   - `setup()` - Synchronous, runs at `</head>`
   - `exec()` - Async, runs after DOMContentLoaded

### Component System

**Type-Safe Registry Pattern** (NOT switch statements):

```typescript
// src/index.ts
const componentRegistry: ComponentRegistry = {
    'test': TestComponent,
    'my-component': MyComponent,
};
```

**How it works:**
1. Find all elements with `[sse-component]` attribute
2. Get component name from attribute value
3. Lookup constructor in registry
4. Instantiate with element reference
5. Register in ComponentManager
6. Execute component

**Benefits:**
- Compile-time validation of component names
- No switch statement maintenance
- Automatic component discovery
- Full TypeScript type safety

### Routing System

**`src/routes.ts`** - Route dispatcher configuration:

```typescript
export const routeDispatcher = (): RouteDispatcher => {
    var routeDispatcher = new RouteDispatcher(Site);
    routeDispatcher.routes = {
        '/': HomePage,
        '/about': AboutPage,
    };
    return routeDispatcher;
}
```

**Route flow:**
1. `setup()` calls `routeDispatcher().setupRoute()` (synchronous)
2. `exec()` calls `routeDispatcher().execRoute()` (async)
3. Current route determines which page module executes

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

### Type Definitions

**`src/types.ts`** - Centralized type definitions:
- `ComponentConstructor` - Type for component class constructors
- `ComponentRegistry` - Type-safe component name → constructor mapping
- `SiteGlobalData` - Interface for site-wide global data

## File Structure

```
src/
├── index.ts              # Entry point - ONLY file loaded in Webflow
├── site.ts               # Site-level module (global functionality)
├── routes.ts             # Route configuration
├── types.ts              # TypeScript type definitions
├── version.ts            # Version constant
├── site.scss             # Global styles
├── pages/
│   └── home.ts          # Page modules (one per route)
├── components/
│   ├── test.ts          # Example component
│   └── example.ts       # Detailed component example
└── engine/
    └── component-manager.ts  # Component instance registry

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

### 2. Type-Safe Component Registry

**Why:** Avoid runtime errors from typos, get compile-time validation.

**Implication:** Use object registry, not switch statements. TypeScript validates component names at build time.

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

1. Create `src/pages/about.ts` implementing `IModule`
2. Add to `src/routes.ts`: `'/about': AboutPage`
3. Import in routes file
4. Build and deploy

### Adding a New Component

1. Create `src/components/my-component.ts` implementing `IModule`
2. Add to `src/index.ts` component registry: `'my-component': MyComponent`
3. Import component in index.ts
4. Use in Webflow: `<div sse-component="my-component">`
5. Build and deploy

### Debugging Type Errors

```bash
npm run typecheck  # Run type checking without building
```

TypeScript strict mode is enabled. All types must be properly defined.

### Optimizing Bundle Size

- Bundle size matters for CDN load time
- Production build minifies to ~6.8KB (gzips to ~2-3KB)
- Monitor bundle size with each build
- Consider code splitting if bundle grows significantly (though single bundle is preferred)

## Things to Remember

1. **Only `index.ts` is loaded** - Everything must be imported directly or indirectly from this file
2. **Component registry is type-safe** - Don't use string literals, use the registry object
3. **Two-phase lifecycle** - Use `setup()` for early init, `exec()` for DOM manipulation
4. **Build before deploy** - Always run `npm run build:prod` before pushing to GitHub
5. **Version bumps matter** - CDN caches by version, bump version in package.json for updates
6. **Source maps included** - Debugging works in production via source maps
7. **Strict TypeScript** - All code must pass type checking before bundling

## Performance Considerations

- **Bundle size**: Keep under 10KB minified (currently 6.8KB)
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
