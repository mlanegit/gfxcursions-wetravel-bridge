import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Search, Eye, X, RefreshCw, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from "@/components/admin/AdminLayout";

function AdminBookings() {
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Search, Eye, X, RefreshCw, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from "@/components/admin/AdminLayout";

function AdminBookings() {

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrip, setFilterTrip] = useState('all');
  const [filterPaymentOption, setFilterPaymentOption] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('credit_card');

  const queryClient = useQueryClient();

  // 👇 ALL your existing useQuery, useMutation, helper functions, etc stay here
  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
    enabled: !!user,
  });

  // Fetch trips
  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list(),
    enabled: !!user,
  });

  // Fetch packages
  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.TripPackage.list(),
    enabled: !!user,
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async ({ bookingId }) => {
      return base44.entities.Booking.update(bookingId, {
        status: 'canceled',
        notes: cancelReason ? `Cancellation reason: ${cancelReason}` : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings']);
      toast.success('Booking canceled successfully');
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast.error('Failed to cancel booking');
      console.error(error);
    },
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async ({ bookingId, amountCents, method }) => {
      return base44.entities.Booking.update(bookingId, {
        status: 'canceled',
        refund_amount_cents: amountCents,
        refund_date: new Date().toISOString().split('T')[0],
        refund_method: method,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings']);
      toast.success('Refund processed successfully');
      setShowRefundDialog(false);
      setRefundAmount('');
      setRefundMethod('credit_card');
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast.error('Failed to process refund');
      console.error(error);
    },
  });

  // Helper functions
  const getTripName = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    return trip?.name || 'Unknown Trip';
  };

  const getPackageName = (packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg?.label || 'Unknown Package';
  };

  const formatCurrency = (cents) => {
    if (!cents && cents !== 0) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    const colors = {
      initiated: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      active_plan: 'bg-blue-100 text-blue-800',
      canceled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      past_due: 'bg-orange-100 text-orange-800',
    };
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status?.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      searchTerm === '' ||
      booking.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTrip = filterTrip === 'all' || booking.trip_id === filterTrip;
    const matchesPayment = filterPaymentOption === 'all' || booking.payment_option === filterPaymentOption;
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;

    return matchesSearch && matchesTrip && matchesPayment && matchesStatus;
  });

  const handleCancelSubscriptionSchedule = async (booking) => {
    if (!booking.stripe_subscription_schedule_id) {
      toast.error('No subscription schedule found');
      return;
    }
    toast.info('This would cancel the Stripe subscription schedule. Integration needed.');
    // TODO: Implement Stripe API call to cancel subscription schedule
  };

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
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterTrip} onValueChange={setFilterTrip}>
                <SelectTrigger>
                  <SelectValue placeholder="All Trips" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trips</SelectItem>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPaymentOption} onValueChange={setFilterPaymentOption}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Options</SelectItem>
                  <SelectItem value="full">Full Payment</SelectItem>
                  <SelectItem value="plan">Payment Plan</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
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

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Schedule ID</TableHead>
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
                        <TableCell className="font-medium">
                          {booking.first_name} {booking.last_name}
                        </TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell>{getTripName(booking.trip_id)}</TableCell>
                        <TableCell>{getPackageName(booking.package_id)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {booking.payment_option === 'full' ? 'Full' : 'Plan'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(booking.total_price_cents)}</TableCell>
                        <TableCell>{formatCurrency(booking.amount_paid_cents)}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {booking.stripe_subscription_schedule_id ? (
                            <span className="truncate block max-w-[120px]" title={booking.stripe_subscription_schedule_id}>
                              {booking.stripe_subscription_schedule_id.substring(0, 15)}...
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {booking.status !== 'canceled' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowCancelDialog(true);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setRefundAmount((booking.total_price_cents / 100).toFixed(2));
                                    setShowRefundDialog(true);
                                  }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {booking.stripe_subscription_schedule_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelSubscriptionSchedule(booking)}
                              >
                                <Calendar className="w-4 h-4" />
                              </Button>
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

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Guest Name</p>
                  <p className="font-medium">{selectedBooking.first_name} {selectedBooking.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedBooking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedBooking.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trip</p>
                  <p className="font-medium">{getTripName(selectedBooking.trip_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Package</p>
                  <p className="font-medium">{getPackageName(selectedBooking.package_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-medium">{selectedBooking.guests}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Option</p>
                  <p className="font-medium">{selectedBooking.payment_option === 'full' ? 'Full Payment' : 'Payment Plan'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="font-medium">{formatCurrency(selectedBooking.total_price_cents)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-medium">{formatCurrency(selectedBooking.amount_paid_cents)}</p>
                </div>
                {selectedBooking.stripe_subscription_schedule_id && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Subscription Schedule ID</p>
                    <p className="font-mono text-xs">{selectedBooking.stripe_subscription_schedule_id}</p>
                  </div>
                )}
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cancellation Reason (Optional)</label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelBookingMutation.mutate({ bookingId: selectedBooking.id })}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Enter refund details below. This will mark the booking as canceled.
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
            </div>
            <div>
              <label className="text-sm font-medium">Refund Method</label>
              <Select value={refundMethod} onValueChange={setRefundMethod}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const amountCents = Math.round(parseFloat(refundAmount) * 100);
                refundMutation.mutate({
                  bookingId: selectedBooking.id,
                  amountCents,
                  method: refundMethod,
                });
              }}
              disabled={!refundAmount || refundMutation.isPending}
            >
              {refundMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Refund'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

}

export default function AdminBookingsWrapper() {
  return (
    <AdminLayout>
      <AdminBookings />
    </AdminLayout>
  );
}
