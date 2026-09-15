// ====================================================================
// StayDirect — Phase 6: Admin Payments & Revenue Management
// Target: React Native / Expo
// ====================================================================

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { Header } from '../../src/components/Header';
import { useAdminPayments } from '../../src/hooks/usePayments';
import { Payment } from '../../src/types/database.types';

interface AdminPaymentsScreenProps {
  onBack?: () => void;
}

export const AdminPaymentsScreen: React.FC<AdminPaymentsScreenProps> = ({ onBack }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    stats,
    payments,
    isLoading,
    refetch,
    isRefetching,
    reviewRefund,
    isReviewingRefund,
  } = useAdminPayments({
    status: statusFilter,
    paymentType: typeFilter,
  });

  // Selected payment for detail / refund review
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter payments by search query
  const filteredPayments = payments.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const studentName = item.user?.full_name?.toLowerCase() || '';
    const ownerName = item.owner?.full_name?.toLowerCase() || '';
    const paymentId = item.provider_payment_id?.toLowerCase() || '';
    const orderId = item.provider_order_id?.toLowerCase() || '';
    const hostelName = item.hostel?.name?.toLowerCase() || '';

    return (
      studentName.includes(q) ||
      ownerName.includes(q) ||
      paymentId.includes(q) ||
      orderId.includes(q) ||
      hostelName.includes(q)
    );
  });

  const getStatusBadge = (status: string, refundStatus?: string) => {
    if (refundStatus === 'requested') {
      return { bg: '#FEF3C7', text: '#D97706', label: 'REFUND REQUESTED' };
    }
    if (refundStatus === 'processed' || status === 'refunded') {
      return { bg: '#EFF6FF', text: '#2563EB', label: 'REFUNDED' };
    }
    if (status === 'paid') {
      return { bg: '#DCFCE7', text: '#15803D', label: 'PAID' };
    }
    if (status === 'failed') {
      return { bg: '#FEE2E2', text: '#DC2626', label: 'FAILED' };
    }
    return { bg: '#F1F5F9', text: '#64748B', label: status.toUpperCase() };
  };

  const handleApproveRefund = async () => {
    if (!selectedPayment) return;
    try {
      await reviewRefund({
        paymentId: selectedPayment.id,
        decision: 'approved',
      });
      setIsReviewModalVisible(false);
      setSelectedPayment(null);
      Alert.alert(
        'Refund Approved! 💸',
        `Refund of ₹${selectedPayment.refund_amount || selectedPayment.amount} has been approved and marked for escrow disbursement.`
      );
    } catch (e: any) {
      Alert.alert('Refund Error', e.message || 'Could not approve refund.');
    }
  };

  const handleRejectRefund = async () => {
    if (!selectedPayment) return;
    if (!rejectionReason.trim()) {
      Alert.alert('Reason Required', 'Please enter a rejection reason for the student.');
      return;
    }

    try {
      await reviewRefund({
        paymentId: selectedPayment.id,
        decision: 'rejected',
        rejectionReason: rejectionReason.trim(),
      });
      setIsReviewModalVisible(false);
      setSelectedPayment(null);
      setRejectionReason('');
      Alert.alert('Refund Rejected', 'The refund request has been rejected.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not reject refund.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Payment & Revenue Center"
        subtitle="Pune Hostel Escrow & Financial Audit"
      />

      {onBack && (
        <TouchableOpacity style={styles.backRow} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={THEME.colors.primary} />
          <Text style={styles.backText}>Back to Admin Overview</Text>
        </TouchableOpacity>
      )}

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
        ListHeaderComponent={
          <>
            {/* REVENUE STATISTICS GRID */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Platform Financial Metrics (INR)</Text>

              <View style={styles.statsGrid}>
                {/* Total Gross Volume */}
                <View style={[styles.statCard, { backgroundColor: '#0F172A' }]}>
                  <View style={styles.statIconWrap}>
                    <Ionicons name="wallet-outline" size={18} color="#38BDF8" />
                  </View>
                  <Text style={[styles.statVal, { color: '#FFFFFF' }]}>
                    ₹{stats.total_volume.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.statLabel, { color: '#94A3B8' }]}>
                    Gross Payment Volume
                  </Text>
                </View>

                {/* Subscriptions Revenue */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="ribbon-outline" size={18} color="#16A34A" />
                  </View>
                  <Text style={[styles.statVal, { color: '#16A34A' }]}>
                    ₹{stats.subscription_revenue.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.statLabel}>Owner Subscriptions</Text>
                </View>

                {/* Booking Deposit Escrow */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="home-outline" size={18} color={THEME.colors.primary} />
                  </View>
                  <Text style={[styles.statVal, { color: THEME.colors.primary }]}>
                    ₹{stats.deposit_volume.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.statLabel}>Booking Deposits</Text>
                </View>

                {/* Pending Refunds Highlight */}
                <View style={[styles.statCard, stats.pending_count > 0 && styles.alertCard]}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="alert-circle-outline" size={18} color="#D97706" />
                  </View>
                  <Text style={[styles.statVal, { color: '#D97706' }]}>
                    {stats.pending_count}
                  </Text>
                  <Text style={styles.statLabel}>Pending Actions / Refunds</Text>
                </View>
              </View>
            </View>

            {/* SEARCH AND FILTERS */}
            <View style={styles.filterSection}>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by student, owner, payment ID, hostel..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Status Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {[
                  { id: 'all', label: 'All Status' },
                  { id: 'paid', label: 'Paid' },
                  { id: 'refunded', label: 'Refunds' },
                  { id: 'failed', label: 'Failed' },
                ].map((st) => (
                  <TouchableOpacity
                    key={st.id}
                    style={[
                      styles.chip,
                      statusFilter === st.id && styles.chipActive,
                    ]}
                    onPress={() => setStatusFilter(st.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        statusFilter === st.id && styles.chipTextActive,
                      ]}
                    >
                      {st.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Payment Type Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.chipsScroll, { marginTop: 8 }]}
              >
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'booking_deposit', label: 'Deposits' },
                  { id: 'owner_subscription', label: 'Subscriptions' },
                  { id: 'service_fee', label: 'Service Fees' },
                ].map((tp) => (
                  <TouchableOpacity
                    key={tp.id}
                    style={[
                      styles.chip,
                      typeFilter === tp.id && styles.chipActive,
                    ]}
                    onPress={() => setTypeFilter(tp.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        typeFilter === tp.id && styles.chipTextActive,
                      ]}
                    >
                      {tp.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.listHeaderRow}>
              <Text style={styles.listCountText}>
                Transactions ({filteredPayments.length})
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status, item.refund_status);
          const hasRefundPending = item.refund_status === 'requested';

          return (
            <TouchableOpacity
              style={[styles.transactionCard, hasRefundPending && styles.pendingCardBorder]}
              onPress={() => {
                setSelectedPayment(item);
                setIsReviewModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.typeBox}>
                  <Text style={styles.typeText}>
                    {item.payment_type === 'booking_deposit'
                      ? 'DEPOSIT'
                      : item.payment_type === 'owner_subscription'
                      ? 'SUBSCRIPTION'
                      : 'SERVICE FEE'}
                  </Text>
                </View>

                <View style={[styles.badgeWrap, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMainRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hostelName}>
                    {item.hostel?.name || item.owner?.college_or_company || 'StayDirect Platform'}
                  </Text>

                  <Text style={styles.partyText}>
                    Student: {item.user?.full_name || 'Pune Student'} • Owner: {item.owner?.full_name || 'Verified Owner'}
                  </Text>

                  <Text style={styles.refText}>
                    ID: {item.provider_payment_id || item.id.slice(0, 12)}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.amountText}>₹{item.amount}</Text>
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Text>
                </View>
              </View>

              {hasRefundPending && (
                <View style={styles.refundAlertRow}>
                  <Ionicons name="alert-circle" size={14} color="#D97706" />
                  <Text style={styles.refundAlertText}>
                    Student requested refund: "{(item.refund_reason || 'Cancellation').slice(0, 45)}..."
                  </Text>
                  <Text style={styles.reviewPromptText}>Tap to Review</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={THEME.colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="card-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Matching Payments</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search criteria or filter selections.
              </Text>
            </View>
          )
        }
      />

      {/* REFUND & TRANSACTION DETAIL MODAL */}
      <Modal
        visible={isReviewModalVisible && !!selectedPayment}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Transaction Details</Text>
                <Text style={styles.modalSub}>
                  Provider: {selectedPayment?.payment_provider.toUpperCase()} • Razorpay Escrow
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Financial Box */}
              <View style={styles.modalPriceBox}>
                <Text style={styles.modalPriceLabel}>Total Amount</Text>
                <Text style={styles.modalPriceVal}>₹{selectedPayment?.amount}</Text>
                <Text style={styles.modalPriceSub}>
                  Type: {selectedPayment?.payment_type} • Status: {selectedPayment?.status.toUpperCase()}
                </Text>
              </View>

              {/* Refund Request Info if applicable */}
              {selectedPayment?.refund_status === 'requested' && (
                <View style={styles.refundActionBox}>
                  <View style={styles.refundActionHeader}>
                    <Ionicons name="alert-circle" size={18} color="#D97706" />
                    <Text style={styles.refundActionTitle}>Pending Refund Request</Text>
                  </View>
                  <Text style={styles.refundDetailRow}>
                    <Text style={{ fontWeight: '700' }}>Reason given by student: </Text>
                    {selectedPayment.refund_reason || 'No detailed reason provided.'}
                  </Text>
                  <Text style={styles.refundDetailRow}>
                    <Text style={{ fontWeight: '700' }}>Requested Amount: </Text>
                    ₹{selectedPayment.refund_amount || selectedPayment.amount}
                  </Text>

                  {/* Rejection input */}
                  <Text style={styles.rejectionLabel}>Rejection Reason (if declining):</Text>
                  <TextInput
                    style={styles.rejectionInput}
                    placeholder="Enter reason if you decide to reject..."
                    placeholderTextColor="#94A3B8"
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                  />

                  {/* Decision Buttons */}
                  <View style={styles.decisionRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={handleRejectRefund}
                      disabled={isReviewingRefund}
                    >
                      <Text style={styles.rejectBtnText}>Decline Refund</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={handleApproveRefund}
                      disabled={isReviewingRefund}
                    >
                      {isReviewingRefund ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.approveBtnText}>Approve & Escrow Refund</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Information Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Student</Text>
                  <Text style={styles.infoVal}>
                    {selectedPayment?.user?.full_name || 'Pune Student'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Student Phone</Text>
                  <Text style={styles.infoVal}>
                    {selectedPayment?.user?.phone || '+91 98000 00000'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Hostel Owner</Text>
                  <Text style={styles.infoVal}>
                    {selectedPayment?.owner?.full_name || 'Registered Owner'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Hostel / Property</Text>
                  <Text style={styles.infoVal}>
                    {selectedPayment?.hostel?.name || 'StayDirect Verified Stay'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Razorpay Order ID</Text>
                  <Text style={[styles.infoVal, { fontSize: 11 }]}>
                    {selectedPayment?.provider_order_id || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Razorpay Payment ID</Text>
                  <Text style={[styles.infoVal, { fontSize: 11 }]}>
                    {selectedPayment?.provider_payment_id || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Created At</Text>
                  <Text style={styles.infoVal}>
                    {selectedPayment?.created_at
                      ? new Date(selectedPayment.created_at).toLocaleString('en-IN')
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setIsReviewModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminPaymentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primary,
    marginLeft: 6,
  },
  listContent: {
    paddingBottom: 40,
  },
  statsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  alertCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  filterSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    marginLeft: 8,
  },
  chipsScroll: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listHeaderRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pendingCardBorder: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFDF5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  badgeWrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cardMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hostelName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  partyText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  refText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  refundAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  refundAlertText: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
  },
  reviewPromptText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalBody: {
    maxHeight: 450,
  },
  modalPriceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalPriceLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  modalPriceVal: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 2,
  },
  modalPriceSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  refundActionBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 16,
  },
  refundActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  refundActionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  refundDetailRow: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 6,
    lineHeight: 18,
  },
  rejectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    marginTop: 8,
    marginBottom: 4,
  },
  rejectionInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 12,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  approveBtn: {
    flex: 1.5,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#16A34A',
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoGrid: {
    gap: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoKey: {
    fontSize: 12,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '60%',
    textAlign: 'right',
  },
  closeModalBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginTop: 10,
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
