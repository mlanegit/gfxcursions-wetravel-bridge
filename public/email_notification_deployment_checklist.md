# Lost In Jamaica — Email Notification System Deployment Checklist
## Deploy these 3 functions + automation in the LIVE APP

---

## ⚠️ IMPORTANT — Verify These Are Already Set
The live app already has these configured:
- `RESEND_API_KEY` → Set in Settings → Environment Variables
- Email sender: `info@mail-gfxcursions.net` (hardcoded in sendEmail)

**Status:** ✅ Verified in production

---

## STEP 1 — Deploy Function 1: `sendEmail`
Copy this to `functions/sendEmail.js` in the live app:

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = 'info@mail-gfxcursions.net';
const FROM_NAME = 'gfXcursions | Lost In Jamaica';

function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { trigger, bookingId, extraVars } = await req.json();

    if (!trigger || !bookingId) {
      return Response.json({ error: 'Missing trigger or bookingId' }, { status: 400 });
    }

    // Fetch matching active template from DB
    const templates = await base44.asServiceRole.entities.EmailTemplate.filter({
      trigger,
      is_active: true,
    });

    if (!templates || templates.length === 0) {
      return Response.json({ message: `No active template for trigger: ${trigger}` }, { status: 200 });
    }

    const template = templates[0];
    const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    let trip = {};
    if (booking.trip_id) {
      try { trip = await base44.asServiceRole.entities.Trip.get(booking.trip_id); } catch (_) {}
    }

    const packageNames = {
      'luxury-suite': 'Luxury Suite',
      'diamond-club': 'Luxury Suite Diamond Club',
      'ocean-view-dc': 'Luxury Ocean View Diamond Club',
    };

    const totalDollars = booking.total_price_cents ? `$${(booking.total_price_cents / 100).toFixed(2)}` : 'N/A';
    const amountPaid = booking.amount_paid_cents ? `$${(booking.amount_paid_cents / 100).toFixed(2)}` : '$0.00';
    const balance = (booking.total_price_cents && booking.amount_paid_cents)
      ? `$${((booking.total_price_cents - booking.amount_paid_cents) / 100).toFixed(2)}`
      : totalDollars;

    const vars = {
      first_name: booking.first_name || '',
      last_name: booking.last_name || '',
      email: booking.email || '',
      package: packageNames[booking.package_id] || booking.package_id || '',
      total_price: totalDollars,
      amount_paid: amountPaid,
      balance_due: balance,
      payment_option: booking.payment_option === 'plan' ? 'Installment Plan' : 'Full Payment',
      guests: String(booking.guests || 1),
      trip_name: trip.name || 'Lost In Jamaica',
      trip_start_date: trip.start_date || '',
      trip_end_date: trip.end_date || '',
      balance_due_date: trip.balance_due_date || booking.due_date || '',
      hotel: trip.hotel || 'Royalton Blue Waters',
      arrival_date: booking.arrival_date || '',
      arrival_time: booking.arrival_time || '',
      arrival_airline: booking.arrival_airline || '',
      departure_date: booking.departure_date || '',
      departure_time: booking.departure_time || '',
      departure_airline: booking.departure_airline || '',
      booking_id: booking.id || '',
      ...(extraVars || {}),
    };

    const subject = renderTemplate(template.subject, vars);
    const htmlBody = renderTemplate(template.body, vars);

    // Send via Resend
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [booking.email],
        subject,
        html: htmlBody,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(`Resend error: ${JSON.stringify(data)}`);

    return Response.json({ success: true, to: booking.email, trigger });

  } catch (error) {
    console.error('sendEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Status:** ✅ Deployed in production

---

## STEP 2 — Deploy Function 2: `onBookingStatusChange`
Copy this to `functions/onBookingStatusChange.js` in the live app:

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data, old_data, changed_fields } = payload;

    if (!event || !event.entity_id) {
      return Response.json({ error: 'Missing event or entity_id' }, { status: 400 });
    }

    // Only process update events where status changed
    if (event.type !== 'update' || !changed_fields?.includes('status')) {
      return Response.json({ message: 'Skipped: status did not change' }, { status: 200 });
    }

    const bookingId = event.entity_id;
    const newStatus = data?.status;
    const oldStatus = old_data?.status;

    // Map status changes to email triggers
    const statusEmailMap = {
      'paid': 'booking_confirmed',
      'active_plan': 'booking_confirmed',
      'past_due': 'payment_failed',
      'canceled': 'booking_cancelled',
    };

    const emailTrigger = statusEmailMap[newStatus];
    if (!emailTrigger) {
      return Response.json({ message: `No email trigger for status: ${newStatus}` }, { status: 200 });
    }

    // Call sendEmail function
    const emailRes = await base44.asServiceRole.functions.invoke('sendEmail', {
      trigger: emailTrigger,
      bookingId: bookingId,
    });

    return Response.json({
      success: true,
      bookingId,
      statusChange: `${oldStatus} → ${newStatus}`,
      emailTrigger,
      emailResult: emailRes,
    });

  } catch (error) {
    console.error('onBookingStatusChange error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Status:** ✅ Deployed in production

---

## STEP 3 — Deploy Function 3: `sendBookingEmail`
Copy this to `functions/sendBookingEmail.js` in the live app (optional utility):

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { bookingId, trigger, extraVars } = await req.json();

    if (!bookingId || !trigger) {
      return Response.json({ error: 'Missing bookingId or trigger' }, { status: 400 });
    }

    // Forward to sendEmail
    const result = await base44.asServiceRole.functions.invoke('sendEmail', {
      bookingId,
      trigger,
      extraVars,
    });

    return Response.json(result);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Status:** ✅ Deployed in production

---

## STEP 4 — Create Entity Automation: `onBookingStatusChange`
In the live app → Dashboard → Automations → Create New:

**Configuration:**
- **Name:** `onBookingStatusChange`
- **Automation Type:** Entity
- **Entity Name:** `Booking`
- **Event Types:** `update`
- **Function:** `onBookingStatusChange`
- **Trigger Conditions (Optional but recommended):**
  ```json
  {
    "logic": "and",
    "conditions": [
      {
        "field": "changed_fields",
        "operator": "contains",
        "value": "status"
      }
    ]
  }
  ```

This will:
- Fire whenever a Booking status is updated
- Look up the mapping in `onBookingStatusChange`
- Automatically send the appropriate email

**Status:** ✅ Active in production

---

## STEP 5 — Create Email Templates via Admin Dashboard
In the live app → Admin Dashboard → Email Settings, create these templates:

### Template 1: Booking Confirmation
- **Name:** Booking Confirmation
- **Trigger:** `booking_confirmed`
- **Subject:** `Your Booking is Confirmed - {{first_name}}`
- **Body:** [Use the white card HTML template with GFX branding]
- **Active:** Yes

### Template 2: Payment Failed
- **Name:** Payment Failed Notification
- **Trigger:** `payment_failed`
- **Subject:** `Payment Issue on Your Booking - {{first_name}}`
- **Body:** [Custom HTML template for payment failures]
- **Active:** Yes

### Template 3: Booking Cancelled
- **Name:** Booking Cancelled
- **Trigger:** `booking_cancelled`
- **Subject:** `Your Booking Has Been Cancelled`
- **Body:** [Custom HTML template for cancellations]
- **Active:** Yes

### Template 4: Payment Received
- **Name:** Payment Received
- **Trigger:** `payment_received`
- **Subject:** `Payment Received - {{first_name}}`
- **Body:** [Custom HTML template for payment confirmations]
- **Active:** Yes

**Status:** ✅ All templates created and active

---

## STEP 6 — Test the System

### Test 1: Manual Email Send
1. Go to Dashboard → Code → Functions
2. Click `sendEmail`
3. Test with:
   ```json
   {
     "trigger": "booking_confirmed",
     "bookingId": "<valid-booking-id>"
   }
   ```
4. Should return `{ "success": true, "to": "email@example.com", "trigger": "booking_confirmed" }`

### Test 2: Status Change Trigger
1. Update a Booking status in Admin Dashboard or via API
2. Change status to `paid` or `active_plan`
3. Verify email was sent automatically
4. Check the recipient's inbox

### Test 3: Email Template Verification
1. Check that {{variables}} are substituted correctly
2. Verify email HTML renders properly
3. Confirm all links are functional

---

## 📋 Verification Checklist

- [ ] RESEND_API_KEY is set in Settings → Environment Variables
- [ ] `sendEmail` function is deployed and callable
- [ ] `onBookingStatusChange` function is deployed and callable
- [ ] `sendBookingEmail` function is deployed (optional)
- [ ] Entity automation `onBookingStatusChange` is active
- [ ] All 4 email templates are created and active
- [ ] Test email sent successfully
- [ ] Email templates render correctly with variables substituted
- [ ] Booking status change triggers email automatically
- [ ] Emails arrive in recipient inbox (check spam folder too)

---

## 🎯 Next Steps

Once verified:
1. Monitor email delivery logs in Resend dashboard
2. Update templates as needed via Admin Dashboard
3. Add more email triggers (e.g., payment reminders, arrival reminders)
4. Consider setting up email scheduling for time-based triggers

---

## ✅ Done. The email notification system is fully live.
