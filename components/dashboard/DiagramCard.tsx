'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface DiagramCardProps {
  diagram: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
}

export default function DiagramCard({ diagram }: DiagramCardProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/diagrams/${diagram.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Failed to delete: ${error.error}`);
      }
    } catch (err) {
      console.error('Failed to delete diagram:', err);
      alert('Failed to delete diagram');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const formattedDate = new Date(diagram.updated_at).toLocaleDateString(
    i18n.language === 'sv' ? 'sv-SE' : 'en-US'
  );

  return (
    <div className="relative group">
      <Link
        href={`/editor/${diagram.id}`}
        className="block bg-white p-6 rounded-sm shadow-sm hover:shadow-md border border-gray-200 transition-all hover:-translate-y-1"
      >
        <div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8" cy="8" r="2" />
            <circle cx="16" cy="16" r="2" />
            <path d="M10 8h4M8 10v4M16 10v4" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{diagram.name}</h3>
        <p className="text-sm text-gray-500">
          {t('dashboard.card.lastEdited', { date: formattedDate })}
        </p>
      </Link>
      
      {/* Delete button */}
      {showConfirm ? (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
          >
            {isDeleting ? '...' : t('dashboard.card.confirm')}
          </button>
          <button
            onClick={handleCancelDelete}
            className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            {t('dashboard.card.cancel')}
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
          title={t('dashboard.card.delete')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
