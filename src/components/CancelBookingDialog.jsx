import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CancelBookingDialog({ booking, isOpen, onClose, onConfirm, isAdmin = false }) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canCancel = () => {
    if (isAdmin) return true; // Admins can cancel anytime
    
    if (!booking?.arrival_date) return false;
    
    const arrivalDate = new Date(booking.arrival_date);
    const today = new Date();
    const daysUntilArrival = Math.ceil((arrivalDate - today) / (1000 * 60 * 60 * 24));
    
    return daysUntilArrival > 14;
  };

  const getDaysUntilArrival = () => {
    if (!booking?.arrival_date) return null;
    
    const arrivalDate = new Date(booking.arrival_date);
    const today = new Date();
    const daysUntilArrival = Math.ceil((arrivalDate - today) / (1000 * 60 * 60 * 24));
    
    return daysUntilArrival;
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setIsLoading(false);
    }
  };

  const daysUntilArrival = getDaysUntilArrival();
  const canProceed = canCancel();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-red-600/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-white flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-500" />
            Cancel Booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!canProceed && !isAdmin && (
            <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-white font-bold mb-1">Cancellation Not Available</p>
                  <p className="text-gray-300 text-sm">
                    Bookings can only be cancelled more than 14 days before arrival. 
                    {daysUntilArrival !== null && (
                      <> You have {daysUntilArrival} day{daysUntilArrival !== 1 ? 's' : ''} until arrival.</>
                    )}
                  </p>
                  <p className="text-gray-300 text-sm mt-2">
                    Please contact support for assistance: info@lostinjamaica.com
                  </p>
                </div>
              </div>
            </div>
          )}

          {canProceed && (
            <>
              <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-white font-bold mb-1">Are you sure?</p>
                    <p className="text-gray-300 text-sm">
                      This action cannot be undone. Your booking will be cancelled and our team will be notified.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Booking Details:</p>
                  <div className="bg-black rounded-lg p-3 space-y-1 text-sm">
                    <p className="text-white">Guest: {booking?.first_name} {booking?.last_name}</p>
                    <p className="text-gray-400">Email: {booking?.email}</p>
                    <p className="text-gray-400">Package: {booking?.package}</p>
                    <p className="text-yellow-400 font-bold">Total: ${booking?.total_price?.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-white font-bold mb-2 block uppercase text-sm">
                    Reason for Cancellation {isAdmin && '(Optional)'}
                  </Label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-black border border-zinc-700 text-white rounded-md px-3 py-2 min-h-[80px]"
                    placeholder="Please provide a reason..."
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
            >
              {canProceed ? 'Keep Booking' : 'Close'}
            </Button>
            {canProceed && (
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}