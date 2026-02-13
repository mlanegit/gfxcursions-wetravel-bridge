import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Calendar, DollarSign, Save, Plus, Trash2 } from 'lucide-react';

export default function TripPaymentSettings() {
  const [selectedTripId, setSelectedTripId] = useState('');
  const [settings, setSettings] = useState({
    payment_plan_enabled: true,
    plan_cutoff_date: '',
    deposit_per_person: 250,
    max_installments: 4,
    installment_dates: ['', '', '', '']
  });

  const queryClient = useQueryClient();

  // Fetch all trips
  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date')
  });

  // Fetch payment settings for selected trip
  const { data: paymentSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['trip-payment-settings', selectedTripId],
    queryFn: async () => {
      if (!selectedTripId) return null;
      const results = await base44.entities.TripPaymentSettings.filter({ trip_id: selectedTripId });
      return results.length > 0 ? results[0] : null;
    },
    enabled: !!selectedTripId
  });

  // Load settings when payment settings change
  useEffect(() => {
    if (paymentSettings) {
      setSettings({
        payment_plan_enabled: paymentSettings.payment_plan_enabled ?? true,
        plan_cutoff_date: paymentSettings.plan_cutoff_date || '',
        deposit_per_person: paymentSettings.deposit_per_person || 250,
        max_installments: paymentSettings.max_installments || 4,
        installment_dates: paymentSettings.installment_dates || Array(paymentSettings.max_installments || 4).fill('')
      });
    } else if (selectedTripId) {
      // Reset to defaults when no settings exist
      setSettings({
        payment_plan_enabled: true,
        plan_cutoff_date: '',
        deposit_per_person: 250,
        max_installments: 4,
        installment_dates: ['', '', '', '']
      });
    }
  }, [paymentSettings, selectedTripId]);

  // Create or update settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (paymentSettings) {
        return await base44.entities.TripPaymentSettings.update(paymentSettings.id, data);
      } else {
        return await base44.entities.TripPaymentSettings.create({ ...data, trip_id: selectedTripId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trip-payment-settings', selectedTripId]);
      toast.success('Payment settings saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save settings: ' + error.message);
    }
  });

  const handleInstallmentCountChange = (count) => {
    const numCount = parseInt(count);
    setSettings({
      ...settings,
      max_installments: numCount,
      installment_dates: Array(numCount).fill('').map((_, i) => settings.installment_dates[i] || '')
    });
  };

  const handleInstallmentDateChange = (index, value) => {
    const newDates = [...settings.installment_dates];
    newDates[index] = value;
    setSettings({ ...settings, installment_dates: newDates });
  };

  const handleSave = () => {
    if (!selectedTripId) {
      toast.error('Please select a trip');
      return;
    }

    // Validate installment dates
    const validDates = settings.installment_dates.filter(d => d !== '');
    if (settings.payment_plan_enabled && validDates.length === 0) {
      toast.error('Please add at least one installment date');
      return;
    }

    saveSettingsMutation.mutate({
      payment_plan_enabled: settings.payment_plan_enabled,
      plan_cutoff_date: settings.plan_cutoff_date,
      deposit_per_person: parseInt(settings.deposit_per_person),
      max_installments: parseInt(settings.max_installments),
      installment_dates: settings.installment_dates.filter(d => d !== '').sort()
    });
  };

  if (tripsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Trip Payment Settings</h1>
        </div>

        {/* Trip Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTripId} onValueChange={setSelectedTripId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a trip..." />
              </SelectTrigger>
              <SelectContent>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name} ({trip.active ? 'Active' : 'Inactive'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Settings Form */}
        {selectedTripId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Plan Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsLoading ? (
                <p className="text-gray-600">Loading settings...</p>
              ) : (
                <>
                  {/* Payment Plan Enabled */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Payment Plan Enabled</Label>
                      <p className="text-sm text-gray-500">Allow guests to pay in installments</p>
                    </div>
                    <Switch
                      checked={settings.payment_plan_enabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, payment_plan_enabled: checked })}
                    />
                  </div>

                  {settings.payment_plan_enabled && (
                    <>
                      {/* Plan Cutoff Date */}
                      <div className="space-y-2">
                        <Label>Plan Cutoff Date</Label>
                        <p className="text-sm text-gray-500">Last date guests can choose payment plan</p>
                        <Input
                          type="date"
                          value={settings.plan_cutoff_date}
                          onChange={(e) => setSettings({ ...settings, plan_cutoff_date: e.target.value })}
                        />
                      </div>

                      {/* Deposit Per Person */}
                      <div className="space-y-2">
                        <Label>Deposit Per Person (USD)</Label>
                        <Input
                          type="number"
                          value={settings.deposit_per_person}
                          onChange={(e) => setSettings({ ...settings, deposit_per_person: e.target.value })}
                          min="0"
                        />
                      </div>

                      {/* Number of Installments */}
                      <div className="space-y-2">
                        <Label>Number of Installments</Label>
                        <Select
                          value={String(settings.max_installments)}
                          onValueChange={handleInstallmentCountChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <SelectItem key={num} value={String(num)}>
                                {num} Installment{num > 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Installment Dates */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Installment Due Dates
                        </Label>
                        <p className="text-sm text-gray-500">Set payment due dates for each installment</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {Array.from({ length: settings.max_installments }).map((_, index) => (
                            <div key={index} className="space-y-1">
                              <Label className="text-sm text-gray-600">Installment {index + 1}</Label>
                              <Input
                                type="date"
                                value={settings.installment_dates[index] || ''}
                                onChange={(e) => handleInstallmentDateChange(index, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Save Button */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSave}
                      disabled={saveSettingsMutation.isPending}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">How Payment Plans Work:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Deposit is charged per person at booking</li>
              <li>Remaining balance splits evenly across future installment dates</li>
              <li>If booking after cutoff date, only full payment is available</li>
              <li>Only future installment dates are used for calculations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}