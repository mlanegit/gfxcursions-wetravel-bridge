import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function InstallmentManager({ bookingId, booking }) {
  const queryClient = useQueryClient();
  const [showChargeDialog, setShowChargeDialog] = useState(false);
  const [showWaiverDialog, setShowWaiverDialog] = useState(false);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState(null);
  const [waiverAmount, setWaiverAmount] = useState('');

  // Fetch installments for this booking
  const { data: installments = [] } = useQuery({
    queryKey: ['installments', bookingId],
    queryFn: () => 
      base44.entities.PaymentInstallment.filter({ booking_id: bookingId }, '-due_date'),
    enabled: !!bookingId,
  });

  const chargeMutation = useMutation({
    mutationFn: async (installmentId) => {
      const installment = installments.find(i => i.id === installmentId);
      if (!installment) throw new Error('Installment not found');
      
      // Call chargeInstallments function for manual charge
      const response = await base44.functions.invoke('chargeInstallments', {
        manual_charge_id: installmentId,
        booking_id: bookingId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['payments-bookings'] });
      toast.success('Payment charged successfully');
      setShowChargeDialog(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to charge payment');
    },
  });

  const waiverMutation = useMutation({
    mutationFn: async (installmentId) => {
      const amount = Number(waiverAmount) * 100; // Convert to cents
      if (amount <= 0) throw new Error('Waiver amount must be greater than 0');
      
      await base44.entities.PaymentInstallment.update(installmentId, {
        status: 'cancelled',
        notes: `Waived $${waiverAmount}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['payments-bookings'] });
      toast.success('Installment waived');
      setShowWaiverDialog(false);
      setWaiverAmount('');
      setSelectedInstallmentId(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to waive installment');
    },
  });

  const formatCurrency = (cents) => `$${(Number(cents) / 100).toFixed(2)}`;

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      retrying: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalInstallments = installments.length;
  const paidInstallments = installments.filter(i => i.status === 'paid').length;
  const failedInstallments = installments.filter(i => i.status === 'failed').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {totalInstallments > 0 && (
        <div className="flex gap-2 text-sm">
          <span className="text-gray-600">Installments: {paidInstallments}/{totalInstallments} paid</span>
          {failedInstallments > 0 && (
            <span className="text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {failedInstallments} failed
            </span>
          )}
        </div>
      )}

      {/* Installments List */}
      {installments.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No installments</p>
      ) : (
        <div className="space-y-2">
          {installments.map((inst) => (
            <div
              key={inst.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {formatCurrency(inst.amount_cents)}
                  </span>
                  <Badge className={getStatusColor(inst.status)}>
                    {inst.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Due: {new Date(inst.due_date).toLocaleDateString()}
                  {inst.is_deposit && ' (Deposit)'}
                </p>
              </div>

              <div className="flex gap-2">
                {inst.status === 'scheduled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedInstallmentId(inst.id);
                      setShowChargeDialog(true);
                    }}
                    className="text-xs"
                  >
                    <Zap className="w-3 h-3 mr-1" /> Charge
                  </Button>
                )}

                {(inst.status === 'scheduled' || inst.status === 'failed') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedInstallmentId(inst.id);
                      setWaiverAmount((inst.amount_cents / 100).toString());
                      setShowWaiverDialog(true);
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Waive
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charge Dialog */}
      <Dialog open={showChargeDialog} onOpenChange={setShowChargeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Charge Installment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to charge this installment via Stripe?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowChargeDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedInstallmentId && chargeMutation.mutate(selectedInstallmentId)
                }
                disabled={chargeMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {chargeMutation.isPending ? 'Charging...' : 'Charge'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waiver Dialog */}
      <Dialog open={showWaiverDialog} onOpenChange={setShowWaiverDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Waive Installment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Waiver Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={waiverAmount}
                onChange={(e) => setWaiverAmount(e.target.value)}
                className="mt-1"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-600">
              This installment will be marked as cancelled and forgiven.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowWaiverDialog(false);
                  setWaiverAmount('');
                  setSelectedInstallmentId(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedInstallmentId && waiverMutation.mutate(selectedInstallmentId)
                }
                disabled={waiverMutation.isPending || !waiverAmount}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {waiverMutation.isPending ? 'Waiving...' : 'Waive'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}