import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Calendar } from 'lucide-react';

export default function RefundDialog({ booking, isOpen, onClose, onSave }) {
  const [refundAmount, setRefundAmount] = useState(booking.refund_amount || booking.amount_paid || 0);
  const [refundDate, setRefundDate] = useState(
    booking.refund_date || new Date().toISOString().split('T')[0]
  );
  const [refundMethod, setRefundMethod] = useState(booking.refund_method || 'credit_card');
  const [refundNotes, setRefundNotes] = useState(booking.refund_notes || '');

  const handleSave = () => {
    onSave({
      refund_amount: parseFloat(refundAmount),
      refund_date: refundDate,
      refund_method: refundMethod,
      refund_notes: refundNotes,
      payment_status: 'refunded',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-green-600/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase">
            Record Refund - {booking.first_name} {booking.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-zinc-800 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Booking Amount:</span>
              <span className="text-white font-bold">${booking.total_price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Amount Paid:</span>
              <span className="text-green-400 font-bold">${(booking.amount_paid || 0).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <Label className="text-white font-bold mb-2 block uppercase text-sm">
              Refund Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="bg-black border-zinc-700 text-white pl-10"
                placeholder="0.00"
                step="0.01"
                min="0"
                max={booking.amount_paid || booking.total_price}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum refundable: ${(booking.amount_paid || 0).toLocaleString()}
            </p>
          </div>

          <div>
            <Label className="text-white font-bold mb-2 block uppercase text-sm">
              Refund Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={refundDate}
                onChange={(e) => setRefundDate(e.target.value)}
                className="bg-black border-zinc-700 text-white pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-white font-bold mb-2 block uppercase text-sm">
              Refund Method
            </Label>
            <Select value={refundMethod} onValueChange={setRefundMethod}>
              <SelectTrigger className="bg-black border-zinc-700 text-white">
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

          <div>
            <Label className="text-white font-bold mb-2 block uppercase text-sm">
              Notes (Optional)
            </Label>
            <textarea
              value={refundNotes}
              onChange={(e) => setRefundNotes(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white rounded-md px-3 py-2 min-h-[80px] text-sm"
              placeholder="Additional notes about the refund..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              Save Refund
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}