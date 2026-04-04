import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const templates = [
  {
    name: "Booking Confirmation",
    trigger: "booking_confirmed",
    is_active: true,
    subject: "🌴 You're In! {{trip_name}} — Booking Confirmed",
    body: `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/2ff9dee21_Horizontal_Logo_Red.png" alt="Grown Folk X" style="max-width: 200px; height: auto;">
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff;">
      <h1 style="color: #d32f2f; margin: 0; font-size: 28px;">You are In! 🌴<br>{{trip_name}} — Booking Confirmed</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Hello {{first_name}},</p>
      <p>Thank you for joining us on <strong>{{trip_name}}</strong>! We are thrilled to welcome you on this exciting journey. Your presence truly makes this trip special. We look forward to exploring new places, sharing unforgettable experiences, and creating lasting memories together.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <h3 style="color: #d32f2f; margin-top: 0;">📋 Booking Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Trip</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{trip_name}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Hotel</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{hotel}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Travel Dates</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{trip_start_date}} – {{trip_end_date}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Package</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{package}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Guests</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{guests}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment Option</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{payment_option}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Price</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{total_price}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Deposit Paid</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{amount_paid}}</td></tr>
        <tr><td style="padding: 8px;"><strong>Remaining Balance Due By</strong></td><td style="padding: 8px;">{{balance_due}} — due {{balance_due_date}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <h3 style="color: #d32f2f; margin-top: 0;">💳 Payment Plan Info</h3>
      <p>If you chose the <strong>installment plan</strong>, your payments will be automatically charged to the card on file on the scheduled dates.<br><strong>All balances are due by {{balance_due_date}}.</strong><br>⚠️ Any failed payments will incur a $30 retry fee.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <h3 style="color: #d32f2f; margin-top: 0;">📌 Cancellation Policy</h3>
      <ul>
        <li>Your deposit is <strong>NON-REFUNDABLE</strong>.</li>
        <li><strong>No refunds</strong> if you cancel within 60 days of the trip.</li>
        <li><strong>50% refund</strong> if you cancel within 90 days of the trip start date.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; text-align: center;">
      <a href="https://gfxcursions.com/" style="display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage My Booking →</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/0b27f6213_Vertical_Logo_Red.png" alt="gfX" style="max-width: 80px; height: auto; margin-bottom: 10px;">
      <p style="margin: 10px 0;">Questions? <a href="mailto:gfxsupport@gfxcursions.com" style="color: #d32f2f; text-decoration: none;">gfxsupport@gfxcursions.com</a> | <a href="tel:3473010714" style="color: #d32f2f; text-decoration: none;">(347) 301-0714</a></p>
      <p style="margin: 0;">© 2026 gfXcursions · Xcursions · Xscapes · Xclusives®. All rights reserved.</p>
    </td>
  </tr>
</table>`
  },
  {
    name: "Payment Received",
    trigger: "payment_received",
    is_active: true,
    subject: "✅ Payment Received — {{trip_name}}",
    body: `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/2ff9dee21_Horizontal_Logo_Red.png" alt="Grown Folk X" style="max-width: 200px; height: auto;">
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff;">
      <h1 style="color: #d32f2f; margin: 0; font-size: 28px;">Payment Received ✅<br>{{trip_name}}</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Hey {{first_name}},</p>
      <p>We have received your payment. Here is your updated balance:</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount Paid (Total)</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{amount_paid}}</td></tr>
        <tr><td style="padding: 8px;"><strong>Remaining Balance</strong></td><td style="padding: 8px;">{{balance_due}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Your next installment will be charged automatically on the scheduled date. No action needed on your end. 🙌</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; text-align: center;">
      <a href="https://gfxcursions.com/" style="display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Booking →</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">Questions? <a href="mailto:gfxsupport@gfxcursions.com" style="color: #d32f2f; text-decoration: none;">gfxsupport@gfxcursions.com</a></p>
      <p style="margin: 0;">© 2026 gfXcursions · All rights reserved.</p>
    </td>
  </tr>
</table>`
  },
  {
    name: "Payment Failed",
    trigger: "payment_failed",
    is_active: true,
    subject: "⚠️ Payment Failed — Action Required for {{trip_name}}",
    body: `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/2ff9dee21_Horizontal_Logo_Red.png" alt="Grown Folk X" style="max-width: 200px; height: auto;">
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff;">
      <h1 style="color: #d32f2f; margin: 0; font-size: 28px;">⚠️ Payment Failed<br>Immediate Action Required — {{trip_name}}</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Hey {{first_name}},</p>
      <p>We were unable to process your scheduled payment for <strong>{{trip_name}}</strong>. Your booking is currently marked as <strong>Past Due</strong>.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Balance Due</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{balance_due}}</td></tr>
        <tr><td style="padding: 8px;"><strong>Due Date</strong></td><td style="padding: 8px;">{{balance_due_date}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>⚠️ A $30 retry fee may be applied to failed payments.</p>
      <p>Please update your payment method or contact us immediately to avoid losing your spot on the trip.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; text-align: center;">
      <a href="https://gfxcursions.com/" style="display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Update Payment →</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">Questions? <a href="mailto:gfxsupport@gfxcursions.com" style="color: #d32f2f; text-decoration: none;">gfxsupport@gfxcursions.com</a> | <a href="tel:3473010714" style="color: #d32f2f; text-decoration: none;">(347) 301-0714</a></p>
      <p style="margin: 0;">© 2026 gfXcursions · All rights reserved.</p>
    </td>
  </tr>
</table>`
  },
  {
    name: "Payment Reminder — 7 Days",
    trigger: "payment_reminder_7d",
    is_active: true,
    subject: "⏰ Payment Due in 7 Days — {{trip_name}}",
    body: `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/2ff9dee21_Horizontal_Logo_Red.png" alt="Grown Folk X" style="max-width: 200px; height: auto;">
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff;">
      <h1 style="color: #d32f2f; margin: 0; font-size: 28px;">⏰ Payment Due Soon<br>7 Days Remaining — {{trip_name}}</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Hey {{first_name}},</p>
      <p>Just a friendly reminder that your next payment for <strong>{{trip_name}}</strong> is due in <strong>7 days</strong>. If you are on a payment plan, your card on file will be charged automatically — no action needed unless your card has changed.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount Due</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{balance_due}}</td></tr>
        <tr><td style="padding: 8px;"><strong>Due Date</strong></td><td style="padding: 8px;">{{balance_due_date}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; text-align: center;">
      <a href="https://gfxcursions.com/" style="display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage My Booking →</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">Questions? <a href="mailto:gfxsupport@gfxcursions.com" style="color: #d32f2f; text-decoration: none;">gfxsupport@gfxcursions.com</a></p>
      <p style="margin: 0;">© 2026 gfXcursions · All rights reserved.</p>
    </td>
  </tr>
</table>`
  },
  {
    name: "Balance Due Reminder — 30 Days",
    trigger: "balance_reminder_30d",
    is_active: true,
    subject: "📅 Balance Due in 30 Days — {{trip_name}}",
    body: `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/2ff9dee21_Horizontal_Logo_Red.png" alt="Grown Folk X" style="max-width: 200px; height: auto;">
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff;">
      <h1 style="color: #d32f2f; margin: 0; font-size: 28px;">📅 30-Day Balance Reminder<br>{{trip_name}}</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Hey {{first_name}},</p>
      <p>Your full balance for <strong>{{trip_name}}</strong> is due in <strong>30 days</strong>. If you still have a remaining balance, please make sure it is paid before the due date to secure your spot.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Remaining Balance</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{balance_due}}</td></tr>
        <tr><td style="padding: 8px;"><strong>Due Date</strong></td><td style="padding: 8px;">{{balance_due_date}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; text-align: center;">
      <a href="https://gfxcursions.com/" style="display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Make a Payment →</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">Questions? <a href="mailto:gfxsupport@gfxcursions.com" style="color: #d32f2f; text-decoration: none;">gfxsupport@gfxcursions.com</a></p>
      <p style="margin: 0;">© 2026 gfXcursions · All rights reserved.</p>
    </td>
  </tr>
</table>`
  },
  {
    name: "Trip Fully Paid",
    trigger: "trip_paid_in_full",
    is_active: true,
    subject: "🎉 You Are Fully Paid — {{trip_name}}",
    body: `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/2ff9dee21_Horizontal_Logo_Red.png" alt="Grown Folk X" style="max-width: 200px; height: auto;">
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff;">
      <h1 style="color: #d32f2f; margin: 0; font-size: 28px;">🎉 Fully Paid!<br>{{trip_name}} — You Are All Set!</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Hey {{first_name}},</p>
      <p>🎉 Congratulations — your trip is <strong>fully paid</strong>! There is nothing else you need to do on the payment side. Just start packing and get ready for an incredible experience on <strong>{{trip_name}}</strong>!</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Paid</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{total_price}}</td></tr>
        <tr><td style="padding: 8px;"><strong>Trip Dates</strong></td><td style="padding: 8px;">{{trip_start_date}} – {{trip_end_date}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; text-align: center;">
      <a href="https://gfxcursions.com/" style="display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Booking →</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">Questions? <a href="mailto:gfxsupport@gfxcursions.com" style="color: #d32f2f; text-decoration: none;">gfxsupport@gfxcursions.com</a></p>
      <p style="margin: 0;">© 2026 gfXcursions · All rights reserved.</p>
    </td>
  </tr>
</table>`
  },
  {
    name: "Arrival Reminder",
    trigger: "arrival_reminder",
    is_active: true,
    subject: "✈️ Your Trip is Coming Up — {{trip_name}}",
    body: `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/2ff9dee21_Horizontal_Logo_Red.png" alt="Grown Folk X" style="max-width: 200px; height: auto;">
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff;">
      <h1 style="color: #d32f2f; margin: 0; font-size: 28px;">✈️ Almost Time!<br>{{trip_name}} is Coming Up!</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Hey {{first_name}},</p>
      <p>Your trip to <strong>{{trip_name}}</strong> is just around the corner! Here is a quick summary of your travel details:</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Hotel</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{hotel}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Travel Dates</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{trip_start_date}} – {{trip_end_date}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Arrival Flight</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{arrival_airline}} — {{arrival_date}} at {{arrival_time}}</td></tr>
        <tr><td style="padding: 8px;"><strong>Departure Flight</strong></td><td style="padding: 8px;">{{departure_airline}} — {{departure_date}} at {{departure_time}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; text-align: center;">
      <a href="https://gfxcursions.com/" style="display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Booking →</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">Questions? <a href="mailto:gfxsupport@gfxcursions.com" style="color: #d32f2f; text-decoration: none;">gfxsupport@gfxcursions.com</a></p>
      <p style="margin: 0;">© 2026 gfXcursions · All rights reserved.</p>
    </td>
  </tr>
</table>`
  },
  {
    name: "Booking Cancelled",
    trigger: "booking_cancelled",
    is_active: true,
    subject: "❌ Booking Cancellation — {{trip_name}}",
    body: `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/2ff9dee21_Horizontal_Logo_Red.png" alt="Grown Folk X" style="max-width: 200px; height: auto;">
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff;">
      <h1 style="color: #d32f2f; margin: 0; font-size: 28px;">Booking Cancelled<br>{{trip_name}}</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Hey {{first_name}},</p>
      <p>We are sorry to see you go. Your booking for <strong>{{trip_name}}</strong> has been cancelled. Please review our cancellation policy regarding any refunds.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <h3 style="color: #d32f2f; margin-top: 0;">Cancellation Policy</h3>
      <ul>
        <li>Your deposit is <strong>NON-REFUNDABLE</strong>.</li>
        <li><strong>No refunds</strong> if cancelled within 60 days of the trip.</li>
        <li><strong>50% refund</strong> if cancelled within 90 days of the trip start date.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>If you believe this was a mistake or would like to rebook, please contact us.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; text-align: center;">
      <a href="mailto:gfxsupport@gfxcursions.com" style="display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Contact Us →</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">Questions? <a href="mailto:gfxsupport@gfxcursions.com" style="color: #d32f2f; text-decoration: none;">gfxsupport@gfxcursions.com</a> | <a href="tel:3473010714" style="color: #d32f2f; text-decoration: none;">(347) 301-0714</a></p>
      <p style="margin: 0;">© 2026 gfXcursions · All rights reserved.</p>
    </td>
  </tr>
</table>`
  },
  {
    name: "Payment Reminder",
    trigger: "payment_reminder",
    is_active: true,
    subject: "💳 Payment Reminder — {{trip_name}}",
    body: `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
      <img src="https://media.base44.com/images/public/69cfd20a552de017c08e6cc9/2ff9dee21_Horizontal_Logo_Red.png" alt="Grown Folk X" style="max-width: 200px; height: auto;">
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff;">
      <h1 style="color: #d32f2f; margin: 0; font-size: 28px;">💳 Payment Reminder<br>{{trip_name}}</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>Hey {{first_name}},</p>
      <p>This is a friendly reminder that you have a payment coming up for <strong>{{trip_name}}</strong>. If you are on an installment plan, your card on file will be charged automatically — no action needed unless your payment info has changed.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount Paid So Far</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{amount_paid}}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Remaining Balance</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{balance_due}}</td></tr>
        <tr><td style="padding: 8px;"><strong>Final Due Date</strong></td><td style="padding: 8px;">{{balance_due_date}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; color: #333;">
      <p>⚠️ Failed payments incur a $30 retry fee. Keep your card info up to date!</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #ffffff; text-align: center;">
      <a href="https://gfxcursions.com/" style="display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage My Booking →</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">Questions? <a href="mailto:gfxsupport@gfxcursions.com" style="color: #d32f2f; text-decoration: none;">gfxsupport@gfxcursions.com</a> | <a href="tel:3473010714" style="color: #d32f2f; text-decoration: none;">(347) 301-0714</a></p>
      <p style="margin: 0;">© 2026 gfXcursions · All rights reserved.</p>
    </td>
  </tr>
</table>`
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let created = 0;

    for (const template of templates) {
      const existing = await base44.asServiceRole.entities.EmailTemplate.filter({
        trigger: template.trigger,
      });

      if (!existing || existing.length === 0) {
        await base44.asServiceRole.entities.EmailTemplate.create(template);
        created++;
      }
    }

    return Response.json({
      success: true,
      message: `Seeded ${created} email templates`,
      total: templates.length,
    });
  } catch (error) {
    console.error('seedEmailTemplates error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});