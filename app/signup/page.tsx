'use client';

import Image from 'next/image';
import { SignupForm } from '@/components/auth/AuthForm';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <Image src="/bpmn_editor_logo.png" alt="BPMNEditor" width={3248} height={610} className="h-6 w-auto max-w-[140px] shrink-0 object-contain" />
        </Link>
        <LanguageSwitcher />
      </nav>
      <div className="flex-1 flex items-center justify-center p-4">
        <SignupForm />
      </div>
    </div>
  );
}
