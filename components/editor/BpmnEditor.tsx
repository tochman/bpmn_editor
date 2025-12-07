'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './BpmnEditor.module.css';

// Default empty diagram
const DEFAULT_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="false">
    <bpmn2:startEvent id="StartEvent_1"/>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

interface BpmnEditorProps {
  initialXml?: string;
  onSave?: (xml: string) => Promise<void>;
  diagramName?: string;
  onNameChange?: (name: string) => void;
}

export default function BpmnEditor({ 
  initialXml, 
  onSave, 
  diagramName = 'Untitled Diagram',
  onNameChange 
}: BpmnEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(diagramName);

  // Initialize the modeler
  useEffect(() => {
    let modeler: any = null;

    const initModeler = async () => {
      if (!containerRef.current || !propertiesPanelRef.current) return;

      try {
        // Dynamic imports for client-side only
        const BpmnModeler = (await import('bpmn-js/lib/Modeler')).default;
        const { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } = 
          await import('bpmn-js-properties-panel');
        const BpmnColorPickerModule = (await import('bpmn-js-color-picker')).default;

        // Import CSS
        await import('bpmn-js/dist/assets/diagram-js.css');
        await import('bpmn-js/dist/assets/bpmn-js.css');
        await import('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css');
        await import('@bpmn-io/properties-panel/dist/assets/properties-panel.css');

        modeler = new BpmnModeler({
          container: containerRef.current,
          keyboard: {
            bindTo: window
          },
          additionalModules: [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            BpmnColorPickerModule
          ],
          propertiesPanel: {
            parent: propertiesPanelRef.current
          }
        });

        modelerRef.current = modeler;

        // Load the diagram
        const xml = initialXml || DEFAULT_DIAGRAM;
        await modeler.importXML(xml);

        // Track changes
        modeler.on('commandStack.changed', () => {
          setHasChanges(true);
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize BPMN modeler:', err);
        setError('Failed to load the diagram editor');
        setIsLoading(false);
      }
    };

    initModeler();

    return () => {
      if (modeler) {
        modeler.destroy();
      }
    };
  }, [initialXml]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!modelerRef.current || !onSave) return;

    setIsSaving(true);
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      await onSave(xml);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save diagram:', err);
      setError('Failed to save diagram');
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  // Handle download BPMN
  const handleDownloadBpmn = useCallback(async () => {
    if (!modelerRef.current) return;

    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${localName.replace(/\s+/g, '_')}.bpmn`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download BPMN:', err);
    }
  }, [localName]);

  // Handle download SVG
  const handleDownloadSvg = useCallback(async () => {
    if (!modelerRef.current) return;

    try {
      const { svg } = await modelerRef.current.saveSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${localName.replace(/\s+/g, '_')}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download SVG:', err);
    }
  }, [localName]);

  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file || !modelerRef.current) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const xml = event.target?.result as string;
      try {
        await modelerRef.current.importXML(xml);
        setHasChanges(true);
      } catch (err) {
        console.error('Failed to import diagram:', err);
        setError('Failed to import diagram');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle name editing
  const handleNameSubmit = () => {
    setEditingName(false);
    if (onNameChange && localName !== diagramName) {
      onNameChange(localName);
    }
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.nameSection}>
          {editingName ? (
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
              className={styles.nameInput}
            />
          ) : (
            <h2 
              className={styles.diagramName} 
              onClick={() => setEditingName(true)}
              title="Click to edit name"
            >
              {localName}
              {hasChanges && <span className={styles.unsaved}>*</span>}
            </h2>
          )}
        </div>
        <div className={styles.actions}>
          {onSave && (
            <button 
              onClick={handleSave} 
              disabled={isSaving || !hasChanges}
              className={styles.saveButton}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
          <button onClick={handleDownloadBpmn} className={styles.button}>
            Download BPMN
          </button>
          <button onClick={handleDownloadSvg} className={styles.button}>
            Download SVG
          </button>
        </div>
      </div>
      
      <div 
        className={styles.container}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isLoading && (
          <div className={styles.loading}>
            <p>Loading editor...</p>
          </div>
        )}
        <div ref={containerRef} className={styles.canvas} />
        <div ref={propertiesPanelRef} className={styles.propertiesPanel} />
      </div>
    </div>
  );
}
