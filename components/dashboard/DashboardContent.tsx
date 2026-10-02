'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import DiagramCard from './DiagramCard';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface DiagramSummary {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface DashboardContentProps {
  diagrams: DiagramSummary[] | null;
  firstName?: string;
}

export default function DashboardContent({ diagrams, firstName }: DashboardContentProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/bpmn_editor_logo.png" alt="BPMNEditor" width={3248} height={610} className="h-6 w-auto max-w-[145px] shrink-0 object-contain" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {firstName && (
                <span className="text-sm text-gray-600">
                  {t('dashboard.welcome', { name: firstName })}
                </span>
              )}
              <form action="/api/auth/signout" method="post">
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  {t('dashboard.signOut')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <Link 
            href="/editor/new" 
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('dashboard.newDiagram')}
          </Link>
        </div>

        {diagrams && diagrams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {diagrams.map((diagram: DiagramSummary) => (
              <DiagramCard key={diagram.id} diagram={diagram} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.noDiagrams.title')}</h3>
            <p className="text-gray-500 mb-6">{t('dashboard.noDiagrams.subtitle')}</p>
            <Link 
              href="/editor/new" 
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('dashboard.noDiagrams.cta')}
            </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
          <p className="mb-1">
            BPMNEditor is part of the{' '}
            <a href="https://auctum.se/solutions" target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700 underline">
              Auctum Business Suite
            </a>
            .
          </p>
          Powered by <a href="https://bpmn.io/" target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700 underline">bpmn-js</a> from{' '}
          <a href="https://bpmn.io/" target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700 underline">bpmn.io</a>. Licensed under the{' '}
          <a href="https://bpmn.io/license" target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700 underline">bpmn.io license</a>.
        </div>
      </footer>
    </div>
  );
}
