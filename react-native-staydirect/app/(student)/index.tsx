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
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME, PUNE_AREAS } from '../../src/constants/theme';
import { useHostels } from '../../src/hooks/useHostels';
import { HostelCard, HostelCardSkeleton } from '../../components/hostels/HostelCard';
import { Hostel, AdvancedSearchFilters } from '../../src/types/database.types';
import { useRecentlyViewed } from '../../src/hooks/useRecentlyViewed';
import { useRecommendations } from '../../src/hooks/useRecommendations';
import { StateFeedback } from '../../src/components/ui/StateFeedback';

interface StudentHomeScreenProps {
  onSelectHostel?: (hostel: Hostel) => void;
  onNavigateToSearch?: (initialQuery?: string, area?: string, initialFilters?: AdvancedSearchFilters) => void;
  onNavigateTab?: (tabName: string) => void;
  onOpenPreferences?: () => void;
  onOpenSavedSearches?: () => void;
}

// Swiggy-style "What's on your mind?" Category Circles
const DISCOVERY_CATEGORIES = [
  { id: 'single', label: 'Single Room', icon: 'bed-outline', filterKey: 'roomType', filterVal: 'Single Room', color: '#EFF6FF', iconColor: '#2563EB' },
  { id: 'double', label: 'Twin Sharing', icon: 'people-outline', filterKey: 'roomType', filterVal: 'Twin Sharing', color: '#F5F3FF', iconColor: '#7C3AED' },
  { id: 'girls', label: 'Girls Only', icon: 'female-outline', filterKey: 'gender', filterVal: 'girls', color: '#FDF2F8', iconColor: '#DB2777' },
  { id: 'boys', label: 'Boys Only', icon: 'male-outline', filterKey: 'gender', filterVal: 'boys', color: '#EFF6FF', iconColor: '#1D4ED8' },
  { id: 'food', label: 'Food Included', icon: 'restaurant-outline', filterKey: 'food', filterVal: 'food_included', color: '#FEF3C7', iconColor: '#D97706' },
  { id: 'ac', label: 'AC Rooms', icon: 'snow-outline', filterKey: 'amenity', filterVal: 'Air conditioning', color: '#ECFDF5', iconColor: '#059669' },
  { id: 'budget', label: 'Under ₹8k', icon: 'wallet-outline', filterKey: 'budget', filterVal: '8000', color: '#F0FDF4', iconColor: '#16A34A' },
  { id: 'verified', label: '100% Verified', icon: 'shield-checkmark-outline', filterKey: 'verified', filterVal: 'true', color: '#F0F9FF', iconColor: '#0284C7' },
];

// Popular Pune Colleges & Hubs
const POPULAR_COLLEGE_HUBS = [
  { name: 'Kothrud', college: 'MIT-WPU & Cummins' },
  { name: 'Shivajinagar', college: 'COEP & Fergusson' },
  { name: 'Viman Nagar', college: 'Symbiosis Campus' },
  { name: 'Dhankawadi', college: 'Bharati Vidyapeeth & PICT' },
  { name: 'Hinjewadi', college: 'Tech Parks & IIMS' },
  { name: 'Wakad', college: 'DY Patil & JSPM' },
  { name: 'Karve Nagar', college: 'MKSSS & Marathwada' },
];

export default function StudentHomeRoute({
  onSelectHostel,
  onNavigateToSearch,
  onNavigateTab,
  onOpenPreferences,
  onOpenSavedSearches,
}: StudentHomeScreenProps) {
  const { hostels, isLoading, refetch, isRefetching } = useHostels();
  const { recentlyViewed } = useRecentlyViewed();
  const { recommendations, isPersonalized } = useRecommendations(hostels);

  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('All');
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [searchPlaceholderIndex, setSearchPlaceholderIndex] = useState(0);

  const searchPlaceholders = [
    'Search "Kothrud hostels near MIT"...',
    'Search "Girls PG with meals in Viman Nagar"...',
    'Search "Single room near COEP Shivajinagar"...',
    'Search "₹0 Brokerage direct owner hostels"...',
  ];

  // Top Rated Hostels (Rating >= 4.5 or verified)
  const topRatedHostels = useMemo(() => {
    return [...hostels]
      .sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8))
      .slice(0, 6);
  }, [hostels]);

  // Main filtered hostels list
  const filteredHostels = useMemo(() => {
    return hostels.filter((h) => {
      // Area filter
      if (selectedArea !== 'All' && h.area.toLowerCase() !== selectedArea.toLowerCase()) {
        return false;
      }

      // Quick filter
      if (activeQuickFilter === 'Boys' && h.gender_preference !== 'boys') return false;
      if (activeQuickFilter === 'Girls' && h.gender_preference !== 'girls') return false;
      if (activeQuickFilter === 'Single') {
        const hasSingle = h.rooms?.some((r: any) =>
          (r.room_type || '').toLowerCase().includes('single')
        );
        if (!hasSingle) return false;
      }
      if (activeQuickFilter === 'Food') {
        const hasFood = h.amenities?.some((a: any) => {
          const name = (typeof a === 'string' ? a : a.name || a.amenity?.name || '').toLowerCase();
          return name.includes('meal') || name.includes('food') || name.includes('mess');
        });
        if (!hasFood) return false;
      }
      if (activeQuickFilter === 'Verified' && h.verification_status !== 'verified') {
        return false;
      }

      return true;
    });
  }, [hostels, selectedArea, activeQuickFilter]);

  const handleCategoryPress = (category: typeof DISCOVERY_CATEGORIES[0]) => {
    if (category.filterKey === 'roomType') {
      onNavigateToSearch?.('', selectedArea, { roomTypes: [category.filterVal] });
    } else if (category.filterKey === 'gender') {
      onNavigateToSearch?.('', selectedArea, { gender: category.filterVal as any });
    } else if (category.filterKey === 'food') {
      onNavigateToSearch?.('', selectedArea, { foodPreference: 'food_included' });
    } else if (category.filterKey === 'amenity') {
      onNavigateToSearch?.('', selectedArea, { amenities: [category.filterVal] });
    } else if (category.filterKey === 'budget') {
      onNavigateToSearch?.('', selectedArea, { maxRent: 8000 });
    } else if (category.filterKey === 'verified') {
      onNavigateToSearch?.('', selectedArea, { verifiedHostelOnly: true });
    }
  };

  const handleHubSelect = (hubName: string) => {
    setSelectedArea(hubName);
  };

  return (
    <View style={styles.container}>
      {/* 1. Swiggy-Style Top Navigation & Location Header */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderRow}>
          {/* Location Selector Button */}
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setIsLocationModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.locationIconWrap}>
              <Ionicons name="location-sharp" size={18} color={THEME.colors.primary} />
            </View>
            <View style={{ marginLeft: 6, maxWidth: 210 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.locationTitle} numberOfLines={1}>
                  {selectedArea === 'All' ? 'Pune, Maharashtra' : `${selectedArea}, Pune`}
                </Text>
                <Ionicons name="chevron-down" size={14} color={THEME.colors.textPrimary} />
              </View>
              <Text style={styles.locationSubtitle} numberOfLines={1}>
                {selectedArea === 'All' ? 'Explore all college zones' : 'Tap to change locality'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Right Action Icons */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => onNavigateTab?.('saved')}
              activeOpacity={0.8}
            >
              <Ionicons name="heart-outline" size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: '#F0F9FF' }]}
              onPress={onOpenPreferences}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={18} color={THEME.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Swiggy-Style Search Trigger Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={() => onNavigateToSearch?.('', selectedArea)}
        >
          <Ionicons name="search" size={18} color={THEME.colors.primary} />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            {searchPlaceholders[searchPlaceholderIndex]}
          </Text>
          <View style={styles.searchDivider} />
          <Ionicons name="options-outline" size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Main Body Scroll */}
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
        {/* Zero Brokerage Trust Banner (Swiggy Offer Strip Style) */}
        <View style={styles.trustBanner}>
          <View style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>₹0 BROKERAGE</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.trustTitle}>Direct Owner Bookings Only</Text>
            <Text style={styles.trustDesc}>
              No agents, no commission. Connect directly with verified Pune owners.
            </Text>
          </View>
          <MaterialCommunityIcons name="shield-check" size={22} color="#059669" />
        </View>

        {/* 3. Swiggy "What's on your mind?" Category Circles */}
        <View style={styles.categorySection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>What are you looking for?</Text>
            <Text style={styles.sectionHint}>Quick Filters</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {DISCOVERY_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(cat)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryCircle, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon as any} size={24} color={cat.iconColor} />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={1}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. Swiggy-Style Top Rated Hostels Carousel */}
        {topRatedHostels.length > 0 && (
          <View style={styles.topRatedSection}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Top Rated Hostels in Pune 🌟</Text>
                <Text style={styles.sectionSubtitle}>
                  Verified properties with 4.8+ ratings from completed stays
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onNavigateToSearch?.('', selectedArea, { minRating: 4.5 })}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topRatedScroll}
            >
              {topRatedHostels.map((h) => (
                <TouchableOpacity
                  key={'top-' + h.id}
                  style={styles.topRatedCard}
                  onPress={() => onSelectHostel?.(h)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{
                      uri:
                        h.images && h.images.length > 0
                          ? (h.images[0] as any).image_url || h.images[0].storage_path
                          : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
                    }}
                    style={styles.topRatedImage}
                  />
                  <View style={styles.topRatedRatingBadge}>
                    <Ionicons name="star" size={11} color="#FFF" />
                    <Text style={styles.topRatedRatingText}>
                      {(h.rating || 4.8).toFixed(1)}
                    </Text>
                  </View>

                  <View style={styles.topRatedBody}>
                    <Text style={styles.topRatedName} numberOfLines={1}>
                      {h.name}
                    </Text>
                    <Text style={styles.topRatedArea} numberOfLines={1}>
                      📍 {h.area}
                    </Text>
                    <Text style={styles.topRatedRent}>
                      ₹{(h.monthly_rent || 8000).toLocaleString('en-IN')}/mo
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5. Explainable Personalized Recommendations (Phase 9) */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.sectionTitle}>Recommended for You</Text>
                  {isPersonalized && (
                    <View style={styles.personalizedChip}>
                      <Ionicons name="sparkles" size={10} color="#0284C7" />
                      <Text style={styles.personalizedChipText}>Personalized</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sectionSubtitle}>
                  Curated using verified platform data & student match scoring
                </Text>
              </View>

              <TouchableOpacity onPress={onOpenPreferences}>
                <Text style={styles.seeAllText}>Edit match</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {recommendations.slice(0, 5).map((rec) => (
                <View key={'rec-' + rec.hostel.id} style={{ width: 280 }}>
                  <HostelCard
                    hostel={rec.hostel}
                    recommendationReason={rec.reasons?.[0] || 'Matches your budget'}
                    onPress={() => onSelectHostel?.(rec.hostel)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 6. Recently Viewed Carousels (Swiggy History) */}
        {recentlyViewed.length > 0 && (
          <View style={styles.recentlyViewedSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="time-outline" size={18} color={THEME.colors.primary} />
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
              </View>
              <Text style={styles.sectionHint}>{recentlyViewed.length} hostels</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {recentlyViewed.slice(0, 6).map((h) => (
                <TouchableOpacity
                  key={'recent-' + h.id}
                  style={styles.recentMiniCard}
                  onPress={() => onSelectHostel?.(h)}
                  activeOpacity={0.8}
                >
                  <View style={styles.recentTag}>
                    <Text style={styles.recentTagText}>{h.area}</Text>
                  </View>
                  <Text style={styles.recentName} numberOfLines={1}>
                    {h.name}
                  </Text>
                  <Text style={styles.recentRent}>
                    ₹{(h.monthly_rent || 8000).toLocaleString('en-IN')}/mo
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 7. Popular Pune College Hubs */}
        <View style={styles.collegeHubSection}>
          <Text style={styles.sectionTitle}>Popular Pune Student Zones</Text>
          <Text style={styles.sectionSubtitle}>Find hostels walking distance from campus</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hubScroll}
          >
            <TouchableOpacity
              style={[styles.hubChip, selectedArea === 'All' && styles.hubChipActive]}
              onPress={() => setSelectedArea('All')}
            >
              <Text style={[styles.hubChipName, selectedArea === 'All' && styles.hubChipNameActive]}>
                All Pune
              </Text>
              <Text style={styles.hubChipCollege}>Entire City</Text>
            </TouchableOpacity>

            {POPULAR_COLLEGE_HUBS.map((hub) => {
              const isSelected = selectedArea.toLowerCase() === hub.name.toLowerCase();
              return (
                <TouchableOpacity
                  key={hub.name}
                  style={[styles.hubChip, isSelected && styles.hubChipActive]}
                  onPress={() => handleHubSelect(hub.name)}
                >
                  <Text style={[styles.hubChipName, isSelected && styles.hubChipNameActive]}>
                    {hub.name}
                  </Text>
                  <Text style={[styles.hubChipCollege, isSelected && styles.hubChipCollegeActive]}>
                    {hub.college}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 8. Swiggy-Style Quick Filter Strip for Main List */}
        <View style={styles.mainListHeader}>
          <View>
            <Text style={styles.mainListTitle}>
              {selectedArea === 'All' ? 'All Verified Hostels' : `Hostels in ${selectedArea}`}
            </Text>
            <Text style={styles.mainListSubtitle}>
              {filteredHostels.length} direct properties • ₹0 brokerage
            </Text>
          </View>

          <TouchableOpacity
            style={styles.fullFilterBtn}
            onPress={() => onNavigateToSearch?.('', selectedArea)}
          >
            <Ionicons name="options" size={14} color={THEME.colors.primary} />
            <Text style={styles.fullFilterText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Filter Horizontal Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterPillScroll}
        >
          {['All', 'Girls', 'Boys', 'Single', 'Food', 'Verified'].map((f) => {
            const isSelected = activeQuickFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.quickFilterPill, isSelected && styles.quickFilterPillActive]}
                onPress={() => setActiveQuickFilter(f)}
              >
                <Text
                  style={[
                    styles.quickFilterPillText,
                    isSelected && styles.quickFilterPillTextActive,
                  ]}
                >
                  {f === 'All'
                    ? 'All Stays'
                    : f === 'Food'
                    ? 'Mess / Food'
                    : f === 'Verified'
                    ? '100% Verified'
                    : `${f} Hostels`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 9. Hostels Vertical List */}
        <View style={styles.listingsContainer}>
          {isLoading ? (
            <>
              <HostelCardSkeleton />
              <HostelCardSkeleton />
              <HostelCardSkeleton />
            </>
          ) : filteredHostels.length === 0 ? (
            <StateFeedback
              type="no_results"
              title="No Hostels Found"
              message={`No properties match "${selectedArea}" with the "${activeQuickFilter}" filter. Tap Reset to view all student stays.`}
              onRetry={() => {
                setSelectedArea('All');
                setActiveQuickFilter('All');
              }}
            />
          ) : (
            filteredHostels.map((h) => (
              <HostelCard
                key={h.id}
                hostel={h}
                onPress={() => onSelectHostel?.(h)}
              />
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Pune Location Selector Modal (Swiggy Style) */}
      <Modal
        visible={isLocationModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsLocationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Pune Student Locality</Text>
            <TouchableOpacity onPress={() => setIsLocationModalVisible(false)}>
              <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {/* Auto Detect / All Pune */}
            <TouchableOpacity
              style={styles.modalAreaRow}
              onPress={() => {
                setSelectedArea('All');
                setIsLocationModalVisible(false);
              }}
            >
              <View style={styles.modalAreaIconWrap}>
                <Ionicons name="navigate-circle" size={22} color={THEME.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.modalAreaName}>All Pune Areas</Text>
                <Text style={styles.modalAreaSub}>View all student rooms across Pune</Text>
              </View>
              {selectedArea === 'All' && (
                <Ionicons name="checkmark-circle" size={20} color={THEME.colors.primary} />
              )}
            </TouchableOpacity>

            <Text style={styles.modalSectionLabel}>Popular Student Zones & College Areas</Text>

            {PUNE_AREAS.map((area) => {
              const isSelected = selectedArea.toLowerCase() === area.toLowerCase();
              return (
                <TouchableOpacity
                  key={area}
                  style={styles.modalAreaRow}
                  onPress={() => {
                    setSelectedArea(area);
                    setIsLocationModalVisible(false);
                  }}
                >
                  <View style={styles.modalAreaIconWrap}>
                    <Ionicons name="location-outline" size={18} color="#64748B" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalAreaName}>{area}</Text>
                    <Text style={styles.modalAreaSub}>Direct owner hostels & PGs</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={THEME.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
  topHeader: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  locationSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  searchDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  trustBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  trustBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  trustDesc: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
  },
  categorySection: {
    marginTop: 16,
    backgroundColor: THEME.colors.surface,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  sectionHint: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  categoryScroll: {
    paddingHorizontal: 12,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 68,
  },
  categoryCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryLabel: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  topRatedSection: {
    marginTop: 16,
  },
  topRatedScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 4,
  },
  topRatedCard: {
    width: 170,
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.small,
  },
  topRatedImage: {
    width: '100%',
    height: 105,
    backgroundColor: '#E2E8F0',
  },
  topRatedRatingBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  topRatedRatingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  topRatedBody: {
    padding: 8,
  },
  topRatedName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  topRatedArea: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  topRatedRent: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 4,
  },
  recommendationsSection: {
    marginTop: 18,
  },
  personalizedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  personalizedChipText: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '700',
  },
  recentlyViewedSection: {
    marginTop: 18,
  },
  recentMiniCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    width: 140,
  },
  recentTag: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  recentTagText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#475569',
  },
  recentName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  recentRent: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  collegeHubSection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  hubScroll: {
    gap: 8,
    paddingTop: 8,
  },
  hubChip: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hubChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  hubChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  hubChipNameActive: {
    color: '#FFF',
  },
  hubChipCollege: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  hubChipCollegeActive: {
    color: '#E2E8F0',
  },
  mainListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  mainListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  mainListSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  fullFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  fullFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  quickFilterPillScroll: {
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 12,
  },
  quickFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickFilterPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  quickFilterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  quickFilterPillTextActive: {
    color: '#FFF',
  },
  listingsContainer: {
    paddingHorizontal: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  modalScroll: {
    padding: 16,
  },
  modalAreaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalAreaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAreaName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  modalAreaSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
});
