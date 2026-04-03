import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { DollarSign, Users, CheckCircle, Clock, TrendingUp, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const TRIP_CAPACITY = 100; // default capacity per trip

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const formatCurrency = (cents) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);

function KPICard({ title, value, icon: Icon, color, index }) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wide">{title}</p>
              <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-zinc-800`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const map = {
    paid: { label: 'Paid', className: 'bg-green-600/20 text-green-400 border-green-600/30' },
    active_plan: { label: 'Active Plan', className: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
    initiated: { label: 'Initiated', className: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
    canceled: { label: 'Cancelled', className: 'bg-red-600/20 text-red-400 border-red-600/30' },
    failed: { label: 'Failed', className: 'bg-red-600/20 text-red-400 border-red-600/30' },
    past_due: { label: 'Past Due', className: 'bg-orange-600/20 text-orange-400 border-orange-600/30' },
  };
  const cfg = map[status] || { label: status, className: 'bg-zinc-700 text-gray-400' };
  return <Badge className={`border text-xs ${cfg.className}`}>{cfg.label}</Badge>;
}

function PaymentBadge({ option }) {
  return option === 'full'
    ? <Badge className="bg-green-600/20 text-green-400 border border-green-600/30 text-xs">Full Pay</Badge>
    : <Badge className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 text-xs">Plan</Badge>;
}

export default function AdminOverview() {
  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  const { data: trips = [], isLoading: loadingTrips } = useQuery({
    queryKey: ['adminTrips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  const isLoading = loadingBookings || loadingTrips;

  // KPI calculations
  const paidStatuses = ['paid', 'active_plan'];
  const confirmedBookings = bookings.filter(b => paidStatuses.includes(b.status));
  const pendingBookings = bookings.filter(b => b.status === 'initiated');
  const totalRevenueCents = confirmedBookings.reduce((sum, b) => sum + (b.total_price_cents || 0), 0);

  // Payment breakdown
  const fullPayBookings = bookings.filter(b => b.payment_option === 'full');
  const planBookings = bookings.filter(b => b.payment_option === 'plan');
  const totalCollectedCents = bookings.reduce((sum, b) => sum + (b.amount_paid_cents || 0), 0);
  const totalOutstandingCents = bookings.reduce((sum, b) => {
    const remaining = (b.total_price_cents || 0) - (b.amount_paid_cents || 0);
    return sum + Math.max(0, remaining);
  }, 0);

  // Recent 5 bookings
  const recentBookings = bookings.slice(0, 5);

  // Trip bookings map
  const bookingsByTrip = trips.map(trip => {
    const tripBookings = bookings.filter(b => b.trip_id === trip.id && !['canceled', 'failed'].includes(b.status));
    const count = tripBookings.length;
    const pct = Math.min((count / TRIP_CAPACITY) * 100, 100);
    const barColor = pct >= 95 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-green-500';
    return { trip, count, pct, barColor };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black uppercase text-white">Dashboard Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard index={0} title="Total Revenue" value={formatCurrency(totalRevenueCents)} icon={DollarSign} color="text-green-400" />
        <KPICard index={1} title="Total Bookings" value={bookings.length} icon={Users} color="text-white" />
        <KPICard index={2} title="Confirmed" value={confirmedBookings.length} icon={CheckCircle} color="text-green-400" />
        <KPICard index={3} title="Pending" value={pendingBookings.length} icon={Clock} color="text-yellow-400" />
      </div>

      {/* Payment Breakdown */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
        <h2 className="text-lg font-black uppercase text-white mb-3">Payment Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                <p className="text-white font-black uppercase">Payment Options</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Full Payment</span>
                <span className="text-white font-bold">{fullPayBookings.length} bookings</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payment Plan</span>
                <span className="text-white font-bold">{planBookings.length} bookings</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <p className="text-white font-black uppercase">Collections</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Collected</span>
                <span className="text-green-400 font-bold">{formatCurrency(totalCollectedCents)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Outstanding</span>
                <span className="text-yellow-400 font-bold">{formatCurrency(totalOutstandingCents)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Trip Capacity */}
      {bookingsByTrip.length > 0 && (
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
          <h2 className="text-lg font-black uppercase text-white mb-3">Trip Capacity</h2>
          <div className="space-y-3">
            {bookingsByTrip.map(({ trip, count, pct, barColor }) => (
              <Card key={trip.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-bold">{trip.name}</p>
                      <p className="text-gray-400 text-xs">
                        {trip.start_date ? format(new Date(trip.start_date), 'MMM d') : '—'} –{' '}
                        {trip.end_date ? format(new Date(trip.end_date), 'MMM d, yyyy') : '—'}
                      </p>
                    </div>
                    <span className="text-gray-300 text-sm font-bold">
                      {count} / {TRIP_CAPACITY}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Bookings */}
      <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible">
        <h2 className="text-lg font-black uppercase text-white mb-3">Recent Bookings</h2>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-0 px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-gray-400 font-bold uppercase text-xs px-6 py-3">Guest</th>
                    <th className="text-left text-gray-400 font-bold uppercase text-xs px-6 py-3">Package</th>
                    <th className="text-left text-gray-400 font-bold uppercase text-xs px-6 py-3">Date</th>
                    <th className="text-left text-gray-400 font-bold uppercase text-xs px-6 py-3">Status</th>
                    <th className="text-left text-gray-400 font-bold uppercase text-xs px-6 py-3">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-500 py-8">No bookings yet</td>
                    </tr>
                  ) : (
                    recentBookings.map((b) => (
                      <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-3 text-white font-bold">{b.first_name} {b.last_name}</td>
                        <td className="px-6 py-3 text-gray-300">{b.package_id || '—'}</td>
                        <td className="px-6 py-3 text-gray-400">
                          {b.created_date ? format(new Date(b.created_date), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-6 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-6 py-3"><PaymentBadge option={b.payment_option} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}