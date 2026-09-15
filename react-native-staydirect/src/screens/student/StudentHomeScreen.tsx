import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, PUNE_AREAS, PUNE_COLLEGES } from '../../constants/theme';
import { Header } from '../../components/Header';
import { HostelCard } from '../../components/HostelCard';
import { FilterModal } from '../../components/FilterModal';
import { useHostels, HostelFilters } from '../../hooks/useHostels';
import { useFavorites } from '../../hooks/useUserInteractions';
import { Hostel } from '../../types/database.types';

interface StudentHomeScreenProps {
  onSelectHostel: (hostel: Hostel) => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  onSelectHostel,
}) => {
  const [filters, setFilters] = useState<HostelFilters>({
    area: 'All Pune',
    gender: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const { data: hostels, isLoading, refetch, isRefetching } = useHostels({
    ...filters,
    search: searchQuery,
  });

  const { data: favorites, toggleFavorite } = useFavorites();
  const favoriteIds = new Set(favorites?.map((f) => f.hostel_id));

  const handleSelectArea = (area: string) => {
    setFilters((prev) => ({ ...prev, area }));
  };

  const handleSelectCollege = (college: { name: string; area: string }) => {
    setSearchQuery(college.name);
  };

  return (
    <View style={styles.container}>
      <Header
        title="StayDirect"
        subtitle="Pune • Zero Brokerage"
        rightAction={
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons name="options" size={18} color={THEME.colors.white} />
          </TouchableOpacity>
        }
      />

      {/* Main Scrollable Content */}
      <FlatList
        data={hostels || []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[THEME.colors.primary]} />
        }
        ListHeaderComponent={
          <>
            {/* Search Input Box */}
            <View style={styles.searchSection}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={THEME.colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  placeholder="Search FC Road, Kothrud, MIT, COEP..."
                  placeholderTextColor={THEME.colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Zero Brokerage Trust Banner */}
            <View style={styles.trustBanner}>
              <View style={styles.trustIconWrap}>
                <Ionicons name="shield-checkmark" size={20} color={THEME.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trustTitle}>Find Your Home. No Brokerage.</Text>
                <Text style={styles.trustSubtitle}>
                  Connect directly with verified property owners across Pune. Save ₹10,000+ in broker fees.
                </Text>
              </View>
            </View>

            {/* Popular Areas Horizontal Scroller */}
            <Text style={styles.sectionHeading}>Explore Pune Neighborhoods</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.areasRow}
            >
              {PUNE_AREAS.map((area) => (
                <TouchableOpacity
                  key={area}
                  onPress={() => handleSelectArea(area)}
                  style={[
                    styles.areaPill,
                    filters.area === area && styles.areaPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.areaPillText,
                      filters.area === area && styles.areaPillTextActive,
                    ]}
                  >
                    {area}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Nearby Colleges Quick Chips */}
            <Text style={styles.sectionHeading}>Nearby Pune Colleges</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collegesRow}
            >
              {PUNE_COLLEGES.map((college) => (
                <TouchableOpacity
                  key={college.name}
                  onPress={() => handleSelectCollege(college)}
                  style={styles.collegeCard}
                >
                  <Ionicons name="school" size={14} color={THEME.colors.primary} />
                  <Text style={styles.collegeName} numberOfLines={1}>
                    {college.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* List Header Results Count */}
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultsTitle}>
                {filters.area === 'All Pune' ? 'Verified Hostels in Pune' : `Hostels in ${filters.area}`}
              </Text>
              <Text style={styles.resultsCount}>
                {hostels ? `${hostels.length} available` : 'Loading...'}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <HostelCard
            hostel={item}
            onPress={() => onSelectHostel(item)}
            isFavorited={favoriteIds.has(item.id)}
            onToggleFavorite={() =>
              toggleFavorite({
                hostelId: item.id,
                isFavorited: favoriteIds.has(item.id),
              })
            }
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={THEME.colors.primary} />
              <Text style={styles.loadingText}>Finding verified hostels in Pune...</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="home-outline" size={44} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>No Hostels Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your budget or selecting another Pune area like Kothrud, Hinjewadi, or Viman Nagar.
              </Text>
            </View>
          )
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        currentFilters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={() => setFilters({ area: 'All Pune', gender: 'all' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: 40,
  },
  searchSection: {
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 14,
    height: 48,
    ...THEME.shadows.soft,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textPrimary,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.secondary,
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.secondaryDark,
  },
  trustIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  trustSubtitle: {
    fontSize: 11,
    color: THEME.colors.primaryLight,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionHeading: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 6,
    marginBottom: 8,
  },
  areasRow: {
    gap: 8,
    marginBottom: 14,
  },
  areaPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  areaPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  areaPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  areaPillTextActive: {
    color: THEME.colors.white,
    fontWeight: '800',
  },
  collegesRow: {
    gap: 8,
    marginBottom: 16,
  },
  collegeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  collegeName: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  resultsCount: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
