# SSE Template — Agent Guide

Authoritative brief for an AI agent implementing a **Webflow site engine** from this template.
Read this first. Where this file and other docs disagree, **this file and the actual `src/` code win.**

Verified against `@sygnal/sse-core@2.2.0` (the installed version). If `package.json` shows a
different version, re-check the API surface in `node_modules/@sygnal/sse-core/dist/*.d.ts`.

---

## What this is

A TypeScript template that compiles to a **single bundled script** (`dist/index.js`) loaded into a
Webflow site via CDN. Each customer site clones this template and adds its own pages, components,
and interactions. The framework itself lives in the external npm package **`@sygnal/sse-core`** — do
not vendor or fork it here; this repo holds only site-specific code.

```html
<!-- How the built bundle is loaded in Webflow custom code (before </head>) -->
<script
  src="https://cdn.jsdelivr.net/gh/OWNER/REPO@VERSION/dist/index.js"
  dev-src="http://127.0.0.1:3000/dist/index.js"
></script>
```

Only `dist/index.js` ships. Everything must be reachable by import from `src/index.ts`.

---

## The three module types

This is the whole programming model. Every feature you add is one of these three.

### 1. Page — runs on matching routes
```typescript
// src/pages/about.ts
import { PageBase, page } from "@sygnal/sse-core";

@page('/about')            // stack multiple @page decorators for aliases
export class AboutPage extends PageBase {
  protected onPrepare(): void {
    // sync, runs in <head> before DOM ready; this.pageInfo is already populated
  }
  protected async onLoad(): Promise<void> {
    // async, runs after DOMContentLoaded; DOM is available
  }
}
```
- Extend `PageBase`. Implement `onLoad()` (required) and optionally `onPrepare()`.
  **Do not** write `setup()`/`exec()` or `implements IModule` — that is the old pattern; the base
  class provides those and calls your hooks.
- `this.pageInfo` (`WebflowPageInfo`) is auto-detected from Webflow's `data-wf-*` attributes:
  `path, url, domain, pageId, siteId, lang, collectionId, itemId, itemSlug, queryParams, hash`.
- Routing: exact (`/about`), wildcard (`/blog/*`), and multi-route (stacked decorators). Exact
  matches take precedence over wildcards.

### 2. Component — runs on matching elements
```typescript
// src/components/nav.ts
import { ComponentBase, component, PageBase } from "@sygnal/sse-core";

@component('nav')          // binds to elements with sse-component="nav"
export class Nav extends ComponentBase {
  protected onPrepare(): void { /* this.element, this.context available */ }
  protected async onLoad(): Promise<void> {
    const page = PageBase.getCurrentPage();   // read current page context if needed
  }
}
```
- Extend `ComponentBase`. Same `onPrepare()`/`onLoad()` hooks.
- Bind in Webflow markup with the **`sse-component`** attribute (NOT `data-component`):
  ```html
  <div sse-component="nav" sse-component-id="main">…</div>
  ```
- `this.element` is the bound element; `this.context` = `{ element, name, id, dataAttributes }`.
  `name` ← `sse-component`, `id` ← `sse-component-id`.
- Every component instance is registered in `window.componentManager`; query at runtime via
  `window.componentManager.getComponentsByType<T>('nav')`, `.getComponentTypes()`, `.getTotalCount()`.

#### Binding conventions — put the attribute on the component ROOT

These make a component portable. Follow them unless there's a strong reason not to.

- **`sse-component` goes on the component's own root element — never on a wrapper around it.**
  A component must self-activate wherever it is dropped. If the attribute sits on a surrounding
  wrapper, an instance placed anywhere else is dead. In Webflow, set the attribute on the
  **component definition's root** so every instance inherits it (don't tag a layout wrapper).
- **Tag sub-element roles with `sse-part`** — the library ignores `sse-part`; *your* component
  code queries it. This decouples behavior from class names, so one component works across
  different markups / visual variants:
  ```html
  <div sse-component="accordion">                <!-- item root: the component -->
    <div sse-part="trigger">Question <svg sse-part="icon"></svg></div>
    <div sse-part="panel">Answer…</div>
  </div>
  ```
  Always query with a sensible fallback for robustness / legacy markup:
  `el.querySelector('[sse-part="trigger"], .accordion__trigger')`.
- **Group-coordinated behaviors** (e.g. single-open accordions, radio-like toggles) still bind
  **per item on the item root**, and coordinate across instances via the DOM (e.g. close sibling
  items sharing the same parent) — not by binding a container. Keep state of record in the DOM
  (`aria-expanded`, etc.) so any instance can read/affect its siblings consistently.
- **Raw / CMS markup** that can't carry attributes: expose the per-element init as an exported
  function and add a fallback scan in `site.ts` that calls the *same* function, so behavior is
  identical whether the element was attribute-bound or class-matched.

### 3. FIX action — declarative, event-driven interactions
FIX ("Functional Interactions") connects HTML triggers to TypeScript actions through named events.
It is re-exported from `@sygnal/sse-core` (the implementation lives in `@sygnal/fix`).

```typescript
// src/actions/example-action.ts
import { ActionBase, action, type TriggerData } from "@sygnal/sse-core";

@action('example-action')
export class ActionExample extends ActionBase {
  init(): void {}                                            // once, at registration
  async trigger(el: HTMLElement, data: TriggerData): Promise<void> {
    // runs when the bound event fires; data comes from trigger:click:data:* attributes
  }
}
```
```html
<!-- HTML fires the named event "example-event" on click -->
<button trigger:click="example-event" trigger:click:data:message="Hi">Click</button>
```
Wiring (in `src/registry.ts`): import the action file, then connect it to an event name:
```typescript
import { ActionExample } from "./actions/example-action";
registerProgrammaticAction('example-action', 'example-event', ActionExample);
```
- `trigger:click` is built in. Standard `EventDefault` (parallel) and `EventSequential` events exist.
- Debug from the browser console: `FIXDebug.stats()`, `.triggers()`, `.actions()`, `.events()`.

---

## The one rule you must not forget

**A page/component/action only activates if its file is imported in [`src/registry.ts`](src/registry.ts).**
The decorators (`@page`/`@component`/`@action`) only run when the module is loaded, and the only thing
that loads them is an import in `registry.ts`. Create a file, forget the import → it silently never runs.

`registry.ts` is the single registration point. There are dedicated sections for PAGES, COMPONENTS,
and ACTIONS. Add your import to the matching section. `index.ts` should rarely need changes.

```
src/registry.ts          adds: import "./pages/about";   (and the registerProgrammaticAction line for actions)
```

---

## File map

```
src/
├── index.ts        Entry point (only file esbuild bundles from). Boots SSE, wires lifecycle.
├── registry.ts     ⭐ SINGLE REGISTRATION POINT — import every page/component/action here.
├── site.ts         Site-level module (global setup; loads site.css via Page.loadEngineCSS).
├── types.ts        Site-specific types (SiteGlobalData). Framework types come from sse-core.
├── version.ts      Re-exports version from package.json (single source of truth).
├── site.scss       Global styles → compiled to dist/site.css.
├── pages/          Page modules (@page).
├── components/     Component modules (@component).
└── actions/        FIX action modules (@action).

dist/               Build output, git-ignored. NEVER hand-edit. index.js is the shipped bundle.
build.js            tsc typecheck → esbuild bundle → Dart Sass compile. Also injects env defines.
```

Framework API lives in `@sygnal/sse-core` — source of truth is its `.d.ts` files in `node_modules`.
Key exports: `PageBase`, `ComponentBase`, `ActionBase`, `page`, `component`, `action`,
`RouteDispatcher`, `ComponentManager`, `getAllPages`, `getRegistryStats`, `initializeComponents`,
`initializeFIX`, `registerProgrammaticAction`, `FIXDebug`, `Page`, `initSSE`, `WebflowPageInfo`.

---

## Build, verify, deploy

```bash
npm install
npm run typecheck     # tsc --noEmit (strict mode + experimental decorators)
npm run build         # typecheck + esbuild bundle (unminified) + SCSS → dist/
npm run build:prod    # build, then minify dist/index.js for deployment
```

**Definition of done for any change:** `npm run build` succeeds (it typechecks). For a release,
run `npm run build:prod`.

**Verifying behavior in a browser** (do NOT start a dev server yourself — the user runs it):
- Tell the user to run `npm run watch` (rebuild) and `npm run serve` (port 3000), or ask which port.
- The `dev-src` attribute on the Webflow `<script>` loads from localhost in dev.
- Engine mode is switchable via query param: `?engine.mode=dev` / `?engine.mode=prod`.

**Deploy:** bump `version` in `package.json` (the only place — `version.ts` reads it), commit, push,
tag. jsDelivr serves by git tag and caches by version, so bumping the version is what busts the CDN
cache. Update the `@VERSION` in the Webflow `<script>` to match.

**Env vars (optional):** `build.js` reads `.env` / `.env.prod` and injects `process.env.*` via esbuild
`define`. Never read or commit secret env files; only reference the variable names.

---

## Lifecycle (for reference)

1. At import time: `initSSE()` runs; decorators register all imported modules.
2. `setup()` (sync, in `<head>`): logs registry stats, `dispatcher.setupRoute()` → matched page's
   `onPrepare()`.
3. `exec()` (after `DOMContentLoaded`): `initializeComponents()` (every component `onPrepare()` then
   `onLoad()`), `initializeFIX()` (scans DOM for `trigger:`/`action:` attributes), then
   `dispatcher.execRoute()` → matched page's `onLoad()`.

---

## Guardrails — do not do these

- ❌ Don't hand-edit anything in `dist/`. It is generated.
- ❌ Don't add a second entry point or emit multiple JS files. One bundle: `dist/index.js`.
- ❌ Don't register modules anywhere except `registry.ts`.
- ❌ Don't use the legacy pattern (`implements IModule`, `setup()`/`exec()`, `constructor(elem)`).
  Extend `PageBase`/`ComponentBase`/`ActionBase` and implement `onPrepare`/`onLoad` (or `init`/`trigger`).
- ❌ Don't use `data-component`. The discovery attribute is `sse-component`.
- ❌ Don't bind `sse-component` to a wrapper around a component — it goes on the component's **own
  root** so every instance self-activates (see *Binding conventions*). Tag sub-parts with `sse-part`.
- ❌ Don't start `npm run watch`/`serve` (long-running). Ask the user to run them.
- ❌ Don't read or commit secret files (`.env`, `.env.prod`, keys).

---

## Common tasks (quick reference)

| Task | Steps |
|---|---|
| Add a page | Create `src/pages/x.ts` (`@page('/x')` extends `PageBase`) → import it in `registry.ts` PAGES → `npm run build` |
| Add a component | Create `src/components/x.ts` (`@component('x')` extends `ComponentBase`) → import in `registry.ts` COMPONENTS → use `sse-component="x"` in Webflow → build |
| Add a FIX action | Create `src/actions/x.ts` (`@action('x')` extends `ActionBase`) → import + `registerProgrammaticAction('x','event-name',X)` in `registry.ts` ACTIONS → use `trigger:click="event-name"` in Webflow → build |
| Global styles | Edit `src/site.scss` (or add `src/**/*.scss`); compiled to `dist/**.css`, loaded via `Page.loadEngineCSS()` in `site.ts` |
| Release | Bump `package.json` version → `npm run build:prod` → commit/push/tag → update `@VERSION` in Webflow script |
