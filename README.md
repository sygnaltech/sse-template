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
│   ├── routes.ts             # Route configuration
│   ├── site.scss             # Global styles
│   ├── pages/
│   │   └── home.ts          # Home page module
│   ├── components/
│   │   └── test.ts          # Example component
│   └── engine/
│       └── component-manager.ts  # Component registry
├── dist/                     # Compiled output (git-ignored)
├── build.js                  # Build script
├── package.json             # Dependencies & scripts
└── tsconfig.json            # TypeScript config
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

1. Create a new page module in `src/pages/`:

```typescript
// src/pages/about.ts
import { Page } from '@sygnal/sse';

export class AboutPage implements IModule {
  constructor() {}

  setup() {
    // Runs at </head> - synchronous
  }

  async exec() {
    // Runs after DOMContentLoaded - asynchronous
  }
}
```

2. Register the route in `src/routes.ts`:

```typescript
import { AboutPage } from './pages/about';

export const routeDispatcher = (): RouteDispatcher => {
    var routeDispatcher = new RouteDispatcher(Site);
    routeDispatcher.routes = {
        '/': HomePage,
        '/about': AboutPage,  // Add your route
    };
    return routeDispatcher;
}
```

## Adding Components

Components are reusable modules that bind to specific HTML elements via the `sse-component` attribute.

### 1. Create a component class in `src/components/`:

```typescript
// src/components/my-component.ts
import { IModule } from "@sygnal/sse";

export class MyComponent implements IModule {
  private elem: HTMLElement;

  constructor(elem: HTMLElement) {
    this.elem = elem;
  }

  setup(): void {
    // Synchronous setup - runs at </head>
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

### 2. Register in the component registry in `src/index.ts`:

```typescript
import { MyComponent } from "./components/my-component";

const componentRegistry: ComponentRegistry = {
    'test': TestComponent,
    'my-component': MyComponent,  // Add your component here
};
```

The component will now be automatically instantiated when found in the DOM, with full type safety.

### 3. Use in Webflow by adding attribute to any element:

```html
<div sse-component="my-component">
  <!-- Component content -->
</div>
```

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

Components are automatically discovered via the `sse-component` attribute and instantiated by the framework.

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
