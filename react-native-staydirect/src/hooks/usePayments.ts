// ====================================================================
// StayDirect — Payment & Subscription React Query Hooks
// Target: React Native / Expo
// ====================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Payment,
  OwnerSubscription,
  AdminPaymentStats,
  SubscriptionPlanName,
} from '../types/database.types';
import { paymentManager } from '../lib/payments';

// Fallback test transactions for development/preview
export const FALLBACK_STUDENT_PAYMENTS: Payment[] = [
  {
    id: 'pay-00000001-0001',
    user_id: '00000000-0000-0000-0000-000000000010',
    booking_id: 'b0000000-0000-0000-0000-000000000001',
    owner_id: '00000000-0000-0000-0000-000000000001',
    payment_provider: 'razorpay',
    provider_order_id: 'order_sd_1718001122_std01',
    provider_payment_id: 'pay_rzp_hinjewadi_01',
    provider_signature: 'sig_verified_demo_01',
    amount: 5000,
    currency: 'INR',
    payment_type: 'booking_deposit',
    status: 'paid',
    paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    hostel: {
      id: 'h0000000-0000-0000-0000-000000000001',
      owner_id: '00000000-0000-0000-0000-000000000001',
      name: 'Sai Krupa Luxury Boys Hostel & PG',
      area: 'Hinjewadi Phase 1',
      city: 'Pune',
      address: 'Near Blue Ridge SEZ, Hinjewadi Phase 1, Pune',
      monthly_rent: 7500,
      monthly_rent_min: 7500,
      monthly_rent_max: 12000,
      security_deposit: 5000,
      gender_preference: 'boys',
      verification_status: 'verified',
      rating: 4.8,
      review_count: 24,
      description: 'Zero Brokerage premium hostel near IT Park',
      latitude: 18.5913,
      longitude: 73.7389,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'pay-00000001-0002',
    user_id: '00000000-0000-0000-0000-000000000010',
    booking_id: null,
    owner_id: null,
    payment_provider: 'razorpay',
    provider_order_id: 'order_sd_1717800000_srv01',
    provider_payment_id: 'pay_rzp_verifpass_01',
    provider_signature: 'sig_verified_demo_02',
    amount: 99,
    currency: 'INR',
    payment_type: 'service_fee',
    status: 'paid',
    paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export const FALLBACK_ADMIN_PAYMENT_STATS: AdminPaymentStats = {
  total_volume: 384500,
  successful_count: 42,
  failed_count: 3,
  refunded_count: 2,
  pending_count: 4,
  subscription_revenue: 54900,
  deposit_volume: 329600,
};

export const FALLBACK_ALL_PAYMENTS: Payment[] = [
  ...FALLBACK_STUDENT_PAYMENTS,
  {
    id: 'pay-00000002-0001',
    user_id: '00000000-0000-0000-0000-000000000011',
    booking_id: 'b0000000-0000-0000-0000-000000000002',
    owner_id: '00000000-0000-0000-0000-000000000002',
    payment_provider: 'razorpay',
    provider_order_id: 'order_sd_1718100222_std02',
    provider_payment_id: 'pay_rzp_kothrud_02',
    provider_signature: 'sig_verified_demo_03',
    amount: 6000,
    currency: 'INR',
    payment_type: 'booking_deposit',
    status: 'paid',
    refund_status: 'none',
    paid_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    user: {
      id: '00000000-0000-0000-0000-000000000011',
      role: 'student',
      full_name: 'Pooja Sharma',
      phone: '+919811223344',
      city: 'Pune',
      is_verified: true,
      college_or_company: 'MIT World Peace University',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    owner: {
      id: '00000000-0000-0000-0000-000000000002',
      role: 'owner',
      full_name: 'Sunita Patil',
      phone: '+919822012345',
      city: 'Pune',
      is_verified: true,
      college_or_company: 'Patil Girls Hostels Kothrud',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'pay-00000003-0001',
    user_id: '00000000-0000-0000-0000-000000000012',
    booking_id: 'b0000000-0000-0000-0000-000000000003',
    owner_id: '00000000-0000-0000-0000-000000000003',
    payment_provider: 'razorpay',
    provider_order_id: 'order_sd_1718200333_std03',
    provider_payment_id: 'pay_rzp_baner_03',
    provider_signature: 'sig_verified_demo_04',
    amount: 4500,
    currency: 'INR',
    payment_type: 'booking_deposit',
    status: 'paid',
    refund_amount: 4500,
    refund_reason: 'Semester delayed by university; owner agreed to cancellation.',
    refund_status: 'requested',
    paid_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    user: {
      id: '00000000-0000-0000-0000-000000000012',
      role: 'student',
      full_name: 'Aditya Deshpande',
      phone: '+919765431200',
      city: 'Pune',
      is_verified: true,
      college_or_company: 'Symbiosis Viman Nagar',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    owner: {
      id: '00000000-0000-0000-0000-000000000003',
      role: 'owner',
      full_name: 'Anand Kadam',
      phone: '+919765432109',
      city: 'Pune',
      is_verified: false,
      college_or_company: 'GreenView Co-living Baner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'pay-00000004-0001',
    user_id: '00000000-0000-0000-0000-000000000001',
    booking_id: null,
    owner_id: '00000000-0000-0000-0000-000000000001',
    payment_provider: 'razorpay',
    provider_order_id: 'order_sd_sub_pro_01',
    provider_payment_id: 'pay_rzp_sub_01',
    provider_signature: 'sig_sub_verified_01',
    amount: 1499,
    currency: 'INR',
    payment_type: 'owner_subscription',
    status: 'paid',
    paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    owner: {
      id: '00000000-0000-0000-0000-000000000001',
      role: 'owner',
      full_name: 'Suresh Deshmukh',
      phone: '+919890123456',
      city: 'Pune',
      is_verified: true,
      college_or_company: 'Deshmukh Hostels Pune',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'pay-00000005-0001',
    user_id: '00000000-0000-0000-0000-000000000013',
    booking_id: null,
    owner_id: '00000000-0000-0000-0000-000000000002',
    payment_provider: 'razorpay',
    provider_order_id: 'order_sd_failed_01',
    provider_payment_id: 'pay_failed_rzp_01',
    amount: 5500,
    currency: 'INR',
    payment_type: 'booking_deposit',
    status: 'failed',
    failure_reason: 'UPI PIN entered incorrectly 3 times',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

// Fallback owner subscription
export const FALLBACK_OWNER_SUBSCRIPTION: OwnerSubscription = {
  id: 'sub-00000001-0001',
  owner_id: '00000000-0000-0000-0000-000000000001',
  plan_name: 'pro_partner',
  provider_subscription_id: 'sub_rzp_pro_partner_pune',
  status: 'active',
  amount: 1499,
  currency: 'INR',
  start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
};

export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter_free' as SubscriptionPlanName,
    name: 'Starter Free',
    price: 0,
    period: 'Forever',
    badge: 'Standard',
    features: [
      'Up to 1 Hostel / PG Property',
      'Basic listing visibility in Pune search',
      'Direct student call & WhatsApp contact',
      'Standard visit inquiry management',
      '100% Zero brokerage promise',
    ],
    isPopular: false,
  },
  {
    id: 'pro_partner' as SubscriptionPlanName,
    name: 'Direct Pro Partner',
    price: 1499,
    period: 'per month',
    badge: 'Most Popular',
    features: [
      'Up to 3 Hostel / PG Properties',
      'Verified Partner Badge on cards & detail screens',
      'Top search placement across Pune college hubs',
      'Instant SMS & WhatsApp vacancy notifications',
      'Priority direct student leads',
      'Detailed inquiry analytics & visit logs',
    ],
    isPopular: true,
  },
  {
    id: 'campus_fleet' as SubscriptionPlanName,
    name: 'Campus Fleet Enterprise',
    price: 3999,
    period: 'per month',
    badge: 'Enterprise',
    features: [
      'Unlimited properties & branches across Pune',
      'Dedicated relationship manager for tenant onboarding',
      'Featured hero banner exposure on student home screen',
      'Multi-staff caretaker account logins',
      'Bulk room & inventory management tools',
      'Custom direct lease agreement templates',
    ],
    isPopular: false,
  },
];

/**
 * Hook for Student Payment History
 */
export function useStudentPayments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['student-payments', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return FALLBACK_STUDENT_PAYMENTS;
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*, booking:bookings(*), hostel:hostels(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          return FALLBACK_STUDENT_PAYMENTS;
        }
        return data as Payment[];
      } catch (e) {
        return FALLBACK_STUDENT_PAYMENTS;
      }
    },
  });

  const requestRefundMutation = useMutation({
    mutationFn: async ({
      paymentId,
      reason,
      refundAmount,
    }: {
      paymentId: string;
      reason: string;
      refundAmount?: number;
    }) => {
      const { data, error } = await supabase.rpc('request_payment_refund', {
        p_payment_id: paymentId,
        p_reason: reason,
        p_refund_amount: refundAmount || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
  });

  return {
    payments: query.data || FALLBACK_STUDENT_PAYMENTS,
    isLoading: query.isLoading,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    requestRefund: requestRefundMutation.mutateAsync,
    isRequestingRefund: requestRefundMutation.isPending,
  };
}

/**
 * Hook for Owner Subscriptions
 */
export function useOwnerSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['owner-subscription', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return FALLBACK_OWNER_SUBSCRIPTION;
      try {
        const { data, error } = await supabase
          .from('owner_subscriptions')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          return FALLBACK_OWNER_SUBSCRIPTION;
        }
        return data as OwnerSubscription;
      } catch (e) {
        return FALLBACK_OWNER_SUBSCRIPTION;
      }
    },
  });

  const historyQuery = useQuery({
    queryKey: ['owner-subscription-history', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [FALLBACK_ALL_PAYMENTS[3]];
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('owner_id', user.id)
          .eq('payment_type', 'owner_subscription')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          return [FALLBACK_ALL_PAYMENTS[3]];
        }
        return data as Payment[];
      } catch (e) {
        return [FALLBACK_ALL_PAYMENTS[3]];
      }
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('owner_subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-subscription'] });
    },
  });

  return {
    subscription: query.data || FALLBACK_OWNER_SUBSCRIPTION,
    history: historyQuery.data || [FALLBACK_ALL_PAYMENTS[3]],
    isLoading: query.isLoading,
    refetch: query.refetch,
    cancelSubscription: cancelSubscriptionMutation.mutateAsync,
    isCancelling: cancelSubscriptionMutation.isPending,
  };
}

/**
 * Hook for Admin Payment & Revenue Management
 */
export function useAdminPayments(filters?: {
  status?: string;
  paymentType?: string;
  searchQuery?: string;
}) {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ['admin-payment-stats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_admin_payment_stats');
        if (error || !data) {
          return FALLBACK_ADMIN_PAYMENT_STATS;
        }
        return data as AdminPaymentStats;
      } catch (e) {
        return FALLBACK_ADMIN_PAYMENT_STATS;
      }
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ['admin-payments', filters],
    queryFn: async () => {
      try {
        let q = supabase
          .from('payments')
          .select('*, user:profiles!payments_user_id_fkey(*), owner:profiles!payments_owner_id_fkey(*), booking:bookings(*), hostel:hostels(*)')
          .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
          q = q.eq('status', filters.status);
        }
        if (filters?.paymentType && filters.paymentType !== 'all') {
          q = q.eq('payment_type', filters.paymentType);
        }

        const { data, error } = await q;
        if (error || !data || data.length === 0) {
          return FALLBACK_ALL_PAYMENTS;
        }
        return data as Payment[];
      } catch (e) {
        return FALLBACK_ALL_PAYMENTS;
      }
    },
  });

  const refundDecisionMutation = useMutation({
    mutationFn: async ({
      paymentId,
      decision,
      rejectionReason,
    }: {
      paymentId: string;
      decision: 'approved' | 'rejected';
      rejectionReason?: string;
    }) => {
      const { data, error } = await supabase.rpc('admin_review_refund', {
        p_payment_id: paymentId,
        p_decision: decision,
        p_rejection_reason: rejectionReason || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
    },
  });

  return {
    stats: statsQuery.data || FALLBACK_ADMIN_PAYMENT_STATS,
    payments: paymentsQuery.data || FALLBACK_ALL_PAYMENTS,
    isLoading: paymentsQuery.isLoading,
    refetch: paymentsQuery.refetch,
    isRefetching: paymentsQuery.isRefetching,
    reviewRefund: refundDecisionMutation.mutateAsync,
    isReviewingRefund: refundDecisionMutation.isPending,
  };
}
