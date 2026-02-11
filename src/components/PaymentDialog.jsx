import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Calendar } from 'lucide-react';

export default function PaymentDialog({ booking, isOpen, onClose, onSave }) {
  const [amountPaid, setAmountPaid] = useState(booking?.amount_paid || 0);
  const [dueDate, setDueDate] = useState(booking?.due_date || '');

  const handleSave = () => {
    const totalPaid = Number(amountPaid);
    const totalPrice = booking.total_price;
    
    let newPaymentStatus = 'pending';
    if (totalPaid >= totalPrice) {
      newPaymentStatus = 'paid';
    } else if (totalPaid > 0) {
      newPaymentStatus = 'partially_paid';
    }

    onSave({
      amount_paid: totalPaid,
      due_date: dueDate,
      payment_status: newPaymentStatus,
    });
  };

  const remainingBalance = booking?.total_price - amountPaid;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-green-600/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase text-xl">
            Record Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-black rounded-lg p-4 border border-zinc-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Guest</span>
              <span className="text-white font-bold">{booking?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Price</span>
              <span className="text-yellow-400 font-black text-lg">
                ${booking?.total_price?.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-white font-bold mb-2 block uppercase text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Amount Paid
            </Label>
            <Input
              type="number"
              min="0"
              max={booking?.total_price}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="bg-black border-zinc-700 text-white"
              placeholder="0.00"
            />
            <p className="text-sm text-gray-400 mt-1">
              Remaining: ${remainingBalance.toLocaleString()}
            </p>
          </div>

          <div>
            <Label className="text-white font-bold mb-2 block uppercase text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              Payment Due Date
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-black border-zinc-700 text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white font-black uppercase"
          >
            Save Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}