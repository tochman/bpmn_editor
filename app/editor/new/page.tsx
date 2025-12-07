'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './page.module.css';

// Dynamically import the BPMN editor to avoid SSR issues
const BpmnEditor = dynamic(
  () => import('@/components/editor/BpmnEditor'),
  { ssr: false }
);

export default function NewEditorPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [diagramName, setDiagramName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const diagramNameRef = useRef(diagramName);
  
  // Set default name using translation after mount
  useEffect(() => {
    const defaultName = t('editor.untitledDiagram');
    setDiagramName(defaultName);
    diagramNameRef.current = defaultName;
  }, [t]);
  
  // Keep ref in sync with state for use in callbacks
  const handleNameChange = useCallback((name: string) => {
    setDiagramName(name);
    diagramNameRef.current = name;
  }, []);

  const handleSave = useCallback(async (xml: string) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/diagrams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: diagramNameRef.current,
          xml_content: xml,
        }),
      });

      if (response.ok) {
        const diagram = await response.json();
        router.push(`/editor/${diagram.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.error}`);
      }
    } finally {
      setIsCreating(false);
    }
  }, [router]);

  // Set editor as ready after mount
  useEffect(() => {
    setIsEditorReady(true);
  }, []);

  return (
    <div className={styles.container}>
      {/* Show loading overlay until editor is ready */}
      {!isEditorReady && (
        <div className={styles.overlay}>
          <div className={styles.spinner}></div>
          <p>{t('editor.loadingEditor')}</p>
        </div>
      )}
      {isCreating && (
        <div className={styles.overlay}>
          <div className={styles.spinner}></div>
          <p>{t('editor.creatingDiagram')}</p>
        </div>
      )}
      <BpmnEditor 
        onSave={handleSave} 
        backHref="/dashboard"
        diagramName={diagramName}
        onNameChange={handleNameChange}
      />
    </div>
  );
}
