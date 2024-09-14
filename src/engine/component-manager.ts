export class ComponentManager {
    private components: Map<string, any[]> = new Map();
  
    // Method to register a component with a type
    registerComponent(type: string, component: any): void {
      if (!this.components.has(type)) {
        this.components.set(type, []);
      }
      this.components.get(type)?.push(component);
    }
  
    // Method to retrieve all components of a specific type
    getComponentsByType<T>(type: string): T[] {
      return this.components.get(type) || [];
    }
  }
  