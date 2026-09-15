import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../../constants/theme';
import { Header } from '../../../components/Header';
import {
  useOwnerSubscription,
  SUBSCRIPTION_PLANS,
} from '../../../hooks/usePayments';
import { SubscriptionPlanName, Payment } from '../../../types/database.types';
import { paymentManager } from '../../../lib/payments';
import { PaymentReceiptModal } from '../../student/payment/PaymentReceiptModal';

interface OwnerSubscriptionScreenProps {
  onBack?: () => void;
}

export const OwnerSubscriptionScreen: React.FC<OwnerSubscriptionScreenProps> = ({ onBack }) => {
  const {
    subscription,
    history,
    isLoading,
    refetch,
    cancelSubscription,
    isCancelling,
  } = useOwnerSubscription();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanName>('pro_partner');
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);

  const currentPlan = subscription?.plan_name || 'starter_free';
  const isActive = subscription?.status === 'active';

  const handleUpgradePlan = async (planId: SubscriptionPlanName) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan || plan.price === 0) {
      Alert.alert('Starter Plan', 'You are already on the Starter Free tier.');
      return;
    }

    try {
      setIsProcessingUpgrade(true);

      // 1. Create order for subscription
      const order = await paymentManager.createSubscriptionOrder(planId, plan.price);

      // 2. Simulate payment completion & verification with server
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const verifyResult = await paymentManager.verifyPayment({
        paymentId: order.paymentId,
        providerOrderId: order.orderId,
        providerPaymentId: `pay_rzp_sub_${Date.now()}`,
        providerSignature: `sig_sub_${Date.now()}`,
      });

      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Subscription payment verification failed.');
      }

      await refetch();

      Alert.alert(
        'Subscription Activated! 🚀',
        `Congratulations! Your ${plan.name} is now active. Your listings will now receive verified partner badges and priority Pune search visibility.`
      );
    } catch (err: any) {
      Alert.alert('Payment Error', err.message || 'Could not upgrade subscription');
    } finally {
      setIsProcessingUpgrade(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!subscription?.id) return;
    try {
      await cancelSubscription(subscription.id);
      setShowCancelModal(false);
      Alert.alert(
        'Subscription Cancelled',
        'Your subscription will remain active until the end of your billing cycle. No further charges will occur.'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not cancel subscription');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Owner Subscription & Growth"
        subtitle="Pune Verified Partner Plans"
      />

      {onBack && (
        <TouchableOpacity style={styles.backRow} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={THEME.colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* CURRENT SUBSCRIPTION BANNER */}
        <View style={styles.activeBanner}>
          <View style={styles.bannerHeader}>
            <View>
              <Text style={styles.bannerSub}>CURRENT ACTIVE PLAN</Text>
              <Text style={styles.bannerTitle}>
                {SUBSCRIPTION_PLANS.find((p) => p.id === currentPlan)?.name || 'Starter Free'}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isActive ? '#DCFCE7' : '#FEF3C7' },
              ]}
            >
              <Ionicons
                name={isActive ? 'shield-checkmark' : 'time-outline'}
                size={14}
                color={isActive ? '#15803D' : '#B45309'}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isActive ? '#15803D' : '#B45309' },
                ]}
              >
                {subscription?.status?.toUpperCase() || 'ACTIVE'}
              </Text>
            </View>
          </View>

          <View style={styles.bannerMetaRow}>
            <View>
              <Text style={styles.metaLabel}>Renewal / Expiry Date</Text>
              <Text style={styles.metaVal}>
                {subscription?.end_date
                  ? new Date(subscription.end_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Valid Indefinitely'}
              </Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Investment</Text>
              <Text style={styles.metaVal}>
                ₹{subscription?.amount || 0} / month
              </Text>
            </View>
          </View>

          {currentPlan !== 'starter_free' && isActive && (
            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.cancelLinkText}>Cancel or Downgrade Subscription</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* PLANS SELECTION CARDS */}
        <Text style={styles.sectionHeading}>Choose Your Partner Tier</Text>
        <Text style={styles.sectionDesc}>
          100% Zero Brokerage. Optional partner upgrades give you priority student leads, verified badge trust, and multi-property management.
        </Text>

        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isThisCurrent = currentPlan === plan.id;

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  plan.isPopular && styles.planCardPopular,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.8}
              >
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>RECOMMENDED IN PUNE</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>
                      ₹{plan.price}{' '}
                      <Text style={styles.planPeriod}>/{plan.period}</Text>
                    </Text>
                  </View>
                  {isThisCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>ACTIVE NOW</Text>
                    </View>
                  )}
                </View>

                {/* Features List */}
                <View style={styles.featuresList}>
                  {plan.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={THEME.colors.primary}
                      />
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {/* Action CTA */}
                {!isThisCurrent ? (
                  <TouchableOpacity
                    style={[
                      styles.upgradeBtn,
                      isSelected && styles.upgradeBtnActive,
                    ]}
                    disabled={isProcessingUpgrade}
                    onPress={() => handleUpgradePlan(plan.id)}
                  >
                    {isProcessingUpgrade && isSelected ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.upgradeBtnText,
                          isSelected && styles.upgradeBtnTextActive,
                        ]}
                      >
                        {plan.price === 0 ? 'Current Free Tier' : `Upgrade to ${plan.name}`}
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.alreadyActiveBox}>
                    <Ionicons name="checkmark" size={16} color="#15803D" />
                    <Text style={styles.alreadyActiveText}>Current Selected Tier</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PLAN COMPARISON TABLE */}
        <View style={styles.comparisonBox}>
          <Text style={styles.comparisonTitle}>Detailed Plan Comparison</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.colHead, { flex: 2 }]}>Features</Text>
            <Text style={styles.colHead}>Free</Text>
            <Text style={styles.colHead}>Pro</Text>
            <Text style={styles.colHead}>Fleet</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.rowTitle, { flex: 2 }]}>Zero Brokerage</Text>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.check}>✓</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.rowTitle, { flex: 2 }]}>Hostel Listings</Text>
            <Text style={styles.cellText}>1</Text>
            <Text style={styles.cellText}>3</Text>
            <Text style={styles.cellText}>Unlimited</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.rowTitle, { flex: 2 }]}>Verified Partner Badge</Text>
            <Text style={styles.cellText}>-</Text>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.check}>✓</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.rowTitle, { flex: 2 }]}>Top Pune Search Boost</Text>
            <Text style={styles.cellText}>-</Text>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.check}>✓</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.rowTitle, { flex: 2 }]}>Dedicated Onboarding RM</Text>
            <Text style={styles.cellText}>-</Text>
            <Text style={styles.cellText}>-</Text>
            <Text style={styles.check}>✓</Text>
          </View>
        </View>

        {/* INVOICE & PAYMENT HISTORY */}
        <View style={styles.historyBox}>
          <Text style={styles.sectionHeading}>Subscription Invoices</Text>
          <Text style={styles.sectionDesc}>
            Download tax invoices for your owner partner subscription payments.
          </Text>

          {history.length > 0 ? (
            history.map((inv) => (
              <View key={inv.id} style={styles.invoiceRow}>
                <View>
                  <Text style={styles.invoiceTitle}>
                    {inv.payment_type === 'owner_subscription'
                      ? 'Pro Partner Monthly'
                      : 'Platform Service'}
                  </Text>
                  <Text style={styles.invoiceDate}>
                    {new Date(inv.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.invoiceAmount}>₹{inv.amount}</Text>
                  <TouchableOpacity
                    style={styles.invoiceReceiptBtn}
                    onPress={() => setSelectedInvoice(inv)}
                  >
                    <Ionicons name="receipt-outline" size={12} color={THEME.colors.primary} />
                    <Text style={styles.invoiceReceiptText}>Receipt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noInvoices}>No past paid subscription invoices found.</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Cancellation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalCard}>
            <View style={styles.warningIcon}>
              <Ionicons name="alert-circle" size={32} color="#DC2626" />
            </View>
            <Text style={styles.cancelTitle}>Cancel Pro Partner Plan?</Text>
            <Text style={styles.cancelDesc}>
              By cancelling, you will lose the Verified Partner badge, top search placement across Hinjewadi, Kothrud & Viman Nagar student searches, and direct vacancy alerts.
            </Text>

            <View style={styles.cancelButtons}>
              <TouchableOpacity
                style={styles.keepBtn}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.keepBtnText}>Keep My Benefits</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Text style={styles.confirmCancelText}>Yes, Cancel Plan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Receipt View Modal */}
      <PaymentReceiptModal
        visible={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        payment={selectedInvoice}
        hostelName="StayDirect Owner Pro Partner"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.primary,
    marginLeft: 6,
  },
  content: {
    padding: 16,
  },
  activeBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bannerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bannerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
  },
  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  cancelLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  cancelLinkText: {
    fontSize: 12,
    color: '#EF4444',
    textDecorationLine: 'underline',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  planCardPopular: {
    borderColor: THEME.colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -11,
    right: 18,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 4,
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  currentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  upgradeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  upgradeBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  upgradeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  upgradeBtnTextActive: {
    color: '#FFFFFF',
  },
  alreadyActiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    gap: 6,
  },
  alreadyActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  comparisonBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 8,
    marginBottom: 8,
  },
  colHead: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowTitle: {
    fontSize: 12,
    color: '#334155',
  },
  check: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
    textAlign: 'center',
  },
  cellText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  historyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  invoiceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  invoiceDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  invoiceAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  invoiceReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  invoiceReceiptText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  noInvoices: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cancelModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  warningIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cancelTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  cancelDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  cancelButtons: {
    width: '100%',
    gap: 10,
  },
  keepBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  keepBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});
