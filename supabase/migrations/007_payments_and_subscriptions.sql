-- ====================================================================
-- Migration: 007_payments_and_subscriptions.sql
-- StayDirect — Phase 6: Payments, Subscriptions, Refunds & Hardening
-- Target: Supabase PostgreSQL (PostgreSQL 15+)
-- ====================================================================

-- 1. EXTEND BOOKING ENUM & NOTIFICATION TYPES IF NEEDED
DO $$ BEGIN
  ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'confirmed';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'payment_failed';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payment_provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT,
  provider_payment_id TEXT,
  provider_signature TEXT,
  amount INTEGER NOT NULL, -- Total in INR
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('booking_deposit', 'service_fee', 'owner_subscription', 'refund')),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled')),
  failure_reason TEXT,
  paid_at TIMESTAMPTZ,
  -- Refund fields
  refund_amount INTEGER DEFAULT 0,
  refund_reason TEXT,
  refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'requested', 'approved', 'rejected', 'processed')),
  refunded_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast query indexes
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner ON public.payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(provider_order_id);

-- 3. PAYMENT WEBHOOK & IDEMPOTENCY EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  provider_event_id TEXT UNIQUE NOT NULL, -- Prevents duplicate webhook execution
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_provider_id ON public.payment_events(provider_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_processed ON public.payment_events(processed);

-- 4. OWNER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.owner_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL CHECK (plan_name IN ('starter_free', 'pro_partner', 'campus_fleet')),
  provider_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  amount INTEGER NOT NULL DEFAULT 0, -- INR
  currency TEXT NOT NULL DEFAULT 'INR',
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_owner ON public.owner_subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_status ON public.owner_subscriptions(status);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR PAYMENTS
CREATE POLICY "Users can view relevant payments"
  ON public.payments
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR owner_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "Users can insert own payment requests"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Admins can update payments"
  ON public.payments
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- 7. RLS POLICIES FOR PAYMENT EVENTS
CREATE POLICY "Only admins and service role can access payment events"
  ON public.payment_events
  FOR ALL
  USING (
    public.is_admin()
  );

-- 8. RLS POLICIES FOR OWNER SUBSCRIPTIONS
CREATE POLICY "Owners can view own subscriptions"
  ON public.owner_subscriptions
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "Owners can insert own subscriptions"
  ON public.owner_subscriptions
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
  );

CREATE POLICY "Owners and admins can update subscriptions"
  ON public.owner_subscriptions
  FOR UPDATE
  USING (
    owner_id = auth.uid() OR public.is_admin()
  );

-- 9. PAYMENT CONFIRMATION FUNCTION (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.confirm_payment_order(
  p_payment_id UUID,
  p_provider_payment_id TEXT,
  p_provider_signature TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
  v_booking RECORD;
  v_hostel_name TEXT;
  v_student_name TEXT;
BEGIN
  SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found';
  END IF;

  IF v_payment.status = 'paid' THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Payment was already confirmed',
      'payment_id', v_payment.id,
      'status', 'paid'
    );
  END IF;

  UPDATE public.payments
  SET
    status = 'paid',
    provider_payment_id = p_provider_payment_id,
    provider_signature = p_provider_signature,
    paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_payment_id;

  IF v_payment.booking_id IS NOT NULL THEN
    UPDATE public.bookings
    SET
      status = 'approved',
      updated_at = NOW()
    WHERE id = v_payment.booking_id
    RETURNING * INTO v_booking;

    SELECT name INTO v_hostel_name FROM public.hostels WHERE id = v_booking.hostel_id;
    SELECT full_name INTO v_student_name FROM public.profiles WHERE id = v_payment.user_id;

    INSERT INTO public.notifications (user_id, title, body, type, reference_id)
    VALUES (
      v_payment.user_id,
      'Booking Deposit Confirmed! 🎉',
      'Your payment of ₹' || v_payment.amount || ' for ' || COALESCE(v_hostel_name, 'your stay') || ' was verified. Your vacancy is reserved with Zero Brokerage!',
      'booking_update',
      v_booking.id
    );

    IF v_payment.owner_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, type, reference_id)
      VALUES (
        v_payment.owner_id,
        'Booking Deposit Received! 💰',
        COALESCE(v_student_name, 'A student') || ' paid deposit of ₹' || v_payment.amount || ' for ' || COALESCE(v_hostel_name, 'your hostel') || '.',
        'booking_update',
        v_booking.id
      );
    END IF;
  END IF;

  IF v_payment.payment_type = 'owner_subscription' AND v_payment.owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type, reference_id)
    VALUES (
      v_payment.owner_id,
      'Subscription Activated! ⭐',
      'Your StayDirect Partner Plan is active. You have premium listing visibility and direct lead contacts.',
      'verification',
      v_payment.id
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment.id,
    'status', 'paid',
    'booking_id', v_payment.booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. REFUND PROCEDURES
CREATE OR REPLACE FUNCTION public.request_payment_refund(
  p_payment_id UUID,
  p_reason TEXT,
  p_refund_amount INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
  v_amount INTEGER;
BEGIN
  SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found';
  END IF;

  IF v_payment.user_id != auth.uid() AND v_payment.owner_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized to request refund for this transaction';
  END IF;

  IF v_payment.status != 'paid' THEN
    RAISE EXCEPTION 'Can only request refund on successful payments';
  END IF;

  v_amount := COALESCE(p_refund_amount, v_payment.amount);
  IF v_amount > v_payment.amount THEN
    RAISE EXCEPTION 'Refund amount cannot exceed original payment amount';
  END IF;

  UPDATE public.payments
  SET
    refund_status = 'requested',
    refund_amount = v_amount,
    refund_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_payment_id;

  INSERT INTO public.notifications (user_id, title, body, type, reference_id)
  VALUES (
    v_payment.user_id,
    'Refund Request Submitted',
    'Your refund request for ₹' || v_amount || ' is under admin review. We process eligible refunds within 24-48 hours.',
    'booking_update',
    v_payment.id
  );

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'refund_status', 'requested',
    'refund_amount', v_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_review_refund(
  p_payment_id UUID,
  p_decision TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin authorization required';
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found';
  END IF;

  IF p_decision = 'approved' THEN
    UPDATE public.payments
    SET
      status = 'refunded',
      refund_status = 'processed',
      refunded_at = NOW(),
      approved_by = auth.uid(),
      updated_at = NOW()
    WHERE id = p_payment_id;

    INSERT INTO public.notifications (user_id, title, body, type, reference_id)
    VALUES (
      v_payment.user_id,
      'Refund Approved & Processed 💳',
      'Your refund of ₹' || v_payment.refund_amount || ' has been approved. The amount will reflect in your source account.',
      'booking_update',
      v_payment.id
    );

    INSERT INTO public.admin_actions (admin_id, action_type, target_id, reason)
    VALUES (
      auth.uid(),
      'resolve_report',
      p_payment_id,
      'Approved refund of ₹' || v_payment.refund_amount || ' for payment #' || p_payment_id
    );

    RETURN jsonb_build_object('success', true, 'status', 'refunded', 'refund_status', 'processed');

  ELSIF p_decision = 'rejected' THEN
    UPDATE public.payments
    SET
      refund_status = 'rejected',
      rejection_reason = p_rejection_reason,
      approved_by = auth.uid(),
      updated_at = NOW()
    WHERE id = p_payment_id;

    INSERT INTO public.notifications (user_id, title, body, type, reference_id)
    VALUES (
      v_payment.user_id,
      'Refund Request Declined',
      'Your refund request was reviewed: ' || COALESCE(p_rejection_reason, 'Booking cancellation policy does not permit refund.'),
      'booking_update',
      v_payment.id
    );

    INSERT INTO public.admin_actions (admin_id, action_type, target_id, reason)
    VALUES (
      auth.uid(),
      'dismiss_report',
      p_payment_id,
      'Rejected refund for payment #' || p_payment_id || ': ' || COALESCE(p_rejection_reason, 'Policy restriction')
    );

    RETURN jsonb_build_object('success', true, 'status', v_payment.status, 'refund_status', 'rejected');
  ELSE
    RAISE EXCEPTION 'Decision must be approved or rejected';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_admin_payment_stats()
RETURNS JSONB AS $$
DECLARE
  v_total_volume BIGINT := 0;
  v_successful_count BIGINT := 0;
  v_failed_count BIGINT := 0;
  v_refunded_count BIGINT := 0;
  v_pending_count BIGINT := 0;
  v_subscription_revenue BIGINT := 0;
  v_deposit_volume BIGINT := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin authorization required';
  END IF;

  SELECT COALESCE(SUM(amount), 0), COUNT(*)
  INTO v_total_volume, v_successful_count
  FROM public.payments
  WHERE status = 'paid';

  SELECT COUNT(*)
  INTO v_failed_count
  FROM public.payments
  WHERE status = 'failed';

  SELECT COUNT(*)
  INTO v_refunded_count
  FROM public.payments
  WHERE status IN ('refunded', 'partially_refunded') OR refund_status = 'processed';

  SELECT COUNT(*)
  INTO v_pending_count
  FROM public.payments
  WHERE status IN ('created', 'pending');

  SELECT COALESCE(SUM(amount), 0)
  INTO v_subscription_revenue
  FROM public.payments
  WHERE status = 'paid' AND payment_type = 'owner_subscription';

  SELECT COALESCE(SUM(amount), 0)
  INTO v_deposit_volume
  FROM public.payments
  WHERE status = 'paid' AND payment_type = 'booking_deposit';

  RETURN jsonb_build_object(
    'total_volume', v_total_volume,
    'successful_count', v_successful_count,
    'failed_count', v_failed_count,
    'refunded_count', v_refunded_count,
    'pending_count', v_pending_count,
    'subscription_revenue', v_subscription_revenue,
    'deposit_volume', v_deposit_volume
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
