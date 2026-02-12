import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GuestInfoEditor({ booking }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: booking?.phone || '',
    tshirt_size: booking?.tshirt_size || '',
    bed_preference: booking?.bed_preference || '',
    notes: booking?.notes || '',
    arrival_airline: booking?.arrival_airline || '',
    arrival_date: booking?.arrival_date || '',
    arrival_time: booking?.arrival_time || '',
    departure_airline: booking?.departure_airline || '',
    departure_date: booking?.departure_date || '',
    departure_time: booking?.departure_time || '',
    guest2_phone: booking?.guest2_phone || '',
    guest2_tshirt_size: booking?.guest2_tshirt_size || '',
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Booking.update(booking.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestBooking'] });
      setIsEditing(false);
      toast.success('Information updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update information. Please try again.');
    },
  });

  const handleSave = () => {
    // Check permissions before saving
    const canEdit = user?.role === 'admin' || user?.email === booking?.email;
    if (!canEdit) {
      toast.error('You do not have permission to edit this booking');
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      phone: booking?.phone || '',
      tshirt_size: booking?.tshirt_size || '',
      bed_preference: booking?.bed_preference || '',
      notes: booking?.notes || '',
      arrival_airline: booking?.arrival_airline || '',
      arrival_date: booking?.arrival_date || '',
      arrival_time: booking?.arrival_time || '',
      departure_airline: booking?.departure_airline || '',
      departure_date: booking?.departure_date || '',
      departure_time: booking?.departure_time || '',
      guest2_phone: booking?.guest2_phone || '',
      guest2_tshirt_size: booking?.guest2_tshirt_size || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-400">Update your contact information, preferences, and travel details</p>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Information
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-zinc-700 text-white"
              disabled={updateMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white font-black uppercase text-sm">
              Contact & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white font-bold mb-2 block uppercase text-xs">
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-black border-zinc-700 text-white"
                />
              ) : (
                <p className="text-gray-400">{booking?.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <Label className="text-white font-bold mb-2 block uppercase text-xs">
                T-Shirt Size
              </Label>
              {isEditing ? (
                <Select
                  value={formData.tshirt_size}
                  onValueChange={(value) => setFormData({ ...formData, tshirt_size: value })}
                >
                  <SelectTrigger className="bg-black border-zinc-700 text-white">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-400">{booking?.tshirt_size || 'Not provided'}</p>
              )}
            </div>

            <div>
              <Label className="text-white font-bold mb-2 block uppercase text-xs">
                Bed Preference
              </Label>
              {isEditing ? (
                <Select
                  value={formData.bed_preference}
                  onValueChange={(value) => setFormData({ ...formData, bed_preference: value })}
                >
                  <SelectTrigger className="bg-black border-zinc-700 text-white">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="king">King</SelectItem>
                    <SelectItem value="double">Double Beds</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-400 capitalize">{booking?.bed_preference || 'Not provided'}</p>
              )}
            </div>

            <div>
              <Label className="text-white font-bold mb-2 block uppercase text-xs">
                Notes to Organizer
              </Label>
              {isEditing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-black border border-zinc-700 text-white rounded-md px-3 py-2 min-h-[80px]"
                  placeholder="Any special requests or notes..."
                />
              ) : (
                <p className="text-gray-400">{booking?.notes || 'No notes'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white font-black uppercase text-sm">
              Travel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-green-500 font-bold mb-3 uppercase text-xs">Arrival</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-white font-bold mb-2 block uppercase text-xs">
                    Airline
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.arrival_airline}
                      onChange={(e) => setFormData({ ...formData, arrival_airline: e.target.value })}
                      className="bg-black border-zinc-700 text-white"
                      placeholder="e.g., Delta"
                    />
                  ) : (
                    <p className="text-gray-400">{booking?.arrival_airline || 'Not provided'}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white font-bold mb-2 block uppercase text-xs">
                      Date
                    </Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.arrival_date}
                        onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                        className="bg-black border-zinc-700 text-white"
                      />
                    ) : (
                      <p className="text-gray-400">
                        {booking?.arrival_date ? new Date(booking.arrival_date).toLocaleDateString() : 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-white font-bold mb-2 block uppercase text-xs">
                      Time
                    </Label>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={formData.arrival_time}
                        onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                        className="bg-black border-zinc-700 text-white"
                      />
                    ) : (
                      <p className="text-gray-400">{booking?.arrival_time || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <p className="text-green-500 font-bold mb-3 uppercase text-xs">Departure</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-white font-bold mb-2 block uppercase text-xs">
                    Airline
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.departure_airline}
                      onChange={(e) => setFormData({ ...formData, departure_airline: e.target.value })}
                      className="bg-black border-zinc-700 text-white"
                      placeholder="e.g., United"
                    />
                  ) : (
                    <p className="text-gray-400">{booking?.departure_airline || 'Not provided'}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white font-bold mb-2 block uppercase text-xs">
                      Date
                    </Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.departure_date}
                        onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                        className="bg-black border-zinc-700 text-white"
                      />
                    ) : (
                      <p className="text-gray-400">
                        {booking?.departure_date ? new Date(booking.departure_date).toLocaleDateString() : 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-white font-bold mb-2 block uppercase text-xs">
                      Time
                    </Label>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={formData.departure_time}
                        onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                        className="bg-black border-zinc-700 text-white"
                      />
                    ) : (
                      <p className="text-gray-400">{booking?.departure_time || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {booking?.guest2_first_name && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white font-black uppercase text-sm">
                Second Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white font-bold mb-2 block uppercase text-xs">
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.guest2_phone}
                    onChange={(e) => setFormData({ ...formData, guest2_phone: e.target.value })}
                    className="bg-black border-zinc-700 text-white"
                  />
                ) : (
                  <p className="text-gray-400">{booking?.guest2_phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block uppercase text-xs">
                  T-Shirt Size
                </Label>
                {isEditing ? (
                  <Select
                    value={formData.guest2_tshirt_size}
                    onValueChange={(value) => setFormData({ ...formData, guest2_tshirt_size: value })}
                  >
                    <SelectTrigger className="bg-black border-zinc-700 text-white">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-gray-400">{booking?.guest2_tshirt_size || 'Not provided'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}