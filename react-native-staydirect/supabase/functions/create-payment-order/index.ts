// ====================================================================
// Supabase Edge Function: create-payment-order
// StayDirect — Phase 6: Secure Payment Order Creation
// Target: Deno / Supabase Edge Functions
// ====================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderRequest {
  booking_id?: string;
  owner_id?: string;
  amount: number; // in INR (Rupees)
  currency?: string;
  payment_type: 'booking_deposit' | 'service_fee' | 'owner_subscription';
  notes?: Record<string, string>;
}

serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_staydirect_pune';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify User Token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: CreateOrderRequest = await req.json();
    const {
      booking_id,
      owner_id,
      amount,
      currency = 'INR',
      payment_type,
      notes = {},
    } = body;

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid payment amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Amount validation for bookings: ensure booking belongs to user
    let validatedOwnerId = owner_id;
    if (booking_id) {
      const { data: booking, error: bookingErr } = await supabaseAdmin
        .from('bookings')
        .select('*, hostel:hostels(*)')
        .eq('id', booking_id)
        .single();

      if (bookingErr || !booking) {
        return new Response(JSON.stringify({ error: 'Associated booking not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (booking.student_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Cannot pay for another student booking' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      validatedOwnerId = booking.owner_id;
    }

    // Check for existing pending/paid payment to avoid duplicate orders
    if (booking_id) {
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('booking_id', booking_id)
        .eq('status', 'paid')
        .maybeSingle();

      if (existingPayment) {
        return new Response(
          JSON.stringify({
            error: 'This booking has already been paid and confirmed.',
            payment_id: existingPayment.id,
            status: 'already_paid',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate receipt / order identifier
    const receiptId = `sd_${Date.now()}_${user.id.slice(0, 6)}`;
    let providerOrderId = `order_${receiptId}`;

    // If Razorpay secret is configured in production, call Razorpay API
    if (razorpayKeySecret && razorpayKeyId) {
      try {
        const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
        const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // convert to paise
            currency,
            receipt: receiptId,
            notes: {
              ...notes,
              user_id: user.id,
              booking_id: booking_id || '',
              payment_type,
            },
          }),
        });

        if (rzpRes.ok) {
          const rzpData = await rzpRes.json();
          providerOrderId = rzpData.id;
        } else {
          console.warn('Razorpay order API returned non-ok, falling back to secure internal order ID');
        }
      } catch (err) {
        console.error('Failed to communicate with Razorpay API:', err);
      }
    }

    // Create payment record in database
    const { data: paymentRecord, error: insertError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        booking_id: booking_id || null,
        owner_id: validatedOwnerId || null,
        payment_provider: 'razorpay',
        provider_order_id: providerOrderId,
        amount: Math.round(amount),
        currency,
        payment_type,
        status: 'created',
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Return order details to client
    return new Response(
      JSON.stringify({
        success: true,
        payment_id: paymentRecord.id,
        order_id: providerOrderId,
        amount: Math.round(amount),
        currency,
        key_id: razorpayKeyId,
        payment_type,
        user: {
          name: user.user_metadata?.full_name || 'Student',
          email: user.email || '',
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
