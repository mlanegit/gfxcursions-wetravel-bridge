import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FUNCTIONS_BASE = 'https://api.base44.app/api/apps/697e8285d68c1a64ca6d3df7/functions';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const authHeader = req.headers.get('Authorization') || '';
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDayDate = sevenDaysFromNow.toISOString().split('T')[0];

    const dueInstallments = await base44.asServiceRole.entities.PaymentInstallment.filter({
      status: 'scheduled',
      due_date: sevenDayDate
    });

    let remindersSent = 0;

    for (const installment of dueInstallments) {
      try {
        if (installment.reminder_sent_7d) continue;

        await fetch(`${FUNCTIONS_BASE}/sendEmail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
          body: JSON.stringify({ trigger: 'payment_reminder', bookingId: installment.booking_id }),
        });

        await base44.asServiceRole.entities.PaymentInstallment.update(installment.id, { reminder_sent_7d: true });
        remindersSent++;
      } catch (err) {
        console.error(`Error sending reminder for installment ${installment.id}:`, err.message);
      }
    }

    return Response.json({ success: true, reminders_sent: remindersSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});