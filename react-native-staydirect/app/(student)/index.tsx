import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME, PUNE_AREAS } from '../../src/constants/theme';
import { useHostels } from '../../src/hooks/useHostels';
import { HostelCard } from '../../components/hostels/HostelCard';
import { Hostel } from '../../src/types/database.types';
import { getRecentlyViewed } from '../../src/lib/recentlyViewed';
import { StateFeedback } from '../../src/components/ui/StateFeedback';

interface StudentHomeScreenProps {
  onSelectHostel?: (hostel: Hostel) => void;
  onNavigateToSearch?: (initialQuery?: string, area?: string) => void;
  onNavigateTab?: (tabName: string) => void;
}

const QUICK_FILTERS = ['All', 'PG', 'Boys', 'Girls', 'Single Room', 'Twin Sharing'];

export default function StudentHomeRoute(props: StudentHomeScreenProps) {
  const { hostels, isLoading, refetch, isRefetching } = useHostels();
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [currentCity, setCurrentCity] = useState('Pune');
  const [recentHostels, setRecentHostels] = useState<Hostel[]>([]);

  // Load recently viewed
  React.useEffect(() => {
    getRecentlyViewed().then((list) => {
      if (list && list.length > 0) {
        setRecentHostels(list);
      }
    });
  }, [hostels]);

  // Filter logic
  const filteredHostels = useMemo(() => {
    return hostels.filter((h) => {
      // Area filter
      if (selectedArea !== 'All' && h.area.toLowerCase() !== selectedArea.toLowerCase()) {
        return false;
      }

      // Quick filter
      if (selectedQuickFilter === 'Boys' && h.gender_preference !== 'boys') return false;
      if (selectedQuickFilter === 'Girls' && h.gender_preference !== 'girls') return false;
      if (selectedQuickFilter === 'Single Room') {
        const hasSingle = h.rooms?.some((r) => r.room_type.toLowerCase().includes('single'));
        if (!hasSingle) return false;
      }
      if (selectedQuickFilter === 'Twin Sharing') {
        const hasTwin = h.rooms?.some(
          (r) =>
            r.room_type.toLowerCase().includes('twin') ||
            r.room_type.toLowerCase().includes('double')
        );
        if (!hasTwin) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = h.name.toLowerCase().includes(q);
        const matchArea = h.area.toLowerCase().includes(q);
        const matchAddress = h.address?.toLowerCase().includes(q);
        if (!matchName && !matchArea && !matchAddress) return false;
      }

      return true;
    });
  }, [hostels, selectedArea, selectedQuickFilter, searchQuery]);

  const handleHostelPress = (hostel: Hostel) => {
    if (props.onSelectHostel) {
      props.onSelectHostel(hostel);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="home" size={16} color={THEME.colors.primary} />
            </View>
            <View>
              <Text style={styles.brandName}>StayDirect</Text>
              <Text style={styles.tagline}>Zero Brokerage Hostels</Text>
            </View>
          </View>

          {/* Location Selector */}
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setIsLocationModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="location" size={14} color={THEME.colors.secondary} />
            <Text style={styles.locationSelectorText}>
              {selectedArea === 'All' ? currentCity : `${selectedArea}, ${currentCity}`}
            </Text>
            <Ionicons name="chevron-down" size={14} color={THEME.colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Find your home in Pune 🎓</Text>
          <Text style={styles.greetingSubtitle}>
            Connect directly with verified owners. No agents, 100% saved broker fees.
          </Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={() => props.onNavigateToSearch?.(searchQuery, selectedArea)}
        >
          <Ionicons name="search" size={18} color={THEME.colors.textMuted} />
          <TextInput
            placeholder="Search hostels in Pune, college, or area..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            onSubmitEditing={() => props.onNavigateToSearch?.(searchQuery, selectedArea)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.filterIconBtn}
            onPress={() => props.onNavigateToSearch?.(searchQuery, selectedArea)}
          >
            <Ionicons name="options" size={16} color={THEME.colors.white} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Body Scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[THEME.colors.primary]}
          />
        }
      >
        {/* Zero Brokerage Trust Banner */}
        <View style={styles.trustBanner}>
          <View style={styles.trustBadgeIcon}>
            <MaterialCommunityIcons name="shield-check" size={20} color={THEME.colors.primary} />
          </View>
          <View style={styles.trustBannerContent}>
            <Text style={styles.trustBannerTitle}>Direct Owner Transparency</Text>
            <Text style={styles.trustBannerDesc}>
              Students save up to ₹15,000 on middleman brokerage fees by booking on StayDirect.
            </Text>
          </View>
        </View>

        {/* Popular Areas Horizontal Carousel */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Popular Student Hubs</Text>
          {selectedArea !== 'All' && (
            <TouchableOpacity onPress={() => setSelectedArea('All')}>
              <Text style={styles.clearLink}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.areasRow}
        >
          {['All', ...PUNE_AREAS].map((area) => {
            const isSelected = selectedArea === area;
            return (
              <TouchableOpacity
                key={area}
                style={[styles.areaChip, isSelected && styles.areaChipSelected]}
                onPress={() => setSelectedArea(area)}
              >
                <Text style={[styles.areaChipText, isSelected && styles.areaChipTextSelected]}>
                  {area}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Quick Filters */}
        <View style={styles.quickFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFiltersRow}
          >
            {QUICK_FILTERS.map((filter) => {
              const isSelected = selectedQuickFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.quickFilterBtn, isSelected && styles.quickFilterBtnActive]}
                  onPress={() => setSelectedQuickFilter(filter)}
                >
                  <Text
                    style={[
                      styles.quickFilterText,
                      isSelected && styles.quickFilterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Recently Viewed Hostels Carousel */}
        {recentHostels.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="time-outline" size={16} color={THEME.colors.primary} />
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {recentHostels.map((h) => (
                <TouchableOpacity
                  key={'recent-' + h.id}
                  style={styles.recentMiniCard}
                  onPress={() => handleHostelPress(h)}
                  activeOpacity={0.8}
                >
                  <View style={styles.recentAreaTag}>
                    <Text style={styles.recentAreaText}>{h.area}</Text>
                  </View>
                  <Text style={styles.recentName} numberOfLines={1}>
                    {h.name}
                  </Text>
                  <Text style={styles.recentRent}>
                    ₹{h.monthly_rent?.toLocaleString('en-IN')}/mo
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recommended Hostels List */}
        <View style={styles.listingsHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {selectedArea === 'All' ? 'Recommended Hostels' : `Hostels in ${selectedArea}`}
            </Text>
            <Text style={styles.listingsCount}>
              {filteredHostels.length} verified properties found
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => props.onNavigateToSearch?.(searchQuery, selectedArea)}
          >
            <Text style={styles.viewAllText}>Search & Filter</Text>
            <Ionicons name="arrow-forward" size={13} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Loading state */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Fetching verified Pune hostels...</Text>
          </View>
        ) : filteredHostels.length === 0 ? (
          <StateFeedback
            type="no_results"
            title="No Matching Hostels Found"
            message={`No properties found in "${selectedArea}" with current filters. Reset filters to explore student stays across Pune.`}
            onRetry={() => {
              setSelectedArea('All');
              setSelectedQuickFilter('All');
              setSearchQuery('');
            }}
          />
        ) : (
          filteredHostels.map((hostel) => (
            <HostelCard
              key={hostel.id}
              hostel={hostel}
              onPress={() => handleHostelPress(hostel)}
            />
          ))
        )}
      </ScrollView>

      {/* Location Modal */}
      <Modal
        visible={isLocationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Student Location</Text>
              <TouchableOpacity
                onPress={() => setIsLocationModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              All properties are verified in Pune, Maharashtra. Choose a student zone:
            </Text>

            <TouchableOpacity
              style={[styles.areaOption, selectedArea === 'All' && styles.areaOptionSelected]}
              onPress={() => {
                setSelectedArea('All');
                setIsLocationModalVisible(false);
              }}
            >
              <Ionicons name="globe-outline" size={18} color={THEME.colors.primary} />
              <Text style={styles.areaOptionText}>Entire Pune City</Text>
            </TouchableOpacity>

            {PUNE_AREAS.map((area) => (
              <TouchableOpacity
                key={area}
                style={[styles.areaOption, selectedArea === area && styles.areaOptionSelected]}
                onPress={() => {
                  setSelectedArea(area);
                  setIsLocationModalVisible(false);
                }}
              >
                <Ionicons name="location" size={16} color={THEME.colors.primary} />
                <Text style={styles.areaOptionText}>{area}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...THEME.shadows.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.white,
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 10,
    color: THEME.colors.secondary,
    fontWeight: '600',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(221, 233, 213, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(221, 233, 213, 0.3)',
  },
  locationSelectorText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  greetingSection: {
    marginBottom: 12,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.white,
    marginBottom: 3,
  },
  greetingSubtitle: {
    fontSize: 11,
    color: THEME.colors.secondary,
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    ...THEME.shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    padding: 0,
  },
  filterIconBtn: {
    backgroundColor: THEME.colors.primary,
    padding: 6,
    borderRadius: 8,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 16,
    paddingBottom: 40,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.secondary,
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    marginBottom: 18,
  },
  trustBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBannerContent: {
    flex: 1,
  },
  trustBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginBottom: 2,
  },
  trustBannerDesc: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    lineHeight: 14,
  },
  recentMiniCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    width: 130,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentAreaTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  recentAreaText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  recentName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  recentRent: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  clearLink: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  areasRow: {
    gap: 8,
    paddingBottom: 14,
  },
  areaChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  areaChipSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  areaChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  areaChipTextSelected: {
    color: THEME.colors.white,
    fontWeight: '800',
  },
  quickFiltersContainer: {
    marginBottom: 16,
  },
  quickFiltersRow: {
    gap: 8,
  },
  quickFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: THEME.colors.secondary,
  },
  quickFilterBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  quickFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  quickFilterTextActive: {
    color: THEME.colors.white,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listingsCount: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  resetFiltersBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetFiltersText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 28, 45, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
  },
  areaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  areaOptionSelected: {
    backgroundColor: THEME.colors.secondary,
  },
  areaOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
});
