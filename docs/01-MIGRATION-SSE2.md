# Migration Guide

This guide helps you migrate existing SSE projects to the latest template architecture (v0.3.0+).

## Overview of Changes

The SSE framework has been refactored to centralize core features in `@sygnal/sse`:

- ✅ Decorator system now in core (`@page`, `@component`)
- ✅ Component management now in core (`ComponentManager`)
- ✅ Component initialization now in core (`initializeComponents()`)
- ✅ Framework types now in core (`ComponentConstructor`, `PageConstructor`, etc.)
- ✅ Removed local `src/engine/` directory (moved to core)
- ✅ Added extensible component initialization options

## Prerequisites

Before migrating:

1. **Backup your project** - Commit all changes or create a backup
2. **Update sse-core** - Ensure `@sygnal/sse` is version `^0.3.0` or higher
3. **Enable decorators** - Verify `tsconfig.json` has `experimentalDecorators: true`

## Step-by-Step Migration

### 1. Update package.json

Update your `@sygnal/sse` dependency to the latest version:

```json
{
  "dependencies": {
    "@sygnal/sse": "^0.3.0"
  }
}
```

Then reinstall:

```bash
npm install
```

### 2. Update tsconfig.json

Ensure experimental decorators are enabled:

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ES6",
    "lib": ["ES6", "DOM"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "experimentalDecorators": true,      // ← Required
    "emitDecoratorMetadata": true        // ← Required
  }
}
```

### 3. Remove Old Engine Directory

Delete the local `src/engine/` directory entirely:

```bash
rm -rf src/engine
```

The decorator system, ComponentManager, and types are now imported from `@sygnal/sse`.

### 4. Update Import Statements

**Before (Old Pattern):**

```typescript
// Old imports from local engine/
import { component } from "../engine/registry";
import { page } from "../engine/registry";
import { ComponentManager } from "../engine/component-manager";
import type { ComponentConstructor } from "../types";
```

**After (New Pattern):**

```typescript
// New imports from @sygnal/sse
import { component, page } from "@sygnal/sse";
import { ComponentManager } from "@sygnal/sse";
import type { ComponentConstructor, PageConstructor } from "@sygnal/sse";
```

### 5. Update Component Attribute Name

If you used the old `sse-component` attribute, update to `data-component`:

**Before (HTML in Webflow):**
```html
<div sse-component="my-component">
  <!-- Content -->
</div>
```

**After:**
```html
<div data-component="my-component">
  <!-- Content -->
</div>
```

**Why?** The `data-` prefix follows HTML5 standards for custom attributes and integrates better with modern tooling.

### 6. Update Component Initialization (if customized)

If you customized component initialization, update to use the new options pattern:

**Before:**
```typescript
// Old pattern with custom logic
const elements = document.querySelectorAll('[sse-component]');
elements.forEach(elem => {
  const componentName = elem.getAttribute('sse-component');
  // Manual initialization logic...
});
```

**After:**
```typescript
// New pattern with extensible options
import { initializeComponents } from "@sygnal/sse";

initializeComponents({
  selector: '[data-component]',      // Custom selector if needed
  attributeName: 'data-component',   // Custom attribute if needed
  componentManager: customManager,   // Custom manager if needed

  // Lifecycle hooks
  onComponentInit: (name, instance, element) => {
    console.log(`Initialized ${name}`);
  },

  onError: (error, componentName, element) => {
    console.error(`Error in ${componentName}:`, error);
  },

  onUnknownComponent: (componentName, element) => {
    console.warn(`Unknown component: ${componentName}`);
  },

  logSummary: true  // Log initialization summary
});
```

### 7. Update routes.ts

Your `routes.ts` should follow this structure:

```typescript
import {
  RouteDispatcher,
  getAllPages,
  getRegistryStats,
  initializeComponents
} from "@sygnal/sse";
import { Site } from "./site";

// ============================================================
// PAGES - Import all pages to trigger @page decorator
// ============================================================
import "./pages/home";
import "./pages/blog";
import "./pages/about";
// Add more page imports here...

// ============================================================
// COMPONENTS - Import all components to trigger @component decorator
// ============================================================
import "./components/test";
import "./components/example";
// Add more component imports here...

/**
 * Create and configure the route dispatcher
 */
export const routeDispatcher = (): RouteDispatcher => {
    const dispatcher = new RouteDispatcher(Site);
    dispatcher.routes = getAllPages(); // Auto-populated from decorators
    return dispatcher;
}

/**
 * Export component initialization for use in index.ts
 */
export { initializeComponents, getRegistryStats };
```

### 8. Update index.ts

Your main entry point should import from the new locations:

```typescript
import { VERSION } from "./version";
import { routeDispatcher, initializeComponents, getRegistryStats } from "./routes";
import { initSSE, ComponentManager } from "@sygnal/sse";
import type { SiteGlobalData } from "./types";

// Global vars
const SITE_NAME = 'Site';

// Extend Window interface (optional)
declare global {
    interface Window {
        fsAttributes: [string, (filterInstances: unknown[]) => void][];
        Site: SiteGlobalData;
        Webflow: {
            require: (module: string) => {
                destroy: () => void;
                init: () => void;
            };
        };
        sa5: unknown;
    }
}

// Initialize component manager on window
window.componentManager = new ComponentManager();

// Init SSE Engine
initSSE();

/**
 * Perform setup - synchronous initialization
 */
const setup = () => {
    console.log(`${SITE_NAME} package init v${VERSION}`);

    // Log auto-discovered registry stats
    const stats = getRegistryStats();
    console.log(`[Registry] Discovered ${stats.pages} page(s) and ${stats.components} component(s)`);

    // Setup routes
    routeDispatcher().setupRoute();
}

/**
 * Perform exec - asynchronous execution after DOM ready
 */
const exec = () => {
    // Execute route
    routeDispatcher().execRoute();

    // Initialize all components
    initializeComponents();
}

/**
 * Initialize
 */

// Perform setup, sync
setup();

// Perform exec, async
if (document.readyState !== 'loading') {
    exec();
} else {
    document.addEventListener("DOMContentLoaded", exec);
}
```

### 9. Update Page Files

Update all page files to import from `@sygnal/sse`:

**Before:**
```typescript
import { IModule } from "@sygnal/sse";
import { page } from "../engine/registry";

@page('/')
export class HomePage implements IModule {
  // ...
}
```

**After:**
```typescript
import { IModule, page } from "@sygnal/sse";  // ← Single import

@page('/')
export class HomePage implements IModule {
  // ...
}
```

### 10. Update Component Files

Update all component files similarly:

**Before:**
```typescript
import { IModule } from "@sygnal/sse";
import { component } from "../engine/registry";

@component('my-component')
export class MyComponent implements IModule {
  // ...
}
```

**After:**
```typescript
import { IModule, component } from "@sygnal/sse";  // ← Single import

@component('my-component')
export class MyComponent implements IModule {
  // ...
}
```

### 11. Update Template-Specific Types

Create or update `src/types.ts` with ONLY template-specific types:

```typescript
/**
 * Template-specific type definitions
 *
 * Note: Core framework types are exported from @sygnal/sse
 */

/**
 * Site-specific global data structure
 * Customize this interface based on your site's needs
 */
export interface SiteGlobalData {
  // Add site-specific global data properties here
  // Example:
  // config?: Record<string, unknown>;
  // user?: { id: string; name: string };
}
```

**Do NOT include** `ComponentConstructor`, `PageConstructor`, etc. - these now come from core.

### 12. Build and Test

Build your project to ensure everything compiles:

```bash
npm run build
```

Check for:
- ✅ No TypeScript errors
- ✅ Decorators register correctly (check console logs)
- ✅ Components initialize properly
- ✅ Routes work as expected
- ✅ Bundle size is reasonable (~9KB minified)

## Verification Checklist

After migration, verify:

- [ ] `npm run build` succeeds without errors
- [ ] Console shows: `[Registry] Discovered X page(s) and Y component(s)`
- [ ] Console shows: `[SSE Registry] Page registered: "..."` for each page
- [ ] Console shows: `[SSE Registry] Component registered: "..."` for each component
- [ ] Pages execute on correct routes
- [ ] Components initialize on elements with `data-component` attribute
- [ ] Bundle size is reasonable (should be ~9KB minified)
- [ ] No `src/engine/` directory exists
- [ ] All imports use `@sygnal/sse` instead of local paths

## Common Issues

### Issue: "Module has no exported member 'component'"

**Cause:** Old version of `@sygnal/sse` installed.

**Fix:**
```bash
npm install @sygnal/sse@latest
```

### Issue: "experimentalDecorators" error

**Cause:** TypeScript decorators not enabled.

**Fix:** Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Issue: "Property 'componentManager' does not exist on type 'Window'"

**Cause:** The ComponentManager type declaration is now in core and might conflict.

**Fix:** Remove the `componentManager` declaration from your local Window interface - it's now declared in `@sygnal/sse`.

### Issue: Components not initializing

**Cause:** Attribute name changed from `sse-component` to `data-component`.

**Fix:** Update all HTML in Webflow to use `data-component`:
```html
<!-- Old -->
<div sse-component="my-component"></div>

<!-- New -->
<div data-component="my-component"></div>
```

### Issue: Registry is empty (0 pages, 0 components)

**Cause:** Pages/components not imported before `getAllPages()` is called.

**Fix:** Ensure all page and component files are imported in `routes.ts` BEFORE using `getAllPages()` or `getRegistryStats()`.

## Benefits of Migration

After migrating, you'll gain:

- ✅ **Centralized maintenance** - Framework updates via npm package
- ✅ **Better type safety** - Framework types from single source
- ✅ **Cleaner project structure** - No local engine directory
- ✅ **Extensible initialization** - ComponentInitOptions for customization
- ✅ **Standard attributes** - HTML5 `data-*` attributes
- ✅ **Easier updates** - `npm update @sygnal/sse` to get latest features

## Need Help?

If you encounter issues during migration:

1. Check the [SSE Core Documentation](https://engine.sygnal.com/)
2. Review the [CHANGELOG](https://github.com/sygnaltech/sse-core/blob/main/CHANGELOG.md)
3. Open an issue on [GitHub](https://github.com/sygnaltech/sse-core/issues)

---

**Migration Guide Version:** 1.0.0
**Target SSE Version:** 0.3.0+
**Last Updated:** 2025-10-27
