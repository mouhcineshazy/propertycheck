'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { getProvinceOptions } from '@propertycheck/shared';

const PROVINCE_OPTIONS = getProvinceOptions();

interface Subscription {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [fullName, setFullName] = useState('');
  const [province, setProvince] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const getUserAndSubscription = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || '');
        setProvince(user.user_metadata?.province || '');
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('status, current_period_end, cancel_at_period_end')
          .eq('user_id', user.id)
          .single();
        setSubscription(subData);
      }
      setIsLoadingSubscription(false);
    };
    getUserAndSubscription();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({ data: { full_name: fullName, province } });
      if (authError) throw authError;
      if (user && province) {
        const { error: dbError } = await supabase.from('users').update({ province }).eq('id', user.id);
        if (dbError) console.error('Failed to update users table:', dbError);
      }
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/account/export');
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propertycheck-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/account/delete', { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setMessage({ type: 'error', text: 'Failed to delete account. Please try again or contact support.' });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-fg">Settings</h1>
        <p className="mt-1 text-fg-muted">Manage your account settings and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-fg">Profile</h2>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`mb-4 rounded-lg border p-4 text-sm ${
                message.type === 'success'
                  ? 'border-verified-100 bg-verified-50 text-verified-700'
                  : 'border-red-100 bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" value={user?.email || ''} disabled className="input cursor-not-allowed bg-card-muted text-fg-muted" />
              <p className="mt-1 text-xs text-fg-subtle">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="fullName" className="label">Full name</label>
              <input id="fullName" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="input" />
            </div>

            <div>
              <label htmlFor="province" className="label">Province</label>
              <select
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="input cursor-pointer appearance-none bg-card"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2363748d' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                }}
              >
                <option value="">Select your province</option>
                {PROVINCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-fg-subtle">We tailor legal information to your province</p>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary px-4 py-2.5">
              {isLoading ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Subscription */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-fg">Subscription</h2>

          {isLoadingSubscription ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
          ) : subscription?.status === 'premium' ? (
            <>
              <div className="mb-4 flex items-center justify-between rounded-xl border border-verified-100 bg-verified-50 p-4">
                <div>
                  <p className="font-medium text-fg">Premium Plan</p>
                  <p className="text-sm text-fg-muted">Unlimited inspections, priority support, and more</p>
                  {subscription.current_period_end && (
                    <p className="mt-1 text-xs text-fg-subtle">
                      {subscription.cancel_at_period_end ? 'Expires' : 'Renews'}: {new Date(subscription.current_period_end).toLocaleDateString('en-CA')}
                    </p>
                  )}
                </div>
                <span className="badge-verified">Active</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route requires full page navigation */}
              <a href="/api/stripe/create-portal-session" className="btn-secondary px-4 py-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Subscription
              </a>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between rounded-xl bg-card-muted p-4">
                <div>
                  <p className="font-medium text-fg">Free Plan</p>
                  <p className="text-sm text-fg-muted">Basic features for personal use</p>
                </div>
                <span className="badge-neutral">Current</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-primary-100 bg-primary-50 p-4">
                <div>
                  <p className="font-medium text-fg">Premium Plan</p>
                  <p className="text-sm text-fg-muted">Unlimited inspections, priority support, and more</p>
                </div>
                <Link href="/checkout?plan=premium" className="btn-primary px-4 py-2">Upgrade</Link>
              </div>
            </>
          )}
        </div>

        {/* Privacy & Data */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-fg">Privacy &amp; Your Data</h2>
          <p className="mb-5 mt-1 text-sm text-fg-muted">Under PIPEDA you have the right to access and erase your personal data at any time.</p>

          <div className="flex items-center justify-between gap-4 border-b border-line py-4">
            <div>
              <p className="font-medium text-fg">Export my data</p>
              <p className="text-sm text-fg-muted">Download a copy of all your inspections, photos, and account data as JSON.</p>
            </div>
            <button type="button" onClick={handleExportData} disabled={isExporting} className="btn-secondary shrink-0 px-4 py-2">
              {isExporting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-600" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {isExporting ? 'Exporting…' : 'Export data'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <div>
              <p className="font-medium text-red-700">Delete account</p>
              <p className="text-sm text-fg-muted">Permanently delete your account and all associated data. This cannot be undone.</p>
            </div>
            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="btn shrink-0 border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50">
              Delete account
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-fg">Delete your account?</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                This will permanently delete your account, all properties, all inspection reports, and all photos. This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="button" onClick={handleDeleteAccount} disabled={isDeleting} className="btn flex-1 bg-red-600 py-2.5 text-white hover:bg-red-700">
                  {isDeleting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {isDeleting ? 'Deleting…' : 'Yes, delete everything'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
