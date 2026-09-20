import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '../../src/constants/theme';
import {
  useOwnerReviews,
  useSubmitOwnerReply,
  useReportReview,
} from '../../src/hooks/useReviews';
import { Review, ReviewReportReason } from '../../src/types/database.types';

export default function OwnerReviewsScreen() {
  const router = useRouter();
  const { data: reviews = [], isLoading, refetch } = useOwnerReviews();
  const replyMutation = useSubmitOwnerReply();
  const reportMutation = useReportReview();

  const [selectedReviewForReply, setSelectedReviewForReply] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedReviewForReport, setSelectedReviewForReport] = useState<Review | null>(null);
  const [reportReason, setReportReason] = useState<ReviewReportReason>('spam');
  const [reportDescription, setReportDescription] = useState('');

  // Derived metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : '4.8';
  const cleanAvg = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.cleanliness_rating || r.rating || 5), 0) / totalReviews).toFixed(1)
    : '4.8';
  const safetyAvg = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.safety_rating || r.rating || 5), 0) / totalReviews).toFixed(1)
    : '4.9';
  const valueAvg = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.value_rating || r.rating || 5), 0) / totalReviews).toFixed(1)
    : '4.8';

  const handleSendReply = async () => {
    if (!selectedReviewForReply) return;
    if (!replyText.trim() || replyText.trim().length < 5) {
      Alert.alert('Invalid Reply', 'Please write at least 5 characters in your response.');
      return;
    }

    try {
      await replyMutation.mutateAsync({
        reviewId: selectedReviewForReply.id,
        replyText: replyText.trim(),
      });
      setSelectedReviewForReply(null);
      setReplyText('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit reply.');
    }
  };

  const handleSendReport = async () => {
    if (!selectedReviewForReport) return;
    try {
      await reportMutation.mutateAsync({
        reviewId: selectedReviewForReport.id,
        reason: reportReason,
        description: reportDescription.trim() || 'Reported by landlord',
      });
      setSelectedReviewForReport(null);
      setReportDescription('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit report.');
    }
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Reviews & Trust Management</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Performance & Trust Card */}
        <View style={styles.metricsCard}>
          <View style={styles.metricsTop}>
            <View>
              <Text style={styles.metricsBigNum}>{avgRating}</Text>
              <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name="star" size={14} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.metricsSubtitle}>
                Based on {totalReviews} student reviews
              </Text>
            </View>

            <View style={styles.trustScorePill}>
              <Ionicons name="shield-checkmark" size={16} color="#059669" />
              <Text style={styles.trustScoreVal}>94/100</Text>
              <Text style={styles.trustScoreLabel}>Trust Score</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Sub category breakups */}
          <View style={styles.subScoresGrid}>
            <View style={styles.subCol}>
              <Text style={styles.subColVal}>{cleanAvg}★</Text>
              <Text style={styles.subColLabel}>Cleanliness</Text>
            </View>
            <View style={styles.subCol}>
              <Text style={styles.subColVal}>{safetyAvg}★</Text>
              <Text style={styles.subColLabel}>Safety</Text>
            </View>
            <View style={styles.subCol}>
              <Text style={styles.subColVal}>{valueAvg}★</Text>
              <Text style={styles.subColLabel}>Value</Text>
            </View>
          </View>
        </View>

        {/* Guidelines info */}
        <View style={styles.guidelinesBanner}>
          <Ionicons name="information-circle" size={18} color="#0284C7" />
          <Text style={styles.guidelinesText}>
            You can publish one public response to any student review. Professional responses reassure future students looking for Pune stays.
          </Text>
        </View>

        {/* Section Heading */}
        <Text style={styles.sectionTitle}>Student Reviews ({reviews.length})</Text>

        {isLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Loading property reviews...</Text>
          </View>
        ) : reviews.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={40} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptyDesc}>
              When students complete their confirmed stay at your property, their verified reviews will appear here.
            </Text>
          </View>
        ) : (
          reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.revHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.studentName}>
                      {rev.student?.full_name || 'Pune Student'}
                    </Text>
                    {rev.is_verified_stay && (
                      <View style={styles.verifiedChip}>
                        <Ionicons name="checkmark-circle" size={10} color="#059669" />
                        <Text style={styles.verifiedChipText}>Verified Stay</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.hostelSub}>
                    {rev.hostel?.name || 'Your Property'} •{' '}
                    {new Date(rev.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingVal}>{rev.rating}.0</Text>
                </View>
              </View>

              {rev.title ? <Text style={styles.revTitle}>{rev.title}</Text> : null}
              <Text style={styles.revComment}>{rev.comment || rev.review_text}</Text>

              {/* Owner Reply if present */}
              {rev.owner_reply ? (
                <View style={styles.ownerReplyCard}>
                  <View style={styles.replyHead}>
                    <Ionicons name="arrow-undo" size={14} color={THEME.colors.primary} />
                    <Text style={styles.replyTitle}>Your Public Reply</Text>
                    {rev.owner_replied_at && (
                      <Text style={styles.replyTime}>
                        • {new Date(rev.owner_replied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.replyBody}>{rev.owner_reply}</Text>
                </View>
              ) : null}

              {/* Actions Footer */}
              <View style={styles.cardActions}>
                {!rev.owner_reply ? (
                  <TouchableOpacity
                    style={styles.replyBtn}
                    onPress={() => {
                      setSelectedReviewForReply(rev);
                      setReplyText('');
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={THEME.colors.primary} />
                    <Text style={styles.replyBtnText}>Reply to Review</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="checkmark" size={14} color="#059669" />
                    <Text style={{ fontSize: 11, color: '#059669', fontWeight: '600' }}>Replied</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.reportBtn}
                  onPress={() => {
                    setSelectedReviewForReport(rev);
                    setReportReason('spam');
                    setReportDescription('');
                  }}
                >
                  <Ionicons name="flag-outline" size={13} color={THEME.colors.textMuted} />
                  <Text style={styles.reportBtnText}>Report to Moderation</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Reply Modal */}
      <Modal
        visible={Boolean(selectedReviewForReply)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReviewForReply(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reply to Student Review</Text>
              <TouchableOpacity onPress={() => setSelectedReviewForReply(null)}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalReviewExcerpt}>
              "{selectedReviewForReply?.comment || selectedReviewForReply?.review_text}"
            </Text>

            <TextInput
              style={styles.replyInput}
              placeholder="Write a polite, professional reply to the student..."
              placeholderTextColor={THEME.colors.textMuted}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
              maxLength={400}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{replyText.length}/400</Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedReviewForReply(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, replyMutation.isPending && styles.btnDisabled]}
                onPress={handleSendReply}
                disabled={replyMutation.isPending}
              >
                {replyMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Publish Reply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Review Modal */}
      <Modal
        visible={Boolean(selectedReviewForReport)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReviewForReport(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Review</Text>
              <TouchableOpacity onPress={() => setSelectedReviewForReport(null)}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.reportModalDesc}>
              Select the reason why this review violates StayDirect guidelines:
            </Text>

            <ScrollView style={{ maxHeight: 180, marginBottom: 12 }}>
              {[
                { key: 'spam', label: 'Spam or Promotional' },
                { key: 'fake_review', label: 'Fake Review (Never Stayed)' },
                { key: 'offensive_language', label: 'Abusive / Offensive Language' },
                { key: 'personal_information', label: 'Discloses Private Phone / Data' },
                { key: 'harassment', label: 'Harassment / Threats' },
                { key: 'fraudulent_activity', label: 'Fraudulent Activity' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.reasonOption,
                    reportReason === item.key && styles.reasonOptionActive,
                  ]}
                  onPress={() => setReportReason(item.key as ReviewReportReason)}
                >
                  <Ionicons
                    name={reportReason === item.key ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={reportReason === item.key ? THEME.colors.primary : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.reasonText,
                      reportReason === item.key && styles.reasonTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.descInput}
              placeholder="Additional details for admin moderators (optional)..."
              placeholderTextColor={THEME.colors.textMuted}
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
              numberOfLines={3}
              maxLength={250}
              textAlignVertical="top"
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedReviewForReport(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitDangerBtn, reportMutation.isPending && styles.btnDisabled]}
                onPress={handleSendReport}
                disabled={reportMutation.isPending}
              >
                {reportMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricsBigNum: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricsSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  trustScorePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  trustScoreVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  trustScoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  subScoresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  subCol: {
    alignItems: 'center',
  },
  subColVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  subColLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  guidelinesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  guidelinesText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  centerLoading: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  revHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  verifiedChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  hostelSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  ratingVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  revTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  revComment: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 17,
  },
  ownerReplyCard: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  replyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  replyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  replyTime: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  replyBody: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  replyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalReviewExcerpt: {
    fontSize: 12,
    fontStyle: 'italic',
    color: THEME.colors.textSecondary,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  replyInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 100,
  },
  charCount: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  reportModalDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  reasonOptionActive: {
    backgroundColor: '#F1F5F9',
  },
  reasonText: {
    fontSize: 13,
    color: '#334155',
  },
  reasonTextActive: {
    fontWeight: '700',
    color: '#0F172A',
  },
  descInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 70,
    marginTop: 6,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  modalSubmitBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSubmitDangerBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
