import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function BookingConfirmation() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking_id');
    if (!bookingId) { setLoading(false); return; }

    base44.entities.Booking.get(bookingId)
      .then(setBooking)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-white text-4xl font-black uppercase tracking-tight">You're In!</h1>
        <p className="text-zinc-400 text-lg">
          Your booking is confirmed. Check your email for details.
        </p>
        {booking && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Name</span>
              <span className="text-white font-bold">{booking.first_name} {booking.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Package</span>
              <span className="text-white font-bold">{booking.package_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Payment</span>
              <span className="text-white font-bold capitalize">{booking.payment_option === 'plan' ? 'Installment Plan' : 'Paid in Full'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Status</span>
              <span className="text-green-400 font-bold capitalize">{booking.status}</span>
            </div>
          </div>
        )}
        <Link to="/" className="inline-block bg-green-600 hover:bg-green-700 text-white font-black px-8 py-3 rounded uppercase tracking-wide transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}