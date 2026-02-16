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
import { Calendar, Save, Trash2, Plus } from "lucide-react";

export default function TripManager() {
  const queryClient = useQueryClient();
  const [selectedTripId, setSelectedTripId] = useState(null);

  const [tripForm, setTripForm] = useState({
    slug: "",
    name: "",
    location: "",
    start_date: "",
    end_date: "",
    payment_plan_enabled: true,
    plan_cutoff_date: "",
    deposit_per_person: 250,
    installment_count: 4,
    plan_dates: [],
    processing_fee_enabled: true,
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
      ...trip,
      plan_dates: trip.plan_dates || [],
    });
  }, [selectedTripId, trips]);

  // Save mutation (create or update)
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (selectedTripId) {
        return base44.entities.Trip.update(selectedTripId, tripForm);
      } else {
        return base44.entities.Trip.create(tripForm);
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

  const addInstallmentDate = () => {
    setTripForm({
      ...tripForm,
      plan_dates: [...tripForm.plan_dates, ""],
    });
  };

  const removeInstallmentDate = (index) => {
    const updated = tripForm.plan_dates.filter((_, i) => i !== index);
    setTripForm({ ...tripForm, plan_dates: updated });
  };

  const updateInstallmentDate = (index, value) => {
    const updated = [...tripForm.plan_dates];
    updated[index] = value;
    setTripForm({ ...tripForm, plan_dates: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create / Edit Trip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Trip Selection */}
          <Select value={selectedTripId || ""} onValueChange={setSelectedTripId}>
            <SelectTrigger>
              <SelectValue placeholder="Select existing trip..." />
            </SelectTrigger>
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  {trip.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Trip Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trip Name</Label>
              <Input
                value={tripForm.name}
                onChange={(e) =>
                  setTripForm({ ...tripForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Slug</Label>
              <Input
                value={tripForm.slug}
                onChange={(e) =>
                  setTripForm({ ...tripForm, slug: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={tripForm.location}
                onChange={(e) =>
                  setTripForm({ ...tripForm, location: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={tripForm.start_date}
                onChange={(e) =>
                  setTripForm({ ...tripForm, start_date: e.target.value })
                }
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={tripForm.end_date}
                onChange={(e) =>
                  setTripForm({ ...tripForm, end_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* Payment Settings */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-bold">Payment Plan Settings</h3>

            <div className="flex justify-between items-center">
              <Label>Enable Payment Plan</Label>
              <Switch
                checked={tripForm.payment_plan_enabled}
                onCheckedChange={(val) =>
                  setTripForm({ ...tripForm, payment_plan_enabled: val })
                }
              />
            </div>

            {tripForm.payment_plan_enabled && (
              <>
                <div>
                  <Label>Plan Cutoff Date</Label>
                  <Input
                    type="date"
                    value={tripForm.plan_cutoff_date}
                    onChange={(e) =>
                      setTripForm({
                        ...tripForm,
                        plan_cutoff_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Deposit Per Person</Label>
                  <Input
                    type="number"
                    value={tripForm.deposit_per_person}
                    onChange={(e) =>
                      setTripForm({
                        ...tripForm,
                        deposit_per_person: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Number of Installments</Label>
                  <Input
                    type="number"
                    value={tripForm.installment_count}
                    onChange={(e) =>
                      setTripForm({
                        ...tripForm,
                        installment_count: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* Installment Dates */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Installment Dates
                  </Label>

                  {tripForm.plan_dates.map((date, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) =>
                          updateInstallmentDate(index, e.target.value)
                        }
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeInstallmentDate(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button onClick={addInstallmentDate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Installment Date
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Trip"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}