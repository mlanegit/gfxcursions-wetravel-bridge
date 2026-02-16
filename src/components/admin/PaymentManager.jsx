import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertTriangle } from 'lucide-react';

export default function PaymentManager() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentType, setFilterPaymentType] = useState('all');

  // Fetch bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['payments-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  // ---- Calculations ----
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (Number(b.amount_paid_cents) || 0),
    0
  );

  const totalOutstanding = bookings.reduce((sum, b) => {
    const total = Number(b.total_price_cents) || 0;
    const paid = Number(b.amount_paid_cents) || 0;
    return sum + (total - paid);
  }, 0);

  const activePlans = bookings.filter(
    (b) => b.payment_option === 'plan' && b.status === 'active_plan'
  ).length;

  const failedPayments = bookings.filter(
    (b) => b.status === 'failed' || b.status === 'past_due'
  ).length;

  // ---- Filters ----
  const filtered = bookings.filter((b) => {
    const statusMatch =
      filterStatus === 'all' || b.status === filterStatus;

    const paymentMatch =
      filterPaymentType === 'all' ||
      b.payment_option === filterPaymentType;

    return statusMatch && paymentMatch;
  });

  const formatCurrency = (cents) =>
    `$${(Number(cents) / 100).toFixed(2)}`;

  return (
    <div className="space-y-8">

      {/* Header */}
      <h1 className="text-3xl font-black uppercase">Payment Manager</h1>

      {/* Revenue Summary */}
      <div className="grid md:grid-cols-4 gap-4">

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Outstanding</p>
            <p className="text-2xl font-bold text-yellow-500">
              {formatCurrency(totalOutstanding)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Active Plans</p>
            <p className="text-2xl font-bold text-blue-600">
              {activePlans}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Failed / Past Due</p>
            <p className="text-2xl font-bold text-red-600">
              {failedPayments}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="active_plan">Active Plan</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPaymentType} onValueChange={setFilterPaymentType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Payment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="plan">Payment Plan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings Financial View</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((b) => {
                const total = Number(b.total_price_cents) || 0;
                const paid = Number(b.amount_paid_cents) || 0;
                const remaining = total - paid;

                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      {b.first_name} {b.last_name}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {b.payment_option}
                      </Badge>
                    </TableCell>

                    <TableCell>{formatCurrency(total)}</TableCell>
                    <TableCell>{formatCurrency(paid)}</TableCell>
                    <TableCell>{formatCurrency(remaining)}</TableCell>

                    <TableCell>
                      <Badge
                        className={
                          b.status === 'failed' || b.status === 'past_due'
                            ? 'bg-red-100 text-red-800'
                            : ''
                        }
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}