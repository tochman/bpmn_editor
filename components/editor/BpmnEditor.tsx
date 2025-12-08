'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './BpmnEditor.module.css';
import { createTranslateModule } from '@/lib/bpmn-translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Note: BPMN styles are imported in app/globals.css for proper Next.js CSS handling

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
  const { t, i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(diagramName);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const currentXmlRef = useRef<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Initialize the modeler
  useEffect(() => {
    let modeler: any = null;
    let isDestroyed = false;

    const initModeler = async () => {
      if (!containerRef.current || !propertiesPanelRef.current) return;

      // Destroy existing modeler first and save its state
      if (modelerRef.current) {
        try {
          const { xml } = await modelerRef.current.saveXML({ format: true });
          currentXmlRef.current = xml;
        } catch (e) {
          // Ignore errors when saving current state
        }
        try {
          modelerRef.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        modelerRef.current = null;
        
        // Clear the container DOM to prevent duplicate renders
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        if (propertiesPanelRef.current) {
          propertiesPanelRef.current.innerHTML = '';
        }
      }

      if (isDestroyed) return;

      try {
        // Dynamic imports for client-side only
        const BpmnModeler = (await import('bpmn-js/lib/Modeler')).default;
        const { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } = 
          await import('bpmn-js-properties-panel');
        const BpmnColorPickerModule = (await import('bpmn-js-color-picker')).default;

        // Create translation module for current language
        const translateModule = createTranslateModule(currentLanguage);

        if (isDestroyed) return;

        modeler = new BpmnModeler({
          container: containerRef.current,
          keyboard: {
            bindTo: window
          },
          additionalModules: [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            BpmnColorPickerModule,
            translateModule
          ],
          propertiesPanel: {
            parent: propertiesPanelRef.current
          }
        });

        modelerRef.current = modeler;

        // Load the diagram - use saved state if available, otherwise initial or default
        const xml = currentXmlRef.current || initialXml || DEFAULT_DIAGRAM;
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
        setError('editor.errors.loadFailed');
        setIsLoading(false);
      }
    };

    initModeler();

    return () => {
      isDestroyed = true;
    };
  }, [initialXml, currentLanguage]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!modelerRef.current || !onSave) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      await onSave(xml);
      setHasChanges(false);
      setSaveMessage('editor.saved');
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      console.error('Failed to save diagram:', err);
      setError('editor.errors.saveFailed');
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  // Handle file load
  const handleFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !modelerRef.current) return;

    setIsLoadingFile(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const xml = event.target?.result as string;
      try {
        // Import the new XML directly - bpmn-js handles clearing internally
        await modelerRef.current.importXML(xml);
        
        // Get canvas and zoom to fit
        const canvas = modelerRef.current.get('canvas');
        canvas.zoom('fit-viewport');
        
        // Update name from filename
        const fileName = file.name.replace(/\.(bpmn|xml)$/i, '');
        setLocalName(fileName);
        if (onNameChange) {
          onNameChange(fileName);
        }
        
        // Trigger save after successful import
        if (onSave) {
          setIsSaving(true);
          setSaveMessage(null);
          try {
            const { xml: savedXml } = await modelerRef.current.saveXML({ format: true });
            await onSave(savedXml);
            setHasChanges(false);
            setSaveMessage('editor.saved');
            setTimeout(() => setSaveMessage(null), 2000);
          } catch (saveErr) {
            console.error('Failed to save after import:', saveErr);
            setHasChanges(true);
          } finally {
            setIsSaving(false);
          }
        } else {
          setHasChanges(true);
        }
      } catch (err) {
        console.error('Failed to import diagram:', err);
        setError('editor.errors.importFailed');
      } finally {
        setIsLoadingFile(false);
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be loaded again
    e.target.value = '';
  }, [onNameChange, onSave]);

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

    setIsLoadingFile(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const xml = event.target?.result as string;
      try {
        // Import the new XML directly - bpmn-js handles clearing internally
        await modelerRef.current.importXML(xml);
        
        // Get canvas and zoom to fit
        const canvas = modelerRef.current.get('canvas');
        canvas.zoom('fit-viewport');
        
        // Update name from filename
        const fileName = file.name.replace(/\.(bpmn|xml)$/i, '');
        setLocalName(fileName);
        if (onNameChange) {
          onNameChange(fileName);
        }
        
        // Trigger save after successful import
        if (onSave) {
          setIsSaving(true);
          setSaveMessage(null);
          try {
            const { xml: savedXml } = await modelerRef.current.saveXML({ format: true });
            await onSave(savedXml);
            setHasChanges(false);
            setSaveMessage('Saved!');
            setTimeout(() => setSaveMessage(null), 2000);
          } catch (saveErr) {
            console.error('Failed to save after import:', saveErr);
            setHasChanges(true);
          } finally {
            setIsSaving(false);
          }
        } else {
          setHasChanges(true);
        }
      } catch (err) {
        console.error('Failed to import diagram:', err);
        setError('Failed to import diagram');
      } finally {
        setIsLoadingFile(false);
      }
    };
    reader.readAsText(file);
  }, [onNameChange, onSave]);

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
        <p>{t(error)}</p>
        <button onClick={() => setError(null)}>{t('editor.tryAgain')}</button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.leftSection}>
          <a href={backHref} className={styles.backLink}>
            ← {t('editor.back')}
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
              title={t('editor.clickToEditName')}
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
            {t('editor.loadBpmn')}
          </button>
          {onSave && (
            <button 
              onClick={handleSave} 
              disabled={isSaving || !hasChanges}
              className={styles.saveButton}
            >
              {isSaving ? t('editor.saving') : saveMessage ? t(saveMessage) : t('editor.save')}
            </button>
          )}
          <button onClick={handleDownloadBpmn} className={styles.button}>
            {t('editor.downloadBpmn')}
          </button>
          <button onClick={handleDownloadSvg} className={styles.button}>
            {t('editor.downloadSvg')}
          </button>
          {onDelete && (
            <button onClick={onDelete} className={styles.deleteButton}>
              {t('editor.delete')}
            </button>
          )}
          <div className={styles.languageSwitcher}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      
      {/* Full-screen overlay for saving after file import */}
      {isLoadingFile && (
        <div className={styles.overlay}>
          <div className={styles.spinner}></div>
          <p>{t('editor.loadingFile')}</p>
        </div>
      )}
      
      <div 
        className={styles.container}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>{t('editor.loadingEditor')}</p>
          </div>
        )}
        <div ref={containerRef} className={styles.canvas} />
        <div ref={propertiesPanelRef} className={styles.propertiesPanel} />
      </div>
    </div>
  );
}
