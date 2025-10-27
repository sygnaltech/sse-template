# SSE Template - Webflow Site Engine Starter

A TypeScript-based template for building custom Webflow site extensions using the [Sygnal Site Engine (SSE)](https://engine.sygnal.com/) framework.

## Features

- **TypeScript** - Type-safe development with modern ES6+ features
- **SCSS Support** - Write maintainable styles with variables, nesting, and mixins
- **Fast Build System** - TypeScript type checking + esbuild bundler, Dart Sass for SCSS
- **Watch Mode** - Auto-rebuild on file changes during development
- **Component System** - Reusable, attribute-based components
- **Route Management** - Page-based architecture with route dispatcher
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
import { IModule, page } from '@sygnal/sse';

@page('/about')  // ← Decorator auto-registers this route!
export class AboutPage implements IModule {
  constructor() {}

  setup(): void {
    // Runs at </head> - synchronous
  }

  async exec(): Promise<void> {
    // Runs after DOMContentLoaded - asynchronous
    console.log('About page loaded');
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

### Multiple Routes Per Page

You can use multiple `@page` decorators on a single class to handle multiple routes:

```typescript
// src/pages/about.ts
import { IModule, page } from '@sygnal/sse';

@page('/about')      // All three routes
@page('/about-us')   // use the same
@page('/team')       // page class!
export class AboutPage implements IModule {
  constructor() {}

  setup(): void {}

  async exec(): Promise<void> {
    // Optionally check which route was accessed
    const currentPath = window.location.pathname;

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
import { IModule, page } from '@sygnal/sse';

@page('/blog/*')  // ← Matches /blog/post-1, /blog/category/tech, etc.
export class BlogPage implements IModule {
  constructor() {}

  setup(): void {}

  async exec(): Promise<void> {
    // Access the full path for dynamic routing
    const fullPath = window.location.pathname;
    const slug = fullPath.replace('/blog/', '');

    console.log('Blog slug:', slug);
    // Load content based on slug
  }
}
```

Routes are matched in the order they're registered, with exact matches taking precedence over wildcards.

## Adding Components

Components are automatically discovered using the `@component` decorator!

### 1. Create a component class in `src/components/`:

```typescript
// src/components/my-component.ts
import { IModule, component } from '@sygnal/sse';

@component('my-component')  // ← Decorator auto-registers this component!
export class MyComponent implements IModule {
  private elem: HTMLElement;

  constructor(elem: HTMLElement) {
    this.elem = elem;
  }

  setup(): void {
    // Synchronous setup - runs before DOM ready
  }

  async exec(): Promise<void> {
    // Asynchronous execution - runs after DOMContentLoaded
    console.log('MyComponent initialized!');

    this.elem.addEventListener('click', () => {
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
<div data-component="my-component">
  <!-- Component content -->
</div>
```

The component is automatically discovered and instantiated!

### Component Features

- **Auto-discovery**: Components are automatically found and initialized
- **Type-safe**: Full TypeScript support with strict typing
- **Component Manager**: All instances registered in `window.componentManager`
- **Error handling**: Graceful error handling with console warnings
- **Lifecycle hooks**: `setup()` and `exec()` methods for different initialization phases

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

1. **`setup()`** - Runs synchronously at `</head>`, before DOM is ready
   - Good for: Configuration, early initialization, no DOM access needed

2. **`exec()`** - Runs asynchronously after `DOMContentLoaded`
   - Good for: DOM manipulation, event binding, API calls

### Module Pattern

All pages and components implement the `IModule` interface:

```typescript
interface IModule {
  setup(): void;
  exec(): Promise<void>;
}
```

### Component Discovery

Components are automatically discovered via the `data-component` attribute and instantiated by the framework.

## Dependencies

### Production
- **@sygnal/sse** - SSE framework core
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
