
/*
 * Component | Test 
 */

import { IModule } from "@sygnal/sse";


export class TestComponent implements IModule {

  elem: HTMLElement;

  constructor(elem: HTMLElement) {
    this.elem = elem; 

  }

  setup() {
        
  }

  exec() {

    // Initialize sa5 window var
    const sa5: any = window['sa5' as any];

  }

}
