'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Home() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8" cy="8" r="2" />
                <circle cx="16" cy="16" r="2" />
                <path d="M10 8h4M8 10v4M16 10v4" />
              </svg>
              <span className="text-xl font-bold text-gray-900">BPMN Editor</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-sm transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-sm transition-colors"
                  >
                    {t('nav.signUp')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 text-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                {t('hero.cta')}
              </Link>
              <a
                href="#features"
                className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-sm transition-colors"
              >
                {t('hero.secondaryCta')}
              </a>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
            <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center text-sm text-gray-400">BPMN Editor</div>
              </div>
              <div className="p-8 bg-white min-h-[300px] flex items-center justify-center">
                <svg className="w-full max-w-2xl h-48 text-gray-300" viewBox="0 0 800 200">
                  {/* Start Event */}
                  <circle cx="50" cy="100" r="20" fill="none" stroke="#22c55e" strokeWidth="3" />
                  <line x1="70" y1="100" x2="140" y2="100" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  
                  {/* Task 1 */}
                  <rect x="140" y="70" width="120" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
                  <text x="200" y="105" textAnchor="middle" fill="#1e40af" fontSize="14">Review</text>
                  <line x1="260" y1="100" x2="330" y2="100" stroke="#94a3b8" strokeWidth="2" />
                  
                  {/* Gateway */}
                  <polygon points="380,60 420,100 380,140 340,100" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                  <text x="380" y="105" textAnchor="middle" fill="#b45309" fontSize="16">?</text>
                  <line x1="420" y1="100" x2="490" y2="100" stroke="#94a3b8" strokeWidth="2" />
                  
                  {/* Task 2 */}
                  <rect x="490" y="70" width="120" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
                  <text x="550" y="105" textAnchor="middle" fill="#1e40af" fontSize="14">Process</text>
                  <line x1="610" y1="100" x2="680" y2="100" stroke="#94a3b8" strokeWidth="2" />
                  
                  {/* End Event */}
                  <circle cx="720" cy="100" r="20" fill="none" stroke="#ef4444" strokeWidth="4" />
                  
                  {/* Arrowhead definition */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t('features.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('features.visualEditor.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.visualEditor.description')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-sm flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('features.cloudStorage.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.cloudStorage.description')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-sm flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('features.export.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.export.description')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-sm flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('features.properties.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.properties.description')}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-sm flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('features.colors.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.colors.description')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 rounded-sm flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('features.responsive.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.responsive.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('cta.subtitle')}
          </p>
          <Link
            href="/signup"
            className="inline-block mt-8 px-8 py-4 text-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8" cy="8" r="2" />
              <circle cx="16" cy="16" r="2" />
              <path d="M10 8h4M8 10v4M16 10v4" />
            </svg>
            <span className="text-gray-600">{t('footer.tagline')}</span>
          </div>
          <p className="text-gray-500 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
