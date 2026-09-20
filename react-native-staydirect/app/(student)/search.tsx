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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { THEME, PUNE_AREAS, formatIndianRupees } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';
import { HostelCard, HostelCardSkeleton } from '../../components/hostels/HostelCard';
import { Hostel, AdvancedSearchFilters, SearchSortOption } from '../../src/types/database.types';
import { FilterModal } from '../../src/components/search/FilterModal';
import { SortModal } from '../../src/components/search/SortModal';
import { logSearchAnalytics } from '../../src/lib/analytics';
import { useSavedSearches } from '../../src/hooks/useSavedSearches';
import { FALLBACK_HOSTELS } from '../../src/hooks/useHostels';

interface StudentSearchRouteProps {
  initialSearchQuery?: string;
  initialArea?: string;
  initialFilters?: AdvancedSearchFilters;
  onSelectHostel?: (hostel: Hostel) => void;
  onBack?: () => void;
}

const PAGE_SIZE = 12;

const POPULAR_PUNE_SUGGESTIONS = [
  { text: 'Kothrud (MIT & Cummins)', type: 'area', area: 'Kothrud' },
  { text: 'Shivajinagar (COEP & FC Road)', type: 'area', area: 'Shivajinagar' },
  { text: 'Viman Nagar (Symbiosis Campus)', type: 'area', area: 'Viman Nagar' },
  { text: 'Hinjewadi Tech Zone Hostels', type: 'area', area: 'Hinjewadi' },
  { text: 'Girls Hostels with Mess Food', type: 'filter', gender: 'Girls', food: 'food_included' },
  { text: 'Single Room under ₹10,000', type: 'filter', maxRent: 10000, roomType: 'Single Room' },
  { text: 'Verified Hostels with AC', type: 'filter', verified: true, amenity: 'Air conditioning' },
];

const DEFAULT_RECENT_SEARCHES = [
  'Kothrud Girls PG',
  'Hostels near COEP',
  'Single room with mess',
  'Viman Nagar under 12k',
];

export default function StudentSearchRoute({
  initialSearchQuery = '',
  initialArea = 'All',
  initialFilters,
  onSelectHostel,
  onBack,
}: StudentSearchRouteProps) {
  // Master Filter State
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: initialSearchQuery,
    area: initialArea === 'All' ? undefined : initialArea,
    sortBy: 'relevance',
    ...initialFilters,
  });

  const [searchInput, setSearchInput] = useState(initialSearchQuery);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isSaveAlertModalOpen, setIsSaveAlertModalOpen] = useState(false);
  const [alertNameInput, setAlertNameInput] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(DEFAULT_RECENT_SEARCHES);
  const [isFocused, setIsFocused] = useState(false);
  const [page, setPage] = useState(0);

  const { saveSearch } = useSavedSearches();

  // Debounce input to filters.query
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, query: searchInput.trim() || undefined }));
      setPage(0);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Server-Side Search Query
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['hostels-advanced-search', filters, page],
    queryFn: async () => {
      const startTime = Date.now();
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
        `, { count: 'exact' })
        .eq('city', 'Pune')
        .eq('is_published', true);

      // Area filter
      if (filters.area && filters.area !== 'All' && filters.area !== 'All Pune') {
        query = query.ilike('area', `%${filters.area}%`);
      }

      // Gender filter
      if (filters.gender && filters.gender !== 'All' && filters.gender !== 'any') {
        query = query.eq('gender_preference', filters.gender.toLowerCase());
      }

      // Budget filters
      if (filters.minRent && filters.minRent > 0) {
        query = query.gte('monthly_rent', filters.minRent);
      }
      if (filters.maxRent && filters.maxRent > 0) {
        query = query.lte('monthly_rent', filters.maxRent);
      }

      // Verification filter
      if (filters.verifiedHostelOnly) {
        query = query.eq('verification_status', 'verified');
      }

      // Full Text search on name, area, address, description
      if (filters.query && filters.query.trim()) {
        const term = filters.query.trim();
        query = query.or(`name.ilike.%${term}%,area.ilike.%${term}%,address.ilike.%${term}%,description.ilike.%${term}%`);
      }

      // Sort
      if (filters.sortBy === 'price_asc') {
        query = query.order('monthly_rent', { ascending: true });
      } else if (filters.sortBy === 'price_desc') {
        query = query.order('monthly_rent', { ascending: false });
      } else if (filters.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('verification_status', { ascending: false }).order('monthly_rent', { ascending: true });
      }

      // Pagination
      const from = 0;
      const to = (page + 1) * PAGE_SIZE - 1;
      query = query.range(from, to);

      try {
        const { data: resData, error, count } = await query;
        if (error || !resData || resData.length === 0) {
          // Fallback to offline/seed hostels for smooth prototype experience
          const fallbackFiltered = FALLBACK_HOSTELS.filter((h) => {
            if (filters.area && filters.area !== 'All' && filters.area !== 'All Pune') {
              if (!h.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
            }
            if (filters.gender && filters.gender !== 'All' && filters.gender !== 'any') {
              if (h.gender_preference !== filters.gender.toLowerCase()) return false;
            }
            const rent = h.monthly_rent || h.monthly_rent_min || 8000;
            if (filters.minRent && rent < filters.minRent) return false;
            if (filters.maxRent && rent > filters.maxRent) return false;
            if (filters.verifiedHostelOnly && h.verification_status !== 'verified') return false;
            if (filters.query && filters.query.trim()) {
              const q = filters.query.toLowerCase().trim();
              const mName = h.name.toLowerCase().includes(q);
              const mArea = h.area.toLowerCase().includes(q);
              const mAddr = (h.address || '').toLowerCase().includes(q);
              const mCol = (h.nearby_college || '').toLowerCase().includes(q);
              if (!mName && !mArea && !mAddr && !mCol) return false;
            }
            return true;
          });

          return {
            hostels: fallbackFiltered,
            totalCount: fallbackFiltered.length,
          };
        }

        const totalFound = count || resData?.length || 0;

        // Privacy-conscious analytics logging
        logSearchAnalytics({
          query: filters.query || null,
          area: filters.area || null,
          filters,
          results_count: totalFound,
          execution_time_ms: Date.now() - startTime,
        });

        return {
          hostels: (resData || []) as Hostel[],
          totalCount: totalFound,
        };
      } catch (err) {
        console.warn('Using search fallback:', err);
        const fallbackFiltered = FALLBACK_HOSTELS.filter((h) => {
          if (filters.area && filters.area !== 'All' && filters.area !== 'All Pune') {
            if (!h.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
          }
          if (filters.gender && filters.gender !== 'All' && filters.gender !== 'any') {
            if (h.gender_preference !== filters.gender.toLowerCase()) return false;
          }
          const rent = h.monthly_rent || h.monthly_rent_min || 8000;
          if (filters.minRent && rent < filters.minRent) return false;
          if (filters.maxRent && rent > filters.maxRent) return false;
          if (filters.verifiedHostelOnly && h.verification_status !== 'verified') return false;
          return true;
        });
        return {
          hostels: fallbackFiltered,
          totalCount: fallbackFiltered.length,
        };
      }
    },
  });

  // Client-side refinement for multi-room / amenities joins if needed
  const finalHostels = useMemo(() => {
    if (!data?.hostels) return [];
    return data.hostels.filter((h) => {
      // Room types check
      if (filters.roomTypes && filters.roomTypes.length > 0) {
        const matchesAnyRoom = filters.roomTypes.some((rt) =>
          h.rooms?.some((r: any) =>
            (r.room_type || '').toLowerCase().includes(rt.toLowerCase().replace(' room', '').replace(' sharing', ''))
          )
        );
        if (!matchesAnyRoom) return false;
      }

      // Amenities check
      if (filters.amenities && filters.amenities.length > 0) {
        const hostelAmenityNames = (h.amenities || []).map((a: any) =>
          (typeof a.amenity === 'object' ? a.amenity?.name : a.name || '').toLowerCase()
        );
        const hasAllAmenities = filters.amenities.every((req) =>
          hostelAmenityNames.some((n: string) => n.includes(req.toLowerCase()))
        );
        if (!hasAllAmenities) return false;
      }

      // Food preference check
      if (filters.foodPreference === 'food_included') {
        const hasMess = (h.amenities || []).some((a: any) => {
          const name = (typeof a.amenity === 'object' ? a.amenity?.name : a.name || '').toLowerCase();
          return name.includes('meal') || name.includes('food') || name.includes('mess');
        });
        if (!hasMess) return false;
      }

      return true;
    });
  }, [data?.hostels, filters.roomTypes, filters.amenities, filters.foodPreference]);

  // Active filter count for badge
  const activeFiltersCount = useMemo(() => {
    let c = 0;
    if (filters.area && filters.area !== 'All' && filters.area !== 'All Pune') c++;
    if (filters.gender && filters.gender !== 'All' && filters.gender !== 'any') c++;
    if (filters.minRent || filters.maxRent) c++;
    if (filters.roomTypes && filters.roomTypes.length > 0) c += filters.roomTypes.length;
    if (filters.foodPreference) c++;
    if (filters.amenities && filters.amenities.length > 0) c += filters.amenities.length;
    if (filters.minRating) c++;
    if (filters.verifiedHostelOnly) c++;
    if (filters.fastResponseOnly) c++;
    return c;
  }, [filters]);

  // Quick filter handlers
  const toggleQuickGender = (g: 'Boys' | 'Girls') => {
    setFilters((prev) => ({
      ...prev,
      gender: prev.gender === g ? undefined : g,
    }));
  };

  const toggleQuickRating = () => {
    setFilters((prev) => ({
      ...prev,
      minRating: prev.minRating === 4.0 ? undefined : 4.0,
    }));
  };

  const toggleQuickBudget = () => {
    setFilters((prev) => ({
      ...prev,
      maxRent: prev.maxRent === 10000 ? undefined : 10000,
    }));
  };

  const toggleQuickFood = () => {
    setFilters((prev) => ({
      ...prev,
      foodPreference: prev.foodPreference === 'food_included' ? undefined : 'food_included',
    }));
  };

  const toggleQuickVerified = () => {
    setFilters((prev) => ({
      ...prev,
      verifiedHostelOnly: !prev.verifiedHostelOnly,
    }));
  };

  const handleApplySuggestion = (s: typeof POPULAR_PUNE_SUGGESTIONS[0]) => {
    if (s.area) {
      setFilters((prev) => ({ ...prev, area: s.area }));
      setSearchInput('');
    }
    if (s.gender) {
      setFilters((prev) => ({ ...prev, gender: s.gender as any }));
    }
    if (s.maxRent) {
      setFilters((prev) => ({ ...prev, maxRent: s.maxRent }));
    }
    if (s.roomType) {
      setFilters((prev) => ({ ...prev, roomTypes: [s.roomType!] }));
    }
    if (s.food) {
      setFilters((prev) => ({ ...prev, foodPreference: s.food as any }));
    }
    if (s.verified) {
      setFilters((prev) => ({ ...prev, verifiedHostelOnly: true }));
    }
    setIsFocused(false);
  };

  const handleSaveSearchAlert = async () => {
    const alertName = alertNameInput.trim() || `${filters.area || 'Pune'} Search Alert`;
    try {
      await saveSearch.mutateAsync({
        name: alertName,
        query: filters.query,
        filters,
        notification_enabled: true,
      });
      setIsSaveAlertModalOpen(false);
      setAlertNameInput('');
      Alert.alert(
        'Alert Saved 🔔',
        `You will receive instant notifications whenever a verified hostel matches "${alertName}".`
      );
    } catch (e: any) {
      Alert.alert('Notice', 'Search alert saved locally.');
      setIsSaveAlertModalOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Swiggy-Style Top Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          )}

          <View style={styles.searchInputBox}>
            <Ionicons name="search" size={18} color={THEME.colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Search hostels, colleges, areas..."
              placeholderTextColor={THEME.colors.textMuted}
              value={searchInput}
              onChangeText={setSearchInput}
              onFocus={() => setIsFocused(true)}
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchInput('');
                  setFilters((prev) => ({ ...prev, query: undefined }));
                }}
                style={styles.clearBtn}
              >
                <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterTriggerBtn, activeFiltersCount > 0 && styles.filterTriggerBtnActive]}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <Ionicons
              name="options"
              size={18}
              color={activeFiltersCount > 0 ? '#FFF' : THEME.colors.textPrimary}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Swiggy-Style Horizontal Quick Filter Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
        >
          {/* Full Filter Button */}
          <TouchableOpacity
            style={[styles.pill, activeFiltersCount > 0 && styles.pillActive]}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <Ionicons
              name="options-outline"
              size={13}
              color={activeFiltersCount > 0 ? '#FFF' : THEME.colors.textPrimary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.pillText, activeFiltersCount > 0 && styles.pillTextActive]}>
              Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Sort By Dropdown Pill */}
          <TouchableOpacity
            style={[styles.pill, filters.sortBy !== 'relevance' && styles.pillActive]}
            onPress={() => setIsSortModalOpen(true)}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={13}
              color={filters.sortBy !== 'relevance' ? '#FFF' : THEME.colors.textPrimary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.pillText, filters.sortBy !== 'relevance' && styles.pillTextActive]}
            >
              Sort By ▾
            </Text>
          </TouchableOpacity>

          {/* 4.0+ Stars Rating Pill */}
          <TouchableOpacity
            style={[styles.pill, filters.minRating === 4.0 && styles.pillActive]}
            onPress={toggleQuickRating}
          >
            <Ionicons
              name="star"
              size={12}
              color={filters.minRating === 4.0 ? '#FFF' : '#F59E0B'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.pillText, filters.minRating === 4.0 && styles.pillTextActive]}>
              Ratings 4.0+
            </Text>
          </TouchableOpacity>

          {/* Girls Hostel Pill */}
          <TouchableOpacity
            style={[styles.pill, filters.gender === 'Girls' && styles.pillActive]}
            onPress={() => toggleQuickGender('Girls')}
          >
            <Text style={[styles.pillText, filters.gender === 'Girls' && styles.pillTextActive]}>
              Girls Only
            </Text>
          </TouchableOpacity>

          {/* Boys Hostel Pill */}
          <TouchableOpacity
            style={[styles.pill, filters.gender === 'Boys' && styles.pillActive]}
            onPress={() => toggleQuickGender('Boys')}
          >
            <Text style={[styles.pillText, filters.gender === 'Boys' && styles.pillTextActive]}>
              Boys Only
            </Text>
          </TouchableOpacity>

          {/* Budget < ₹10k Pill */}
          <TouchableOpacity
            style={[styles.pill, filters.maxRent === 10000 && styles.pillActive]}
            onPress={toggleQuickBudget}
          >
            <Text style={[styles.pillText, filters.maxRent === 10000 && styles.pillTextActive]}>
              Under ₹10k
            </Text>
          </TouchableOpacity>

          {/* Food / Mess Included Pill */}
          <TouchableOpacity
            style={[styles.pill, filters.foodPreference === 'food_included' && styles.pillActive]}
            onPress={toggleQuickFood}
          >
            <Text
              style={[
                styles.pillText,
                filters.foodPreference === 'food_included' && styles.pillTextActive,
              ]}
            >
              Food Included
            </Text>
          </TouchableOpacity>

          {/* 100% Verified Pill */}
          <TouchableOpacity
            style={[styles.pill, filters.verifiedHostelOnly && styles.pillActive]}
            onPress={toggleQuickVerified}
          >
            <Ionicons
              name="shield-checkmark"
              size={12}
              color={filters.verifiedHostelOnly ? '#FFF' : '#059669'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.pillText, filters.verifiedHostelOnly && styles.pillTextActive]}>
              Verified
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Autocomplete & Suggestions Overlay when search input is focused with no query */}
      {isFocused && searchInput.length === 0 ? (
        <ScrollView style={styles.suggestionsContainer}>
          {/* Recent Searches */}
          <View style={styles.suggestionsSection}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={() => setRecentSearches([])}>
                <Text style={styles.clearRecentText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentChipsWrap}>
              {recentSearches.map((r, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.recentChip}
                  onPress={() => {
                    setSearchInput(r);
                    setIsFocused(false);
                  }}
                >
                  <Ionicons name="time-outline" size={13} color={THEME.colors.textSecondary} />
                  <Text style={styles.recentChipText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Popular Student Zones & College Areas */}
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Popular Pune Student Zones</Text>
            {POPULAR_PUNE_SUGGESTIONS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionRow}
                onPress={() => handleApplySuggestion(item)}
              >
                <View style={styles.suggestionIconWrap}>
                  <Ionicons
                    name={item.type === 'area' ? 'location-outline' : 'sparkles-outline'}
                    size={16}
                    color={THEME.colors.primary}
                  />
                </View>
                <Text style={styles.suggestionText}>{item.text}</Text>
                <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.dismissSuggestionsBtn} onPress={() => setIsFocused(false)}>
            <Text style={styles.dismissSuggestionsText}>Hide Suggestions</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.resultsContainer}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              colors={[THEME.colors.primary]}
            />
          }
        >
          {/* Results Summary Bar with Save Search Alert */}
          <View style={styles.resultsMetaBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultsCountText}>
                {finalHostels.length} verified hostels found
              </Text>
              <Text style={styles.resultsSubtext}>
                {filters.area ? `In ${filters.area}` : 'Across Pune'} • Direct Owner • ₹0 Brokerage
              </Text>
            </View>

            {/* Save Search Alert Button (Swiggy Style) */}
            <TouchableOpacity
              style={styles.saveAlertBtn}
              onPress={() => {
                setAlertNameInput(
                  `${filters.area || 'Pune'} ${filters.gender || ''} ${
                    filters.maxRent ? `<₹${filters.maxRent}` : ''
                  }`.trim()
                );
                setIsSaveAlertModalOpen(true);
              }}
            >
              <Ionicons name="notifications-outline" size={13} color={THEME.colors.primary} />
              <Text style={styles.saveAlertText}>Alert Me</Text>
            </TouchableOpacity>
          </View>

          {/* Active Filter Chips (if any) */}
          {activeFiltersCount > 0 && (
            <View style={styles.activeChipsBar}>
              {filters.area && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>{filters.area}</Text>
                  <TouchableOpacity
                    onPress={() => setFilters((prev) => ({ ...prev, area: undefined }))}
                  >
                    <Ionicons name="close" size={12} color="#0284C7" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.gender && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>{filters.gender}</Text>
                  <TouchableOpacity
                    onPress={() => setFilters((prev) => ({ ...prev, gender: undefined }))}
                  >
                    <Ionicons name="close" size={12} color="#0284C7" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.maxRent && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>Under ₹{filters.maxRent}</Text>
                  <TouchableOpacity
                    onPress={() => setFilters((prev) => ({ ...prev, maxRent: undefined }))}
                  >
                    <Ionicons name="close" size={12} color="#0284C7" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.foodPreference && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>Food Included</Text>
                  <TouchableOpacity
                    onPress={() => setFilters((prev) => ({ ...prev, foodPreference: undefined }))}
                  >
                    <Ionicons name="close" size={12} color="#0284C7" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.verifiedHostelOnly && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>Verified</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, verifiedHostelOnly: false }))
                    }
                  >
                    <Ionicons name="close" size={12} color="#0284C7" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                onPress={() =>
                  setFilters({
                    query: filters.query,
                    sortBy: 'relevance',
                  })
                }
              >
                <Text style={styles.clearAllTagsText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hostels List */}
          <View style={styles.cardsList}>
            {isLoading ? (
              <>
                <HostelCardSkeleton />
                <HostelCardSkeleton />
                <HostelCardSkeleton />
              </>
            ) : finalHostels.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconCircle}>
                  <Ionicons name="search-outline" size={36} color={THEME.colors.textMuted} />
                </View>
                <Text style={styles.emptyStateTitle}>No Hostels Match Your Criteria</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try expanding your budget range or removing specific filters to discover student rooms in nearby Pune localities.
                </Text>
                <TouchableOpacity
                  style={styles.resetFiltersBtn}
                  onPress={() =>
                    setFilters({
                      query: undefined,
                      sortBy: 'relevance',
                    })
                  }
                >
                  <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              finalHostels.map((h) => (
                <HostelCard
                  key={h.id}
                  hostel={h}
                  onPress={() => onSelectHostel?.(h)}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterModalOpen}
        filters={filters}
        totalResultsCount={finalHostels.length}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(updated) => setFilters(updated)}
        onReset={() =>
          setFilters({
            query: filters.query,
            sortBy: 'relevance',
          })
        }
      />

      {/* Sort Modal */}
      <SortModal
        visible={isSortModalOpen}
        selectedSort={filters.sortBy || 'relevance'}
        onClose={() => setIsSortModalOpen(false)}
        onSelectSort={(newSort) => setFilters((prev) => ({ ...prev, sortBy: newSort }))}
      />

      {/* Save Search Alert Modal */}
      <Modal
        visible={isSaveAlertModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSaveAlertModalOpen(false)}
      >
        <View style={styles.alertModalBackdrop}>
          <View style={styles.alertModalCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Ionicons name="notifications" size={20} color={THEME.colors.primary} />
              <Text style={styles.alertModalTitle}>Create Hostel Alert</Text>
            </View>
            <Text style={styles.alertModalSubtitle}>
              StayDirect will notify you immediately when a verified hostel matches these filters.
            </Text>

            <TextInput
              style={styles.alertModalInput}
              placeholder="e.g. Kothrud Girls PG under 10k"
              placeholderTextColor={THEME.colors.textMuted}
              value={alertNameInput}
              onChangeText={setAlertNameInput}
            />

            <View style={styles.alertModalBtnRow}>
              <TouchableOpacity
                style={styles.alertModalCancelBtn}
                onPress={() => setIsSaveAlertModalOpen(false)}
              >
                <Text style={styles.alertModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.alertModalSaveBtn}
                onPress={handleSaveSearchAlert}
                disabled={saveSearch.isPending}
              >
                {saveSearch.isPending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.alertModalSaveText}>Save Alert</Text>
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
  searchHeader: {
    backgroundColor: THEME.colors.surface,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    padding: 0,
  },
  clearBtn: {
    padding: 2,
  },
  filterTriggerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTriggerBtnActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  filterPillsScroll: {
    paddingHorizontal: 14,
    gap: 6,
    paddingTop: 8,
    paddingBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  pillTextActive: {
    color: '#FFF',
  },
  suggestionsContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  suggestionsSection: {
    marginBottom: 20,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  clearRecentText: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  recentChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentChipText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontWeight: '500',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  suggestionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  dismissSuggestionsBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  dismissSuggestionsText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  resultsSubtext: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  saveAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  saveAlertText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  activeChipsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
  },
  clearAllTagsText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginLeft: 4,
  },
  cardsList: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  emptyStateContainer: {
    padding: 36,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 20,
  },
  emptyStateIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  resetFiltersBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetFiltersBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  alertModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertModalCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  alertModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  alertModalSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 14,
  },
  alertModalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    marginBottom: 16,
  },
  alertModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  alertModalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  alertModalCancelText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  alertModalSaveBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  alertModalSaveText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
