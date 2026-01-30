'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { getProvinceOptions } from '@propertycheck/shared';

// Get province options for dropdown
const PROVINCE_OPTIONS = getProvinceOptions();

interface Subscription {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [fullName, setFullName] = useState('');
  const [province, setProvince] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const getUserAndSubscription = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || '');
        setProvince(user.user_metadata?.province || '');

        // Fetch subscription status
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

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, province: province },
      });

      if (authError) throw authError;

      // Also update the users table if province changed
      if (user && province) {
        const { error: dbError } = await supabase
          .from('users')
          .update({ province: province })
          .eq('id', user.id);

        if (dbError) console.error('Failed to update users table:', dbError);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                Province
              </label>
              <select
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                }}
              >
                <option value="">Select your province</option>
                {PROVINCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">We tailor legal information to your province</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Subscription Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>

          {isLoadingSubscription ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : subscription?.status === 'premium' ? (
            <>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg mb-4">
                <div>
                  <p className="font-medium text-gray-900">Premium Plan</p>
                  <p className="text-sm text-gray-600">Unlimited inspections, priority support, and more</p>
                  {subscription.current_period_end && (
                    <p className="text-xs text-gray-500 mt-1">
                      {subscription.cancel_at_period_end ? 'Expires' : 'Renews'}: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Active
                </span>
              </div>
              <a
                href="/api/stripe/create-portal-session"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Subscription
              </a>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                  <p className="font-medium text-gray-900">Free Plan</p>
                  <p className="text-sm text-gray-500">Basic features for personal use</p>
                </div>
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full">
                  Current
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Premium Plan</p>
                  <p className="text-sm text-gray-600">Unlimited inspections, priority support, and more</p>
                </div>
                <a
                  href="/checkout?plan=premium"
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Upgrade
                </a>
              </div>
            </>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Delete account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
