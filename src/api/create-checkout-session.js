import Stripe from "stripe";
import { createClientFromRequest } from "@base44/sdk"; // 🔥 Important

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {

  // ✅ CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "Missing bookingId" });
    }

    // 🔥 Authenticated Base44 client
    const base44 = createClientFromRequest(req);

    // Fetch booking securely
    const booking = await base44.entities.Booking.get(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // NEVER trust frontend deposit
    let amountToCharge;

    if (booking.payment_option === "plan") {
      const depositPerPerson = 250; // You can later make this trip-controlled
      amountToCharge = depositPerPerson * booking.guests;
    } else {
      amountToCharge = booking.total_price;
    }

    // Add Stripe fee (2.9% + $0.30)
    const grossAmount =
      Math.round(((amountToCharge + 0.30) / (1 - 0.029)) * 100) / 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: booking.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${booking.package_id} - ${booking.nights} Nights (${booking.occupancy})`,
            },
            unit_amount: Math.round(grossAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        payment_option: booking.payment_option
      },
      success_url: "https://radical-task-flow-app.base44.app/success",
      cancel_url: "https://radical-task-flow-app.base44.app/cancel",
    });

    // Save Stripe session ID back to booking
    await base44.entities.Booking.update(booking.id, {
      stripe_checkout_session_id: session.id
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: "Stripe session failed" });
  }
}
