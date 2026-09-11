'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================
interface Property {
  id: string;
  address: string;
  property_type: string;
  created_at: string;
  inspection_count: number;
}

interface DashboardStats {
  totalProperties: number;
  totalInspections: number;
  completedInspections: number;
  depositsProtected: string;
  isPremium: boolean;
}

interface RecentActivity {
  id: string;
  type: 'inspection' | 'property' | 'report';
  title: string;
  description: string;
  timestamp: string;
}

// ============================================
// ICONS (SVG only — no emoji)
// ============================================
const svg = {
  home: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 12.72c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  plus: 'M12 4v16m8-8H4',
  camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
} as const;

function Icon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
    </svg>
  );
}

// ============================================
// ANIMATION VARIANTS
// ============================================
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

// ============================================
// ANIMATED COUNTER
// ============================================
function AnimatedCounter({ value }: { value: number | string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const isCurrency = typeof value === 'string' && value.includes('$');
  const numericValue =
    typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value;

  useEffect(() => {
    const steps = 48;
    const increment = numericValue / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplayValue(Math.min(Math.floor(increment * step), numericValue));
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(numericValue);
      }
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, [numericValue]);

  return (
    <span className="tabular-nums">
      {isCurrency ? '$' : ''}
      {displayValue.toLocaleString()}
    </span>
  );
}

// ============================================
// STATS CARD
// ============================================
type StatTone = 'primary' | 'verified' | 'amber' | 'neutral';

const toneStyles: Record<StatTone, string> = {
  primary: 'bg-primary-50 text-primary-600',
  verified: 'bg-verified-50 text-verified-600',
  amber: 'bg-amber-50 text-amber-600',
  neutral: 'bg-card-muted text-fg',
};

function StatsCard({
  iconPath,
  label,
  value,
  trend,
  tone,
  href,
}: {
  iconPath: string;
  label: string;
  value: number | string;
  trend: string;
  tone: StatTone;
  href: string;
}) {
  const numericValue = typeof value === 'number' || (typeof value === 'string' && /\d/.test(value));
  return (
    <motion.div variants={itemVariants}>
      <Link href={href} className="card-interactive block p-5">
        <div className="mb-4 flex items-start justify-between">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
            <Icon d={iconPath} />
          </span>
          <span className="badge-neutral">{trend}</span>
        </div>
        <p className="text-sm font-medium text-fg-muted">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-fg">
          {numericValue ? <AnimatedCounter value={value} /> : value}
        </p>
      </Link>
    </motion.div>
  );
}

// ============================================
// PROPERTY CARD
// ============================================
function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={`/dashboard/properties/${property.id}`} className="card-interactive block overflow-hidden">
        <div className="relative h-32 bg-gradient-to-br from-ink-100 to-ink-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card/80 text-primary-600 backdrop-blur">
              <Icon d={svg.home} className="h-7 w-7" />
            </span>
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-fg-muted backdrop-blur">
            {property.inspection_count} inspection{property.inspection_count !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="p-5">
          <h3 className="line-clamp-1 font-semibold text-fg">{property.address}</h3>
          <p className="mt-0.5 text-sm capitalize text-fg-muted">{property.property_type}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-fg-subtle">
              Added{' '}
              {new Date(property.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600">
              View
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ============================================
// EMPTY STATE
// ============================================
function EmptyState() {
  return (
    <motion.div variants={itemVariants} className="col-span-full">
      <div className="rounded-2xl border border-dashed border-line-strong bg-card p-12 text-center">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <Icon d={svg.home} className="h-8 w-8" />
        </span>
        <h3 className="text-lg font-bold text-fg">Add your first property</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
          Start protecting your rental deposit by documenting your property&apos;s condition with timestamped photos.
        </p>
        <Link href="/dashboard/properties/new" className="btn-primary mx-auto mt-6 w-fit px-5 py-3">
          <Icon d={svg.plus} className="h-5 w-5" />
          Add Property
        </Link>
      </div>
    </motion.div>
  );
}

// ============================================
// RECENT ACTIVITY
// ============================================
function RecentActivitySection({ activities }: { activities: RecentActivity[] }) {
  const iconFor = (type: string) =>
    type === 'property' ? svg.home : type === 'report' ? svg.document : svg.clipboard;

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-fg-subtle">No recent activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 }}
          className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-card-muted"
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-card-muted text-fg-muted">
            <Icon d={iconFor(activity.type)} className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">{activity.title}</p>
            <p className="text-xs text-fg-muted">{activity.description}</p>
          </div>
          <span className="flex-shrink-0 text-xs text-fg-subtle">{activity.timestamp}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// SKELETON
// ============================================
function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="skeleton mb-2 h-8 w-56" />
          <div className="skeleton h-5 w-72" />
        </div>
        <div className="skeleton h-11 w-40" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5">
            <div className="skeleton mb-4 h-10 w-10" />
            <div className="skeleton mb-2 h-4 w-20" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton h-32 w-full" />
            <div className="p-5">
              <div className="skeleton mb-2 h-5 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// QUICK ACTIONS
// ============================================
const quickActions = [
  { href: '/dashboard/properties/new', iconPath: svg.plus, title: 'Add Property', desc: 'Register a new rental' },
  { href: '/dashboard/inspections/new', iconPath: svg.camera, title: 'Start Inspection', desc: 'Document condition' },
  { href: '/dashboard/reports', iconPath: svg.document, title: 'Generate Report', desc: 'Create PDF evidence' },
];

// ============================================
// MAIN
// ============================================
export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalInspections: 0,
    completedInspections: 0,
    depositsProtected: '$0',
    isPremium: false,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      setNotification({ type: 'success', message: 'Welcome to Premium! Your subscription is now active.' });
      router.replace('/dashboard', { scroll: false });
    } else if (checkout === 'canceled') {
      setNotification({ type: 'info', message: 'Checkout canceled. You can upgrade anytime from Settings.' });
      router.replace('/dashboard', { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        const { data: propertiesData } = await supabase
          .from('properties')
          .select(`id, address, property_type, created_at, inspections (id)`)
          .order('created_at', { ascending: false });

        const formattedProperties: Property[] = (propertiesData || []).map(
          (p: {
            id: string;
            address: string;
            property_type: string;
            created_at: string;
            inspections: { id: string }[];
          }) => ({
            id: p.id,
            address: p.address,
            property_type: p.property_type,
            created_at: p.created_at,
            inspection_count: p.inspections?.length || 0,
          })
        );
        setProperties(formattedProperties);

        const { data: inspectionsData } = await supabase.from('inspections').select('id, status');
        const totalInspections = inspectionsData?.length || 0;
        const completedInspections =
          inspectionsData?.filter((i: { status: string }) => i.status === 'completed').length || 0;
        const depositsProtected = completedInspections * 1500;

        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .single();
        const isPremium = subscriptionData?.status === 'premium';

        setStats({
          totalProperties: formattedProperties.length,
          totalInspections,
          completedInspections,
          depositsProtected: `$${depositsProtected.toLocaleString()}`,
          isPremium,
        });

        const { data: recentInspections } = await supabase
          .from('inspections')
          .select(`id, created_at, status, properties (address)`)
          .order('created_at', { ascending: false })
          .limit(5);

        const activity: RecentActivity[] = (recentInspections || []).map(
          (inspection: {
            id: string;
            created_at: string;
            status: string;
            properties: { address: string } | null;
          }) => ({
            id: inspection.id,
            type: 'inspection' as const,
            title: inspection.properties?.address || 'Unknown property',
            description: inspection.status === 'completed' ? 'Inspection completed' : 'Inspection in progress',
            timestamp: new Date(inspection.created_at).toLocaleDateString('en-CA', {
              month: 'short',
              day: 'numeric',
            }),
          })
        );
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  if (isLoading) return <DashboardSkeleton />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`mb-6 flex items-center justify-between rounded-xl border p-4 ${
              notification.type === 'success'
                ? 'border-verified-100 bg-verified-50 text-verified-700'
                : notification.type === 'error'
                ? 'border-red-100 bg-red-50 text-red-700'
                : 'border-primary-100 bg-primary-50 text-primary-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                d={notification.type === 'error' ? 'M6 18L18 6M6 6l12 12' : svg.shield}
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="p-1 opacity-70 hover:opacity-100" aria-label="Dismiss">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-fg-muted">Here&apos;s what&apos;s happening with your properties.</p>
        </div>
        <Link href="/dashboard/inspections/new" className="btn-primary w-fit px-5 py-2.5">
          <Icon d={svg.plus} className="h-5 w-5" />
          New Inspection
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={containerVariants} className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard iconPath={svg.home} label="Properties" value={stats.totalProperties} trend={stats.totalProperties > 0 ? 'Active' : 'Add first'} tone="primary" href="/dashboard/properties" />
        <StatsCard iconPath={svg.clipboard} label="Inspections" value={stats.totalInspections} trend={`${stats.completedInspections} completed`} tone="neutral" href="/dashboard/inspections" />
        <StatsCard iconPath={svg.shield} label="Deposits Protected" value={stats.depositsProtected} trend="Documented" tone="verified" href="/dashboard/reports" />
        <StatsCard iconPath={svg.star} label="Account" value={stats.isPremium ? 'Premium' : 'Free'} trend={stats.isPremium ? 'Active' : 'Upgrade'} tone={stats.isPremium ? 'verified' : 'amber'} href={stats.isPremium ? '/dashboard/settings' : '/checkout?plan=premium'} />
      </motion.div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Properties */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-fg">My Properties</h2>
            <Link href="/dashboard/properties/new" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
              <Icon d={svg.plus} className="h-4 w-4" />
              Add Property
            </Link>
          </div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {properties.length === 0 ? (
              <EmptyState />
            ) : (
              properties.slice(0, 4).map((property) => <PropertyCard key={property.id} property={property} />)
            )}
          </motion.div>
          {properties.length > 4 && (
            <div className="mt-5 text-center">
              <Link href="/dashboard/properties" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View all {properties.length} properties →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-fg">Recent Activity</h3>
              <Link href="/dashboard/inspections" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <RecentActivitySection activities={recentActivity} />
          </div>

          <div className="card p-6">
            <h3 className="mb-4 font-bold text-fg">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-card-muted"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                    <Icon d={action.iconPath} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-fg">{action.title}</p>
                    <p className="text-xs text-fg-subtle">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {!stats.isPremium && (
            <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white">
              <span className="badge bg-white/15 text-white">Premium</span>
              <h3 className="mt-3 text-lg font-bold">Upgrade to Premium</h3>
              <p className="mt-1 text-sm text-primary-100">
                Unlimited properties, professional reports, and priority support.
              </p>
              <Link href="/checkout?plan=premium" className="mt-4 block rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50">
                Upgrade Now
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Getting started */}
      {stats.totalProperties === 0 && (
        <motion.div variants={itemVariants} className="mt-8 card p-8">
          <h2 className="text-lg font-bold text-fg">Getting Started</h2>
          <p className="mt-1 text-fg-muted">
            Follow these steps to protect your rental deposit with professional documentation.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { step: 1, title: 'Add your property', description: 'Enter your rental address and basic details.', iconPath: svg.home },
              { step: 2, title: 'Create an inspection', description: 'Take timestamped photos of every room.', iconPath: svg.camera },
              { step: 3, title: 'Generate your report', description: 'Get a professional PDF for legal evidence.', iconPath: svg.document },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="rounded-2xl border border-line bg-card-muted p-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.08 }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <span className="text-fg-muted">
                    <Icon d={item.iconPath} />
                  </span>
                </div>
                <h3 className="font-semibold text-fg">{item.title}</h3>
                <p className="mt-1 text-sm text-fg-muted">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
