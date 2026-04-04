import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Search, Eye, X, RefreshCw, Edit2, Save, XCircle, Info, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

const PACKAGE_NAMES = {
  'luxury-suite': 'Luxury Suite',
  'diamond-club': 'Luxury Suite Diamond Club',
  'ocean-view-dc': 'Luxury Ocean View Diamond Club',
};

function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrip, setFilterTrip] = useState('all');
  const [filterPaymentOption, setFilterPaymentOption] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [isEditingFinancials, setIsEditingFinancials] = useState(false);
  const [financialForm, setFinancialForm] = useState({});

  const [activeTab, setActiveTab] = useState('guest'); // 'guest' | 'financials' | 'payment'
  const [isEditingPaymentSchedule, setIsEditingPaymentSchedule] = useState(false);
  const [paymentScheduleForm, setPaymentScheduleForm] = useState({});
  const [manualPaymentAmount, setManualPaymentAmount] = useState('');

  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);

  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [refundNotes, setRefundNotes] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list(),
  });

  const formatCurrency = (cents) => {
    if (cents === null || cents === undefined) return '$0.00';
    return `$${(Number(cents) / 100).toFixed(2)}`;
  };

  const getTripName = (tripId) => trips.find((t) => t.id === tripId)?.name || 'Unknown Trip';
  const getPackageName = (packageId) => PACKAGE_NAMES[packageId] || packageId || '—';

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      initiated: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      active_plan: 'bg-emerald-100 text-emerald-800',
      canceled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      past_due: 'bg-orange-100 text-orange-800',
    };
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {(status || 'unknown').replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  // ── Filters ────────────────────────────────────────────────────────────────

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      searchTerm === '' ||
      b.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrip = filterTrip === 'all' || b.trip_id === filterTrip;
    const matchesPayment = filterPaymentOption === 'all' || b.payment_option === filterPaymentOption;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesTrip && matchesPayment && matchesStatus;
  });

  // ── Edit ───────────────────────────────────────────────────────────────────

  const startEditing = () => {
    setEditForm({
      first_name: selectedBooking.first_name || '',
      last_name: selectedBooking.last_name || '',
      email: selectedBooking.email || '',
      phone: selectedBooking.phone || '',
      tshirt_size: selectedBooking.tshirt_size || '',
      guest2_first_name: selectedBooking.guest2_first_name || '',
      guest2_last_name: selectedBooking.guest2_last_name || '',
      guest2_email: selectedBooking.guest2_email || '',
      guest2_phone: selectedBooking.guest2_phone || '',
      guest2_tshirt_size: selectedBooking.guest2_tshirt_size || '',
      bed_preference: selectedBooking.bed_preference || '',
      arrival_airline: selectedBooking.arrival_airline || '',
      arrival_date: selectedBooking.arrival_date || '',
      arrival_time: selectedBooking.arrival_time || '',
      departure_airline: selectedBooking.departure_airline || '',
      departure_date: selectedBooking.departure_date || '',
      departure_time: selectedBooking.departure_time || '',
      notes: selectedBooking.notes || '',
    });
    setIsEditing(true);
  };

  const ef = (key, val) => setEditForm((f) => ({ ...f, [key]: val }));

  const startEditingFinancials = () => {
    setFinancialForm({
      total_price_cents: selectedBooking.total_price_cents || 0,
      amount_paid_cents: selectedBooking.amount_paid_cents || 0,
      deposit_amount_cents: selectedBooking.deposit_amount_cents || 0,
    });
    setIsEditingFinancials(true);
  };

  const startEditingPaymentSchedule = () => {
    setPaymentScheduleForm({
      plan_next_charge_date: selectedBooking.plan_next_charge_date || '',
      plan_installments_remaining: selectedBooking.plan_installments_remaining || 0,
      plan_anchor_dates: [...(selectedBooking.plan_anchor_dates || [])],
    });
    setIsEditingPaymentSchedule(true);
  };

  const handleSavePaymentSchedule = async () => {
    try {
      const updated = await base44.entities.Booking.update(selectedBooking.id, paymentScheduleForm);
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setSelectedBooking(updated);
      setIsEditingPaymentSchedule(false);
      toast.success('Payment schedule updated');
    } catch (err) {
      toast.error('Failed to update payment schedule');
    }
  };

  const handleManualPayment = async () => {
    if (!manualPaymentAmount || isNaN(parseFloat(manualPaymentAmount))) return;
    try {
      const addCents = Math.round(parseFloat(manualPaymentAmount) * 100);
      const newPaid = (selectedBooking.amount_paid_cents || 0) + addCents;
      const newRemaining = Math.max((selectedBooking.plan_installments_remaining || 0) - 1, 0);
      const updated = await base44.entities.Booking.update(selectedBooking.id, {
        amount_paid_cents: newPaid,
        plan_installments_remaining: newRemaining,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setSelectedBooking(updated);
      setManualPaymentAmount('');
      toast.success(`$${manualPaymentAmount} recorded — new balance: ${formatCurrency(updated.total_price_cents - updated.amount_paid_cents)}`);
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  const handleSaveFinancials = async () => {
    try {
      const updated = await base44.entities.Booking.update(selectedBooking.id, financialForm);
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setSelectedBooking(updated);
      setIsEditingFinancials(false);
      toast.success('Financials updated');
    } catch (err) {
      toast.error('Failed to update financials');
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const updated = await base44.entities.Booking.update(selectedBooking.id, editForm);
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setSelectedBooking(updated);
      setIsEditing(false);
      toast.success('Booking updated');
    } catch (err) {
      toast.error('Failed to update booking');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      await base44.entities.Booking.update(selectedBooking.id, {
        status: 'canceled',
        notes: cancelReason ? `Cancellation reason: ${cancelReason}` : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking canceled');
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedBooking(null);
    } catch (err) {
      toast.error('Failed to cancel booking');
      console.error(err);
    } finally {
      setIsCanceling(false);
    }
  };

  // ── Refund ─────────────────────────────────────────────────────────────────

  const handleRefund = async () => {
    setIsRefunding(true);
    try {
      const amountCents = Math.round(parseFloat(refundAmount) * 100);
      const response = await base44.functions.invoke('processRefund', {
        bookingId: selectedBooking.id,
        amountCents,
        reason: refundReason,
        refundMethod: refundReason === 'manual' ? 'manual' : 'credit_card',
      });
      const data = response?.data || response;
      if (data?.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        setShowRefundDialog(false);
        setRefundAmount('');
        setRefundNotes('');
        setRefundReason('requested_by_customer');
        setSelectedBooking(null);
      } else {
        toast.error(data?.error || 'Refund failed');
      }
    } catch (err) {
      toast.error('Refund failed — check console');
      console.error(err);
    } finally {
      setIsRefunding(false);
    }
  };

  if (bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">View and manage all retreat bookings</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterTrip} onValueChange={setFilterTrip}>
                <SelectTrigger><SelectValue placeholder="All Trips" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trips</SelectItem>
                  {trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterPaymentOption} onValueChange={setFilterPaymentOption}>
                <SelectTrigger><SelectValue placeholder="Payment Option" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Options</SelectItem>
                  <SelectItem value="full">Full Payment</SelectItem>
                  <SelectItem value="plan">Payment Plan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="initiated">Initiated</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="active_plan">Active Plan</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {booking.first_name} {booking.last_name}
                        </TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell className="whitespace-nowrap">{getTripName(booking.trip_id)}</TableCell>
                        <TableCell className="whitespace-nowrap">{getPackageName(booking.package_id)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {booking.payment_option === 'full' ? 'Full' : 'Plan'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(booking.total_price_cents)}</TableCell>
                        <TableCell>{formatCurrency(booking.amount_paid_cents)}</TableCell>
                        <TableCell>{formatCurrency(booking.deposit_amount_cents)}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(booking); setIsEditing(false); setShowDetailsDialog(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {booking.status !== 'canceled' && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(booking); setShowCancelDialog(true); }}>
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(booking); setRefundAmount(((booking.amount_paid_cents || 0) / 100).toFixed(2)); setShowRefundDialog(true); }}>
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Details / Edit Dialog ── */}
      <Dialog open={showDetailsDialog} onOpenChange={(open) => { setShowDetailsDialog(open); if (!open) { setIsEditing(false); setIsEditingFinancials(false); setIsEditingPaymentSchedule(false); setActiveTab('guest'); setManualPaymentAmount(''); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span>Booking Details</span>
              {!isEditing && selectedBooking?.status !== 'canceled' && (
                <Button size="sm" variant="outline" onClick={startEditing}>
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && !isEditing && (
            <div className="space-y-4">
              {/* Tab Bar */}
              <div className="flex border-b border-gray-200">
                {['guest', 'financials', 'payment'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-green-600 text-green-700'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'guest' ? 'Guest Info' : tab === 'financials' ? 'Financials' : 'Payment Schedule'}
                  </button>
                ))}
              </div>

              {/* Guest Info Tab */}
              {activeTab === 'guest' && (
                <div className="space-y-6">
                  <Section title="Guest">
                    <Row label="Name" value={`${selectedBooking.first_name} ${selectedBooking.last_name}`} />
                    <Row label="Email" value={selectedBooking.email} />
                    <Row label="Phone" value={selectedBooking.phone} />
                    <Row label="T-Shirt" value={selectedBooking.tshirt_size} />
                    <Row label="Birthday" value={selectedBooking.celebrating_birthday} />
                    <Row label="Bed Pref" value={selectedBooking.bed_preference} />
                    <Row label="Referred By" value={selectedBooking.referred_by} />
                  </Section>

                  {selectedBooking.guest2_first_name && (
                    <Section title="Roommate">
                      <Row label="Name" value={`${selectedBooking.guest2_first_name} ${selectedBooking.guest2_last_name}`} />
                      <Row label="Email" value={selectedBooking.guest2_email} />
                      <Row label="Phone" value={selectedBooking.guest2_phone} />
                      <Row label="T-Shirt" value={selectedBooking.guest2_tshirt_size} />
                    </Section>
                  )}

                  <Section title="Booking">
                    <Row label="Trip" value={getTripName(selectedBooking.trip_id)} />
                    <Row label="Package" value={getPackageName(selectedBooking.package_id)} />
                    <Row label="Guests" value={selectedBooking.guests} />
                    <Row label="Payment" value={selectedBooking.payment_option === 'full' ? 'Full Payment' : 'Payment Plan'} />
                    <Row label="Status" value={getStatusBadge(selectedBooking.status)} />
                  </Section>

                  {(selectedBooking.arrival_airline || selectedBooking.departure_airline) && (
                    <Section title="Travel">
                      {selectedBooking.arrival_airline && (
                        <Row label="Arrival" value={`${selectedBooking.arrival_airline} — ${selectedBooking.arrival_date} ${selectedBooking.arrival_time}`} />
                      )}
                      {selectedBooking.departure_airline && (
                        <Row label="Departure" value={`${selectedBooking.departure_airline} — ${selectedBooking.departure_date} ${selectedBooking.departure_time}`} />
                      )}
                    </Section>
                  )}

                  {selectedBooking.notes && (
                    <Section title="Notes">
                      <p className="text-sm text-gray-700">{selectedBooking.notes}</p>
                    </Section>
                  )}
                </div>
              )}

              {/* Financials Tab */}
              {activeTab === 'financials' && (
                <div className="space-y-6">
                  <Section
                    title="Financials"
                    action={
                      selectedBooking?.status !== 'canceled' && (
                        <button
                          onClick={startEditingFinancials}
                          className="text-xs text-blue-600 hover:underline font-bold uppercase"
                        >
                          Adjust
                        </button>
                      )
                    }
                  >
                    {!isEditingFinancials ? (
                      <>
                        <Row label="Total" value={formatCurrency(selectedBooking.total_price_cents)} />
                        <Row label="Paid" value={formatCurrency(selectedBooking.amount_paid_cents)} />
                        <Row label="Deposit" value={formatCurrency(selectedBooking.deposit_amount_cents)} />
                        <Row label="Balance Due" value={formatCurrency((selectedBooking.total_price_cents || 0) - (selectedBooking.amount_paid_cents || 0))} />
                        {selectedBooking.refund_amount_cents && (
                          <Row label="Refunded" value={`${formatCurrency(selectedBooking.refund_amount_cents)} via ${selectedBooking.refund_method} on ${selectedBooking.refund_date}`} />
                        )}
                        {selectedBooking.refund_notes && (
                          <Row label="Refund Notes" value={selectedBooking.refund_notes} />
                        )}
                      </>
                    ) : (
                      <>
                        <EditRow label="Total Price ($)" value={(financialForm.total_price_cents / 100).toFixed(2)} onChange={(v) => setFinancialForm(f => ({ ...f, total_price_cents: Math.round(parseFloat(v) * 100) || 0 }))} />
                        <EditRow label="Amount Paid ($)" value={(financialForm.amount_paid_cents / 100).toFixed(2)} onChange={(v) => setFinancialForm(f => ({ ...f, amount_paid_cents: Math.round(parseFloat(v) * 100) || 0 }))} />
                        <EditRow label="Deposit ($)" value={(financialForm.deposit_amount_cents / 100).toFixed(2)} onChange={(v) => setFinancialForm(f => ({ ...f, deposit_amount_cents: Math.round(parseFloat(v) * 100) || 0 }))} />
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => setIsEditingFinancials(false)}>Cancel</Button>
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveFinancials}>Save</Button>
                        </div>
                      </>
                    )}
                  </Section>
                </div>
              )}

              {/* Payment Schedule Tab */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <Section title="Payment Option">
                    <Row label="Type" value={selectedBooking.payment_option === 'full' ? 'Full Payment' : 'Installment Plan'} />
                    <Row label="Status" value={getStatusBadge(selectedBooking.status)} />
                  </Section>

                  {selectedBooking.payment_option === 'plan' ? (
                    <>
                      <Section title="Plan Status">
                        <Row label="Installments Total" value={selectedBooking.plan_installments_total} />
                        <Row label="Installments Remaining" value={selectedBooking.plan_installments_remaining} />
                        <Row label="Next Charge Date" value={selectedBooking.plan_next_charge_date} />
                        <Row label="Cutoff Applied" value={selectedBooking.plan_cutoff_applied ? 'Yes' : 'No'} />
                        {selectedBooking.plan_next_charge_date && new Date(selectedBooking.plan_next_charge_date) < new Date() && (
                          <div className="flex items-center gap-2 text-orange-600 text-xs mt-1">
                            <AlertCircle className="w-3 h-3" />
                            Next charge date is in the past
                          </div>
                        )}
                      </Section>

                      {isEditingPaymentSchedule ? (
                        <Section title="Edit Schedule">
                          <EditRow label="Next Charge Date" value={paymentScheduleForm.plan_next_charge_date} onChange={(v) => setPaymentScheduleForm(f => ({ ...f, plan_next_charge_date: v }))} type="date" />
                          <EditRow label="Installments Remaining" value={String(paymentScheduleForm.plan_installments_remaining)} onChange={(v) => setPaymentScheduleForm(f => ({ ...f, plan_installments_remaining: parseInt(v) || 0 }))} type="number" />
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs text-gray-500 uppercase font-bold">Installment Dates</label>
                              <button
                                onClick={() => setPaymentScheduleForm(f => ({ ...f, plan_anchor_dates: [...(f.plan_anchor_dates || []), ''] }))}
                                className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Add Date
                              </button>
                            </div>
                            {(paymentScheduleForm.plan_anchor_dates || []).map((date, i) => (
                              <div key={i} className="flex gap-2 mb-2">
                                <Input
                                  type="date"
                                  value={date}
                                  onChange={(e) => {
                                    const updated = [...paymentScheduleForm.plan_anchor_dates];
                                    updated[i] = e.target.value;
                                    setPaymentScheduleForm(f => ({ ...f, plan_anchor_dates: updated }));
                                  }}
                                  className="flex-1"
                                />
                                <Button size="sm" variant="outline" onClick={() => setPaymentScheduleForm(f => ({ ...f, plan_anchor_dates: f.plan_anchor_dates.filter((_, idx) => idx !== i) }))}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setIsEditingPaymentSchedule(false)}>Cancel</Button>
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleSavePaymentSchedule}>Save</Button>
                          </div>
                        </Section>
                      ) : (
                        <Section
                          title="Installment Dates"
                          action={
                            selectedBooking?.status !== 'canceled' && (
                              <button onClick={startEditingPaymentSchedule} className="text-xs text-blue-600 hover:underline font-bold uppercase">
                                Edit Schedule
                              </button>
                            )
                          }
                        >
                          {(selectedBooking.plan_anchor_dates || []).length === 0 ? (
                            <p className="text-sm text-gray-400">No installment dates set</p>
                          ) : (
                            selectedBooking.plan_anchor_dates.map((date, i) => (
                              <Row key={i} label={`Installment ${i + 1}`} value={date} />
                            ))
                          )}
                        </Section>
                      )}

                      <Section title="Record Manual Payment">
                        <p className="text-xs text-gray-400 mb-2">Use this if a guest paid outside of Stripe (cash, Zelle, etc.)</p>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Amount ($)"
                            value={manualPaymentAmount}
                            onChange={(e) => setManualPaymentAmount(e.target.value)}
                          />
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                            onClick={handleManualPayment}
                            disabled={!manualPaymentAmount}
                          >
                            Record Payment
                          </Button>
                        </div>
                      </Section>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">No installment schedule — this booking uses full payment.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedBooking && isEditing && (
            <div className="space-y-6">
              <Section title="Guest Info">
                <EditRow label="First Name" value={editForm.first_name} onChange={(v) => ef('first_name', v)} />
                <EditRow label="Last Name" value={editForm.last_name} onChange={(v) => ef('last_name', v)} />
                <EditRow label="Email" value={editForm.email} onChange={(v) => ef('email', v)} />
                <EditRow label="Phone" value={editForm.phone} onChange={(v) => ef('phone', v)} />
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">T-Shirt Size</label>
                  <Select value={editForm.tshirt_size} onValueChange={(v) => ef('tshirt_size', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['XS','S','M','L','XL','XXL','3XL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </Section>

              {selectedBooking.guests > 1 && (
                <Section title="Roommate Info">
                  <EditRow label="First Name" value={editForm.guest2_first_name} onChange={(v) => ef('guest2_first_name', v)} />
                  <EditRow label="Last Name" value={editForm.guest2_last_name} onChange={(v) => ef('guest2_last_name', v)} />
                  <EditRow label="Email" value={editForm.guest2_email} onChange={(v) => ef('guest2_email', v)} />
                  <EditRow label="Phone" value={editForm.guest2_phone} onChange={(v) => ef('guest2_phone', v)} />
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">T-Shirt Size</label>
                    <Select value={editForm.guest2_tshirt_size} onValueChange={(v) => ef('guest2_tshirt_size', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['XS','S','M','L','XL','XXL','3XL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </Section>
              )}

              <Section title="Travel Info">
                <EditRow label="Arrival Airline" value={editForm.arrival_airline} onChange={(v) => ef('arrival_airline', v)} />
                <EditRow label="Arrival Date" value={editForm.arrival_date} onChange={(v) => ef('arrival_date', v)} type="date" />
                <EditRow label="Arrival Time" value={editForm.arrival_time} onChange={(v) => ef('arrival_time', v)} type="time" />
                <EditRow label="Departure Airline" value={editForm.departure_airline} onChange={(v) => ef('departure_airline', v)} />
                <EditRow label="Departure Date" value={editForm.departure_date} onChange={(v) => ef('departure_date', v)} type="date" />
                <EditRow label="Departure Time" value={editForm.departure_time} onChange={(v) => ef('departure_time', v)} type="time" />
              </Section>

              <Section title="Notes">
                <textarea
                  value={editForm.notes}
                  onChange={(e) => ef('notes', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px]"
                  placeholder="Internal notes..."
                />
              </Section>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                  <XCircle className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Cancel Dialog ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>This will mark the booking as canceled. Cannot be undone.</DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Reason (optional)</label>
            <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Enter reason..." className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isCanceling}>
              {isCanceling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Refund Dialog ── */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              {selectedBooking?.stripe_payment_intent_id
                ? '✅ Stripe payment found — refund will be processed automatically.'
                : '⚠️ No Stripe payment on record — this will be recorded as a manual refund only.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Refund Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount paid: {formatCurrency(selectedBooking?.amount_paid_cents)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested_by_customer">Requested by Customer</SelectItem>
                  <SelectItem value="duplicate">Duplicate Charge</SelectItem>
                  <SelectItem value="fraudulent">Fraudulent</SelectItem>
                  <SelectItem value="manual">Other / Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                placeholder="e.g. medical emergency"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>Cancel</Button>
            <Button
              onClick={handleRefund}
              disabled={!refundAmount || isRefunding}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRefunding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helper UI Components ──────────────────────────────────────────────────────

function Section({ title, action, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</p>
        {action && action}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function EditRow({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-xs text-gray-500 uppercase font-bold">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
    </div>
  );
}

export default function AdminBookingsWrapper() {
  return (
    <AdminLayout>
      <AdminBookings />
    </AdminLayout>
  );
}