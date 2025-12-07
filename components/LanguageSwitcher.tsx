'use client';

import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'sv' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      title={i18n.language === 'en' ? 'Byt till svenska' : 'Switch to English'}
    >
      <span className="text-base">{i18n.language === 'en' ? '🇬🇧' : '🇸🇪'}</span>
      <span>{i18n.language === 'en' ? 'EN' : 'SV'}</span>
    </button>
  );
}
