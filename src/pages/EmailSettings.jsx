import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Mail, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailSettings() {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    subject: '',
    body: '',
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date'),
    initialData: [],
    enabled: user?.role === 'admin',
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Email template created');
      setIsCreating(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create template');
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Email template updated');
      setEditingTemplate(null);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Email template deleted');
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      trigger: '',
      subject: '',
      body: '',
      is_active: true,
    });
  };

  const handleEdit = (template) => {
    setEditingTemplate(template.id);
    setFormData({
      name: template.name,
      trigger: template.trigger,
      subject: template.subject,
      body: template.body,
      is_active: template.is_active,
    });
  };

  const handleSave = () => {
    if (isCreating) {
      createTemplateMutation.mutate(formData);
    } else if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate, data: formData });
    }
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsCreating(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this email template?')) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const triggerLabels = {
    booking_confirmed: 'Booking Confirmed',
    payment_received: 'Payment Received',
    booking_cancelled: 'Booking Cancelled',
    payment_reminder: 'Payment Reminder',
    arrival_reminder: 'Arrival Reminder',
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-6">
        <Card className="bg-zinc-900 border-red-600/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-xl font-bold mb-2">Access Denied</div>
            <p className="text-gray-400">You must be an administrator to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-4xl font-black uppercase mb-2">Email Notifications</h1>
            <p className="text-gray-400">Manage automated email templates</p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        {(isCreating || editingTemplate) && (
          <Card className="bg-zinc-900 border-green-600/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white font-black uppercase flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-500" />
                {isCreating ? 'Create New Template' : 'Edit Template'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-bold mb-2 block uppercase text-sm">
                    Template Name
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-black border-zinc-700 text-white"
                    placeholder="e.g., Booking Confirmation Email"
                  />
                </div>

                <div>
                  <Label className="text-white font-bold mb-2 block uppercase text-sm">
                    Trigger Event
                  </Label>
                  <Select
                    value={formData.trigger}
                    onValueChange={(value) => setFormData({ ...formData, trigger: value })}
                  >
                    <SelectTrigger className="bg-black border-zinc-700 text-white">
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking_confirmed">Booking Confirmed</SelectItem>
                      <SelectItem value="payment_received">Payment Received</SelectItem>
                      <SelectItem value="booking_cancelled">Booking Cancelled</SelectItem>
                      <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                      <SelectItem value="arrival_reminder">Arrival Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block uppercase text-sm">
                  Subject Line
                </Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-black border-zinc-700 text-white"
                  placeholder="e.g., Your Lost in Jamaica Booking is Confirmed!"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block uppercase text-sm">
                  Email Body
                </Label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full bg-black border border-zinc-700 text-white rounded-md px-3 py-2 min-h-[200px] font-mono text-sm"
                  placeholder="Email content... Use variables like {{first_name}}, {{package}}, {{total_price}}"
                />
                <p className="text-gray-500 text-xs mt-2">
                  Available variables: {'{'}{'{'} first_name {'}'}{'}'},  {'{'}{'{'} last_name {'}'}{'}'},  {'{'}{'{'} email {'}'}{'}'},  {'{'}{'{'} package {'}'}{'}'},  {'{'}{'{'} total_price {'}'}{'}'},  {'{'}{'{'} arrival_date {'}'}{'}'} 
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label className="text-white font-bold uppercase text-sm">
                  Active
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                  disabled={!formData.name || !formData.trigger || !formData.subject || !formData.body}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating ? 'Create Template' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoadingTemplates ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12 text-center">
              <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No email templates yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-black text-lg">{template.name}</h3>
                        {template.is_active ? (
                          <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        Trigger: <span className="text-green-500 font-bold">{triggerLabels[template.trigger]}</span>
                      </p>
                      <p className="text-white text-sm mb-1">
                        <span className="font-bold">Subject:</span> {template.subject}
                      </p>
                      <p className="text-gray-500 text-xs line-clamp-2">{template.body}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(template)}
                        className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
                        className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}