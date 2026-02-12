import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, DollarSign, Filter, Loader2, Mail, Phone, Users, Search, ChevronLeft, ChevronRight, Edit, Eye, XCircle } from 'lucide-react';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import PaymentDialog from '../components/PaymentDialog';
import BookingDetailsDialog from '../components/BookingDetailsDialog';
import CancelBookingDialog from '../components/CancelBookingDialog';

export default function Admin() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const bookingsPerPage = 10;

  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
    initialData: [],
    enabled: user?.role === 'admin',
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Booking.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking status updated');
    },
    onError: () => {
      toast.error('Failed to update booking status');
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, paymentData }) => base44.entities.Booking.update(id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Payment information updated');
      setIsPaymentDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: () => {
      toast.error('Failed to update payment information');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      const booking = bookings.find(b => b.id === id);
      await base44.entities.Booking.update(id, {
        status: 'cancelled',
        payment_status: 'cancelled',
        notes: booking.notes ? `${booking.notes}\n\nCancellation Reason (Admin): ${reason}` : `Cancellation Reason (Admin): ${reason}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled');
      setIsCancelDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: () => {
      toast.error('Failed to cancel booking');
    },
  });

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
    const paymentMatch = paymentStatusFilter === 'all' || booking.payment_status === paymentStatusFilter;
    
    const bookingDate = new Date(booking.created_date);
    const startMatch = !startDate || bookingDate >= new Date(startDate);
    const endMatch = !endDate || bookingDate <= new Date(endDate);

    const searchMatch = !searchQuery || 
      (booking.first_name && booking.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.last_name && booking.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && paymentMatch && startMatch && endMatch && searchMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const endIndex = startIndex + bookingsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentStatusFilter, startDate, endDate, searchQuery]);

  const handleOpenPaymentDialog = (booking) => {
    setSelectedBooking(booking);
    setIsPaymentDialogOpen(true);
  };

  const handleOpenDetailsDialog = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenCancelDialog = (booking) => {
    setSelectedBooking(booking);
    setIsCancelDialogOpen(true);
  };

  const handleCancelBooking = (reason) => {
    cancelBookingMutation.mutate({ id: selectedBooking.id, reason });
  };

  const handleSavePayment = (paymentData) => {
    updatePaymentMutation.mutate({
      id: selectedBooking.id,
      paymentData,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-600';
      case 'partially_paid': return 'bg-yellow-600';
      case 'pending': return 'bg-orange-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getPackageName = (packageType) => {
    const names = {
      'luxury-suite': 'Luxury Suite',
      'diamond-club': 'Diamond Club',
      'ocean-view-dc': 'Ocean View DC',
    };
    return names[packageType] || packageType;
  };

  const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
  const totalPaid = filteredBookings.reduce((sum, booking) => sum + (booking.amount_paid || 0), 0);
  const totalOutstanding = totalRevenue - totalPaid;

  // Check if user is admin
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-6">
        <Card className="bg-zinc-900 border-red-600/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-xl font-bold mb-2">Access Denied</div>
            <p className="text-gray-400">You must be an administrator to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white uppercase mb-2">Booking Management</h1>
          <p className="text-gray-400">View and manage all retreat bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-zinc-900 border-green-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 font-bold uppercase">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{filteredBookings.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-green-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 font-bold uppercase">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-green-500">
                {filteredBookings.filter(b => b.status === 'confirmed').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-green-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 font-bold uppercase">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-yellow-400">${totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-green-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 font-bold uppercase">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-green-400">${totalPaid.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-green-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 font-bold uppercase">Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-orange-400">${totalOutstanding.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-zinc-900 border-green-600/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white font-black uppercase flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-500" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label className="text-white font-bold mb-2 block uppercase text-sm">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by guest name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black border-zinc-700 text-white pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-white font-bold mb-2 block uppercase text-sm">Booking Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-black border-zinc-700 text-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block uppercase text-sm">Payment Status</Label>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="bg-black border-zinc-700 text-white">
                    <SelectValue placeholder="All Payment Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="pending">Payment Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block uppercase text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-black border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block uppercase text-sm">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="bg-zinc-900 border-green-600/30">
          <CardHeader>
            <CardTitle className="text-white font-black uppercase">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No bookings found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableHead className="text-gray-400 font-bold uppercase">Date</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase">Guest</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase">Contact</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase">Package</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase">Details</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase">Payment</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase">Status</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBookings.map((booking) => (
                      <TableRow key={booking.id} className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer" onClick={() => handleOpenDetailsDialog(booking)}>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{format(new Date(booking.created_date), 'MMM d, yyyy')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-bold">{booking.first_name} {booking.last_name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Mail className="w-3 h-3" />
                              {booking.email}
                            </div>
                            {booking.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Phone className="w-3 h-3" />
                                {booking.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="font-bold">{getPackageName(booking.package)}</div>
                          <div className="text-sm text-gray-400">{booking.nights} Nights</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-white">
                              <Users className="w-3 h-3 text-green-500" />
                              {booking.occupancy === 'single' ? 'Single' : 'Double'} ({booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'})
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <DollarSign className="w-3 h-3" />
                              ${booking.price_per_person?.toLocaleString()} per person
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-yellow-400 font-black text-lg">
                              ${booking.total_price?.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-400">
                              Paid: ${(booking.amount_paid || 0).toLocaleString()}
                            </div>
                            {booking.amount_paid < booking.total_price && (
                              <div className="text-sm text-orange-400">
                                Due: ${(booking.total_price - (booking.amount_paid || 0)).toLocaleString()}
                              </div>
                            )}
                            {booking.due_date && (
                              <div className="text-xs text-gray-400">
                                Due: {format(new Date(booking.due_date), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge className={`${getStatusColor(booking.status)} text-white font-bold uppercase text-xs`}>
                              {booking.status}
                            </Badge>
                            <Badge className={`${getPaymentStatusColor(booking.payment_status)} text-white font-bold uppercase text-xs`}>
                              {booking.payment_status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDetailsDialog(booking)}
                              className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white w-32 h-8 text-xs font-bold"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            <Select
                              value={booking.status}
                              onValueChange={(value) => updateStatusMutation.mutate({ id: booking.id, status: value })}
                            >
                              <SelectTrigger className="bg-black border-zinc-700 text-white w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleOpenPaymentDialog(booking)}
                              className="bg-green-600 hover:bg-green-700 text-white w-32 h-8 text-xs font-bold"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Record Payment
                            </Button>
                            {booking.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenCancelDialog(booking)}
                                className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white w-32 h-8 text-xs font-bold"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Cancel Booking
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
                  <div className="text-sm text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="border-zinc-700 text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={currentPage === pageNum ? 
                                "bg-green-600 hover:bg-green-700 text-white" : 
                                "border-zinc-700 text-white hover:bg-zinc-800"
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return <span key={pageNum} className="text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="border-zinc-700 text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        {selectedBooking && (
          <PaymentDialog
            booking={selectedBooking}
            isOpen={isPaymentDialogOpen}
            onClose={() => {
              setIsPaymentDialogOpen(false);
              setSelectedBooking(null);
            }}
            onSave={handleSavePayment}
          />
        )}

        {/* Booking Details Dialog */}
        {selectedBooking && (
          <BookingDetailsDialog
            booking={selectedBooking}
            isOpen={isDetailsDialogOpen}
            onClose={() => {
              setIsDetailsDialogOpen(false);
              setSelectedBooking(null);
            }}
          />
        )}

        {/* Cancel Booking Dialog */}
        {selectedBooking && (
          <CancelBookingDialog
            booking={selectedBooking}
            isOpen={isCancelDialogOpen}
            onClose={() => {
              setIsCancelDialogOpen(false);
              setSelectedBooking(null);
            }}
            onConfirm={handleCancelBooking}
            isAdmin={true}
          />
        )}
      </div>
    </div>
  );
}