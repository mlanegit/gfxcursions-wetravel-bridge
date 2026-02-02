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

    // Build WeTravel checkout URL with prefilled parameters
    // WeTravel supports URL parameters to prefill checkout form
    const params = new URLSearchParams({
      first_name: intentData.traveler_primary.first_name,
      last_name: intentData.traveler_primary.last_name,
      email: intentData.traveler_primary.email,
      guests: String(intentData.travelers_count || 1),
      // Store intent ID for webhook reconciliation
      notes: `Intent: ${intent.id}`,
    });

    // Add phone if provided
    if (intentData.traveler_primary.phone) {
      params.append('phone', intentData.traveler_primary.phone);
    }

    // Add package selection if it maps to WeTravel package
    if (intentData.package_id) {
      params.append('package', intentData.package_id);
    }

    const checkoutUrl = `https://gfxcursions.wetravel.com/trips/test-lost-in-jamaica-gfx-${WETRAVEL_TRIP_ID}?${params.toString()}`;
    
    console.log('Generated prefilled checkout URL:', checkoutUrl);

    // Update intent with checkout URL and mark as handed_off
    await base44.asServiceRole.entities.BookingIntent.update(intent.id, {
      status: 'handed_off',
      wetravel_refs: {
        payment_link: checkoutUrl
      }
    });

    console.log('BookingIntent created and handed off:', intent.id);

    return Response.json({
      success: true,
      intent_id: intent.id,
      wetravel_lead_id: leadId,
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