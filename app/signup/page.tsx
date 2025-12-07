'use client';

import { SignupForm } from '@/components/auth/AuthForm';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8" cy="8" r="2" />
            <circle cx="16" cy="16" r="2" />
            <path d="M10 8h4M8 10v4M16 10v4" />
          </svg>
          <span className="text-xl font-bold text-gray-900">BPMN Editor</span>
        </Link>
        <LanguageSwitcher />
      </nav>
      <div className="flex-1 flex items-center justify-center p-4">
        <SignupForm />
      </div>
    </div>
  );
}
