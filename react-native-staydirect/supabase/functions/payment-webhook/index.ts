// ====================================================================
// Supabase Edge Function: payment-webhook
// StayDirect — Phase 6: Razorpay Webhook Handler & Event Idempotency
// Target: Deno / Supabase Edge Functions
// ====================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

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
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // 1. Webhook Signature Verification
    if (webhookSecret && signature) {
      const expectedSignature = await computeHmacSha256(webhookSecret, rawBody);
      if (expectedSignature !== signature) {
        console.error('Invalid Razorpay webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const providerEventId = payload.id || `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 2. Idempotency Check: Prevent duplicate webhook execution
    const { data: existingEvent } = await supabaseAdmin
      .from('payment_events')
      .select('id, processed')
      .eq('provider_event_id', providerEventId)
      .maybeSingle();

    if (existingEvent && existingEvent.processed) {
      console.log(`Event ${providerEventId} already processed. Skipping duplicate.`);
      return new Response(JSON.stringify({ status: 'already_processed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Log event into payment_events table
    let eventRecordId: string | null = null;
    if (!existingEvent) {
      const { data: newEvent } = await supabaseAdmin
        .from('payment_events')
        .insert({
          provider_event_id: providerEventId,
          event_type: eventType,
          payload: payload,
          processed: false,
        })
        .select()
        .single();
      if (newEvent) eventRecordId = newEvent.id;
    } else {
      eventRecordId = existingEvent.id;
    }

    // 4. Process event types
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const { data: payment } = await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('provider_order_id', orderId)
          .maybeSingle();

        if (payment) {
          await supabaseAdmin.rpc('confirm_payment_order', {
            p_payment_id: payment.id,
            p_provider_payment_id: paymentId || 'webhook_captured',
            p_provider_signature: signature || 'webhook_verified',
          });
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const errorDesc = paymentEntity?.error_description || 'Bank transaction declined';

      if (orderId) {
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'failed',
            failure_reason: errorDesc,
            updated_at: new Date().toISOString(),
          })
          .eq('provider_order_id', orderId);
      }
    } else if (eventType === 'refund.processed') {
      const refundEntity = payload.payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'refunded',
            refund_status: 'processed',
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('provider_payment_id', paymentId);
      }
    }

    // 5. Mark event as processed
    if (eventRecordId) {
      await supabaseAdmin
        .from('payment_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', eventRecordId);
    }

    return new Response(JSON.stringify({ success: true, event: eventType }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Webhook internal failure' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
