'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { PropertyType, Property } from '@propertycheck/database';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

const propertyTypes = [
  { value: 'apartment', label: 'Apartment', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { value: 'house', label: 'House', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6a1 1 0 011-1h4a1 1 0 011 1v6h3a1 1 0 001-1V10' },
  { value: 'condo', label: 'Condo', icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01' },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ address: '', property_type: 'apartment', notes: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to add a property');
      const { data, error: insertError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          address: formData.address,
          property_type: formData.property_type as PropertyType,
          notes: formData.notes || null,
        } as never)
        .select()
        .single();
      if (insertError) throw insertError;
      const property = data as unknown as Property;
      router.push(`/dashboard/properties/${property.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-2xl">
      <motion.div variants={itemVariants} className="mb-8">
        <Link href="/dashboard/properties" className="mb-4 inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Properties
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-fg">Add New Property</h1>
        <p className="mt-1 text-fg-muted">Enter your rental property details to get started.</p>
      </motion.div>

      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="card p-6 md:p-8">
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="alert" className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </motion.div>
        )}

        <div className="mb-6">
          <label htmlFor="address" className="label">Property Address *</label>
          <input
            id="address"
            type="text"
            required
            autoComplete="street-address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main St, Toronto, ON M5V 1A1"
            className="input"
          />
          <p className="mt-1.5 text-xs text-fg-subtle">Enter the full address including street, city, and postal code</p>
        </div>

        <div className="mb-6">
          <label className="label mb-3">Property Type *</label>
          <div className="grid grid-cols-3 gap-3">
            {propertyTypes.map((type) => {
              const active = formData.property_type === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, property_type: type.value })}
                  className={`flex flex-col items-center gap-2 rounded-xl border-[1.5px] p-4 transition-all ${
                    active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-line-strong text-fg-muted hover:border-ink-300'
                  }`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={type.icon} />
                  </svg>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <label htmlFor="notes" className="label">Notes (Optional)</label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional details about the property..."
            className="input resize-none"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={isLoading || !formData.address} className="btn-primary flex-1 py-3">
            {isLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Property
              </>
            )}
          </button>
          <Link href="/dashboard/properties" className="btn-secondary py-3">Cancel</Link>
        </div>
      </motion.form>

      <motion.div variants={itemVariants} className="mt-6 rounded-2xl border border-primary-100 bg-primary-50 p-5">
        <h3 className="flex items-center gap-2 font-semibold text-primary-900">
          <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Tips for property documentation
        </h3>
        <ul className="mt-2 space-y-1.5 text-sm text-primary-800">
          <li>• Add the property before your move-in date</li>
          <li>• Create an inspection immediately after adding</li>
          <li>• Take photos of every room using the mobile app</li>
          <li>• Document any existing damage or wear</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
