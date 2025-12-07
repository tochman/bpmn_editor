'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './page.module.css';

// Dynamically import the BPMN editor to avoid SSR issues
const BpmnEditor = dynamic(
  () => import('@/components/editor/BpmnEditor'),
  { ssr: false }
);

interface Diagram {
  id: string;
  name: string;
  xml_content: string;
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagramId, setDiagramId] = useState<string | null>(null);
  const diagramNameRef = useRef<string>('');

  // Unwrap params
  useEffect(() => {
    params.then(p => setDiagramId(p.id));
  }, [params]);

  // Fetch diagram data
  useEffect(() => {
    if (!diagramId) return;

    const fetchDiagram = async () => {
      try {
        const response = await fetch(`/api/diagrams/${diagramId}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setDiagram(data);
          diagramNameRef.current = data.name;
        } else if (response.status === 404) {
          setError('editor.errors.diagramNotFound');
        } else {
          setError('editor.errors.loadDiagramFailed');
        }
      } catch {
        setError('editor.errors.loadDiagramFailed');
      } finally {
        setLoading(false);
      }
    };

    fetchDiagram();
  }, [diagramId]);

  const handleSave = useCallback(async (xml: string) => {
    if (!diagramId) return;
    
    const response = await fetch(`/api/diagrams/${diagramId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: diagramNameRef.current,
        xml_content: xml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save: ${errorData.error}`);
    }
    
    // Update local state with saved content
    const savedDiagram = await response.json();
    setDiagram(savedDiagram);
    diagramNameRef.current = savedDiagram.name;
  }, [diagramId]);

  const handleNameChange = useCallback(async (name: string) => {
    if (!diagramId) return;
    
    // Update ref immediately for use in save
    diagramNameRef.current = name;
    setDiagram(prev => prev ? { ...prev, name } : null);
    
    await fetch(`/api/diagrams/${diagramId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
  }, [diagramId]);

  const handleDelete = async () => {
    if (!diagramId) return;
    
    if (!confirm(t('editor.confirmDelete'))) return;

    const response = await fetch(`/api/diagrams/${diagramId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      alert(t('editor.errors.deleteFailed'));
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>{t('editor.loadingDiagram')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{t(error)}</p>
        <a href="/dashboard">{t('editor.back')}</a>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {diagram && (
        <BpmnEditor
          key={diagram.id}
          initialXml={diagram.xml_content}
          onSave={handleSave}
          onDelete={handleDelete}
          backHref="/dashboard"
          diagramName={diagram.name}
          onNameChange={handleNameChange}
        />
      )}
    </div>
  );
}
