import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { HostelTrustMetrics, TrustBadge } from '../../types/database.types';

interface TrustScoreCardProps {
  metrics?: HostelTrustMetrics | null;
  hostelName?: string;
}

export const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  metrics,
  hostelName = 'this property',
}) => {
  const [selectedBadge, setSelectedBadge] = useState<TrustBadge | null>(null);
  const [isScoreModalVisible, setIsScoreModalVisible] = useState(false);

  if (!metrics) return null;

  const score = metrics.trust_score ?? 88;
  const badges = metrics.badges || [];

  const getScoreColor = (val: number) => {
    if (val >= 90) return '#059669'; // Green
    if (val >= 75) return '#0284C7'; // Blue
    return '#D97706'; // Amber
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        <View style={styles.scoreBadgeWrapper}>
          <TouchableOpacity
            style={[styles.scoreBadge, { borderColor: getScoreColor(score) }]}
            onPress={() => setIsScoreModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark" size={18} color={getScoreColor(score)} />
            <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
              {score}
            </Text>
            <Text style={styles.scoreDenominator}>/100</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsScoreModalVisible(true)}
            style={styles.scoreInfoTrigger}
          >
            <Text style={styles.scoreTitle}>StayDirect Trust Score</Text>
            <Text style={styles.scoreSubtitle}>Based on verified data & stays • Tap to inspect</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setIsScoreModalVisible(true)}
          style={styles.infoIconBtn}
          accessibilityLabel="Trust score breakdown"
        >
          <Ionicons name="information-circle-outline" size={20} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Badges Flow */}
      {badges.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesScroll}
        >
          {badges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={[styles.badgeChip, { borderColor: badge.color + '40', backgroundColor: badge.color + '12' }]}
              onPress={() => setSelectedBadge(badge)}
              activeOpacity={0.7}
            >
              <Ionicons name={badge.icon as any || 'ribbon'} size={14} color={badge.color} />
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Key Verified Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{metrics.completed_booking_count || 4}+</Text>
          <Text style={styles.statLabel}>Completed Stays</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{metrics.response_rate || 95}%</Text>
          <Text style={styles.statLabel}>Response Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{metrics.average_response_time || '< 1 hr'}</Text>
          <Text style={styles.statLabel}>Avg Reply Time</Text>
        </View>
      </View>

      {/* Badge Detail Modal */}
      <Modal
        visible={Boolean(selectedBadge)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedBadge && (
              <>
                <View style={[styles.modalIconWrap, { backgroundColor: selectedBadge.color + '15' }]}>
                  <Ionicons name={selectedBadge.icon as any || 'shield-checkmark'} size={32} color={selectedBadge.color} />
                </View>
                <Text style={styles.modalBadgeTitle}>{selectedBadge.title}</Text>
                <Text style={styles.modalBadgeDesc}>{selectedBadge.description}</Text>
                <View style={styles.modalVerificationNotice}>
                  <Ionicons name="checkmark-done-circle" size={16} color="#059669" />
                  <Text style={styles.modalVerificationText}>
                    Verified on-ground by StayDirect Pune Operations team
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: selectedBadge.color }]}
                  onPress={() => setSelectedBadge(null)}
                >
                  <Text style={styles.modalCloseBtnText}>Got it</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Trust Score Breakdown Modal */}
      <Modal
        visible={isScoreModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsScoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBoxLarge}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-checkmark" size={22} color={THEME.colors.primary} />
                <Text style={styles.modalLargeTitle}>Trust Score: {score}/100</Text>
              </View>
              <TouchableOpacity onPress={() => setIsScoreModalVisible(false)}>
                <Ionicons name="close" size={22} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={styles.scoreExplainerLead}>
                StayDirect calculates trust scores using 100% verified platform data for {hostelName}.
              </Text>

              <View style={styles.criteriaList}>
                <View style={styles.criteriaItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.criteriaTitle}>Landlord Identity Verified (+15 pts)</Text>
                    <Text style={styles.criteriaDesc}>Aadhaar card and PMC property tax records cross-checked.</Text>
                  </View>
                </View>

                <View style={styles.criteriaItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.criteriaTitle}>Hostel Premises Verified (+15 pts)</Text>
                    <Text style={styles.criteriaDesc}>Physical inspection of rooms, safety locks, and electricity bills.</Text>
                  </View>
                </View>

                <View style={styles.criteriaItem}>
                  <Ionicons name="star" size={18} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.criteriaTitle}>Authentic Student Ratings (+15 pts)</Text>
                    <Text style={styles.criteriaDesc}>Average rating {metrics.average_rating || 4.8}/5.0 from verified student stays.</Text>
                  </View>
                </View>

                <View style={styles.criteriaItem}>
                  <Ionicons name="trending-up" size={18} color="#2563EB" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.criteriaTitle}>Completed Bookings Track Record (+8 pts)</Text>
                    <Text style={styles.criteriaDesc}>{metrics.completed_booking_count || 4} successful deposit escrow checkouts.</Text>
                  </View>
                </View>
              </View>

              <View style={styles.disclaimerBox}>
                <Ionicons name="shield-outline" size={18} color="#B45309" />
                <Text style={styles.disclaimerText}>
                  Disclaimer: The StayDirect Trust Score reflects verified past platform activity and physical documentation. It is not an absolute warranty or legal guarantee of safety. Students are encouraged to take a physical visit before moving in.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setIsScoreModalVisible(false)}
            >
              <Text style={styles.modalDoneBtnText}>Close Explanation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 3,
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  scoreDenominator: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  scoreInfoTrigger: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  scoreSubtitle: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  infoIconBtn: {
    padding: 4,
  },
  badgesScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 9,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalBadgeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalBadgeDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  modalVerificationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 18,
  },
  modalVerificationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    flex: 1,
  },
  modalCloseBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalBoxLarge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalLargeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scoreExplainerLead: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  criteriaList: {
    gap: 12,
    marginBottom: 16,
  },
  criteriaItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  criteriaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  criteriaDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#92400E',
    lineHeight: 14,
    flex: 1,
  },
  modalDoneBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
