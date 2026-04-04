import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FUNCTIONS_BASE = 'https://api.base44.app/api/apps/697e8285d68c1a64ca6d3df7/functions';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const authHeader = req.headers.get('Authorization') || '';
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const thirtyDayDate = thirtyDaysFromNow.toISOString().split('T')[0];
    const sevenDayDate = sevenDaysFromNow.toISOString().split('T')[0];

    const activeBookings = await base44.asServiceRole.entities.Booking.filter({
      status: { $in: ['paid', 'active_plan'] }
    });

    let sent30d = 0;
    let sent7d = 0;

    for (const booking of activeBookings) {
      try {
        const trip = await base44.asServiceRole.entities.Trip.get(booking.trip_id);
        if (!trip) continue;

        // 30-day reminder
        if (trip.start_date === thirtyDayDate && !booking.reminder_sent_30d) {
          await fetch(`${FUNCTIONS_BASE}/sendEmail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
            body: JSON.stringify({ trigger: 'arrival_reminder', bookingId: booking.id }),
          });
          await base44.asServiceRole.entities.Booking.update(booking.id, { reminder_sent_30d: true });
          sent30d++;
        }

        // 7-day reminder
        if (trip.start_date === sevenDayDate && !booking.reminder_sent_7d) {
          await fetch(`${FUNCTIONS_BASE}/sendEmail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
            body: JSON.stringify({ trigger: 'arrival_reminder', bookingId: booking.id }),
          });
          await base44.asServiceRole.entities.Booking.update(booking.id, { reminder_sent_7d: true });
          sent7d++;
        }
      } catch (err) {
        console.error(`Error processing booking ${booking.id}:`, err.message);
      }
    }

    return Response.json({ success: true, sent_30d: sent30d, sent_7d: sent7d });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});