'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================
interface Property {
  id: string;
  address: string;
  city: string;
  created_at: string;
  inspection_count: number;
}

interface DashboardStats {
  totalProperties: number;
  totalInspections: number;
  completedInspections: number;
  depositsProtected: string;
}

interface RecentActivity {
  id: string;
  type: 'inspection' | 'property' | 'report';
  title: string;
  description: string;
  timestamp: string;
}

// ============================================
// ANIMATION VARIANTS
// ============================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardHoverVariants = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number | string; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, numericValue);
      setDisplayValue(Math.floor(current));

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(numericValue);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue]);

  return <span>{prefix}{typeof value === 'string' && value.includes('$') ? `$${displayValue.toLocaleString()}` : displayValue.toLocaleString()}{suffix}</span>;
}

// ============================================
// STATS CARD COMPONENT
// ============================================
function StatsCard({
  icon,
  label,
  value,
  trend,
  color,
  href,
  delay = 0,
}: {
  icon: string;
  label: string;
  value: number | string;
  trend: string;
  color: string;
  href: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <Link href={href}>
        <motion.div
          className={`relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer`}
          variants={cardHoverVariants}
        >
          {/* Background gradient accent */}
          <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`} />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{icon}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${color} bg-opacity-10 text-gray-700`}>
                {trend}
              </span>
            </div>

            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">
              <AnimatedCounter value={value} />
            </p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ============================================
// PROPERTY CARD COMPONENT
// ============================================
function PropertyCard({ property, delay = 0 }: { property: Property; delay?: number }) {
  return (
    <motion.div
      variants={itemVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <Link href={`/dashboard/properties/${property.id}`}>
        <motion.div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer"
          variants={cardHoverVariants}
        >
          {/* Property Image Placeholder */}
          <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>

            {/* Inspection count badge */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-medium text-gray-700">
              {property.inspection_count} inspection{property.inspection_count !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Property Info */}
          <div className="p-5">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.address}</h3>
            <p className="text-sm text-gray-500 mb-3">{property.city}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Added {new Date(property.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <motion.span
                className="text-primary-600 text-sm font-medium"
                whileHover={{ x: 4 }}
              >
                View →
              </motion.span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================
function EmptyState() {
  return (
    <motion.div
      variants={itemVariants}
      className="col-span-full"
    >
      <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-2xl p-12 text-center border-2 border-dashed border-blue-200">
        <motion.div
          className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-4xl">🏠</span>
        </motion.div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">Add your first property</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start protecting your rental deposit by documenting your property&apos;s condition with timestamped photos.
        </p>

        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-600/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>
    </motion.div>
  );
}

// ============================================
// RECENT ACTIVITY COMPONENT
// ============================================
function RecentActivitySection({ activities }: { activities: RecentActivity[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'inspection':
        return '📋';
      case 'property':
        return '🏠';
      case 'report':
        return '📄';
      default:
        return '📌';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg">{getActivityIcon(activity.type)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{activity.title}</p>
            <p className="text-sm text-gray-500">{activity.description}</p>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{activity.timestamp}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// SKELETON LOADER
// ============================================
function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-5 w-64 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-11 w-40 bg-gray-200 rounded-xl" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="h-8 w-8 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 w-20 bg-gray-100 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Properties skeleton */}
      <div className="mb-6">
        <div className="h-7 w-32 bg-gray-200 rounded-lg mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-40 bg-gray-200" />
              <div className="p-5">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalInspections: 0,
    completedInspections: 0,
    depositsProtected: '$0',
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const supabase = createClient();

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // Fetch properties with inspection count
        const { data: propertiesData } = await supabase
          .from('properties')
          .select(`
            id,
            address,
            city,
            created_at,
            inspections (id)
          `)
          .order('created_at', { ascending: false });

        const formattedProperties: Property[] = (propertiesData || []).map((p: {
          id: string;
          address: string;
          city: string;
          created_at: string;
          inspections: { id: string }[];
        }) => ({
          id: p.id,
          address: p.address,
          city: p.city,
          created_at: p.created_at,
          inspection_count: p.inspections?.length || 0,
        }));

        setProperties(formattedProperties);

        // Fetch inspection stats
        const { data: inspectionsData } = await supabase
          .from('inspections')
          .select('id, status');

        const totalInspections = inspectionsData?.length || 0;
        const completedInspections = inspectionsData?.filter((i: { status: string }) => i.status === 'completed').length || 0;

        // Calculate deposits protected (mock calculation)
        const depositsProtected = completedInspections * 1500;

        setStats({
          totalProperties: formattedProperties.length,
          totalInspections,
          completedInspections,
          depositsProtected: `$${depositsProtected.toLocaleString()}`,
        });

        // Build recent activity from inspections
        const { data: recentInspections } = await supabase
          .from('inspections')
          .select(`
            id,
            created_at,
            status,
            properties (address)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        const activity: RecentActivity[] = (recentInspections || []).map((inspection: {
          id: string;
          created_at: string;
          status: string;
          properties: { address: string } | null;
        }) => ({
          id: inspection.id,
          type: 'inspection' as const,
          title: inspection.properties?.address || 'Unknown property',
          description: inspection.status === 'completed' ? 'Inspection completed' : 'Inspection in progress',
          timestamp: new Date(inspection.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        }));

        setRecentActivity(activity);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your properties.</p>
        </div>

        <Link
          href="/dashboard/inspections/new"
          className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-600/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Inspection
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon="🏠"
          label="Properties"
          value={stats.totalProperties}
          trend={stats.totalProperties > 0 ? 'Active' : 'Add first'}
          color="bg-blue-500"
          href="/dashboard/properties"
        />
        <StatsCard
          icon="📋"
          label="Inspections"
          value={stats.totalInspections}
          trend={`${stats.completedInspections} completed`}
          color="bg-purple-500"
          href="/dashboard/inspections"
        />
        <StatsCard
          icon="💰"
          label="Deposits Protected"
          value={stats.depositsProtected}
          trend="100% success"
          color="bg-green-500"
          href="/dashboard/reports"
        />
        <StatsCard
          icon="⭐"
          label="Account Status"
          value="Free"
          trend="Upgrade →"
          color="bg-amber-500"
          href="/checkout?plan=premium"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Properties Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
            <Link
              href="/dashboard/properties/new"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {properties.length === 0 ? (
              <EmptyState />
            ) : (
              properties.slice(0, 4).map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  delay={index * 0.1}
                />
              ))
            )}
          </motion.div>

          {properties.length > 4 && (
            <motion.div variants={itemVariants} className="mt-6 text-center">
              <Link
                href="/dashboard/properties"
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                View all {properties.length} properties →
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Activity</h3>
              <Link
                href="/dashboard/inspections"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>
            </div>
            <RecentActivitySection activities={recentActivity} />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/properties/new"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add Property</p>
                  <p className="text-xs text-gray-500">Register a new rental</p>
                </div>
              </Link>

              <Link
                href="/dashboard/inspections/new"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Start Inspection</p>
                  <p className="text-xs text-gray-500">Document condition</p>
                </div>
              </Link>

              <Link
                href="/dashboard/reports"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Generate Report</p>
                  <p className="text-xs text-gray-500">Create PDF evidence</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Upgrade CTA - Only show for free users */}
          <motion.div
            className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-2xl p-6 text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⭐</span>
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">PRO</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
            <p className="text-sm text-blue-100 mb-4">
              Unlimited properties, professional reports, and priority support.
            </p>
            <Link
              href="/checkout?plan=premium"
              className="block w-full bg-white text-primary-600 text-center py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Upgrade Now
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Getting Started Guide - Show when no data */}
      {stats.totalProperties === 0 && (
        <motion.div
          variants={itemVariants}
          className="mt-8 bg-gradient-to-br from-blue-50 via-white to-primary-50 rounded-2xl border border-blue-100 p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">Getting Started 🚀</h2>
          <p className="text-gray-600 mb-6">
            Follow these steps to protect your rental deposit with professional documentation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: 'Add your property',
                description: 'Enter your rental address and basic details.',
                icon: '🏠',
              },
              {
                step: 2,
                title: 'Create an inspection',
                description: 'Take timestamped photos of every room.',
                icon: '📸',
              },
              {
                step: 3,
                title: 'Generate your report',
                description: 'Get a professional PDF for legal evidence.',
                icon: '📄',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="bg-white rounded-xl p-6 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                    {item.step}
                  </div>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
