import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar, DollarSign, User, Plane, Check, MapPin,
  FileText, Clock, CreditCard, Loader2, XCircle,
  AlertCircle, CheckCircle2, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import GuestInfoEditor from '../components/GuestInfoEditor';
import CancelBookingDialog from '../components/CancelBookingDialog';

// ✅ Points to LIVE app (697e8285d68c1a64ca6d3df7)
const FUNCTIONS_BASE = 'https://api.base44.app/api/apps/697e8285d68c1a64ca6d3df7/functions';

const formatCurrency = (cents) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
};

function InstallmentStatusBadge({ status }) {
  const map = {
    scheduled: { label: 'Upcoming',   className: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
    paid:      { label: 'Paid',       className: 'bg-green-600/20 text-green-400 border-green-600/30' },
    failed:    { label: 'Failed',     className: 'bg-red-600/20 text-red-400 border-red-600/30' },
    retrying:  { label: 'Retrying',   className: 'bg-orange-600/20 text-orange-400 border-orange-600/30' },
    waived:    { label: 'Waived',     className: 'bg-zinc-600/20 text-gray-400 border-zinc-600/30' },
    cancelled: { label: 'Cancelled',  className: 'bg-zinc-600/20 text-gray-400 border-zinc-600/30' },
  };
  const cfg = map[status] || { label: status, className: 'bg-zinc-700 text-gray-400' };
  return <Badge className={`border text-xs ${cfg.className}`}>{cfg.label}</Badge>;
}

export default function GuestPortal() {
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const paymentResult = urlParams.get('payment');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => { try { return await base44.auth.me(); } catch { return null; } },
  });

  const { data: booking, isLoading: isLoadingBooking } = useQuery({
    queryKey: ['guestBooking', email],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ email });
      if (bookings.length === 0) throw new Error('No booking found');
      return bookings[0];
    },
    enabled: isAuthenticated && !!email,
  });

  const { data: installments = [] } = useQuery({
    queryKey: ['guestInstallments', booking?.id],
    queryFn: async () => base44.entities.PaymentInstallment.filter({ booking_id: booking.id }),
    enabled: !!booking?.id && booking?.payment_option === 'plan',
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (reason) => {
      await base44.entities.Booking.update(booking.id, {
        status: 'cancelled',
        payment_status: 'cancelled',
        notes: booking.notes
          ? `${booking.notes}\n\nCancellation Reason: ${reason}`
          : `Cancellation Reason: ${reason}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestBooking'] });
      toast.success('Booking cancelled successfully');
      setIsCancelDialogOpen(false);
    },
    onError: () => toast.error('Failed to cancel booking'),
  });

  const handleAccessPortal = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const bookings = await base44.entities.Booking.filter({ email });
      if (bookings.length === 0) {
        toast.error('No booking found with this email address');
        return;
      }
      setIsAuthenticated(true);
      toast.success('Welcome to your booking portal!');
    } catch {
      toast.error('Failed to access portal. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleMakePayment = async () => {
    if (!booking) return;
    setIsCheckingOut(true);
    try {
      const resp = await fetch(`${FUNCTIONS_BASE}/createCheckoutSession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Could not create payment session. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Payment error. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getBookingStatusConfig = (status) => {
    const map = {
      paid:        { text: 'Fully Paid',  color: 'bg-green-600' },
      active_plan: { text: 'Active Plan', color: 'bg-blue-600' },
      initiated:   { text: 'Initiated',   color: 'bg-yellow-600' },
      pending:     { text: 'Pending',     color: 'bg-orange-600' },
      past_due:    { text: 'Past Due',    color: 'bg-red-600' },
      cancelled:   { text: 'Cancelled',   color: 'bg-zinc-600' },
    };
    return map[status] || { text: status || 'Unknown', color: 'bg-zinc-600' };
  };

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="bg-zinc-900 border-green-600/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-white text-2xl font-black uppercase">Guest Portal</CardTitle>
              <p className="text-gray-400 mt-2">Access your booking details and manage your retreat reservation</p>
            </CardHeader>
            <CardContent>
              {paymentResult === 'success' && (
                <div className="mb-4 flex items-center gap-2 bg-green-600/10 border border-green-600/30 rounded-md p-3 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Payment successful! Enter your email to view your updated booking.
                </div>
              )}
              {paymentResult === 'cancelled' && (
                <div className="mb-4 flex items-center gap-2 bg-yellow-600/10 border border-yellow-600/30 rounded-md p-3 text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Payment was cancelled. Enter your email to try again.
                </div>
              )}
              <form onSubmit={handleAccessPortal} className="space-y-4">
                <div>
                  <Label className="text-white font-bold mb-2 block uppercase text-sm">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your booking email"
                    className="bg-black border-zinc-700 text-white"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoggingIn} className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase">
                  {isLoggingIn ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Accessing...</> : 'Access My Booking'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isLoadingBooking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">No booking found</p>
          <Button onClick={() => { setIsAuthenticated(false); setEmail(''); }} variant="outline">Try Again</Button>
        </div>
      </div>
    );
  }

  const bookingStatusConfig = getBookingStatusConfig(booking.status);
  const totalCents = booking.total_price_cents || 0;
  const paidCents = booking.amount_paid_cents || 0;
  const balanceCents = Math.max(0, totalCents - paidCents);
  const isFullyPaid = booking.status === 'paid';
  const isPastDue = booking.status === 'past_due';
  const isCancelled = booking.status === 'cancelled';
  const canMakePayment = !isFullyPaid && !isCancelled && balanceCents > 0;
  const canEdit = user?.role === 'admin' || user?.email === booking?.email;

  const paidInstallments = installments.filter(i => i.status === 'paid').length;
  const totalInstallments = installments.filter(i => !['cancelled', 'waived'].includes(i.status)).length;
  const nextInstallment = installments
    .filter(i => i.status === 'scheduled')
    .sort((a, b) => a.due_date?.localeCompare(b.due_date))[0];

  // ── Portal Dashboard ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-12 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-3xl font-black uppercase mb-2">Welcome, {booking.first_name}!</h1>
              <p className="text-gray-400">Manage your retreat booking and stay updated</p>
            </div>
            <Button onClick={() => { setIsAuthenticated(false); setEmail(''); }} variant="outline" className="border-zinc-700 text-white">
              Sign Out
            </Button>
          </div>

          {paymentResult === 'success' && (
            <div className="mb-4 flex items-center gap-2 bg-green-600/10 border border-green-600/30 rounded-md p-4 text-green-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="font-bold">Payment successful! Your booking has been updated.</p>
            </div>
          )}
          {isPastDue && (
            <div className="mb-4 flex items-center gap-2 bg-red-600/10 border border-red-600/30 rounded-md p-4 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Payment Past Due</p>
                <p className="text-sm text-red-300">A scheduled payment failed. Please make a payment or contact us.</p>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-bold mb-1">Booking Status</p>
                    <Badge className={`${bookingStatusConfig.color} text-white`}>{bookingStatusConfig.text}</Badge>
                  </div>
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-bold mb-1">Amount Paid</p>
                    <p className="text-green-400 font-black text-xl">{formatCurrency(paidCents)}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-bold mb-1">Balance Due</p>
                    <p className={`font-black text-xl ${balanceCents > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {formatCurrency(balanceCents)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="booking" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="booking"   className="data-[state=active]:bg-green-600 text-white">Booking Details</TabsTrigger>
            <TabsTrigger value="payment"   className="data-[state=active]:bg-green-600 text-white">Payments</TabsTrigger>
            <TabsTrigger value="edit"      className="data-[state=active]:bg-green-600 text-white">Update Info</TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-green-600 text-white">Event Resources</TabsTrigger>
          </TabsList>

          {/* ── Booking Details ─────────────────────────────────────────── */}
          <TabsContent value="booking">
            {!isCancelled && (
              <div className="mb-6">
                <Button onClick={() => setIsCancelDialogOpen(true)} variant="outline" className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white">
                  <XCircle className="w-4 h-4 mr-2" /> Cancel Booking
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <User className="w-5 h-5 text-green-500" /> Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ['Name', `${booking.first_name} ${booking.last_name}`],
                    ['Email', booking.email],
                    ['Phone', booking.phone],
                    ['T-Shirt Size', booking.tshirt_size || '—'],
                    ['Bed Preference', booking.bed_preference || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-bold">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" /> Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ['Package', booking.package_id || '—'],
                    ['Occupancy', booking.occupancy ? booking.occupancy.charAt(0).toUpperCase() + booking.occupancy.slice(1) : '—'],
                    ['Guests', booking.guests],
                    ['Booked On', new Date(booking.created_date).toLocaleDateString()],
                    ['Payment Type', booking.payment_option === 'plan' ? 'Payment Plan' : 'Full Payment'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-bold">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {booking.guest2_first_name && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                      <User className="w-5 h-5 text-green-500" /> Second Guest
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      ['Name', `${booking.guest2_first_name} ${booking.guest2_last_name}`],
                      ['Email', booking.guest2_email],
                      ['Phone', booking.guest2_phone],
                      ['T-Shirt Size', booking.guest2_tshirt_size || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-400">{label}</span>
                        <span className="text-white font-bold">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <Plane className="w-5 h-5 text-green-500" /> Travel Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm font-bold mb-1">ARRIVAL</p>
                    <p className="text-white">{booking.arrival_airline || 'Not provided'}</p>
                    <p className="text-gray-400 text-sm">
                      {booking.arrival_date ? formatDate(booking.arrival_date) : ''}
                      {booking.arrival_time ? ` at ${booking.arrival_time}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold mb-1">DEPARTURE</p>
                    <p className="text-white">{booking.departure_airline || 'Not provided'}</p>
                    <p className="text-gray-400 text-sm">
                      {booking.departure_date ? formatDate(booking.departure_date) : ''}
                      {booking.departure_time ? ` at ${booking.departure_time}` : ''}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Payments ────────────────────────────────────────────────── */}
          <TabsContent value="payment">
            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" /> Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-black rounded-lg p-5 border border-zinc-800 text-center">
                      <p className="text-gray-400 text-xs uppercase font-bold mb-1">Total Price</p>
                      <p className="text-white font-black text-2xl">{formatCurrency(totalCents)}</p>
                    </div>
                    <div className="bg-black rounded-lg p-5 border border-zinc-800 text-center">
                      <p className="text-gray-400 text-xs uppercase font-bold mb-1">Amount Paid</p>
                      <p className="text-green-400 font-black text-2xl">{formatCurrency(paidCents)}</p>
                    </div>
                    <div className="bg-black rounded-lg p-5 border border-zinc-800 text-center">
                      <p className="text-gray-400 text-xs uppercase font-bold mb-1">Balance Due</p>
                      <p className={`font-black text-2xl ${balanceCents > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {formatCurrency(balanceCents)}
                      </p>
                    </div>
                  </div>

                  {booking.due_date && !isFullyPaid && (
                    <div className="flex items-center gap-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4 mb-4">
                      <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <div>
                        <p className="text-white font-bold text-sm">Balance Due Date</p>
                        <p className="text-gray-400 text-sm">{formatDate(booking.due_date)}</p>
                      </div>
                    </div>
                  )}

                  {booking.late_enrollment_adjustment_cents > 0 && (
                    <div className="flex items-center gap-3 bg-orange-600/10 border border-orange-600/30 rounded-lg p-4 mb-4">
                      <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-bold text-sm">Late Enrollment Adjustment</p>
                        <p className="text-gray-400 text-sm">
                          A late enrollment fee of {formatCurrency(booking.late_enrollment_adjustment_cents)} was applied at booking.
                        </p>
                      </div>
                    </div>
                  )}

                  {canMakePayment && (
                    <Button
                      onClick={handleMakePayment}
                      disabled={isCheckingOut}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase text-lg py-6"
                    >
                      {isCheckingOut
                        ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Preparing Payment...</>
                        : <><CreditCard className="w-5 h-5 mr-2" />Make a Payment</>
                      }
                    </Button>
                  )}

                  {isFullyPaid && (
                    <div className="flex items-center gap-3 bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <p className="text-green-400 font-bold">Your booking is fully paid. See you in Jamaica! 🌴</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Installment Schedule — payment plan bookings only */}
              {booking.payment_option === 'plan' && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-500" /> Installment Schedule
                      </CardTitle>
                      {totalInstallments > 0 && (
                        <span className="text-gray-400 text-sm">{paidInstallments} of {totalInstallments} paid</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {installments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <RefreshCw className="w-8 h-8 mx-auto mb-3 opacity-40" />
                        <p>Installment schedule will appear here once your payment plan is active.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {installments
                          .filter(i => i.status !== 'cancelled')
                          .sort((a, b) => a.due_date?.localeCompare(b.due_date))
                          .map((installment, index) => {
                            const isNext = nextInstallment?.id === installment.id;
                            return (
                              <div key={installment.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                                installment.status === 'paid'   ? 'bg-green-600/5 border-green-600/20'
                                : isNext                        ? 'bg-blue-600/10 border-blue-600/30'
                                :                                 'bg-zinc-800 border-zinc-700'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    installment.status === 'paid' ? 'bg-green-600 text-white'
                                    : isNext                      ? 'bg-blue-600 text-white'
                                    :                               'bg-zinc-700 text-gray-400'
                                  }`}>
                                    {installment.status === 'paid' ? <Check className="w-4 h-4" /> : index + 1}
                                  </div>
                                  <div>
                                    <p className="text-white font-bold text-sm">
                                      {installment.is_deposit
                                        ? 'Deposit'
                                        : installment.is_late_enrollment_adjustment
                                        ? 'Late Enrollment Fee'
                                        : `Installment #${index + 1}`}
                                      {isNext && <span className="ml-2 text-xs text-blue-400">(Next)</span>}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                      {installment.status === 'paid' && installment.paid_date
                                        ? `Paid on ${formatDate(installment.paid_date)}`
                                        : `Due ${formatDate(installment.due_date)}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-white font-black">{formatCurrency(installment.amount_cents)}</span>
                                  <InstallmentStatusBadge status={installment.status} />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ── Update Info ─────────────────────────────────────────────── */}
          <TabsContent value="edit">
            {canEdit ? (
              <GuestInfoEditor booking={booking} />
            ) : (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-400">You don't have permission to edit this booking.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Event Resources ─────────────────────────────────────────── */}
          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" /> Event Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      ['Day 1 — Arrival & Welcome',  'Check-in, welcome cocktails, and opening ceremony'],
                      ['Day 2 — Beach & Pool Party',  'All-day beach activities, pool party, and sunset dinner'],
                      ['Day 3 — Excursions',          'Island tours, water sports, and evening entertainment'],
                      ['Day 4 — Departure',           'Farewell breakfast and checkout'],
                    ].map(([title, desc]) => (
                      <div key={title} className="bg-black rounded-lg p-4 border border-zinc-800">
                        <p className="text-white font-bold mb-1">{title}</p>
                        <p className="text-gray-400 text-sm">{desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-500" /> Important Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-black rounded-lg p-4 border border-zinc-800">
                      <p className="text-white font-bold mb-2">What to Pack</p>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Swimwear and beach attire</li>
                        <li>• Comfortable walking shoes</li>
                        <li>• Sunscreen and sunglasses</li>
                        <li>• Valid ID and travel documents</li>
                      </ul>
                    </div>
                    <div className="bg-black rounded-lg p-4 border border-zinc-800">
                      <p className="text-white font-bold mb-2">Resort Amenities</p>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Multiple restaurants & bars</li>
                        <li>• Pool and beach access</li>
                        <li>• Fitness center & spa</li>
                        <li>• 24/7 concierge service</li>
                      </ul>
                    </div>
                    <div className="bg-black rounded-lg p-4 border border-zinc-800">
                      <p className="text-white font-bold mb-2">Contact</p>
                      <div className="text-gray-400 text-sm space-y-1">
                        <p>📧 info@[gfxcursions.com](https://gfxcursions.com)</p>
                        <p>🌐 [gfxcursions.com](https://gfxcursions.com)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <CancelBookingDialog
          booking={booking}
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          onConfirm={cancelBookingMutation.mutate}
          isAdmin={user?.role === 'admin'}
        />
      </div>
    </div>
  );
}