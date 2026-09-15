import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useAdminListings } from '../../src/hooks/useAdmin';
import { Hostel } from '../../src/types/database.types';

export interface AdminListingsScreenProps {
  onBack?: () => void;
  onSelectListing?: (hostelId: string) => void;
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'unpublished';

export const AdminListingsScreen: React.FC<AdminListingsScreenProps> = ({
  onBack,
  onSelectListing,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const { data: listings, isLoading, refetch } = useAdminListings(activeFilter);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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
          <Text style={styles.headerTitle}>Hostel Listing Moderation</Text>
          <Text style={styles.headerSub}>Verify rooms, genuine rent & amenities in Pune</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'pending', 'approved', 'rejected', 'unpublished'] as FilterTab[]).map((tab) => {
          const isSelected = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                {tab === 'all'
                  ? 'All'
                  : tab === 'pending'
                  ? 'Pending'
                  : tab === 'approved'
                  ? 'Active'
                  : tab === 'rejected'
                  ? 'Rejected'
                  : 'Unpublished'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Fetching listings for moderation...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />
          }
        >
          {listings && listings.length > 0 ? (
            listings.map((hostel) => {
              const coverImg =
                hostel.images && hostel.images.length > 0
                  ? hostel.images[0].image_url
                  : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80';

              const isVerified =
                hostel.verification_status === 'verified' ||
                hostel.verification_status === 'approved';

              return (
                <TouchableOpacity
                  key={hostel.id}
                  style={styles.card}
                  onPress={() => onSelectListing?.(hostel.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardTopRow}>
                    <Image source={{ uri: coverImg }} style={styles.thumbnail} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.statusBadge,
                            isVerified
                              ? styles.badgeVerified
                              : hostel.verification_status === 'rejected'
                              ? styles.badgeRejected
                              : styles.badgePending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              isVerified
                                ? { color: '#166534' }
                                : hostel.verification_status === 'rejected'
                                ? { color: '#991B1B' }
                                : { color: '#B45309' },
                            ]}
                          >
                            {hostel.verification_status.toUpperCase()}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.pubBadge,
                            hostel.is_published ? styles.badgePub : styles.badgeUnpub,
                          ]}
                        >
                          <Text
                            style={[
                              styles.pubBadgeText,
                              hostel.is_published ? { color: '#1E40AF' } : { color: '#64748B' },
                            ]}
                          >
                            {hostel.is_published ? 'PUBLISHED' : 'DRAFT/UNPUB'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.hostelName} numberOfLines={2}>
                        {hostel.name}
                      </Text>

                      <Text style={styles.hostelArea}>
                        {hostel.area}, {hostel.city}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.infoGrid}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoColLabel}>Monthly Rent</Text>
                      <Text style={styles.infoColValue}>
                        ₹{hostel.monthly_rent?.toLocaleString('en-IN') || hostel.monthly_rent_min?.toLocaleString('en-IN') || '—'}/mo
                      </Text>
                    </View>

                    <View style={styles.infoCol}>
                      <Text style={styles.infoColLabel}>Gender</Text>
                      <Text style={styles.infoColValue}>
                        {hostel.gender_preference.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.infoCol}>
                      <Text style={styles.infoColLabel}>Listed By</Text>
                      <Text style={styles.infoColValue} numberOfLines={1}>
                        {hostel.owner?.full_name || 'Owner'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerPrompt}>Review photos, rooms & moderate listing</Text>
                    <Ionicons name="chevron-forward" size={16} color={THEME.colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="home-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Listings Found</Text>
              <Text style={styles.emptySub}>No hostel listings match the selected moderation status.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#0F172A',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  loadingBox: {
    padding: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    fontSize: 9,
    fontWeight: '800',
  },
  pubBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePub: {
    backgroundColor: '#DBEAFE',
  },
  badgeUnpub: {
    backgroundColor: '#F1F5F9',
  },
  pubBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  hostelName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  hostelArea: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  infoCol: {
    flex: 1,
  },
  infoColLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoColValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  footerPrompt: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
