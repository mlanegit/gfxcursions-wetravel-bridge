import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TripPaymentAdmin() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (currentUser?.role !== 'admin') {
          window.location.href = '/';
          return;
        }

        const tripsData = await base44.entities.Trip.list();
        setTrips(tripsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load user or trips:', error);
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleAddDate = () => {
    setSelectedTrip(prev => {
      if (prev.plan_dates?.length >= 10) return prev;
      return {
        ...prev,
        plan_dates: [...(prev.plan_dates || []), ""]
      };
    });
  };

  const handleRemoveDate = (index) => {
    setSelectedTrip(prev => ({
      ...prev,
      plan_dates: prev.plan_dates.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!selectedTrip) {
      toast.error('Please select a trip');
      return;
    }

    setIsSaving(true);

    try {
      await base44.entities.Trip.update(selectedTrip.id, {
        deposit_per_person: parseFloat(selectedTrip.deposit_per_person) || 250,
        payment_plan_enabled: selectedTrip.payment_plan_enabled ?? true,
        plan_cutoff_date: selectedTrip.plan_cutoff_date || null,
        plan_dates: (selectedTrip.plan_dates || []).filter(date => date !== ''),
      });

      toast.success('Trip payment settings saved successfully');

      const updatedTrips = await base44.entities.Trip.list();
      setTrips(updatedTrips);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black uppercase mb-8 text-yellow-400">
          Trip Payment Administration
        </h1>

        <Card className="bg-zinc-900 border-green-600/30">
          <CardHeader>
            <CardTitle className="text-white text-xl font-black uppercase">
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trip Selector */}
            <div className="border-b border-zinc-800 pb-6">
              <Label className="text-white font-bold mb-2 block uppercase text-sm">
                Trip Selector
              </Label>
              <Select
                value={selectedTrip?.id}
                onValueChange={(id) => {
                  const trip = trips.find(t => t.id === id);
                  setSelectedTrip(trip);
                }}
              >
                <SelectTrigger className="bg-black border-zinc-700 text-white">
                  <SelectValue placeholder="Select a trip" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTrip && (
              <>
                {/* Deposit Per Person */}
                <div className="border-b border-zinc-800 pb-6">
                  <Label className="text-white font-bold mb-2 block uppercase text-sm">
                    Deposit Per Person
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <Input
                      type="number"
                      value={selectedTrip?.deposit_per_person || ''}
                      onChange={(e) =>
                        setSelectedTrip(prev => ({
                          ...prev,
                          deposit_per_person: Number(e.target.value),
                        }))
                      }
                      className="bg-black border-zinc-700 text-white"
                      placeholder="250"
                    />
                  </div>
                </div>

                {/* Enable Payment Plan */}
                <div className="border-b border-zinc-800 pb-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-white font-bold uppercase text-sm">
                      Enable Payment Plan
                    </Label>
                    <Switch
                      checked={selectedTrip?.payment_plan_enabled}
                      onCheckedChange={(value) =>
                        setSelectedTrip(prev => ({
                          ...prev,
                          payment_plan_enabled: value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Plan Cutoff Date */}
                <div className="border-b border-zinc-800 pb-6">
                  <Label className="text-white font-bold mb-2 block uppercase text-sm">
                    Plan Cutoff Date
                  </Label>
                  <Input
                    type="date"
                    value={selectedTrip?.plan_cutoff_date || ""}
                    onChange={(e) =>
                      setSelectedTrip(prev => ({
                        ...prev,
                        plan_cutoff_date: e.target.value
                      }))
                    }
                    className="bg-black border-zinc-700 text-white"
                  />
                </div>

                {/* Installment Dates */}
                <div className="border-b border-zinc-800 pb-6">
                  <Label className="text-white font-bold mb-3 block uppercase text-sm">
                    Installment Dates (Dynamic List)
                  </Label>
                  <div className="space-y-3">
                    {selectedTrip?.plan_dates?.map((date, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-gray-400 w-6">{index + 1}.</span>
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => {
                            const updated = [...selectedTrip.plan_dates];
                            updated[index] = e.target.value;
                            setSelectedTrip(prev => ({
                              ...prev,
                              plan_dates: updated
                            }));
                          }}
                          className="bg-black border-zinc-700 text-white flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDate(index)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() =>
                        setSelectedTrip(prev => {
                          if (prev.plan_dates?.length >= 10) return prev;
                          return {
                            ...prev,
                            plan_dates: [...(prev.plan_dates || []), ""]
                          };
                        })
                      }
                      className="border-green-600/30 text-green-500 hover:bg-green-600/10 w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      + Add Installment Date
                    </Button>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white font-black uppercase w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}