import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { THEME, PUNE_AREAS, formatIndianRupees } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';
import { HostelCard } from '../../components/hostels/HostelCard';
import { Hostel } from '../../src/types/database.types';

interface StudentSearchRouteProps {
  initialSearchQuery?: string;
  initialArea?: string;
  onSelectHostel?: (hostel: Hostel) => void;
  onBack?: () => void;
}

type SortOption = 'price_asc' | 'price_desc' | 'newest';

const RENT_RANGES = [
  { label: 'Any Budget', min: 0, max: 999999 },
  { label: 'Under ₹7,500', min: 0, max: 7500 },
  { label: '₹7,500 – ₹10,000', min: 7500, max: 10000 },
  { label: '₹10,000 – ₹14,000', min: 10000, max: 14000 },
  { label: '₹14,000+', min: 14000, max: 999999 },
];

const ROOM_TYPES = ['All Types', 'Single Room', 'Twin Sharing', 'Triple Sharing'];
const GENDERS = ['All', 'Boys', 'Girls', 'Co-ed'];
const POPULAR_AMENITIES = [
  'High-speed Wi-Fi',
  'Daily Meals (Mess)',
  'Air Conditioning (AC)',
  '24/7 CCTV & Security',
  'Washing Machine',
  'Power Backup (Inverter)',
  'Attached Washroom',
];

const PAGE_SIZE = 8;

export default function StudentSearchRoute({
  initialSearchQuery = '',
  initialArea = 'All',
  onSelectHostel,
  onBack,
}: StudentSearchRouteProps) {
  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearchQuery);
  const [selectedArea, setSelectedArea] = useState<string>(initialArea);
  const [selectedRentRangeIndex, setSelectedRentRangeIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState('All Types');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isGridView, setIsGridView] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(0); // Reset page on new query
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page whenever filters change
  const handleFilterChange = () => {
    setPage(0);
  };

  // Real Supabase Query via TanStack Query
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: [
      'search-hostels',
      debouncedQuery,
      selectedArea,
      selectedRentRangeIndex,
      selectedRoomType,
      selectedGender,
      selectedAmenities,
      sortBy,
      page,
    ],
    queryFn: async () => {
      let query = supabase
        .from('hostels')
        .select(`
          id,
          owner_id,
          name,
          description,
          city,
          area,
          address,
          latitude,
          longitude,
          monthly_rent,
          security_deposit,
          gender_preference,
          verification_status,
          is_published,
          created_at,
          images:hostel_images(storage_path, sort_order),
          rooms:rooms(room_type, monthly_rent, total_beds, available_beds),
          amenities:hostel_amenities(amenity:amenities(name))
        `)
        .eq('city', 'Pune')
        .eq('is_published', true);

      // Area Filter
      if (selectedArea !== 'All') {
        query = query.ilike('area', `%${selectedArea}%`);
      }

      // Gender Filter
      if (selectedGender !== 'All') {
        query = query.eq('gender_preference', selectedGender.toLowerCase());
      }

      // Rent Range Filter
      const activeRange = RENT_RANGES[selectedRentRangeIndex];
      if (activeRange.min > 0) {
        query = query.gte('monthly_rent', activeRange.min);
      }
      if (activeRange.max < 999999) {
        query = query.lte('monthly_rent', activeRange.max);
      }

      // Text Search
      if (debouncedQuery.trim()) {
        const term = debouncedQuery.trim();
        query = query.or(`name.ilike.%${term}%,area.ilike.%${term}%,description.ilike.%${term}%`);
      }

      // Sorting
      if (sortBy === 'price_asc') {
        query = query.order('monthly_rent', { ascending: true });
      } else if (sortBy === 'price_desc') {
        query = query.order('monthly_rent', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const from = 0;
      const to = (page + 1) * PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase query error:', error.message);
        throw error;
      }

      return (data || []) as Hostel[];
    },
  });

  // Client-side refinement for Room Type & Amenities join if needed
  const finalHostels = useMemo(() => {
    if (!data) return [];
    return data.filter((h) => {
      // Room Type check
      if (selectedRoomType !== 'All Types') {
        const matchesRoom = h.rooms?.some((r) =>
          r.room_type.toLowerCase().includes(selectedRoomType.toLowerCase().replace(' room', ''))
        );
        if (!matchesRoom) return false;
      }

      // Amenities check
      if (selectedAmenities.length > 0) {
        const hostelAmenityNames = (h.amenities || []).map((a: any) =>
          typeof a.amenity === 'object' ? a.amenity?.name : a.name
        );
        const hasAllSelected = selectedAmenities.every((amenity) =>
          hostelAmenityNames.includes(amenity)
        );
        if (!hasAllSelected) return false;
      }

      return true;
    });
  }, [data, selectedRoomType, selectedAmenities]);

  const activeFiltersCount =
    (selectedArea !== 'All' ? 1 : 0) +
    (selectedRentRangeIndex !== 0 ? 1 : 0) +
    (selectedRoomType !== 'All Types' ? 1 : 0) +
    (selectedGender !== 'All' ? 1 : 0) +
    selectedAmenities.length;

  const handleResetFilters = () => {
    setSelectedArea('All');
    setSelectedRentRangeIndex(0);
    setSelectedRoomType('All Types');
    setSelectedGender('All');
    setSelectedAmenities([]);
    setSortBy('newest');
    setSearchQuery('');
    setPage(0);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
    handleFilterChange();
  };

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={THEME.colors.white} />
          </TouchableOpacity>
        )}

        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color={THEME.colors.textMuted} />
          <TextInput
            placeholder="Search Pune hostels, areas, colleges..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Trigger */}
        <TouchableOpacity
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => setIsFilterModalOpen(true)}
        >
          <Ionicons
            name="funnel"
            size={16}
            color={activeFiltersCount > 0 ? THEME.colors.primary : THEME.colors.white}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Area & Sort Controls Bar */}
      <View style={styles.controlBar}>
        {/* Horizontal Areas */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.areaScroll}
        >
          {['All', ...PUNE_AREAS].map((area) => {
            const isSelected = selectedArea === area;
            return (
              <TouchableOpacity
                key={area}
                style={[styles.areaPill, isSelected && styles.areaPillActive]}
                onPress={() => {
                  setSelectedArea(area);
                  handleFilterChange();
                }}
              >
                <Text style={[styles.areaPillText, isSelected && styles.areaPillTextActive]}>
                  {area}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header: Count, Sort Dropdown & Grid Toggle */}
      <View style={styles.subHeader}>
        <Text style={styles.resultsCount}>
          {isLoading ? 'Searching...' : `${finalHostels.length} Pune hostels`}
        </Text>

        <View style={styles.subHeaderActions}>
          {/* Sort Switcher */}
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => {
              if (sortBy === 'newest') setSortBy('price_asc');
              else if (sortBy === 'price_asc') setSortBy('price_desc');
              else setSortBy('newest');
              handleFilterChange();
            }}
          >
            <Ionicons name="swap-vertical" size={14} color={THEME.colors.primary} />
            <Text style={styles.sortBtnText}>
              {sortBy === 'price_asc'
                ? 'Price: Low-High'
                : sortBy === 'price_desc'
                ? 'Price: High-Low'
                : 'Newest'}
            </Text>
          </TouchableOpacity>

          {/* Grid / List Toggle */}
          <TouchableOpacity
            style={styles.viewToggleBtn}
            onPress={() => setIsGridView(!isGridView)}
          >
            <Ionicons
              name={isGridView ? 'list' : 'grid'}
              size={16}
              color={THEME.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Fetching Pune hostel database...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={44} color="#E53E3E" />
          <Text style={styles.errorTitle}>Unable to load listings</Text>
          <Text style={styles.errorSub}>{(error as any)?.message || 'Network error'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Retry Search</Text>
          </TouchableOpacity>
        </View>
      ) : finalHostels.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={48} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>No matching hostels</Text>
          <Text style={styles.emptySub}>
            No properties match your current filters in Pune. Try widening your budget or clearing area filters.
          </Text>
          <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
            <Text style={styles.resetBtnText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={isGridView ? 'grid' : 'list'}
          data={finalHostels}
          keyExtractor={(item) => item.id}
          numColumns={isGridView ? 2 : 1}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[THEME.colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <View style={isGridView ? styles.gridCardWrapper : undefined}>
              <HostelCard
                hostel={item}
                onPress={() => onSelectHostel?.(item)}
              />
            </View>
          )}
          onEndReached={() => {
            if (finalHostels.length >= (page + 1) * PAGE_SIZE) {
              setPage((prev) => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Filter Hostels & PGs</Text>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
                <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Gender Preference */}
              <Text style={styles.filterSectionTitle}>Gender Preference</Text>
              <View style={styles.filterChipsRow}>
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.modalChip, selectedGender === g && styles.modalChipActive]}
                    onPress={() => {
                      setSelectedGender(g);
                      handleFilterChange();
                    }}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        selectedGender === g && styles.modalChipTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Monthly Rent Budget */}
              <Text style={styles.filterSectionTitle}>Monthly Budget</Text>
              <View style={styles.filterChipsRow}>
                {RENT_RANGES.map((range, idx) => (
                  <TouchableOpacity
                    key={range.label}
                    style={[
                      styles.modalChip,
                      selectedRentRangeIndex === idx && styles.modalChipActive,
                    ]}
                    onPress={() => {
                      setSelectedRentRangeIndex(idx);
                      handleFilterChange();
                    }}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        selectedRentRangeIndex === idx && styles.modalChipTextActive,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Room Sharing Type */}
              <Text style={styles.filterSectionTitle}>Room Sharing</Text>
              <View style={styles.filterChipsRow}>
                {ROOM_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.modalChip,
                      selectedRoomType === type && styles.modalChipActive,
                    ]}
                    onPress={() => {
                      setSelectedRoomType(type);
                      handleFilterChange();
                    }}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        selectedRoomType === type && styles.modalChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Key Amenities */}
              <Text style={styles.filterSectionTitle}>Must-Have Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {POPULAR_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <TouchableOpacity
                      key={amenity}
                      style={[styles.amenityBox, isChecked && styles.amenityBoxActive]}
                      onPress={() => toggleAmenity(amenity)}
                    >
                      <Ionicons
                        name={isChecked ? 'checkbox' : 'square-outline'}
                        size={18}
                        color={isChecked ? THEME.colors.primary : THEME.colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.amenityBoxText,
                          isChecked && styles.amenityBoxTextActive,
                        ]}
                      >
                        {amenity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.modalBottomActions}>
              <TouchableOpacity style={styles.modalResetBtn} onPress={handleResetFilters}>
                <Text style={styles.modalResetText}>Reset All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => setIsFilterModalOpen(false)}
              >
                <Text style={styles.modalApplyText}>
                  Show {finalHostels.length} Results
                </Text>
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
    backgroundColor: THEME.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
  },
  backBtn: {
    padding: 6,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    padding: 0,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: THEME.colors.secondary,
  },
  badgeCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: THEME.colors.accent,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: THEME.colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  controlBar: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  areaScroll: {
    paddingHorizontal: THEME.spacing.md,
    gap: 6,
  },
  areaPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  areaPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  areaPillText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  areaPillTextActive: {
    color: THEME.colors.white,
    fontWeight: '800',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  subHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sortBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  viewToggleBtn: {
    backgroundColor: THEME.colors.surface,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  listContent: {
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: 30,
  },
  gridCardWrapper: {
    flex: 0.5,
    marginHorizontal: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  resetBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E53E3E',
    marginTop: 10,
  },
  errorSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
  },
  retryBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 28, 45, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  modalScroll: {
    paddingVertical: 12,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: THEME.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  modalChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  modalChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  modalChipTextActive: {
    color: THEME.colors.white,
    fontWeight: '800',
  },
  amenitiesGrid: {
    gap: 8,
  },
  amenityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: THEME.colors.surfaceVariant,
  },
  amenityBoxActive: {
    backgroundColor: THEME.colors.secondary,
  },
  amenityBoxText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
  },
  amenityBoxTextActive: {
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  modalBottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  modalResetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
  },
  modalResetText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  modalApplyBtn: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalApplyText: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
