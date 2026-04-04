import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data, old_data } = payload;
    const bookingId = event?.entity_id;
    const newStatus = data?.status;
    const oldStatus = old_data?.status;

    if (!bookingId || newStatus === oldStatus) {
      return Response.json({ skipped: true });
    }

    // Map status to email trigger
    const triggerMap = {
      'paid': 'booking_confirmed',
      'active_plan': 'booking_confirmed',
      'canceled': 'booking_cancelled',
    };

    const trigger = triggerMap[newStatus];
    if (!trigger) {
      console.log(`No email trigger for status: ${newStatus}`);
      return Response.json({ skipped: true, reason: `no trigger for ${newStatus}` });
    }

    // Call sendEmail function with trigger and bookingId
    const result = await base44.asServiceRole.functions.invoke('sendEmail', {
      trigger,
      bookingId,
    });

    console.log(`Email dispatched for booking ${bookingId}, status: ${newStatus}`);
    return Response.json({ success: true, result });

  } catch (error) {
    console.error('onBookingStatusChange error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});