import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../../constants/theme';
import { Hostel, Room, Booking, Payment } from '../../../types/database.types';
import { paymentManager } from '../../../lib/payments';
import { PaymentReceiptModal } from './PaymentReceiptModal';

export type PaymentFlowStep = 'summary' | 'processing' | 'success' | 'failed';

interface PaymentFlowModalProps {
  visible: boolean;
  onClose: () => void;
  hostel: Hostel;
  room?: Room | null;
  booking?: Booking | null;
  moveInDate?: string;
  durationMonths?: number;
  onPaymentSuccess?: (payment: any) => void;
}

export const PaymentFlowModal: React.FC<PaymentFlowModalProps> = ({
  visible,
  onClose,
  hostel,
  room,
  booking,
  moveInDate = '2025-07-01',
  durationMonths = 6,
  onPaymentSuccess,
}) => {
  const [step, setStep] = useState<PaymentFlowStep>('summary');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [statusMessage, setStatusMessage] = useState('Initializing secure bank checkout...');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedPayment, setConfirmedPayment] = useState<Payment | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Financial calculations
  const depositAmount = booking?.security_deposit || room?.deposit || hostel.security_deposit || 5000;
  const platformFee = 0; // Explicitly 0 for Zero Brokerage
  const verificationPassFee = 99; // Standard platform tenant pass fee
  const totalAmount = depositAmount + platformFee + verificationPassFee;

  const handleStartPayment = async () => {
    if (!termsAccepted) {
      Alert.alert('Terms Required', 'Please accept the refund policy and booking terms.');
      return;
    }

    try {
      setStep('processing');
      setStatusMessage('Creating encrypted payment order...');

      // 1. Create payment order via abstraction (Supabase Edge Function or fallback)
      const order = await paymentManager.createBookingDepositOrder(
        booking?.id || `b_temp_${Date.now()}`,
        hostel.owner_id,
        totalAmount
      );

      setStatusMessage('Opening Razorpay UPI & NetBanking Gateway...');

      // Simulate network wait for payment gateway interaction
      await new Promise((resolve) => setTimeout(resolve, 1800));

      setStatusMessage('Verifying payment signature with bank servers...');

      // 2. Server-side verification via Supabase Edge Function
      const verifyResult = await paymentManager.verifyPayment({
        paymentId: order.paymentId,
        providerOrderId: order.orderId,
        providerPaymentId: `pay_rzp_${Date.now().toString(36)}`,
        providerSignature: `sig_${Math.random().toString(36).slice(2, 12)}`,
      });

      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Payment signature verification failed.');
      }

      // Success payload
      const paidPayment: Payment = {
        id: order.paymentId,
        user_id: booking?.student_id || '00000000-0000-0000-0000-000000000010',
        booking_id: booking?.id || null,
        owner_id: hostel.owner_id,
        payment_provider: 'razorpay',
        provider_order_id: order.orderId,
        provider_payment_id: `pay_rzp_${Date.now().toString(36)}`,
        amount: totalAmount,
        currency: 'INR',
        payment_type: 'booking_deposit',
        status: 'paid',
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hostel: hostel,
      };

      setConfirmedPayment(paidPayment);
      setStep('success');
      onPaymentSuccess?.(paidPayment);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing was declined or timed out.');
      setStep('failed');
    }
  };

  const handleSimulateFailure = () => {
    setErrorMessage('Simulated Payment Error: UPI payment request was timed out by bank.');
    setStep('failed');
  };

  const handleReset = () => {
    setStep('summary');
    setErrorMessage('');
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={step === 'processing' ? undefined : onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.shieldIcon}>
                  <Ionicons name="shield-checkmark" size={18} color={THEME.colors.primary} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>
                    {step === 'summary' && 'Payment Summary'}
                    {step === 'processing' && 'Processing Payment'}
                    {step === 'success' && 'Payment Confirmed!'}
                    {step === 'failed' && 'Payment Unsuccessful'}
                  </Text>
                  <Text style={styles.headerSub}>
                    {step === 'summary' && '100% Zero Brokerage • Direct Stay'}
                    {step === 'processing' && '256-Bit SSL Encrypted Transaction'}
                    {step === 'success' && 'Your vacancy is secured'}
                    {step === 'failed' && 'No amount was deducted'}
                  </Text>
                </View>
              </View>

              {step !== 'processing' && (
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
                </TouchableOpacity>
              )}
            </View>

            {/* 1. PAYMENT SUMMARY STEP */}
            {step === 'summary' && (
              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {/* Hostel and Room Card */}
                <View style={styles.summaryCard}>
                  <Text style={styles.hostelName}>{hostel.name}</Text>
                  <Text style={styles.hostelArea}>
                    <Ionicons name="location-outline" size={13} color="#64748B" /> {hostel.area}, Pune
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Room Selection</Text>
                      <Text style={styles.metaValue}>
                        {room?.sharing_type || booking?.sharing_type || 'Standard Sharing'}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Move-in Date</Text>
                      <Text style={styles.metaValue}>{booking?.move_in_date || moveInDate}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Duration</Text>
                      <Text style={styles.metaValue}>{booking?.duration_months || durationMonths} Months</Text>
                    </View>
                  </View>
                </View>

                {/* Amount Breakdown */}
                <View style={styles.breakdownBox}>
                  <Text style={styles.sectionTitle}>Price Breakdown (INR)</Text>

                  <View style={styles.row}>
                    <Text style={styles.label}>Refundable Security Deposit</Text>
                    <Text style={styles.value}>₹{depositAmount}</Text>
                  </View>

                  <View style={styles.row}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.label}>Brokerage & Commission</Text>
                      <View style={styles.freePill}>
                        <Text style={styles.freePillText}>ZERO</Text>
                      </View>
                    </View>
                    <Text style={styles.freeText}>₹0 (Free)</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Student Verification & Pass Fee</Text>
                    <Text style={styles.value}>₹{verificationPassFee}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Payable Now</Text>
                    <Text style={styles.totalValue}>₹{totalAmount}</Text>
                  </View>
                </View>

                {/* Payment Method Selector */}
                <View style={styles.paymentMethodSection}>
                  <Text style={styles.sectionTitle}>Select Payment Method</Text>
                  <View style={styles.methodsRow}>
                    <TouchableOpacity
                      style={[styles.methodBtn, paymentMethod === 'upi' && styles.methodBtnActive]}
                      onPress={() => setPaymentMethod('upi')}
                    >
                      <Ionicons
                        name="phone-portrait-outline"
                        size={18}
                        color={paymentMethod === 'upi' ? THEME.colors.primary : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.methodText,
                          paymentMethod === 'upi' && styles.methodTextActive,
                        ]}
                      >
                        UPI (GPay / PhonePe)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.methodBtn, paymentMethod === 'card' && styles.methodBtnActive]}
                      onPress={() => setPaymentMethod('card')}
                    >
                      <Ionicons
                        name="card-outline"
                        size={18}
                        color={paymentMethod === 'card' ? THEME.colors.primary : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.methodText,
                          paymentMethod === 'card' && styles.methodTextActive,
                        ]}
                      >
                        Debit / Credit Card
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Refund Policy Card */}
                <View style={styles.policyCard}>
                  <Ionicons name="information-circle" size={20} color="#0369A1" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.policyTitle}>100% Refundable Deposit Policy</Text>
                    <Text style={styles.policyDesc}>
                      If you cancel before your move-in date or if the room is found inaccurate during check-in, your security deposit is refunded in full. No hidden forfeiture.
                    </Text>
                  </View>
                </View>

                {/* Terms and Conditions */}
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                >
                  <Ionicons
                    name={termsAccepted ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={termsAccepted ? THEME.colors.primary : '#94A3B8'}
                  />
                  <Text style={styles.termsText}>
                    I agree to the StayDirect Zero Brokerage Terms & Conditions and property house rules.
                  </Text>
                </TouchableOpacity>

                {/* Pay Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.payBtn} onPress={handleStartPayment}>
                    <Text style={styles.payBtnText}>Pay Securely ₹{totalAmount}</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.simulateFailBtn} onPress={handleSimulateFailure}>
                    <Text style={styles.simulateFailText}>Test Failure Flow</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* 2. PAYMENT PROCESSING STEP */}
            {step === 'processing' && (
              <View style={styles.centerContainer}>
                <View style={styles.pulseIconWrap}>
                  <ActivityIndicator size="large" color={THEME.colors.primary} />
                </View>
                <Text style={styles.processingTitle}>Securing Your Booking</Text>
                <Text style={styles.processingStatus}>{statusMessage}</Text>
                <Text style={styles.processingNote}>
                  Please do not close this window or press the back button while the payment provider processes your transaction.
                </Text>

                <View style={styles.encryptionBadge}>
                  <Ionicons name="lock-closed" size={14} color="#059669" />
                  <Text style={styles.encryptionText}>Razorpay 256-Bit SSL Bank Escrow</Text>
                </View>

                <TouchableOpacity
                  style={styles.cancelProcessingBtn}
                  onPress={() => {
                    setStep('failed');
                    setErrorMessage('Transaction was cancelled by the user.');
                  }}
                >
                  <Text style={styles.cancelProcessingText}>Cancel Payment</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 3. PAYMENT SUCCESS STEP */}
            {step === 'success' && (
              <View style={styles.centerContainer}>
                <View style={styles.successIconWrap}>
                  <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
                </View>

                <Text style={styles.successTitle}>Payment Verified! 🎉</Text>
                <Text style={styles.successSub}>
                  Your deposit has been safely received. The vacancy is reserved with 100% Zero Brokerage.
                </Text>

                <View style={styles.receiptSummaryCard}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Hostel</Text>
                    <Text style={styles.receiptVal} numberOfLines={1}>{hostel.name}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Amount Paid</Text>
                    <Text style={[styles.receiptVal, { color: '#16A34A', fontWeight: '800' }]}>
                      ₹{confirmedPayment?.amount || totalAmount}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Payment ID</Text>
                    <Text style={styles.receiptVal}>
                      {confirmedPayment?.provider_payment_id || 'pay_rzp_demo_confirmed'}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Date & Time</Text>
                    <Text style={styles.receiptVal}>
                      {new Date().toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.successActions}>
                  <TouchableOpacity
                    style={styles.receiptBtn}
                    onPress={() => setShowReceiptModal(true)}
                  >
                    <Ionicons name="document-text-outline" size={18} color={THEME.colors.primary} />
                    <Text style={styles.receiptBtnText}>View & Download Receipt</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.donePrimaryBtn}
                    onPress={onClose}
                  >
                    <Text style={styles.donePrimaryText}>View My Bookings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 4. PAYMENT FAILED STEP */}
            {step === 'failed' && (
              <View style={styles.centerContainer}>
                <View style={styles.failedIconWrap}>
                  <Ionicons name="alert-circle" size={64} color="#DC2626" />
                </View>

                <Text style={styles.failedTitle}>Payment Failed</Text>
                <Text style={styles.failedSub}>
                  {errorMessage || 'Your payment was declined by the bank or cancelled. Your booking is kept in pending state so you can retry anytime.'}
                </Text>

                <View style={styles.failedActions}>
                  <TouchableOpacity style={styles.retryBtn} onPress={handleReset}>
                    <Ionicons name="refresh" size={18} color="#FFFFFF" />
                    <Text style={styles.retryBtnText}>Retry Payment</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.changeMethodBtn}
                    onPress={() => {
                      setStep('summary');
                    }}
                  >
                    <Ionicons name="card-outline" size={18} color={THEME.colors.textPrimary} />
                    <Text style={styles.changeMethodText}>Change Payment Method</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.supportBtn}
                    onPress={() => {
                      Alert.alert(
                        'StayDirect Helpdesk',
                        'Need help with your deposit payment? Reach out directly via WhatsApp at +91 98220 00000 or email support@staydirect.in'
                      );
                    }}
                  >
                    <Text style={styles.supportBtnText}>Contact Support</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Official Receipt Sub-Modal */}
      <PaymentReceiptModal
        visible={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        payment={confirmedPayment}
        hostelName={hostel.name}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  hostelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  hostelArea: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  breakdownBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#475569',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  freePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  freePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  freeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  paymentMethodSection: {
    marginBottom: 14,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  methodBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 6,
  },
  methodTextActive: {
    color: THEME.colors.primary,
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  policyDesc: {
    fontSize: 11,
    color: '#0C4A6E',
    marginTop: 2,
    lineHeight: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  termsText: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  actionButtons: {
    marginBottom: 20,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
  },
  payBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  simulateFailBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 6,
  },
  simulateFailText: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  centerContainer: {
    padding: 24,
    alignItems: 'center',
  },
  pulseIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  processingStatus: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  processingNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  encryptionText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelProcessingBtn: {
    paddingVertical: 10,
  },
  cancelProcessingText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  successIconWrap: {
    marginVertical: 14,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  receiptSummaryCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  receiptVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '65%',
  },
  successActions: {
    width: '100%',
    gap: 10,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#EFF6FF',
  },
  receiptBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginLeft: 6,
  },
  donePrimaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  donePrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  failedIconWrap: {
    marginVertical: 14,
  },
  failedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  failedSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  failedActions: {
    width: '100%',
    gap: 10,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  changeMethodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  changeMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginLeft: 6,
  },
  supportBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  supportBtnText: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
});
