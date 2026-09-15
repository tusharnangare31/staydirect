import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../../constants/theme';
import { Header } from '../../../components/Header';
import { useStudentPayments } from '../../../hooks/usePayments';
import { Payment } from '../../../types/database.types';
import { PaymentReceiptModal } from './PaymentReceiptModal';

export const PaymentHistoryScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const {
    payments,
    isLoading,
    refetch,
    isRefetching,
    requestRefund,
    isRequestingRefund,
  } = useStudentPayments();

  const [filter, setFilter] = useState<'all' | 'paid' | 'refunded'>('all');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);

  // Refund Request Dialog State
  const [refundTargetPayment, setRefundTargetPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'paid') return p.status === 'paid';
    if (filter === 'refunded') return p.status === 'refunded' || p.refund_status === 'requested' || p.refund_status === 'processed';
    return true;
  });

  const getStatusStyle = (status: string, refundStatus?: string) => {
    if (refundStatus === 'requested') {
      return { bg: '#FEF3C7', text: '#D97706', label: 'Refund Requested' };
    }
    if (refundStatus === 'processed' || status === 'refunded') {
      return { bg: '#EFF6FF', text: '#2563EB', label: 'Refunded ↩' };
    }
    if (status === 'paid') {
      return { bg: '#DCFCE7', text: '#15803D', label: 'Paid ✓' };
    }
    if (status === 'failed') {
      return { bg: '#FEE2E2', text: '#DC2626', label: 'Failed' };
    }
    return { bg: '#F1F5F9', text: '#64748B', label: status };
  };

  const handleSubmitRefund = async () => {
    if (!refundTargetPayment) return;
    if (!refundReason.trim()) {
      Alert.alert('Reason Required', 'Please explain the reason for requesting a refund.');
      return;
    }

    try {
      await requestRefund({
        paymentId: refundTargetPayment.id,
        reason: refundReason.trim(),
        refundAmount: refundTargetPayment.amount,
      });

      Alert.alert(
        'Refund Request Submitted',
        'Your refund request has been sent for admin review. Eligible deposits are processed back to your original payment method in 24-48 hours.'
      );
      setRefundTargetPayment(null);
      setRefundReason('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not submit refund request');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Payment & Deposit History"
        subtitle="Zero Brokerage Verified Transactions"
      />

      {/* Back button row if presented standalone */}
      {onBack && (
        <TouchableOpacity style={styles.backRow} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={THEME.colors.primary} />
          <Text style={styles.backText}>Back to Profile</Text>
        </TouchableOpacity>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({payments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'paid' && styles.filterChipActive]}
          onPress={() => setFilter('paid')}
        >
          <Text style={[styles.filterText, filter === 'paid' && styles.filterTextActive]}>
            Successful
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'refunded' && styles.filterChipActive]}
          onPress={() => setFilter('refunded')}
        >
          <Text style={[styles.filterText, filter === 'refunded' && styles.filterTextActive]}>
            Refunds
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[THEME.colors.primary]}
          />
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status, item.refund_status);
          const isDeposit = item.payment_type === 'booking_deposit';
          const canRequestRefund =
            item.status === 'paid' && (!item.refund_status || item.refund_status === 'none');

          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.typeWrap}>
                  <Ionicons
                    name={isDeposit ? 'home-outline' : 'receipt-outline'}
                    size={16}
                    color={THEME.colors.primary}
                  />
                  <Text style={styles.typeText}>
                    {item.payment_type === 'booking_deposit'
                      ? 'Security Deposit'
                      : item.payment_type === 'service_fee'
                      ? 'Platform Pass'
                      : item.payment_type}
                  </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {statusStyle.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.titleText}>
                {item.hostel?.name || 'StayDirect Pune Housing'}
              </Text>

              <View style={styles.detailsGrid}>
                <View style={styles.gridItem}>
                  <Text style={styles.itemLabel}>Amount</Text>
                  <Text style={styles.itemValue}>₹{item.amount}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.itemLabel}>Date</Text>
                  <Text style={styles.itemValue}>
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.itemLabel}>Provider</Text>
                  <Text style={styles.itemValue}>
                    {item.payment_provider.toUpperCase()}
                  </Text>
                </View>
              </View>

              {item.failure_reason ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={14} color="#DC2626" />
                  <Text style={styles.errorText}>Reason: {item.failure_reason}</Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                {item.status === 'paid' && (
                  <TouchableOpacity
                    style={styles.receiptBtn}
                    onPress={() => setSelectedReceiptPayment(item)}
                  >
                    <Ionicons name="document-text-outline" size={15} color={THEME.colors.primary} />
                    <Text style={styles.receiptBtnText}>View Receipt</Text>
                  </TouchableOpacity>
                )}

                {canRequestRefund && isDeposit && (
                  <TouchableOpacity
                    style={styles.refundBtn}
                    onPress={() => {
                      setRefundTargetPayment(item);
                      setRefundReason('');
                    }}
                  >
                    <Ionicons name="arrow-undo-outline" size={15} color="#D97706" />
                    <Text style={styles.refundBtnText}>Request Refund</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={THEME.colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={48} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySub}>
                Your payment receipts, booking deposits, and refund statuses will be listed here.
              </Text>
            </View>
          )
        }
      />

      {/* Receipt Modal */}
      <PaymentReceiptModal
        visible={!!selectedReceiptPayment}
        onClose={() => setSelectedReceiptPayment(null)}
        payment={selectedReceiptPayment}
      />

      {/* Refund Request Modal */}
      <Modal
        visible={!!refundTargetPayment}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRefundTargetPayment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Deposit Refund</Text>
              <TouchableOpacity onPress={() => setRefundTargetPayment(null)}>
                <Ionicons name="close" size={22} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Hostel: {refundTargetPayment?.hostel?.name || 'StayDirect Hostel'}
              {'\n'}Deposit Amount: ₹{refundTargetPayment?.amount}
            </Text>

            <Text style={styles.inputLabel}>Reason for Refund Request</Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. Plan cancelled before move-in date, semester delayed, or mutual agreement with owner..."
              placeholderTextColor="#94A3B8"
              value={refundReason}
              onChangeText={setRefundReason}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setRefundTargetPayment(null)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitRefundBtn}
                onPress={handleSubmitRefund}
                disabled={isRequestingRefund}
              >
                {isRequestingRefund ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitRefundText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  receiptBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
    marginLeft: 4,
  },
  refundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  refundBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    minHeight: 90,
    marginBottom: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
  },
  cancelModalText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  submitRefundBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#D97706',
    borderRadius: 10,
  },
  submitRefundText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
