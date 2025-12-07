// Type declarations for BPMN.js modules

declare module 'bpmn-js/lib/Modeler' {
  export default class BpmnModeler {
    constructor(options?: any);
    importXML(xml: string): Promise<{ warnings: string[] }>;
    saveXML(options?: { format?: boolean }): Promise<{ xml: string }>;
    saveSVG(): Promise<{ svg: string }>;
    get(service: string): any;
    on(event: string, callback: () => void): void;
    clear(): void;
    destroy(): void;
  }
}

declare module 'bpmn-js-properties-panel' {
  export const BpmnPropertiesPanelModule: any;
  export const BpmnPropertiesProviderModule: any;
}

declare module 'bpmn-js-color-picker' {
  const BpmnColorPickerModule: any;
  export default BpmnColorPickerModule;
}

// CSS module declarations
declare module 'bpmn-js/dist/assets/diagram-js.css';
declare module 'bpmn-js/dist/assets/bpmn-js.css';
declare module 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
declare module '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
