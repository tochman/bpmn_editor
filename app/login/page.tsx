'use client';

import Image from 'next/image';
import { LoginForm } from '@/components/auth/AuthForm';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <Image src="/bpmn_editor_logo.png" alt="BPMNEditor logo" width={36} height={36} className="h-9 w-auto" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">BPMNEditor</span>
            <a href="https://auctum.se/solutions" target="_blank" rel="noreferrer" className="text-[10px] font-medium text-gray-500 hover:text-primary-600">
              Auctum Business Suite
            </a>
          </div>
        </Link>
        <LanguageSwitcher />
      </nav>
      <div className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
}
