import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Save, Trash2, Plus, AlertCircle } from "lucide-react";

export default function TripManager() {
  const queryClient = useQueryClient();
  const [selectedTripId, setSelectedTripId] = useState(null);

  const [tripForm, setTripForm] = useState({
    slug: "",
    name: "",
    description: "",
    location: "",
    hotel: "",
    start_date: "",
    end_date: "",
    deposit_per_person: 500,
    balance_due_date: "",
    late_enrollment_fee_pct: 50,
    payment_dates: [],
    is_active: true,
  });

  // Fetch trips
  const { data: trips = [] } = useQuery({
    queryKey: ["trips"],
    queryFn: () => base44.entities.Trip.list("-created_date"),
  });

  // Load selected trip into form
  useEffect(() => {
    if (!selectedTripId) return;
    const trip = trips.find((t) => t.id === selectedTripId);
    if (!trip) return;
    setTripForm({
      slug: trip.slug || "",
      name: trip.name || "",
      description: trip.description || "",
      location: trip.location || "",
      hotel: trip.hotel || "",
      start_date: trip.start_date || "",
      end_date: trip.end_date || "",
      deposit_per_person: trip.deposit_per_person || 500,
      balance_due_date: trip.balance_due_date || "",
      late_enrollment_fee_pct: trip.late_enrollment_fee_pct ?? 50,
      payment_dates: trip.payment_dates || [],
      is_active: trip.is_active ?? true,
    });
  }, [selectedTripId, trips]);

  const handleNewTrip = () => {
    setSelectedTripId(null);
    setTripForm({
      slug: "",
      name: "",
      description: "",
      location: "",
      hotel: "",
      start_date: "",
      end_date: "",
      deposit_per_person: 500,
      balance_due_date: "",
      late_enrollment_fee_pct: 50,
      payment_dates: [],
      is_active: true,
    });
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...tripForm,
        // Ensure payment_dates is sorted and clean
        payment_dates: tripForm.payment_dates.filter(Boolean).sort(),
      };
      if (selectedTripId) {
        return base44.entities.Trip.update(selectedTripId, payload);
      } else {
        return base44.entities.Trip.create(payload);
      }
    },
    onSuccess: () => {
      toast.success("Trip saved successfully");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (err) => {
      toast.error("Failed to save trip");
      console.error(err);
    },
  });

  const handleSave = () => {
    if (!tripForm.name || !tripForm.start_date || !tripForm.end_date) {
      toast.error("Trip name and dates are required");
      return;
    }
    saveMutation.mutate();
  };

  const addPaymentDate = () => {
    setTripForm({ ...tripForm, payment_dates: [...tripForm.payment_dates, ""] });
  };

  const removePaymentDate = (index) => {
    const updated = tripForm.payment_dates.filter((_, i) => i !== index);
    setTripForm({ ...tripForm, payment_dates: updated });
  };

  const updatePaymentDate = (index, value) => {
    const updated = [...tripForm.payment_dates];
    updated[index] = value;
    setTripForm({ ...tripForm, payment_dates: updated });
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Trip Manager</CardTitle>
            <Button variant="outline" size="sm" onClick={handleNewTrip}>
              <Plus className="w-4 h-4 mr-2" /> New Trip
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Trip Selection */}
          <div>
            <Label className="text-gray-400 mb-1 block">Load Existing Trip</Label>
            <Select value={selectedTripId || ""} onValueChange={setSelectedTripId}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select existing trip to edit..." />
              </SelectTrigger>
              <SelectContent>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name} {trip.is_active ? "✅" : "⛔"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Info */}
          <div className="border-t border-zinc-700 pt-6">
            <h3 className="text-white font-black uppercase text-sm mb-4">Trip Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Trip Name *</Label>
                <Input
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={tripForm.name}
                  onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-gray-400">Slug (URL key)</Label>
                <Input
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  placeholder="e.g. lij-2026"
                  value={tripForm.slug}
                  onChange={(e) => setTripForm({ ...tripForm, slug: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-gray-400">Location</Label>
                <Input
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={tripForm.location}
                  onChange={(e) => setTripForm({ ...tripForm, location: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-gray-400">Hotel</Label>
                <Input
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={tripForm.hotel}
                  onChange={(e) => setTripForm({ ...tripForm, hotel: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-gray-400">Start Date *</Label>
                <Input
                  type="date"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={tripForm.start_date}
                  onChange={(e) => setTripForm({ ...tripForm, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-gray-400">End Date *</Label>
                <Input
                  type="date"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={tripForm.end_date}
                  onChange={(e) => setTripForm({ ...tripForm, end_date: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-400">Description</Label>
                <textarea
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 text-white rounded-md p-2 text-sm"
                  rows={2}
                  value={tripForm.description}
                  onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })}
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex justify-between items-center mt-4">
              <Label className="text-gray-400">Trip Active (visible to guests)</Label>
              <Switch
                checked={tripForm.is_active}
                onCheckedChange={(val) => setTripForm({ ...tripForm, is_active: val })}
              />
            </div>
          </div>

          {/* Payment Settings */}
          <div className="border-t border-zinc-700 pt-6 space-y-4">
            <h3 className="text-white font-black uppercase text-sm">Payment Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Deposit Per Person ($)</Label>
                <Input
                  type="number"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={tripForm.deposit_per_person}
                  onChange={(e) => setTripForm({ ...tripForm, deposit_per_person: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-gray-400">Balance Due Date</Label>
                <Input
                  type="date"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={tripForm.balance_due_date}
                  onChange={(e) => setTripForm({ ...tripForm, balance_due_date: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-gray-400">Late Enrollment Fee (%)</Label>
                <Input
                  type="number"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  placeholder="e.g. 50"
                  value={tripForm.late_enrollment_fee_pct}
                  onChange={(e) => setTripForm({ ...tripForm, late_enrollment_fee_pct: Number(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">% of missed payments charged as a catch-up fee. Set to 0 to disable.</p>
              </div>
            </div>

            {/* Installment Payment Dates */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Installment Payment Dates
                </Label>
                <Button size="sm" variant="outline" onClick={addPaymentDate}>
                  <Plus className="w-4 h-4 mr-1" /> Add Date
                </Button>
              </div>

              {tripForm.payment_dates.length === 0 && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 border border-yellow-400/20 rounded-md p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  No installment dates set. Guests on a payment plan will only pay a deposit.
                </div>
              )}

              {tripForm.payment_dates.map((date, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-gray-500 text-sm w-6">#{index + 1}</span>
                  <Input
                    type="date"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    value={date}
                    onChange={(e) => updatePaymentDate(index, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => removePaymentDate(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {tripForm.payment_dates.length > 0 && (
                <p className="text-xs text-gray-500">
                  Dates will be sorted automatically when saved. Guests enrolling after any date has passed will incur the late enrollment fee.
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : selectedTripId ? "Update Trip" : "Create Trip"}
          </Button>

        </CardContent>
      </Card>

      {/* Trip List Summary */}
      {trips.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-sm uppercase">All Trips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center justify-between p-3 bg-zinc-800 rounded-md cursor-pointer hover:bg-zinc-700"
                onClick={() => setSelectedTripId(trip.id)}
              >
                <div>
                  <p className="text-white font-bold text-sm">{trip.name}</p>
                  <p className="text-gray-400 text-xs">{trip.start_date} → {trip.end_date} · {trip.payment_dates?.length || 0} payment dates</p>
                </div>
                <div className="flex items-center gap-2">
                  {trip.is_active
                    ? <span className="text-xs bg-green-600/20 text-green-400 border border-green-600/30 px-2 py-0.5 rounded-full">Active</span>
                    : <span className="text-xs bg-zinc-700 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>
                  }
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
