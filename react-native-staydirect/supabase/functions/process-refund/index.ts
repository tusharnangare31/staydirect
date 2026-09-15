// ====================================================================
// Supabase Edge Function: process-refund
// StayDirect — Phase 6: Controlled Refund Execution
// Target: Deno / Supabase Edge Functions
// ====================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || '';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
      return new Response(JSON.stringify({ error: 'Unauthorized user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify Admin Status
    const { data: isAdmin } = await supabaseAdmin.rpc('is_admin');
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!isAdmin && !adminUser) {
      return new Response(JSON.stringify({ error: 'Admin authorization required for refund execution' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { payment_id, decision, rejection_reason } = await req.json();

    if (!payment_id || !decision) {
      return new Response(JSON.stringify({ error: 'Missing payment_id or decision' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call database admin_review_refund RPC
    const { data: reviewResult, error: reviewError } = await supabaseAdmin.rpc('admin_review_refund', {
      p_payment_id: payment_id,
      p_decision: decision,
      p_rejection_reason: rejection_reason || null,
    });

    if (reviewError) {
      throw reviewError;
    }

    // If approved and Razorpay keys exist, invoke provider refund API
    if (decision === 'approved' && razorpayKeyId && razorpayKeySecret) {
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', payment_id)
        .single();

      if (payment && payment.provider_payment_id) {
        try {
          const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
          await fetch(`https://api.razorpay.com/v1/payments/${payment.provider_payment_id}/refund`, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${basicAuth}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: Math.round((payment.refund_amount || payment.amount) * 100),
              notes: {
                payment_id: payment.id,
                approved_by_admin: user.id,
              },
            }),
          });
        } catch (rzpErr) {
          console.warn('Razorpay refund API call notice:', rzpErr);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, result: reviewResult }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Refund processing failure' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
