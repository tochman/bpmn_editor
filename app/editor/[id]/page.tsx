'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

// Dynamically import the BPMN editor to avoid SSR issues
const BpmnEditor = dynamic(
  () => import('@/components/editor/BpmnEditor'),
  { ssr: false, loading: () => <div className={styles.loading}>Loading editor...</div> }
);

interface Diagram {
  id: string;
  name: string;
  xml_content: string;
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagramId, setDiagramId] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then(p => setDiagramId(p.id));
  }, [params]);

  // Fetch diagram data
  useEffect(() => {
    if (!diagramId) return;

    const fetchDiagram = async () => {
      try {
        const response = await fetch(`/api/diagrams/${diagramId}`);
        if (response.ok) {
          const data = await response.json();
          setDiagram(data);
        } else if (response.status === 404) {
          setError('Diagram not found');
        } else {
          setError('Failed to load diagram');
        }
      } catch {
        setError('Failed to load diagram');
      } finally {
        setLoading(false);
      }
    };

    fetchDiagram();
  }, [diagramId]);

  const handleSave = async (xml: string) => {
    if (!diagramId) return;
    
    const response = await fetch(`/api/diagrams/${diagramId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: diagram?.name,
        xml_content: xml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Failed to save: ${errorData.error}`);
    }
  };

  const handleNameChange = async (name: string) => {
    if (!diagramId) return;
    
    setDiagram(prev => prev ? { ...prev, name } : null);
    
    await fetch(`/api/diagrams/${diagramId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
  };

  const handleDelete = async () => {
    if (!diagramId) return;
    
    if (!confirm('Are you sure you want to delete this diagram?')) return;

    const response = await fetch(`/api/diagrams/${diagramId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      alert('Failed to delete diagram');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading diagram...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <a href="/dashboard">Back to Dashboard</a>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <a href="/dashboard" className={styles.backLink}>← Back to Dashboard</a>
        <button onClick={handleDelete} className={styles.deleteButton}>
          Delete Diagram
        </button>
      </div>
      {diagram && (
        <BpmnEditor
          initialXml={diagram.xml_content}
          onSave={handleSave}
          diagramName={diagram.name}
          onNameChange={handleNameChange}
        />
      )}
    </div>
  );
}
