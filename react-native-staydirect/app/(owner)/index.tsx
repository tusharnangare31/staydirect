import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useOwnerListings } from '../../src/hooks/useOwnerListings';
import { OwnerStatCard } from '../../components/owner/OwnerStatCard';
import { OwnerListingCard } from '../../components/owner/OwnerListingCard';
import { AppButton } from '../../components/ui/AppButton';
import { Hostel } from '../../src/types/database.types';

export interface OwnerDashboardProps {
  onNavigateToAddHostel: () => void;
  onNavigateToEditHostel: (hostelId: string) => void;
  onNavigateToListings: (tab?: string) => void;
  onNavigateToInquiries: () => void;
  onNavigateToProfile: () => void;
}

export const OwnerDashboardScreen: React.FC<OwnerDashboardProps> = ({
  onNavigateToAddHostel,
  onNavigateToEditHostel,
  onNavigateToListings,
  onNavigateToInquiries,
  onNavigateToProfile,
}) => {
  const { user, profile } = useAuth();
  const {
    allHostels,
    inquiries,
    isLoading,
    isRefetching,
    refetch,
    totalListings,
    activeListings,
    totalBeds,
    availableBeds,
    pendingInquiriesCount,
    togglePublish,
    deleteHostel,
  } = useOwnerListings('all');

  const ownerName = profile?.full_name || user?.email?.split('@')[0] || 'Property Owner';
  const recentListings = allHostels.slice(0, 3);
  const recentInquiries = inquiries.slice(0, 4);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[THEME.colors.primary]}
        />
      }
    >
      {/* Top Header & Owner Greeting */}
      <View style={styles.header}>
        <View style={styles.greetingCol}>
          <Text style={styles.subGreeting}>Namaste, Pune Property Partner</Text>
          <Text style={styles.ownerName} numberOfLines={1}>
            {ownerName}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={onNavigateToProfile}
          activeOpacity={0.8}
        >
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={18} color={THEME.colors.primary} />
          </View>
          {profile?.is_verified && (
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark" size={8} color={THEME.colors.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Add Hostel Hero CTA */}
      <View style={styles.ctaBanner}>
        <View style={styles.ctaTextCol}>
          <Text style={styles.ctaTitle}>Zero Brokerage Listing</Text>
          <Text style={styles.ctaSubtitle}>
            Connect directly with thousands of verified college students in Pune.
          </Text>
          <View style={styles.ctaBtnWrapper}>
            <AppButton
              title="+ Add New Hostel"
              onPress={onNavigateToAddHostel}
              size="md"
              variant="primary"
              leftIcon="business"
              style={styles.ctaBtn}
            />
          </View>
        </View>
      </View>

      {/* Statistics 2x2 Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overview & Metrics</Text>
        <Text style={styles.liveTag}>● LIVE</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <OwnerStatCard
            label="Total Properties"
            value={totalListings}
            icon="business"
            colorTheme="primary"
            subtitle="Properties registered"
            onPress={() => onNavigateToListings('all')}
          />
          <OwnerStatCard
            label="Active Listings"
            value={activeListings}
            icon="checkmark-circle"
            colorTheme="sage"
            subtitle="Published & live"
            onPress={() => onNavigateToListings('active')}
          />
        </View>

        <View style={styles.statRow}>
          <OwnerStatCard
            label="Vacant Beds"
            value={`${availableBeds}/${totalBeds}`}
            icon="bed"
            colorTheme="accent"
            subtitle="Available capacity"
            onPress={() => onNavigateToListings('all')}
          />
          <OwnerStatCard
            label="Pending Inquiries"
            value={pendingInquiriesCount}
            icon="chatbubbles"
            colorTheme="primary"
            subtitle="Awaiting reply"
            onPress={onNavigateToInquiries}
          />
        </View>
      </View>

      {/* Recent Listings Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Properties</Text>
        {allHostels.length > 0 && (
          <TouchableOpacity onPress={() => onNavigateToListings('all')}>
            <Text style={styles.viewAllText}>View All ({allHostels.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Syncing your properties...</Text>
        </View>
      ) : recentListings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="home-outline" size={42} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>No Hostels Listed Yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first hostel or PG in Pune with zero brokerage and direct student inquiries.
          </Text>
          <AppButton
            title="Create First Listing"
            onPress={onNavigateToAddHostel}
            variant="primary"
            size="md"
            leftIcon="add-circle"
            style={{ marginTop: 12 }}
          />
        </View>
      ) : (
        recentListings.map((hostel: Hostel) => (
          <OwnerListingCard
            key={hostel.id}
            hostel={hostel}
            onEdit={() => onNavigateToEditHostel(hostel.id)}
            onTogglePublish={(h) =>
              togglePublish({ hostelId: h.id, publish: !h.is_published })
            }
            onDelete={(id) => deleteHostel(id)}
          />
        ))
      )}

      {/* Recent Student Inquiries Section */}
      <View style={[styles.sectionHeader, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>Recent Student Inquiries</Text>
        {inquiries.length > 0 && (
          <TouchableOpacity onPress={onNavigateToInquiries}>
            <Text style={styles.viewAllText}>All Inquiries ({inquiries.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentInquiries.length === 0 ? (
        <View style={styles.emptyInquiriesCard}>
          <Ionicons name="mail-unread-outline" size={32} color={THEME.colors.textMuted} />
          <Text style={styles.emptyInquiriesText}>
            No student inquiries received yet. When students express interest in your rooms, they will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.inquiriesContainer}>
          {recentInquiries.map((inq) => {
            const studentName = inq.student?.full_name || 'Interested Student';
            const hostelName = inq.hostel?.name || 'Your Property';
            const dateStr = new Date(inq.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <TouchableOpacity
                key={inq.id}
                style={styles.inquiryRow}
                onPress={onNavigateToInquiries}
                activeOpacity={0.7}
              >
                <View style={styles.inquiryIconCircle}>
                  <Ionicons name="chatbubble-ellipses" size={16} color={THEME.colors.primary} />
                </View>

                <View style={styles.inquiryInfoCol}>
                  <View style={styles.inquiryTop}>
                    <Text style={styles.inquiryStudentName} numberOfLines={1}>
                      {studentName}
                    </Text>
                    <Text style={styles.inquiryDate}>{dateStr}</Text>
                  </View>
                  <Text style={styles.inquiryHostelName} numberOfLines={1}>
                    Interested in: {hostelName}
                  </Text>
                  {inq.message && (
                    <Text style={styles.inquiryMessage} numberOfLines={1}>
                      "{inq.message}"
                    </Text>
                  )}
                </View>

                <View style={styles.inquiryStatusBadge}>
                  <Text style={styles.inquiryStatusText}>
                    {inq.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default OwnerDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingCol: {
    flex: 1,
    marginRight: 12,
  },
  subGreeting: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  avatarBtn: {
    position: 'relative',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.secondaryDark,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: THEME.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.white,
  },
  ctaBanner: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.lg,
    padding: 18,
    marginBottom: 20,
    ...THEME.shadows.medium,
  },
  ctaTextCol: {
    width: '100%',
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: THEME.colors.white,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: THEME.colors.secondary,
    lineHeight: 17,
    marginBottom: 14,
  },
  ctaBtnWrapper: {
    maxWidth: 200,
  },
  ctaBtn: {
    backgroundColor: THEME.colors.accent,
    borderColor: '#9E6D38',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  liveTag: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.success,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  statsGrid: {
    gap: 10,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  loaderBox: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    padding: 24,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  emptyInquiriesCard: {
    backgroundColor: THEME.colors.surface,
    padding: 18,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 20,
  },
  emptyInquiriesText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  inquiriesContainer: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  inquiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  inquiryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inquiryInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  inquiryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  inquiryStudentName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  inquiryDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  inquiryHostelName: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  inquiryMessage: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  inquiryStatusBadge: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  inquiryStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
  },
});
