import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function PaymentManager() {
  const [selectedTrip, setSelectedTrip] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['payments-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  // Fetch trips
  const { data: trips = [] } = useQuery({
    queryKey: ['payments-trips'],
    queryFn: () => base44.entities.Trip.list(),
  });

  // ---- Trip Filter ----
  const tripFiltered = bookings.filter((b) =>
    selectedTrip === 'all' ? true : b.trip_id === selectedTrip
  );

  const filtered = tripFiltered.filter((b) =>
    filterStatus === 'all' ? true : b.status === filterStatus
  );

  // ---- Calculations (PER TRIP) ----
  const totalRevenue = tripFiltered.reduce(
    (sum, b) => sum + (Number(b.amount_paid_cents) || 0),
    0
  );

  const totalOutstanding = tripFiltered.reduce((sum, b) => {
    const total = Number(b.total_price_cents) || 0;
    const paid = Number(b.amount_paid_cents) || 0;
    return sum + (total - paid);
  }, 0);

  const totalBookings = tripFiltered.length;

  const formatCurrency = (cents) =>
    `$${(Number(cents) / 100).toFixed(2)}`;

  const getTripName = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    return trip?.name || 'Unknown Trip';
  };

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-black uppercase">Payment Manager</h1>

      {/* Trip Filter */}
      <div className="flex gap-4">

        <Select value={selectedTrip} onValueChange={setSelectedTrip}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Trip" />
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

      </div>

      {/* Trip Summary */}
      <div className="grid md:grid-cols-3 gap-4">

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
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold">
              {totalBookings}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedTrip === 'all'
              ? 'All Trip Payments'
              : `Payments for ${getTripName(selectedTrip)}`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Trip</TableHead>
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
                    <TableCell>{getTripName(b.trip_id)}</TableCell>
                    <TableCell>{formatCurrency(total)}</TableCell>
                    <TableCell>{formatCurrency(paid)}</TableCell>
                    <TableCell>{formatCurrency(remaining)}</TableCell>
                    <TableCell>
                      <Badge>
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