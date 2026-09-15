import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../../src/constants/theme';
import { useAuth } from '../../../src/context/AuthContext';
import { useHostelDetail } from '../../../src/hooks/useHostels';
import { supabase } from '../../../src/lib/supabase';
import { logAdminAction, FALLBACK_MODERATION_HOSTELS } from '../../../src/hooks/useAdmin';
import { Hostel } from '../../../src/types/database.types';

export interface AdminListingDetailScreenProps {
  hostelId: string;
  onBack?: () => void;
  onActionComplete?: () => void;
}

export const AdminListingDetailScreen: React.FC<AdminListingDetailScreenProps> = ({
  hostelId,
  onBack,
  onActionComplete,
}) => {
  const { user } = useAuth();
  const { data: hostelData, isLoading, refetch } = useHostelDetail(hostelId);

  // Use fallback if not found in db
  const hostel: Hostel =
    hostelData ||
    FALLBACK_MODERATION_HOSTELS.find((h) => h.id === hostelId) ||
    FALLBACK_MODERATION_HOSTELS[0];

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);
  const [reasonInput, setReasonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    Alert.alert(
      'Approve & Publish Listing',
      `Approve "${hostel.name}"? It will become instantly visible to students across Pune with verified direct badge.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Publish',
          style: 'default',
          onPress: async () => {
            try {
              setIsProcessing(true);
              const { error } = await supabase
                .from('hostels')
                .update({
                  verification_status: 'verified',
                  is_published: true,
                })
                .eq('id', hostel.id);

              if (error) console.warn('Supabase listing approve error:', error.message);

              if (user?.id) {
                await logAdminAction(
                  user.id,
                  'approve_listing',
                  hostel.id,
                  'Verified photos, address, and college proximity.'
                );
              }

              Alert.alert('Listing Approved', 'Hostel is now active and published.');
              await refetch();
              onActionComplete?.();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Could not approve listing.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!reasonInput.trim()) {
      Alert.alert('Reason Required', 'Please enter a rejection reason for the owner.');
      return;
    }

    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('hostels')
        .update({
          verification_status: 'rejected',
          is_published: false,
        })
        .eq('id', hostel.id);

      if (error) console.warn('Listing reject error:', error.message);

      if (user?.id) {
        await logAdminAction(
          user.id,
          'reject_listing',
          hostel.id,
          reasonInput.trim()
        );
      }

      setIsRejectModalOpen(false);
      setReasonInput('');
      Alert.alert('Listing Rejected', 'Listing has been marked rejected and taken offline.');
      await refetch();
      onActionComplete?.();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not reject listing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('hostels')
        .update({
          is_published: false,
        })
        .eq('id', hostel.id);

      if (error) console.warn('Listing unpublish error:', error.message);

      if (user?.id) {
        await logAdminAction(
          user.id,
          'unpublish_listing',
          hostel.id,
          reasonInput.trim() || 'Admin unpublish / take down'
        );
      }

      setIsUnpublishModalOpen(false);
      setReasonInput('');
      Alert.alert('Listing Unpublished', 'Hostel has been removed from public student search.');
      await refetch();
      onActionComplete?.();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not unpublish listing.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading listing details...</Text>
      </View>
    );
  }

  const coverUrl =
    hostel.images && hostel.images.length > 0
      ? hostel.images[0].image_url
      : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Listing Moderation</Text>
          <Text style={styles.headerSub}>ID: {hostel.id.slice(0, 10)}...</Text>
        </View>

        <View style={styles.headerBadges}>
          <View
            style={[
              styles.statusBadge,
              hostel.verification_status === 'verified'
                ? styles.badgeVerified
                : hostel.verification_status === 'rejected'
                ? styles.badgeRejected
                : styles.badgePending,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {hostel.verification_status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Cover Photo */}
        <View style={styles.coverWrap}>
          <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.coverOverlayBadge}>
            <Ionicons name="images-outline" size={14} color="#FFFFFF" />
            <Text style={styles.coverOverlayText}>
              {hostel.images?.length || 1} Photos Attached
            </Text>
          </View>
        </View>

        {/* Primary Info Card */}
        <View style={styles.card}>
          <Text style={styles.hostelTitle}>{hostel.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={THEME.colors.primary} />
            <Text style={styles.locationText}>
              {hostel.address || `${hostel.area}, ${hostel.city}`}
            </Text>
          </View>

          {hostel.nearby_college && (
            <View style={styles.collegeRow}>
              <Ionicons name="school" size={14} color="#4338CA" />
              <Text style={styles.collegeText}>
                Proximity: {hostel.distance_to_college || 'Walking distance'} to {hostel.nearby_college}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Pricing & Terms */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Monthly Rent</Text>
              <Text style={styles.priceVal}>
                ₹{hostel.monthly_rent?.toLocaleString('en-IN') || hostel.monthly_rent_min?.toLocaleString('en-IN') || '—'}
                <Text style={styles.perMonth}> / month</Text>
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.priceLabel}>Security Deposit</Text>
              <Text style={styles.depositVal}>
                ₹{hostel.security_deposit?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>
          </View>

          <View style={styles.termsRow}>
            <View style={styles.termChip}>
              <Text style={styles.termChipText}>
                Gender: {hostel.gender_preference.toUpperCase()}
              </Text>
            </View>
            <View style={styles.termChip}>
              <Text style={styles.termChipText}>
                Status: {hostel.is_published ? 'PUBLIC' : 'UNPUBLISHED'}
              </Text>
            </View>
            <View style={styles.termChip}>
              <Text style={styles.termChipText}>
                Beds: {hostel.available_beds ?? 2} available
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Description & Amenities</Text>
          <Text style={styles.descText}>{hostel.description || 'No description provided.'}</Text>
        </View>

        {/* Owner Information */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Hostel Owner</Text>
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.avatarText}>
                {hostel.owner?.full_name ? hostel.owner.full_name[0].toUpperCase() : 'O'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.ownerName}>{hostel.owner?.full_name || 'Independent Owner'}</Text>
              <Text style={styles.ownerPhone}>
                {hostel.owner?.phone || 'No phone registered'} • {hostel.owner?.city || 'Pune'}
              </Text>
              <Text style={styles.ownerTrust}>
                {hostel.owner?.is_verified ? '✓ Verified Direct Owner Partner' : '⏳ Owner Pending Verification'}
              </Text>
            </View>
          </View>
        </View>

        {/* Moderation Controls */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionHeading}>Admin Moderation Controls</Text>
          <Text style={styles.actionsSub}>
            Take authoritative actions on this listing. All actions are logged into admin audit trail.
          </Text>

          <View style={styles.btnStack}>
            {/* Approve Button */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={handleApprove}
              disabled={isProcessing}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Approve & Publish to Students</Text>
            </TouchableOpacity>

            {/* Unpublish Toggle */}
            {hostel.is_published && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.unpublishBtn]}
                onPress={() => setIsUnpublishModalOpen(true)}
                disabled={isProcessing}
              >
                <Ionicons name="eye-off-outline" size={18} color="#D97706" />
                <Text style={[styles.actionBtnText, { color: '#D97706' }]}>
                  Unpublish / Take Down
                </Text>
              </TouchableOpacity>
            )}

            {/* Reject Button */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => setIsRejectModalOpen(true)}
              disabled={isProcessing}
            >
              <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
              <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>
                Reject Listing (with feedback)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        visible={isRejectModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRejectModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
              <Text style={styles.modalTitle}>Reject Listing</Text>
            </View>

            <Text style={styles.modalSub}>
              Select or type why this listing fails StayDirect quality standards:
            </Text>

            <View style={styles.presetReasons}>
              {[
                'Reported rent does not match actual rent demanded.',
                'Photos do not represent actual rooms or building.',
                'College proximity is inaccurate or misleading.',
                'Missing required facilities or incorrect gender tag.',
              ].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.presetBtn}
                  onPress={() => setReasonInput(reason)}
                >
                  <Text style={styles.presetBtnText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter custom rejection reason..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={reasonInput}
              onChangeText={setReasonInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsRejectModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitRejectBtn}
                onPress={handleReject}
                disabled={isProcessing || !reasonInput.trim()}
              >
                <Text style={styles.modalSubmitRejectText}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Unpublish Modal */}
      <Modal
        visible={isUnpublishModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUnpublishModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="eye-off" size={24} color="#D97706" />
              <Text style={styles.modalTitle}>Unpublish Listing</Text>
            </View>

            <Text style={styles.modalSub}>
              This will remove the listing from public student search. Specify reason:
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Complaint under investigation, owner request, seasonal renovation..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={reasonInput}
              onChangeText={setReasonInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsUnpublishModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitRejectBtn, { backgroundColor: '#D97706' }]}
                onPress={handleUnpublish}
                disabled={isProcessing}
              >
                <Text style={styles.modalSubmitRejectText}>Confirm Unpublish</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeVerified: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  coverWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  coverOverlayBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coverOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hostelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  collegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  collegeText: {
    fontSize: 12,
    color: '#4338CA',
    fontWeight: '600',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  priceVal: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 2,
  },
  perMonth: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  depositVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  termsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  termChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  termChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4338CA',
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  ownerPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  ownerTrust: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
    marginTop: 2,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionsSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 16,
  },
  btnStack: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  approveBtn: {
    backgroundColor: '#16A34A',
  },
  unpublishBtn: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rejectBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    lineHeight: 16,
    marginBottom: 12,
  },
  presetReasons: {
    gap: 6,
    marginBottom: 12,
  },
  presetBtn: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetBtnText: {
    fontSize: 11,
    color: '#334155',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitRejectBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  modalSubmitRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
