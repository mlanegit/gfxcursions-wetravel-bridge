import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Plane, MapPin, Calendar, Shirt, Bed, Gift, MessageSquare, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingDetailsDialog({ booking, isOpen, onClose }) {
  if (!booking) return null;

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
      case 'refunded': return 'bg-blue-600';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-green-600/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-white">
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status Badges */}
          <div className="flex gap-3">
            <Badge className={`${getStatusColor(booking.status)} text-white font-bold uppercase`}>
              {booking.status}
            </Badge>
            <Badge className={`${getPaymentStatusColor(booking.payment_status)} text-white font-bold uppercase`}>
              {booking.payment_status}
            </Badge>
          </div>

          {/* Guest 1 Information */}
          <div className="bg-black rounded-lg p-6 border border-zinc-800">
            <h3 className="text-green-500 font-black uppercase text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Primary Guest
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Full Name</p>
                <p className="text-white font-bold">{booking.first_name} {booking.last_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-green-500" />
                  <p className="text-white">{booking.email}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-green-500" />
                  <p className="text-white">{booking.phone || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">T-Shirt Size</p>
                <div className="flex items-center gap-2">
                  <Shirt className="w-3 h-3 text-green-500" />
                  <p className="text-white">{booking.tshirt_size || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest 2 Information (if exists) */}
          {booking.guest2_first_name && (
            <div className="bg-black rounded-lg p-6 border border-zinc-800">
              <h3 className="text-green-500 font-black uppercase text-sm mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Second Guest
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Full Name</p>
                  <p className="text-white font-bold">{booking.guest2_first_name} {booking.guest2_last_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-green-500" />
                    <p className="text-white">{booking.guest2_email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-green-500" />
                    <p className="text-white">{booking.guest2_phone || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">T-Shirt Size</p>
                  <div className="flex items-center gap-2">
                    <Shirt className="w-3 h-3 text-green-500" />
                    <p className="text-white">{booking.guest2_tshirt_size || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Package & Preferences */}
          <div className="bg-black rounded-lg p-6 border border-zinc-800">
            <h3 className="text-green-500 font-black uppercase text-sm mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Package & Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Package</p>
                <p className="text-white font-bold">{getPackageName(booking.package)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Duration</p>
                <p className="text-white">{booking.nights} Nights</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Occupancy</p>
                <p className="text-white capitalize">{booking.occupancy} ({booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'})</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Bed Preference</p>
                <div className="flex items-center gap-2">
                  <Bed className="w-3 h-3 text-green-500" />
                  <p className="text-white capitalize">{booking.bed_preference || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Referred By</p>
                <p className="text-white capitalize">{booking.referred_by || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Celebrating Birthday</p>
                <div className="flex items-center gap-2">
                  <Gift className="w-3 h-3 text-green-500" />
                  <p className="text-white capitalize">{booking.celebrating_birthday || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Booked On</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-green-500" />
                  <p className="text-white">{format(new Date(booking.created_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Information */}
          <div className="bg-black rounded-lg p-6 border border-zinc-800">
            <h3 className="text-green-500 font-black uppercase text-sm mb-4 flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Travel Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-yellow-400 font-bold mb-3 uppercase text-xs">Arrival</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 text-xs">Airline</p>
                    <p className="text-white">{booking.arrival_airline || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Date & Time</p>
                    <p className="text-white">
                      {booking.arrival_date ? format(new Date(booking.arrival_date), 'MMM d, yyyy') : 'Not provided'}
                      {booking.arrival_time && ` at ${booking.arrival_time}`}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-yellow-400 font-bold mb-3 uppercase text-xs">Departure</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 text-xs">Airline</p>
                    <p className="text-white">{booking.departure_airline || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Date & Time</p>
                    <p className="text-white">
                      {booking.departure_date ? format(new Date(booking.departure_date), 'MMM d, yyyy') : 'Not provided'}
                      {booking.departure_time && ` at ${booking.departure_time}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-black rounded-lg p-6 border border-zinc-800">
              <h3 className="text-green-500 font-black uppercase text-sm mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Special Notes
              </h3>
              <p className="text-gray-300">{booking.notes}</p>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-black rounded-lg p-6 border border-zinc-800">
            <h3 className="text-green-500 font-black uppercase text-sm mb-4">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Total Price</p>
                <p className="text-yellow-400 font-black text-2xl">${booking.total_price?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Amount Paid</p>
                <p className="text-green-400 font-black text-2xl">${(booking.amount_paid || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Balance Due</p>
                <p className="text-orange-400 font-black text-2xl">
                  ${(booking.total_price - (booking.amount_paid || 0)).toLocaleString()}
                </p>
              </div>
            </div>
            {booking.due_date && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-gray-400 text-xs">Payment Due Date: <span className="text-white font-bold">{format(new Date(booking.due_date), 'MMMM d, yyyy')}</span></p>
              </div>
            )}

            {/* Refund Information */}
            {booking.refund_amount && (
              <div className="mt-4 bg-blue-900/30 border border-blue-600/30 p-4 rounded-lg space-y-2">
                <h5 className="text-blue-400 font-bold uppercase text-xs">Refund Details</h5>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Refund Amount:</span>
                  <span className="text-blue-400 font-bold">${booking.refund_amount?.toLocaleString()}</span>
                </div>
                {booking.refund_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Refund Date:</span>
                    <span className="text-white">{format(new Date(booking.refund_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {booking.refund_method && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Refund Method:</span>
                    <span className="text-white capitalize">{booking.refund_method.replace('_', ' ')}</span>
                  </div>
                )}
                {booking.refund_notes && (
                  <div className="text-sm pt-2 border-t border-blue-600/20">
                    <span className="text-gray-400">Notes:</span>
                    <p className="text-white mt-1">{booking.refund_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}