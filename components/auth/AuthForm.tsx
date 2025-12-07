'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">{t('auth.signIn.title')}</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.signIn.email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder={t('auth.signIn.emailPlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.signIn.password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder={t('auth.signIn.passwordPlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-sm transition-colors"
      >
        {loading ? t('auth.signIn.submitting') : t('auth.signIn.submit')}
      </button>
      
      <p className="mt-6 text-center text-gray-600">
        {t('auth.signIn.noAccount')}{' '}
        <a href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
          {t('auth.signIn.signUpLink')}
        </a>
      </p>
    </form>
  );
}

export function SignupForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usageType, setUsageType] = useState<'private' | 'professional'>('private');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.signUp.errors.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError(t('auth.signUp.errors.nameRequired'));
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If signup succeeded and we have a user, create the profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('bpmn_profiles')
        .upsert({
          id: data.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          usage_type: usageType,
        });

      if (profileError) {
        console.error('Failed to create profile:', profileError);
      }

      // If session exists (email confirmation disabled), redirect to dashboard
      if (data.session) {
        router.push('/dashboard');
        router.refresh();
        return;
      }
    }

    // Only show email confirmation message if no session (email confirmation enabled)
    setError(t('auth.signUp.successMessage'));
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignup} className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">{t('auth.signUp.title')}</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.signUp.firstName')}
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder={t('auth.signUp.firstNamePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.signUp.lastName')}
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder={t('auth.signUp.lastNamePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.signUp.email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder={t('auth.signUp.emailPlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.signUp.password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder={t('auth.signUp.passwordPlaceholder')}
          minLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.signUp.confirmPassword')}
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder={t('auth.signUp.passwordPlaceholder')}
          minLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.signUp.usageType')}
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="usageType"
              value="private"
              checked={usageType === 'private'}
              onChange={() => setUsageType('private')}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">{t('auth.signUp.private')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="usageType"
              value="professional"
              checked={usageType === 'professional'}
              onChange={() => setUsageType('professional')}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">{t('auth.signUp.professional')}</span>
          </label>
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-sm transition-colors"
      >
        {loading ? t('auth.signUp.submitting') : t('auth.signUp.submit')}
      </button>
      
      <p className="mt-6 text-center text-gray-600">
        {t('auth.signUp.hasAccount')}{' '}
        <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          {t('auth.signUp.signInLink')}
        </a>
      </p>
    </form>
  );
}
