import React, { useState, useEffect } from 'react';
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../../src/constants/theme';
import { useAuth } from '../../../src/context/AuthContext';
import { AppButton } from '../../../components/ui/AppButton';
import { supabase } from '../../../src/lib/supabase';
import {
  useVerificationDetail,
  getVerificationDocumentSignedUrl,
  logAdminAction,
} from '../../../src/hooks/useAdmin';
import { OwnerVerification } from '../../../src/types/database.types';

export interface AdminVerificationDetailScreenProps {
  verificationId: string;
  onBack?: () => void;
  onActionComplete?: () => void;
}

export const AdminVerificationDetailScreen: React.FC<AdminVerificationDetailScreenProps> = ({
  verificationId,
  onBack,
  onActionComplete,
}) => {
  const { user } = useAuth();
  const { data: verification, isLoading, refetch } = useVerificationDetail(verificationId);

  const [signedDocUrl, setSignedDocUrl] = useState<string | null>(null);
  const [isUrlLoading, setIsUrlLoading] = useState(true);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (verification?.document_path) {
      setIsUrlLoading(true);
      getVerificationDocumentSignedUrl(verification.document_path)
        .then((url) => setSignedDocUrl(url))
        .finally(() => setIsUrlLoading(false));
    }
  }, [verification?.document_path]);

  const handleApprove = async () => {
    if (!verification) return;

    Alert.alert(
      'Approve Owner Verification',
      `Are you sure you want to approve ${verification.owner?.full_name || 'this owner'}? Their listings will be marked Verified Direct Partner.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Verify',
          style: 'default',
          onPress: async () => {
            try {
              setIsProcessing(true);
              const now = new Date().toISOString();

              // Update owner_verifications table
              const { error: verifError } = await supabase
                .from('owner_verifications')
                .update({
                  status: 'approved',
                  reviewed_by: user?.id || '00000000-0000-0000-0000-000000000099',
                  reviewed_at: now,
                  rejection_reason: null,
                })
                .eq('id', verification.id);

              if (verifError) console.warn('Verif update warning:', verifError.message);

              // Update profiles table
              await supabase
                .from('profiles')
                .update({ is_verified: true, updated_at: now })
                .eq('id', verification.owner_id);

              // Log admin action audit
              if (user?.id) {
                await logAdminAction(
                  user.id,
                  'approve_owner',
                  verification.owner_id,
                  `Verified ${verification.document_type} document.`
                );
              }

              Alert.alert('Approved', 'Owner has been successfully verified.');
              await refetch();
              onActionComplete?.();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Could not approve verification.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a clear rejection reason to guide the owner on what to correct.');
      return;
    }

    if (!verification) return;

    try {
      setIsProcessing(true);
      const now = new Date().toISOString();

      // Update owner_verifications
      const { error: verifError } = await supabase
        .from('owner_verifications')
        .update({
          status: 'rejected',
          reviewed_by: user?.id || '00000000-0000-0000-0000-000000000099',
          reviewed_at: now,
          rejection_reason: rejectionReason.trim(),
        })
        .eq('id', verification.id);

      if (verifError) console.warn('Verif update warning:', verifError.message);

      // Update profiles
      await supabase
        .from('profiles')
        .update({ is_verified: false, updated_at: now })
        .eq('id', verification.owner_id);

      // Log admin action
      if (user?.id) {
        await logAdminAction(
          user.id,
          'reject_owner',
          verification.owner_id,
          rejectionReason.trim()
        );
      }

      setIsRejectModalOpen(false);
      Alert.alert('Submission Rejected', 'Owner has been notified of the rejection reason.');
      await refetch();
      onActionComplete?.();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not reject verification.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Fetching verification document...</Text>
      </View>
    );
  }

  if (!verification) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#64748B' }}>Submission not found.</Text>
        <TouchableOpacity style={styles.backBtnSimple} onPress={onBack}>
          <Text style={{ color: THEME.colors.primary, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor =
    verification.status === 'approved'
      ? '#166534'
      : verification.status === 'rejected'
      ? '#991B1B'
      : '#B45309';

  const statusBg =
    verification.status === 'approved'
      ? '#DCFCE7'
      : verification.status === 'rejected'
      ? '#FEE2E2'
      : '#FEF3C7';

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Review Submission</Text>
          <Text style={styles.headerSub}>ID: {verification.id.slice(0, 10)}...</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {verification.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Owner Profile Summary Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Owner Information</Text>
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.avatarText}>
                {verification.owner?.full_name ? verification.owner.full_name[0].toUpperCase() : 'O'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.ownerName}>{verification.owner?.full_name || 'N/A'}</Text>
              <Text style={styles.ownerMeta}>
                {verification.owner?.phone || 'No phone'} • {verification.owner?.city || 'Pune'}
              </Text>
              {verification.owner?.college_or_company && (
                <Text style={styles.ownerBusiness}>
                  Trust / Business: {verification.owner.college_or_company}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.ownerDetailRow}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => {
                if (verification.owner?.phone) {
                  Linking.openURL(`tel:${verification.owner.phone}`);
                }
              }}
            >
              <Ionicons name="call" size={14} color="#4338CA" />
              <Text style={styles.contactBtnText}>Call Owner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: '#F0FDF4' }]}
              onPress={() => {
                if (verification.owner?.phone) {
                  Linking.openURL(`https://wa.me/${verification.owner.phone.replace(/[^0-9]/g, '')}`);
                }
              }}
            >
              <Ionicons name="logo-whatsapp" size={14} color="#16A34A" />
              <Text style={[styles.contactBtnText, { color: '#16A34A' }]}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Document Inspection Card */}
        <View style={styles.card}>
          <View style={styles.docHeader}>
            <View>
              <Text style={styles.sectionHeading}>Document Inspection</Text>
              <Text style={styles.docSub}>
                Type: {verification.document_type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={styles.privateSecureBadge}>
              <Ionicons name="lock-closed" size={12} color="#15803D" />
              <Text style={styles.privateSecureText}>Private S3 / RLS</Text>
            </View>
          </View>

          <View style={styles.docPreviewWrap}>
            {isUrlLoading ? (
              <View style={styles.docLoadingBox}>
                <ActivityIndicator size="small" color={THEME.colors.primary} />
                <Text style={styles.docLoadingText}>Generating temporary signed URL...</Text>
              </View>
            ) : signedDocUrl ? (
              <View>
                <Image
                  source={{ uri: signedDocUrl }}
                  style={styles.docImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.expandUrlBtn}
                  onPress={() => Linking.openURL(signedDocUrl)}
                >
                  <Ionicons name="open-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.expandUrlBtnText}>Open High-Resolution Original</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.docPlaceholder}>
                <Ionicons name="document-text-outline" size={32} color="#94A3B8" />
                <Text style={{ color: '#64748B', marginTop: 8, fontSize: 12 }}>
                  Private document path: {verification.document_path}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.pathNotice}>
            <Text style={styles.pathNoticeText} numberOfLines={1}>
              Stored in: owner-verifications/{verification.document_path}
            </Text>
            <Text style={styles.pathSubText}>
              Accessible only by authenticated StayDirect administrators.
            </Text>
          </View>
        </View>

        {/* Existing Review Notes if any */}
        {verification.rejection_reason && (
          <View style={styles.rejectedNotesCard}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.rejectedNotesTitle}>Previous Rejection Note</Text>
              <Text style={styles.rejectedNotesBody}>{verification.rejection_reason}</Text>
            </View>
          </View>
        )}

        {/* Moderation Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionHeading}>Moderation Decision</Text>
          <Text style={styles.actionsSub}>
            Approve will grant "Verified Direct Partner" status. Reject allows owner to resubmit.
          </Text>

          <View style={styles.decisionButtons}>
            <TouchableOpacity
              style={[styles.decisionBtn, styles.approveBtn]}
              onPress={handleApprove}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.decisionBtnText}>Approve Verification</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.decisionBtn, styles.rejectBtn]}
              onPress={() => setIsRejectModalOpen(true)}
              disabled={isProcessing}
            >
              <Ionicons name="close-circle" size={18} color="#DC2626" />
              <Text style={[styles.decisionBtnText, { color: '#DC2626' }]}>
                Reject with Feedback
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
              <Text style={styles.modalTitle}>Reject Verification</Text>
            </View>

            <Text style={styles.modalSub}>
              Please provide clear instructions for {verification.owner?.full_name || 'the owner'} so they can resubmit the correct document:
            </Text>

            <View style={styles.presetReasons}>
              {[
                'Document photo is blurry or unreadable.',
                'Name on electricity bill does not match registered owner name.',
                'Property address on tax receipt is outside Pune/PCMC coverage.',
                'Document expired or missing municipal seal stamp.',
              ].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.presetBtn}
                  onPress={() => setRejectionReason(reason)}
                >
                  <Text style={styles.presetBtnText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Or type custom rejection reason here..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={rejectionReason}
              onChangeText={setRejectionReason}
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
                disabled={isProcessing || !rejectionReason.trim()}
              >
                <Text style={styles.modalSubmitRejectText}>Confirm Rejection</Text>
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
  backBtnSimple: {
    marginTop: 14,
    padding: 10,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  ownerMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  ownerBusiness: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  ownerDetailRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  docSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  privateSecureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  privateSecureText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  docPreviewWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docLoadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  docLoadingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  docImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E2E8F0',
  },
  expandUrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    gap: 6,
  },
  expandUrlBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  docPlaceholder: {
    padding: 30,
    alignItems: 'center',
  },
  pathNotice: {
    marginTop: 10,
  },
  pathNoticeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  pathSubText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  rejectedNotesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectedNotesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  rejectedNotesBody: {
    fontSize: 13,
    color: '#7F1D1D',
    marginTop: 2,
    lineHeight: 18,
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
    marginBottom: 16,
    lineHeight: 16,
  },
  decisionButtons: {
    gap: 10,
  },
  decisionBtn: {
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
  rejectBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  decisionBtnText: {
    fontSize: 14,
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
