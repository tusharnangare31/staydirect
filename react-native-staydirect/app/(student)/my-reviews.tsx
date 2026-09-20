import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '../../src/constants/theme';
import { useMyReviews } from '../../src/hooks/useReviews';
import { Review, ReviewStatus } from '../../src/types/database.types';

export default function StudentMyReviewsScreen() {
  const router = useRouter();
  const { data: myReviews = [], isLoading, refetch } = useMyReviews();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredReviews = myReviews.filter((rev) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'published') return rev.status === 'published';
    if (filterStatus === 'pending') return rev.status === 'pending';
    if (filterStatus === 'replied') return Boolean(rev.owner_reply);
    return true;
  });

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'published':
        return { label: 'Published', color: '#059669', bg: '#ECFDF5', icon: 'checkmark-circle' };
      case 'pending':
        return { label: 'Under Review', color: '#D97706', bg: '#FFFBEB', icon: 'time' };
      case 'rejected':
        return { label: 'Rejected', color: '#DC2626', bg: '#FEF2F2', icon: 'close-circle' };
      case 'hidden':
        return { label: 'Hidden', color: '#64748B', bg: '#F1F5F9', icon: 'eye-off' };
      default:
        return { label: status, color: '#64748B', bg: '#F1F5F9', icon: 'help-circle' };
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
        <Text style={styles.appBarTitle}>My Reviews & Feedback</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {[
          { key: 'all', label: `All (${myReviews.length})` },
          { key: 'published', label: 'Published' },
          { key: 'pending', label: 'Pending' },
          { key: 'replied', label: 'Owner Replied' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterChip, filterStatus === tab.key && styles.filterChipActive]}
            onPress={() => setFilterStatus(tab.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === tab.key && styles.filterChipTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Fetching your stay reviews...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          showsVerticalScrollIndicator={false}
        >
          {filteredReviews.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="star-outline" size={36} color={THEME.colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Reviews Found</Text>
              <Text style={styles.emptyDesc}>
                {filterStatus === 'all'
                  ? 'You haven’t submitted any reviews yet. Complete a booking stay at a Pune hostel and share honest feedback to help fellow students!'
                  : `No reviews currently matching the "${filterStatus}" filter.`}
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.push('/(student)/search' as any)}
              >
                <Text style={styles.exploreBtnText}>Browse Pune Hostels</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredReviews.map((rev) => {
              const badge = getStatusBadge(rev.status || 'published');
              return (
                <View key={rev.id} style={styles.reviewCard}>
                  {/* Top row: Hostel & Status */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hostelName} numberOfLines={1}>
                        {rev.hostel?.name || 'Pune Student Hostel'}
                      </Text>
                      <Text style={styles.hostelArea}>
                        {rev.hostel?.area ? `${rev.hostel.area}, Pune` : 'Verified Property'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Ionicons name={badge.icon as any} size={12} color={badge.color} />
                      <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Rating Header */}
                  <View style={styles.ratingRow}>
                    <View style={styles.starsGroup}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= rev.rating ? 'star' : 'star-outline'}
                          size={16}
                          color={s <= rev.rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingScore}>{rev.rating}.0</Text>
                    <Text style={styles.createdDate}>
                      • {new Date(rev.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  {/* Review Title & Content */}
                  {rev.title ? <Text style={styles.reviewTitle}>{rev.title}</Text> : null}
                  <Text style={styles.reviewText}>{rev.comment || rev.review_text}</Text>

                  {/* Category Ratings Bar */}
                  <View style={styles.subGrid}>
                    {rev.cleanliness_rating ? (
                      <View style={styles.subTag}>
                        <Text style={styles.subTagLabel}>Cleanliness: {rev.cleanliness_rating}★</Text>
                      </View>
                    ) : null}
                    {rev.safety_rating ? (
                      <View style={styles.subTag}>
                        <Text style={styles.subTagLabel}>Safety: {rev.safety_rating}★</Text>
                      </View>
                    ) : null}
                    {rev.location_rating ? (
                      <View style={styles.subTag}>
                        <Text style={styles.subTagLabel}>Location: {rev.location_rating}★</Text>
                      </View>
                    ) : null}
                    {rev.value_rating ? (
                      <View style={styles.subTag}>
                        <Text style={styles.subTagLabel}>Value: {rev.value_rating}★</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Landlord Reply Box */}
                  {rev.owner_reply ? (
                    <View style={styles.ownerReplyBox}>
                      <View style={styles.ownerReplyHead}>
                        <Ionicons name="business" size={14} color={THEME.colors.primary} />
                        <Text style={styles.ownerReplyAuthor}>Landlord Official Response</Text>
                        {rev.owner_replied_at && (
                          <Text style={styles.ownerReplyTime}>
                            {new Date(rev.owner_replied_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.ownerReplyBody}>{rev.owner_reply}</Text>
                    </View>
                  ) : null}

                  {/* Moderation Rejection note if any */}
                  {rev.status === 'rejected' && rev.moderation_reason ? (
                    <View style={styles.rejectionNotice}>
                      <Ionicons name="information-circle" size={14} color="#DC2626" />
                      <Text style={styles.rejectionText}>
                        Moderation note: {rev.moderation_reason}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
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
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  exploreBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  hostelName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  hostelArea: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  starsGroup: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  createdDate: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  subGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  subTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subTagLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  ownerReplyBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  ownerReplyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ownerReplyAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  ownerReplyTime: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  ownerReplyBody: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  rejectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  rejectionText: {
    fontSize: 11,
    color: '#DC2626',
    flex: 1,
  },
});
