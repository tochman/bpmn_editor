'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import styles from './page.module.css';

// Dynamically import the BPMN editor to avoid SSR issues
const BpmnEditor = dynamic(
  () => import('@/components/editor/BpmnEditor'),
  { ssr: false, loading: () => <div className={styles.loading}>Loading editor...</div> }
);

export default function NewEditorPage() {
  const router = useRouter();
  const [diagramName, setDiagramName] = useState('Untitled Diagram');

  const handleSave = async (xml: string) => {
    const response = await fetch('/api/diagrams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: diagramName,
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
  };

  return (
    <div className={styles.container}>
      <BpmnEditor 
        onSave={handleSave} 
        backHref="/dashboard"
        diagramName={diagramName}
        onNameChange={setDiagramName}
      />
    </div>
  );
}
