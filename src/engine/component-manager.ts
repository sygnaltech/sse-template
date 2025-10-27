import { IModule } from "@sygnal/sse";

/**
 * ComponentManager - Registry for component instances
 *
 * This class manages all instantiated components, allowing you to:
 * - Register component instances by type
 * - Retrieve all instances of a specific component type
 * - Perform operations on groups of components
 */
export class ComponentManager {
    private components: Map<string, IModule[]> = new Map();

    /**
     * Register a component instance with a type identifier
     * @param type - The component type identifier (e.g., 'test', 'my-component')
     * @param component - The component instance implementing IModule
     */
    registerComponent(type: string, component: IModule): void {
      if (!this.components.has(type)) {
        this.components.set(type, []);
      }
      this.components.get(type)?.push(component);
    }

    /**
     * Retrieve all component instances of a specific type
     * @param type - The component type identifier
     * @returns Array of component instances, or empty array if none found
     */
    getComponentsByType<T extends IModule>(type: string): T[] {
      return (this.components.get(type) as T[]) || [];
    }

    /**
     * Get all registered component types
     * @returns Array of component type names
     */
    getComponentTypes(): string[] {
      return Array.from(this.components.keys());
    }

    /**
     * Get the total count of all registered component instances
     * @returns Total number of component instances
     */
    getTotalCount(): number {
      let count = 0;
      this.components.forEach(instances => count += instances.length);
      return count;
    }

    /**
     * Clear all registered components
     */
    clear(): void {
      this.components.clear();
    }
  }
  