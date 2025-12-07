'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './BpmnEditor.module.css';

// Import BPMN styles at module level to ensure they're loaded
import './bpmn-styles.css';

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
  onDelete?: () => void;
  backHref?: string;
  diagramName?: string;
  onNameChange?: (name: string) => void;
}

export default function BpmnEditor({ 
  initialXml, 
  onSave,
  onDelete,
  backHref = '/dashboard',
  diagramName = 'Untitled Diagram',
  onNameChange 
}: BpmnEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(diagramName);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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
        
        // Zoom to fit the diagram
        const canvas = modeler.get('canvas');
        canvas.zoom('fit-viewport');

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
    setSaveMessage(null);
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      await onSave(xml);
      setHasChanges(false);
      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      console.error('Failed to save diagram:', err);
      setError('Failed to save diagram');
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  // Handle file load
  const handleFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !modelerRef.current) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const xml = event.target?.result as string;
      try {
        // Import the new XML directly - bpmn-js handles clearing internally
        await modelerRef.current.importXML(xml);
        
        // Get canvas and zoom to fit
        const canvas = modelerRef.current.get('canvas');
        canvas.zoom('fit-viewport');
        
        setHasChanges(true);
        // Update name from filename
        const fileName = file.name.replace(/\.(bpmn|xml)$/i, '');
        setLocalName(fileName);
        if (onNameChange) {
          onNameChange(fileName);
        }
      } catch (err) {
        console.error('Failed to import diagram:', err);
        setError('Failed to import diagram. Make sure the file is a valid BPMN file.');
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be loaded again
    e.target.value = '';
  }, [onNameChange]);

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
        // Import the new XML directly - bpmn-js handles clearing internally
        await modelerRef.current.importXML(xml);
        
        // Get canvas and zoom to fit
        const canvas = modelerRef.current.get('canvas');
        canvas.zoom('fit-viewport');
        
        setHasChanges(true);
        // Update name from filename
        const fileName = file.name.replace(/\.(bpmn|xml)$/i, '');
        setLocalName(fileName);
        if (onNameChange) {
          onNameChange(fileName);
        }
      } catch (err) {
        console.error('Failed to import diagram:', err);
        setError('Failed to import diagram');
      }
    };
    reader.readAsText(file);
  }, [onNameChange]);

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
        <div className={styles.leftSection}>
          <a href={backHref} className={styles.backLink}>
            ← Back
          </a>
          <div className={styles.nameDivider} />
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
            <h1 
              className={styles.diagramName} 
              onClick={() => setEditingName(true)}
              title="Click to edit name"
            >
              {localName}
              {hasChanges && <span className={styles.unsaved}>*</span>}
            </h1>
          )}
        </div>
        <div className={styles.actions}>
          <input
            type="file"
            ref={fileInputRef}
            accept=".bpmn,.xml"
            onChange={handleFileLoad}
            style={{ display: 'none' }}
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className={styles.button}
          >
            Load BPMN
          </button>
          {onSave && (
            <button 
              onClick={handleSave} 
              disabled={isSaving || !hasChanges}
              className={styles.saveButton}
            >
              {isSaving ? 'Saving...' : saveMessage || 'Save'}
            </button>
          )}
          <button onClick={handleDownloadBpmn} className={styles.button}>
            Download BPMN
          </button>
          <button onClick={handleDownloadSvg} className={styles.button}>
            Download SVG
          </button>
          {onDelete && (
            <button onClick={onDelete} className={styles.deleteButton}>
              Delete
            </button>
          )}
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
