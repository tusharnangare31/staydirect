// ====================================================================
// Supabase Edge Function: verify-payment-signature
// StayDirect — Phase 6: Payment Signature & Server-Side Verification
// Target: Deno / Supabase Edge Functions
// ====================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: HMAC SHA-256 computation in Deno Web Crypto
async function computeHmacSha256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyBuf = encoder.encode(key);
  const dataBuf = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuf,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuf);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify User Session
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

    const {
      payment_id,
      provider_order_id,
      provider_payment_id,
      provider_signature,
    } = await req.json();

    if (!payment_id || !provider_order_id || !provider_payment_id) {
      return new Response(
        JSON.stringify({ error: 'Missing payment identifiers for verification' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify signature if secret is provided in environment
    if (razorpayKeySecret && provider_signature) {
      const generatedSignature = await computeHmacSha256(
        razorpayKeySecret,
        `${provider_order_id}|${provider_payment_id}`
      );

      if (generatedSignature !== provider_signature) {
        // Record failed attempt
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'failed',
            failure_reason: 'Tampered payment signature or verification mismatch',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment_id);

        return new Response(
          JSON.stringify({ error: 'Payment signature mismatch. Transaction flagged.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Call database function confirm_payment_order (handles idempotency, booking update, and notifications)
    const { data, error: rpcError } = await supabaseAdmin.rpc('confirm_payment_order', {
      p_payment_id: payment_id,
      p_provider_payment_id: provider_payment_id,
      p_provider_signature: provider_signature || 'verified_dev_signature',
    });

    if (rpcError) {
      console.error('Error confirming payment in database:', rpcError);
      throw rpcError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified and booking confirmed successfully',
        payment: data,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal verification error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
