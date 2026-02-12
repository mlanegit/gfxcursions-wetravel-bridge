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
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  Plane, 
  Edit, 
  Check,
  MapPin,
  FileText,
  Clock,
  CreditCard,
  Loader2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import GuestInfoEditor from '../components/GuestInfoEditor';
import CancelBookingDialog from '../components/CancelBookingDialog';

export default function GuestPortal() {
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
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

  const cancelBookingMutation = useMutation({
    mutationFn: async (reason) => {
      await base44.entities.Booking.update(booking.id, {
        status: 'cancelled',
        payment_status: 'cancelled',
        notes: booking.notes ? `${booking.notes}\n\nCancellation Reason: ${reason}` : `Cancellation Reason: ${reason}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestBooking'] });
      toast.success('Booking cancelled successfully');
      setIsCancelDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to cancel booking');
    },
  });

  const handleAccessPortal = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const bookings = await base44.entities.Booking.filter({ email });
      if (bookings.length === 0) {
        toast.error('No booking found with this email address');
        setIsLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      toast.success('Welcome to your booking portal!');
    } catch (error) {
      toast.error('Failed to access portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatus = () => {
    if (!booking) return { text: 'Unknown', color: 'bg-gray-500' };
    
    switch (booking.payment_status) {
      case 'paid':
        return { text: 'Fully Paid', color: 'bg-green-600' };
      case 'partially_paid':
        return { text: 'Partially Paid', color: 'bg-yellow-600' };
      case 'pending':
        return { text: 'Payment Pending', color: 'bg-orange-600' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-600' };
      default:
        return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };

  const getBookingStatus = () => {
    if (!booking) return { text: 'Unknown', color: 'bg-gray-500' };
    
    switch (booking.status) {
      case 'confirmed':
        return { text: 'Confirmed', color: 'bg-green-600' };
      case 'pending':
        return { text: 'Pending', color: 'bg-yellow-600' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-600' };
      default:
        return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-zinc-900 border-green-600/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-white text-2xl font-black uppercase">
                Guest Portal
              </CardTitle>
              <p className="text-gray-400 mt-2">
                Access your booking details and manage your retreat reservation
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccessPortal} className="space-y-4">
                <div>
                  <Label className="text-white font-bold mb-2 block uppercase text-sm">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your booking email"
                    className="bg-black border-zinc-700 text-white"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accessing...
                    </>
                  ) : (
                    'Access My Booking'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Portal Dashboard
  if (isLoadingBooking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  const paymentStatus = getPaymentStatus();
  const bookingStatus = getBookingStatus();
  const amountPaid = booking?.amount_paid || 0;
  const totalPrice = booking?.total_price || 0;
  const balance = totalPrice - amountPaid;

  // Check if user can edit this booking (admin or booking owner)
  const canEdit = user?.role === 'admin' || user?.email === booking?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-3xl font-black uppercase mb-2">
                Welcome, {booking?.first_name}!
              </h1>
              <p className="text-gray-400">Manage your retreat booking and stay updated</p>
            </div>
            <Button
              onClick={() => {
                setIsAuthenticated(false);
                setEmail('');
              }}
              variant="outline"
              className="border-zinc-700 text-white"
            >
              Sign Out
            </Button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-bold mb-1">Booking Status</p>
                    <Badge className={`${bookingStatus.color} text-white`}>
                      {bookingStatus.text}
                    </Badge>
                  </div>
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-bold mb-1">Payment Status</p>
                    <Badge className={`${paymentStatus.color} text-white`}>
                      {paymentStatus.text}
                    </Badge>
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
                    <p className="text-white font-black text-xl">${balance.toLocaleString()}</p>
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
            <TabsTrigger value="booking" className="data-[state=active]:bg-green-600">
              Booking Details
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-green-600">
              Payment Info
            </TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-green-600">
              Update Info
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-green-600">
              Event Resources
            </TabsTrigger>
          </TabsList>

          {/* Booking Details Tab */}
          <TabsContent value="booking">
            {booking?.status !== 'cancelled' && (
              <div className="mb-6">
                <Button
                  onClick={() => setIsCancelDialogOpen(true)}
                  variant="outline"
                  className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <User className="w-5 h-5 text-green-500" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name</span>
                    <span className="text-white font-bold">{booking?.first_name} {booking?.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white font-bold">{booking?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone</span>
                    <span className="text-white font-bold">{booking?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">T-Shirt Size</span>
                    <span className="text-white font-bold">{booking?.tshirt_size || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bed Preference</span>
                    <span className="text-white font-bold capitalize">{booking?.bed_preference || 'Not specified'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Package</span>
                    <span className="text-white font-bold capitalize">{booking?.package?.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white font-bold">{booking?.nights} Nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Occupancy</span>
                    <span className="text-white font-bold capitalize">{booking?.occupancy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Guests</span>
                    <span className="text-white font-bold">{booking?.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Booked On</span>
                    <span className="text-white font-bold">
                      {new Date(booking?.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {booking?.guest2_first_name && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                      <User className="w-5 h-5 text-green-500" />
                      Second Guest
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name</span>
                      <span className="text-white font-bold">{booking?.guest2_first_name} {booking?.guest2_last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white font-bold">{booking?.guest2_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone</span>
                      <span className="text-white font-bold">{booking?.guest2_phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">T-Shirt Size</span>
                      <span className="text-white font-bold">{booking?.guest2_tshirt_size || 'Not specified'}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <Plane className="w-5 h-5 text-green-500" />
                    Travel Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm font-bold mb-2">ARRIVAL</p>
                    <div className="space-y-1">
                      <p className="text-white">{booking?.arrival_airline || 'Not provided'}</p>
                      <p className="text-gray-400 text-sm">
                        {booking?.arrival_date ? new Date(booking.arrival_date).toLocaleDateString() : ''} 
                        {booking?.arrival_time ? ` at ${booking.arrival_time}` : ''}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold mb-2">DEPARTURE</p>
                    <div className="space-y-1">
                      <p className="text-white">{booking?.departure_airline || 'Not provided'}</p>
                      <p className="text-gray-400 text-sm">
                        {booking?.departure_date ? new Date(booking.departure_date).toLocaleDateString() : ''} 
                        {booking?.departure_time ? ` at ${booking.departure_time}` : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Info Tab */}
          <TabsContent value="payment">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black rounded-lg p-6 border border-zinc-800">
                    <p className="text-gray-400 text-sm uppercase font-bold mb-2">Total Price</p>
                    <p className="text-white font-black text-3xl">${totalPrice.toLocaleString()}</p>
                  </div>
                  <div className="bg-black rounded-lg p-6 border border-zinc-800">
                    <p className="text-gray-400 text-sm uppercase font-bold mb-2">Amount Paid</p>
                    <p className="text-green-500 font-black text-3xl">${amountPaid.toLocaleString()}</p>
                  </div>
                  <div className="bg-black rounded-lg p-6 border border-zinc-800">
                    <p className="text-gray-400 text-sm uppercase font-bold mb-2">Balance Due</p>
                    <p className="text-yellow-400 font-black text-3xl">${balance.toLocaleString()}</p>
                  </div>
                </div>

                {booking?.due_date && (
                  <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-white font-bold">Payment Due Date</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(booking.due_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {balance > 0 && (
                  <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                    <p className="text-white font-bold mb-2">Payment Instructions</p>
                    <p className="text-gray-400 text-sm">
                      To complete your payment, please contact our team at{' '}
                      <a href="mailto:info@lostinjamaica.com" className="text-green-500 hover:underline">
                        info@lostinjamaica.com
                      </a>{' '}
                      or call us. We accept various payment methods including credit cards, bank transfers, and payment plans.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Info Tab */}
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

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Event Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-black rounded-lg p-4 border border-zinc-800">
                      <p className="text-white font-bold mb-1">Day 1 - Arrival & Welcome</p>
                      <p className="text-gray-400 text-sm">Check-in, welcome cocktails, and opening ceremony</p>
                    </div>
                    <div className="bg-black rounded-lg p-4 border border-zinc-800">
                      <p className="text-white font-bold mb-1">Day 2 - Beach & Pool Party</p>
                      <p className="text-gray-400 text-sm">All-day beach activities, pool party, and sunset dinner</p>
                    </div>
                    <div className="bg-black rounded-lg p-4 border border-zinc-800">
                      <p className="text-white font-bold mb-1">Day 3 - Excursions</p>
                      <p className="text-gray-400 text-sm">Island tours, water sports, and evening entertainment</p>
                    </div>
                    <div className="bg-black rounded-lg p-4 border border-zinc-800">
                      <p className="text-white font-bold mb-1">Day 4 - Departure</p>
                      <p className="text-gray-400 text-sm">Farewell breakfast and checkout</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    Important Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                      <p className="text-white font-bold mb-2">Contact Information</p>
                      <div className="text-gray-400 text-sm space-y-1">
                        <p>📧 info@lostinjamaica.com</p>
                        <p>📱 +1 (555) 123-4567</p>
                        <p>🌐 www.lostinjamaica.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Cancel Booking Dialog */}
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