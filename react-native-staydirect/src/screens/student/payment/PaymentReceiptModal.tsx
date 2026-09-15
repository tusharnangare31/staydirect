import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../../constants/theme';
import { Payment } from '../../../types/database.types';

interface PaymentReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  payment: Payment | null;
  hostelName?: string;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  visible,
  onClose,
  payment,
  hostelName,
}) => {
  if (!payment) return null;

  const displayHostelName = hostelName || payment.hostel?.name || 'StayDirect Verified Hostel';
  const receiptDate = payment.paid_at
    ? new Date(payment.paid_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date(payment.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        title: `StayDirect Receipt - ${payment.id.slice(0, 8)}`,
        message: `StayDirect Official Payment Receipt\n\nHostel: ${displayHostelName}\nAmount Paid: ₹${payment.amount}\nPayment ID: ${payment.provider_payment_id || payment.id}\nStatus: ${payment.status.toUpperCase()}\nDate: ${receiptDate}\n\n100% Zero Brokerage Verified Stay. Pune, Maharashtra.`,
      });
    } catch (e: any) {
      Alert.alert('Share Error', e.message || 'Could not share receipt');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Official Payment Receipt</Text>
              <Text style={styles.headerSub}>StayDirect Zero Brokerage Platform</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Receipt Card */}
            <View style={styles.receiptCard}>
              <View style={styles.brandRow}>
                <View>
                  <Text style={styles.brandName}>StayDirect</Text>
                  <Text style={styles.brandTag}>Pune Student Housing</Text>
                </View>
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                  <Text style={styles.paidBadgeText}>PAID & VERIFIED</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailGrid}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Receipt Number</Text>
                  <Text style={styles.detailValue}>
                    SD-REC-{payment.id.slice(0, 8).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Transaction Date</Text>
                  <Text style={styles.detailValue}>{receiptDate}</Text>
                </View>
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>
                    {payment.payment_provider.toUpperCase()} (UPI / NetBanking)
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Provider Ref</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {payment.provider_payment_id || 'sd_trans_verified'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionHeading}>Stay Details</Text>
              <View style={styles.itemRow}>
                <Text style={styles.itemTitle}>{displayHostelName}</Text>
                <Text style={styles.itemType}>
                  {payment.payment_type === 'booking_deposit'
                    ? 'Refundable Security Deposit'
                    : payment.payment_type === 'service_fee'
                    ? 'Platform Verification Fee'
                    : 'Owner Subscription'}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Price Breakdown */}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Base Payment</Text>
                <Text style={styles.rowValue}>₹{payment.amount}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Brokerage & Commission</Text>
                <Text style={styles.freeValue}>₹0 (Zero Brokerage)</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Taxes (GST 18% included)</Text>
                <Text style={styles.rowValue}>₹0.00</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount Paid</Text>
                <Text style={styles.totalValue}>₹{payment.amount}</Text>
              </View>

              {payment.refund_status && payment.refund_status !== 'none' && (
                <View style={styles.refundBox}>
                  <Ionicons name="information-circle" size={18} color="#0284C7" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.refundTitle}>Refund Status: {payment.refund_status.toUpperCase()}</Text>
                    <Text style={styles.refundDesc}>
                      {payment.refund_status === 'requested'
                        ? 'Refund of ₹' + (payment.refund_amount || payment.amount) + ' is currently under admin review.'
                        : payment.refund_status === 'processed'
                        ? 'Refund of ₹' + (payment.refund_amount || payment.amount) + ' has been credited back to your original payment method.'
                        : 'Refund request was declined: ' + (payment.rejection_reason || 'Policy limitation')}
                    </Text>
                  </View>
                </View>
              )}

              {/* Security Seal */}
              <View style={styles.sealRow}>
                <Ionicons name="shield-checkmark" size={18} color={THEME.colors.primary} />
                <Text style={styles.sealText}>
                  Protected by StayDirect Escrow & 100% Zero Brokerage Policy.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareReceipt}>
              <Ionicons name="share-social-outline" size={18} color={THEME.colors.primary} />
              <Text style={styles.shareBtnText}>Share / Save Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  receiptCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  brandTag: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  paidBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  itemRow: {
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemType: {
    fontSize: 12,
    color: '#64748B',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: '#475569',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  freeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  refundBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  refundTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  refundDesc: {
    fontSize: 11,
    color: '#0C4A6E',
    marginTop: 2,
    lineHeight: 16,
  },
  sealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  sealText: {
    fontSize: 11,
    color: '#1E40AF',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.primary,
    marginLeft: 6,
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
