/**
 * Example Custom Action
 *
 * This is a template for creating custom FIX actions.
 * Custom actions contain business logic specific to your project.
 *
 * Usage in HTML:
 * <button trigger:click="example-event">Click Me</button>
 *
 * Register in registry.ts:
 * import { ActionExample } from "./actions/example-action";
 * registerProgrammaticAction('example-action', 'example-event', ActionExample);
 */

import { ActionBase, action, type TriggerData } from '@sygnal/sse-core';

@action('example-action')
export class ActionExample extends ActionBase {
    /**
     * Initialize the action
     * Called once when the action is registered
     */
    init(): void {
        console.log('[ActionExample] Initialized');
    }

    /**
     * Execute the action
     * Called when the associated event is triggered
     *
     * @param triggerElement - The element that triggered the event
     * @param triggerData - Data passed from the trigger (from data-* attributes)
     */
    async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
        console.log('[ActionExample] Triggered!', {
            triggerElement,
            triggerData
        });

        // Example: Access data from trigger
        const message = triggerData['message'] || 'Hello from ActionExample!';

        // Example: Perform async operation
        await this.doSomething(message);
    }

    /**
     * Example private method
     */
    private async doSomething(message: string): Promise<void> {
        console.log('[ActionExample]', message);

        // Your custom logic here:
        // - API calls
        // - DOM manipulation
        // - State updates
        // - etc.

        // Example: Show an alert
        alert(message);
    }
}
