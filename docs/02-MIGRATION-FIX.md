# Migration Guide: Adding FIX System to Existing SSE Projects

This guide explains how to manually migrate an existing SSE project to include the FIX (Functional Interactions) system.

## Overview

The FIX system is now integrated into `@sygnal/sse-core` and provides a declarative, event-driven interaction system using HTML attributes. This migration adds FIX support while maintaining backward compatibility with existing SSE functionality.

## What is FIX?

FIX (Functional Interactions) enables declarative event handling in HTML:

```html
<!-- Trigger an event on click -->
<button trigger:click="delete-item" data-item-id="123">Delete</button>

<!-- Action responds to the event -->
<div action:delete-item="delete-item">
  <!-- This action will be triggered -->
</div>
```

## Prerequisites

- Existing SSE project using `@sygnal/sse-core` v2.1.0 or later
- FIX system must be available in your version of sse-core

## Migration Steps

### Step 1: Rename `routes.ts` to `registry.ts`

**Why?** The file now serves as a central registry for ALL modules (pages, components, AND FIX actions), not just routes.

```bash
# In your src/ directory
mv routes.ts registry.ts
```

### Step 2: Update `registry.ts` imports

**Before:**
```typescript
import {
  RouteDispatcher,
  getAllPages,
  getRegistryStats,
  initializeComponents
} from "@sygnal/sse-core";
```

**After:**
```typescript
import {
  RouteDispatcher,
  getAllPages,
  getRegistryStats,
  initializeComponents,
  // FIX imports from sse-core
  initializeFIX,
  FIXDebug,
  FIXRegistry,
  registerProgrammaticAction
} from "@sygnal/sse-core";
```

### Step 3: Update `registry.ts` header comment

**Before:**
```typescript
/**
 * Route Dispatcher & Module Registry
 * Central location for all pages and components auto-discovery
 */
```

**After:**
```typescript
/**
 * Module Registry
 * Central location for ALL project modules:
 * - Pages & Components (SSE)
 * - Actions & Events (FIX)
 *
 * This file imports all modules to trigger their decorators (@page, @component, @action)
 * and provides a single source of truth for the application's module structure.
 *
 * https://engine.sygnal.com/
 */
```

### Step 4: Add FIX sections to `registry.ts`

Add these sections after your component imports:

```typescript
// ============================================================
// FIX - STANDARD TRIGGERS & ACTIONS (auto-loaded from sse-core)
// ============================================================
// Standard triggers and actions are automatically registered when
// @sygnal/sse-core is imported. No manual imports needed!
// - trigger:click (TriggerClick)
// - action:click (ActionClick)

// ============================================================
// ACTIONS - Custom project actions (FIX)
// ============================================================
// Import your custom actions here and register them
// Example:
// import { ActionCustom } from "./actions/custom-action";
// registerProgrammaticAction('custom-action', 'custom-event', ActionCustom);
```

### Step 5: Add FIX exports to `registry.ts`

Add these exports at the end of the file:

```typescript
/**
 * Re-export FIX functions and utilities
 */
export { initializeFIX, FIXDebug, FIXRegistry };

/**
 * Get FIX registry stats (mirrors getRegistryStats for SSE)
 */
export const getFIXRegistryStats = () => ({
    triggers: FIXRegistry.getTriggerNames().length,
    actions: FIXRegistry.getActionNames().length,
});
```

### Step 6: Update `index.ts` import path

**Before:**
```typescript
import { routeDispatcher, initializeComponents, getRegistryStats } from "./routes";
```

**After:**
```typescript
import { routeDispatcher, initializeComponents, getRegistryStats, initializeFIX, FIXDebug } from "./registry";
```

### Step 7: Add FIX to Window interface in `index.ts`

Add FIXDebug to the global Window interface:

```typescript
declare global {
    interface Window {
        // ... existing properties ...

        // FIX debug helpers
        FIXDebug: typeof FIXDebug;
    }
}

window.componentManager = new ComponentManager();
window.FIXDebug = FIXDebug;  // Add this line
```

### Step 8: Initialize FIX in `index.ts`

Add FIX initialization in the `exec()` function:

**Before:**
```typescript
const exec = () => {
    initializeComponents();
    dispatcher.execRoute();
}
```

**After:**
```typescript
const exec = () => {
    // Initialize all components FIRST so they're available in componentManager
    initializeComponents();

    // Initialize FIX system (Functional Interactions)
    initializeFIX();

    // Execute route AFTER components are registered
    dispatcher.execRoute();
}
```

### Step 9: Create `src/actions/` directory (Optional)

If you plan to create custom actions:

```bash
mkdir src/actions
```

### Step 10: Verify compilation

```bash
npm run typecheck
# or
npx tsc --noEmit
```

## Complete File Examples

### Complete `registry.ts` Example

```typescript
/**
 * Module Registry
 * Central location for ALL project modules:
 * - Pages & Components (SSE)
 * - Actions & Events (FIX)
 *
 * This file imports all modules to trigger their decorators (@page, @component, @action)
 * and provides a single source of truth for the application's module structure.
 *
 * https://engine.sygnal.com/
 */

import {
  RouteDispatcher,
  getAllPages,
  getRegistryStats,
  initializeComponents,
  // FIX imports from sse-core
  initializeFIX,
  FIXDebug,
  FIXRegistry,
  registerProgrammaticAction
} from "@sygnal/sse-core";
import { Site } from "./site";

// ============================================================
// PAGES - Import all pages to trigger @page decorator
// ============================================================
import "./pages/home";
import "./pages/blog";
// Add more page imports here...

// ============================================================
// COMPONENTS - Import all components to trigger @component decorator
// ============================================================
import "./components/header";
import "./components/footer";
// Add more component imports here...

// ============================================================
// FIX - STANDARD TRIGGERS & ACTIONS (auto-loaded from sse-core)
// ============================================================
// Standard triggers and actions are automatically registered when
// @sygnal/sse-core is imported. No manual imports needed!
// - trigger:click (TriggerClick)
// - action:click (ActionClick)

// ============================================================
// ACTIONS - Custom project actions (FIX)
// ============================================================
// Import your custom actions here and register them
// Example:
// import { ActionCustom } from "./actions/custom-action";
// registerProgrammaticAction('custom-action', 'custom-event', ActionCustom);

/**
 * Create and configure route dispatcher
 */
export const routeDispatcher = (): RouteDispatcher => {
    const dispatcher = new RouteDispatcher(Site);
    dispatcher.routes = getAllPages();
    return dispatcher;
}

/**
 * Re-export SSE functions from sse-core for convenience
 */
export { initializeComponents, getRegistryStats };

/**
 * Re-export FIX functions and utilities
 */
export { initializeFIX, FIXDebug, FIXRegistry };

/**
 * Get FIX registry stats (mirrors getRegistryStats for SSE)
 */
export const getFIXRegistryStats = () => ({
    triggers: FIXRegistry.getTriggerNames().length,
    actions: FIXRegistry.getActionNames().length,
});
```

### Complete `index.ts` Example

```typescript
import { VERSION } from "./version";
import { routeDispatcher, initializeComponents, getRegistryStats, initializeFIX, FIXDebug } from "./registry";
import { initSSE } from "@sygnal/sse-core";
import { ComponentManager } from "@sygnal/sse-core";
import type { SiteGlobalData } from "./types";

const SITE_NAME = 'Site';

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

        // FIX debug helpers
        FIXDebug: typeof FIXDebug;
    }
}

window.componentManager = new ComponentManager();
window.FIXDebug = FIXDebug;

initSSE();

const dispatcher = routeDispatcher();

const setup = () => {
    console.log(`${SITE_NAME} package init v${VERSION}`);
    const stats = getRegistryStats();
    console.log(`[Registry] Discovered ${stats.pages} page(s) and ${stats.components} component(s)`);
    dispatcher.setupRoute();
}

const exec = () => {
    initializeComponents();
    initializeFIX();
    dispatcher.execRoute();
}

setup();

if (document.readyState !== 'loading') {
    exec();
} else {
    document.addEventListener("DOMContentLoaded", exec);
}
```

## Creating Custom Actions

Once migrated, you can create custom actions for your project-specific business logic:

### Example Custom Action

Create `src/actions/example-action.ts`:

```typescript
import { ActionBase, action, type TriggerData } from '@sygnal/sse-core';

@action('example-action')
export class ActionExample extends ActionBase {
    init(): void {
        console.log('[ActionExample] Initialized');
    }

    async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
        const message = triggerData['message'] || 'Hello!';
        console.log('[ActionExample]', message);

        // Your custom logic here:
        // - API calls
        // - DOM manipulation
        // - State updates
    }
}
```

### Register the Action

In `registry.ts`:

```typescript
import { ActionExample } from "./actions/example-action";
registerProgrammaticAction('example-action', 'example-event', ActionExample);
```

### Use in HTML

```html
<button trigger:click="example-event" data-message="Custom message">
    Click Me
</button>
```

## Available Standard Components

After migration, these are automatically available from sse-core:

### Triggers
- `trigger:click` - Click events

### Actions
- `action:click` - Click elements

### Events
- `EventDefault` - Parallel execution (fire-and-forget)
- `EventSequential` - Sequential execution (async/await)

## Debugging

Use the FIX debug helper in the browser console:

```javascript
// List all registered triggers
FIXDebug.triggerTypes()

// List all registered actions
FIXDebug.actionTypes()

// Show all active triggers
FIXDebug.triggers()

// Show all active actions
FIXDebug.actions()

// Show all registered events
FIXDebug.events()

// Show complete stats
FIXDebug.stats()
```

## Migration Checklist

- [ ] Rename `routes.ts` to `registry.ts`
- [ ] Update imports in `registry.ts` to include FIX functions
- [ ] Update header comment in `registry.ts`
- [ ] Add FIX sections to `registry.ts`
- [ ] Add FIX exports to `registry.ts`
- [ ] Update import path in `index.ts` from `./routes` to `./registry`
- [ ] Add FIXDebug to Window interface in `index.ts`
- [ ] Set `window.FIXDebug` in `index.ts`
- [ ] Add `initializeFIX()` call in `exec()` function
- [ ] Create `src/actions/` directory (if needed)
- [ ] Verify TypeScript compilation passes
- [ ] Test application in browser

## Troubleshooting

### "Module has no exported member 'initializeFIX'"

**Cause:** Your version of sse-core doesn't include FIX yet.

**Solution:** Update sse-core to v2.1.0 or later, or use local sse-core with FIX:

```json
// package.json
{
  "dependencies": {
    "@sygnal/sse-core": "file:../sse-core"
  }
}
```

Then run: `npm install`

### FIX not working in browser

**Cause:** `initializeFIX()` not called.

**Solution:** Ensure `initializeFIX()` is called in the `exec()` function in `index.ts`.

### Custom actions not firing

**Cause:** Action not registered.

**Solution:**
1. Import the action in `registry.ts`
2. Call `registerProgrammaticAction()` with correct event name
3. Ensure HTML uses matching `trigger:click="event-name"`

## What Changed?

### File Renames
- `src/routes.ts` → `src/registry.ts`

### New Imports
- `initializeFIX` - Initialize FIX system
- `FIXDebug` - Debug utilities
- `FIXRegistry` - Access to registry
- `registerProgrammaticAction` - Register custom actions

### New Initialization
- `initializeFIX()` called in `exec()` function

### New Directory (Optional)
- `src/actions/` - Custom FIX actions

## Benefits After Migration

1. **Declarative Interactions** - Define behavior in HTML attributes
2. **Separation of Concerns** - UI logic separated from business logic
3. **Reusability** - Standard triggers/actions available across projects
4. **Debuggability** - Built-in debug tools via `FIXDebug`
5. **Type Safety** - Full TypeScript support
6. **Async Support** - Native async/await for actions

## Next Steps

After successful migration:

1. **Explore standard components** - Use `trigger:click` and `action:click`
2. **Create custom actions** - Add project-specific business logic
3. **Add more triggers** - Create custom triggers for other events
4. **Use sequential events** - For ordered async operations
5. **Read FIX documentation** - Learn advanced patterns

## Support

For issues or questions:
- Check sse-core documentation
- Review example actions in the template
- Use `FIXDebug.stats()` to inspect the system
- Ensure latest sse-core version

## Version History

- **v2.1.0** - FIX system added to sse-core
- **v2.0.0** - Original SSE template
