import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const intentData = await req.json();
    
    // Validate required fields
    if (!intentData.traveler_primary?.first_name || 
        !intentData.traveler_primary?.last_name ||
        !intentData.traveler_primary?.email || 
        !intentData.package_id || 
        !intentData.total_price) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const WETRAVEL_API_KEY = Deno.env.get('WETRAVEL_API_KEY');
    const WETRAVEL_TRIP_ID = '0062792714';

    if (!WETRAVEL_API_KEY) {
      return Response.json({ error: 'WeTravel API key not configured' }, { status: 500 });
    }

    // Create BookingIntent in Base44
    const intent = await base44.asServiceRole.entities.BookingIntent.create({
      trip_id: WETRAVEL_TRIP_ID,
      package_id: intentData.package_id,
      add_on_ids: intentData.add_on_ids || [],
      traveler_primary: intentData.traveler_primary,
      travelers_count: intentData.travelers_count || 1,
      nights: intentData.nights,
      occupancy: intentData.occupancy,
      price_per_person: intentData.price_per_person,
      total_price: intentData.total_price,
      notes: intentData.notes || '',
      status: 'draft',
      wetravel_refs: {}
    });

    // Create booking via WeTravel Booking API
    const wetravelPayload = {
      buyer: {
        first_name: intentData.traveler_primary.first_name,
        last_name: intentData.traveler_primary.last_name,
        email: intentData.traveler_primary.email,
        phone: intentData.traveler_primary.phone || ''
      },
      participants: [{
        first_name: intentData.traveler_primary.first_name,
        last_name: intentData.traveler_primary.last_name,
        email: intentData.traveler_primary.email,
        phone: intentData.traveler_primary.phone || ''
      }],
      notes: `Intent ID: ${intent.id}`,
      internal_reference: intent.id
    };

    // Add package if specified
    if (intentData.package_id) {
      wetravelPayload.package_id = intentData.package_id;
    }

    console.log('Creating WeTravel booking:', wetravelPayload);

    const wetravelResponse = await fetch(
      `https://api.wetravel.com/v1/trips/${WETRAVEL_TRIP_ID}/bookings`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WETRAVEL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(wetravelPayload)
      }
    );

    const responseText = await wetravelResponse.text();
    console.log('WeTravel API response:', wetravelResponse.status, responseText);
    
    let wetravelData;
    try {
      wetravelData = JSON.parse(responseText);
    } catch (e) {
      wetravelData = { error: responseText || 'Empty response from WeTravel' };
    }

    if (!wetravelResponse.ok) {
      await base44.asServiceRole.entities.BookingIntent.update(intent.id, {
        status: 'failed',
        notes: `WeTravel API error: ${JSON.stringify(wetravelData)}`
      });

      return Response.json({ 
        error: 'Failed to create WeTravel booking',
        details: wetravelData,
        intent_id: intent.id
      }, { status: 500 });
    }

    // Extract booking info from WeTravel response
    const bookingId = wetravelData.id || wetravelData.booking_id;
    const checkoutUrl = wetravelData.checkout_url || 
                        wetravelData.payment_url || 
                        wetravelData.payment_link ||
                        `https://gfxcursions.wetravel.com/bookings/${bookingId}`;

    // Update intent with WeTravel references and mark as handed_off
    await base44.asServiceRole.entities.BookingIntent.update(intent.id, {
      status: 'handed_off',
      wetravel_refs: {
        booking_id: bookingId,
        payment_link: checkoutUrl
      }
    });

    console.log('BookingIntent created and handed off:', intent.id);

    return Response.json({
      success: true,
      intent_id: intent.id,
      checkout_url: checkoutUrl
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});