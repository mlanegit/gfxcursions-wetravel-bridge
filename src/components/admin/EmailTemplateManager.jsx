import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Edit2, Trash2, Check, X } from 'lucide-react';

const TRIGGERS = [
  { value: 'booking_confirmed', label: 'Booking Confirmed' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'payment_reminder_7d', label: 'Payment Reminder (7 Days)' },
  { value: 'balance_reminder_30d', label: 'Balance Reminder (30 Days)' },
  { value: 'trip_paid_in_full', label: 'Trip Paid in Full' },
  { value: 'payment_reminder', label: 'Payment Reminder' },
  { value: 'arrival_reminder', label: 'Arrival Reminder' },
  { value: 'booking_cancelled', label: 'Booking Cancelled' },
];

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    subject: '',
    body: '',
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await base44.entities.EmailTemplate.list();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      trigger: template.trigger,
      subject: template.subject,
      body: template.body,
      is_active: template.is_active !== false,
    });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await base44.entities.EmailTemplate.update(editingId, formData);
      } else {
        await base44.entities.EmailTemplate.create(formData);
      }
      setEditingId(null);
      setFormData({ name: '', trigger: '', subject: '', body: '', is_active: true });
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.EmailTemplate.delete(id);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', trigger: '', subject: '', body: '', is_active: true });
  };

  const getTriggerLabel = (trigger) => {
    return TRIGGERS.find(t => t.value === trigger)?.label || trigger;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        {!editingId && (
          <Button onClick={() => setEditingId('new')} className="bg-green-600 hover:bg-green-700">
            New Template
          </Button>
        )}
      </div>

      {editingId && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId === 'new' ? 'Create New Template' : 'Edit Template'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Booking Confirmation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Trigger Event</label>
              <Select value={formData.trigger} onValueChange={(value) => setFormData({ ...formData, trigger: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger event" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Subject</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={'e.g., You\'re In! Your {{trip_name}} Booking is Confirmed 🇯🇲'}
              />
              <p className="text-xs text-zinc-500 mt-1">{'Available placeholders: {{first_name}}, {{last_name}}, {{trip_name}}, {{payment_option_display}}, {{total_price_usd}}'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Body</label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Email body content..."
                className="min-h-64 font-mono text-sm"
              />
              <p className="text-xs text-zinc-500 mt-1">{'Use placeholders like {{first_name}}, {{last_name}}, {{trip_name}}, {{total_price_usd}}, etc.'}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium">Active</label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">Save Template</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map(template => (
          <Card key={template.id} className={!template.is_active ? 'opacity-60' : ''}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{template.name}</h3>
                    <Badge>{getTriggerLabel(template.trigger)}</Badge>
                    {!template.is_active && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-zinc-600 mb-3">{template.subject}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2 whitespace-pre-wrap">{template.body}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(template.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}