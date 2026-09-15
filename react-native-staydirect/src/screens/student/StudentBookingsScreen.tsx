import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/Header';
import { useStudentBookings, useStudentInquiries } from '../../hooks/useUserInteractions';
import { useAuth } from '../../context/AuthContext';

export const StudentBookingsScreen: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'visits'>('bookings');

  const {
    data: bookings,
    isLoading: isBookingsLoading,
    refetch: refetchBookings,
    isRefetching: isBookingsRefetching,
  } = useStudentBookings();

  const {
    data: inquiries,
    isLoading: isInquiriesLoading,
    refetch: refetchInquiries,
    isRefetching: isInquiriesRefetching,
  } = useStudentInquiries();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: THEME.colors.successLight, text: THEME.colors.success, label: 'Approved ✓' };
      case 'pending':
        return { bg: THEME.colors.warningLight, text: THEME.colors.warning, label: 'Pending Owner' };
      case 'rejected':
        return { bg: THEME.colors.errorLight, text: THEME.colors.error, label: 'Declined' };
      default:
        return { bg: THEME.colors.surfaceVariant, text: THEME.colors.textSecondary, label: status };
    }
  };

  return (
    <View style={styles.container}>
      <Header title="My Bookings & Visits" subtitle="Zero Brokerage Direct Stays" />

      {/* Segment Tab Controls */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.tabActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
            Room Bookings ({bookings?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'visits' && styles.tabActive]}
          onPress={() => setActiveTab('visits')}
        >
          <Text style={[styles.tabText, activeTab === 'visits' && styles.tabTextActive]}>
            Scheduled Visits ({inquiries?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Bookings List */}
      {activeTab === 'bookings' && (
        <FlatList
          data={bookings || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isBookingsRefetching}
              onRefresh={refetchBookings}
              colors={[THEME.colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const status = getStatusBadge(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hostelName}>{item.hostel?.name || 'Pune Student Hostel'}</Text>
                    <Text style={styles.roomType}>
                      {item.sharing_type} • Move-in: {item.move_in_date}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: status.text }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                {/* Price summary */}
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Monthly Rent</Text>
                    <Text style={styles.priceVal}>₹{item.monthly_rent}</Text>
                  </View>
                  <View>
                    <Text style={styles.priceLabel}>Deposit</Text>
                    <Text style={styles.priceVal}>₹{item.security_deposit}</Text>
                  </View>
                  <View>
                    <Text style={styles.priceLabel}>Brokerage</Text>
                    <Text style={styles.brokerageFree}>₹0 (Free)</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            isBookingsLoading ? (
              <ActivityIndicator size="large" color={THEME.colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>No Booking Requests Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Explore hostels in Pune and book your room directly without paying brokerage fees.
                </Text>
                <TouchableOpacity style={styles.exploreBtn} onPress={onExplore}>
                  <Text style={styles.exploreBtnText}>Find a Hostel</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}

      {/* Tab 2: Visits List */}
      {activeTab === 'visits' && (
        <FlatList
          data={inquiries || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isInquiriesRefetching}
              onRefresh={refetchInquiries}
              colors={[THEME.colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hostelName}>{item.hostel?.name || 'Pune Hostel'}</Text>
                  <Text style={styles.roomType}>
                    {item.preferred_sharing || 'Any Room'}
                  </Text>
                </View>
                <View style={styles.visitTimePill}>
                  <Ionicons name="time" size={12} color={THEME.colors.primary} />
                  <Text style={styles.visitTimeText}>{item.visit_time || 'Evening Slot'}</Text>
                </View>
              </View>

              <View style={styles.visitInfoRow}>
                <Ionicons name="calendar-outline" size={14} color={THEME.colors.textSecondary} />
                <Text style={styles.visitInfoText}>
                  Scheduled for: {item.visit_date || 'Upcoming'}
                </Text>
              </View>

              {item.message ? (
                <Text style={styles.visitMessage}>"{item.message}"</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            isInquiriesLoading ? (
              <ActivityIndicator size="large" color={THEME.colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>No Visits Scheduled</Text>
                <Text style={styles.emptySubtitle}>
                  Schedule a free in-person tour to inspect any hostel before making a decision.
                </Text>
                <TouchableOpacity style={styles.exploreBtn} onPress={onExplore}>
                  <Text style={styles.exploreBtnText}>Browse Hostels</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceVariant,
  },
  tabActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    color: THEME.colors.white,
  },
  listContent: {
    padding: THEME.spacing.lg,
    gap: 12,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.soft,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  hostelName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  roomType: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surfaceVariant,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
  },
  priceLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 1,
  },
  brokerageFree: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 1,
  },
  visitTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  visitTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  visitInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  visitInfoText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  visitMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  exploreBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
  },
  exploreBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
