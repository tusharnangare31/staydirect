import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, formatIndianRupees } from '../../constants/theme';
import { AdvancedSearchFilters } from '../../types/database.types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: AdvancedSearchFilters;
  onApply: (filters: AdvancedSearchFilters) => void;
  onReset: () => void;
  totalResultsCount?: number;
}

const BUDGET_PRESETS = [
  { label: 'Any Budget', min: undefined, max: undefined },
  { label: 'Under ₹7,000', min: 0, max: 7000 },
  { label: '₹7k - ₹10k', min: 7000, max: 10000 },
  { label: '₹10k - ₹14k', min: 10000, max: 14000 },
  { label: '₹14k - ₹20k', min: 14000, max: 20000 },
  { label: '₹20k+', min: 20000, max: 50000 },
];

const ROOM_TYPES = [
  'Single Room',
  'Double Sharing',
  'Triple Sharing',
  'Four Sharing',
  'Private Room',
  'Shared Room',
];

const GENDERS: ('All' | 'Boys' | 'Girls' | 'Co-ed')[] = ['All', 'Boys', 'Girls', 'Co-ed'];

const FOOD_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Pure Veg', value: 'veg' },
  { label: 'Non-Veg Allowed', value: 'non_veg' },
  { label: 'Food Included (Mess)', value: 'food_included' },
  { label: 'Self Cooking / No Mess', value: 'food_not_included' },
];

const FURNISHED_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Fully Furnished', value: 'furnished' },
  { label: 'Semi-Furnished', value: 'semi-furnished' },
  { label: 'Unfurnished', value: 'unfurnished' },
];

const AMENITY_OPTIONS = [
  'Wi-Fi',
  'Laundry',
  'Parking',
  'Gym',
  'Study area',
  'CCTV',
  'Security guard',
  'Power backup',
  'Housekeeping',
  'Hot water',
  'Air conditioning',
  'Kitchen access',
];

const RATING_OPTIONS = [
  { label: 'Any Rating', value: 0 },
  { label: '3.5+ ★', value: 3.5 },
  { label: '4.0+ ★', value: 4.0 },
  { label: '4.5+ ★', value: 4.5 },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
  totalResultsCount,
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedSearchFilters>(filters);

  // Sync with incoming filters when modal opens
  React.useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const toggleRoomType = (rt: string) => {
    const current = localFilters.roomTypes || [];
    const updated = current.includes(rt) ? current.filter((item) => item !== rt) : [...current, rt];
    setLocalFilters({ ...localFilters, roomTypes: updated });
  };

  const toggleAmenity = (amenity: string) => {
    const current = localFilters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((item) => item !== amenity)
      : [...current, amenity];
    setLocalFilters({ ...localFilters, amenities: updated });
  };

  // Calculate active filter count
  const activeCount = React.useMemo(() => {
    let count = 0;
    if (localFilters.minRent || localFilters.maxRent) count++;
    if (localFilters.gender && localFilters.gender !== 'All') count++;
    if (localFilters.roomTypes && localFilters.roomTypes.length > 0) count += localFilters.roomTypes.length;
    if (localFilters.foodPreference) count++;
    if (localFilters.furnishedStatus) count++;
    if (localFilters.amenities && localFilters.amenities.length > 0) count += localFilters.amenities.length;
    if (localFilters.minRating) count++;
    if (localFilters.verifiedHostelOnly) count++;
    if (localFilters.verifiedOwnerOnly) count++;
    if (localFilters.completedStayReviewsOnly) count++;
    if (localFilters.fastResponseOnly) count++;
    return count;
  }, [localFilters]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: AdvancedSearchFilters = {
      query: localFilters.query,
      area: localFilters.area,
      sortBy: localFilters.sortBy,
    };
    setLocalFilters(emptyFilters);
    onReset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>Filter Hostels</Text>
            {activeCount > 0 && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{activeCount} active</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalVerticalScrollIndicator={false}>
          {/* Zero Brokerage Assurance Banner */}
          <View style={styles.brokerageAssurance}>
            <Ionicons name="shield-checkmark" size={18} color="#059669" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.brokerageAssuranceTitle}>₹0 Brokerage & Direct Deals</Text>
              <Text style={styles.brokerageAssuranceDesc}>
                StayDirect never charges student commission or hidden platform fees.
              </Text>
            </View>
          </View>

          {/* 1. Monthly Budget */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Rent Budget (Pune)</Text>
            <Text style={styles.sectionSubtitle}>Select student-friendly rent tiers</Text>
            <View style={styles.pillWrap}>
              {BUDGET_PRESETS.map((preset, idx) => {
                const isSelected =
                  localFilters.minRent === preset.min && localFilters.maxRent === preset.max;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        minRent: preset.min,
                        maxRent: preset.max,
                      })
                    }
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. Gender Preference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gender Preference</Text>
            <View style={styles.pillWrap}>
              {GENDERS.map((g) => {
                const isSelected = (localFilters.gender || 'All') === g;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setLocalFilters({ ...localFilters, gender: g })}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {g === 'All' ? 'All Hostels' : `${g} Hostel`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. Room & Sharing Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room Types & Sharing</Text>
            <Text style={styles.sectionSubtitle}>Select one or multiple options</Text>
            <View style={styles.pillWrap}>
              {ROOM_TYPES.map((rt) => {
                const isSelected = (localFilters.roomTypes || []).includes(rt);
                return (
                  <TouchableOpacity
                    key={rt}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => toggleRoomType(rt)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'bed-outline'}
                      size={14}
                      color={isSelected ? '#FFF' : THEME.colors.textSecondary}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {rt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Food & Mess Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food & Mess Facility</Text>
            <View style={styles.pillWrap}>
              {FOOD_OPTIONS.map((opt) => {
                const isSelected = (localFilters.foodPreference || '') === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setLocalFilters({ ...localFilters, foodPreference: opt.value })}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Furnished Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Furnishing Status</Text>
            <View style={styles.pillWrap}>
              {FURNISHED_OPTIONS.map((opt) => {
                const isSelected = (localFilters.furnishedStatus || '') === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setLocalFilters({ ...localFilters, furnishedStatus: opt.value })}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 6. Facilities & Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
            <Text style={styles.sectionSubtitle}>Must-have hostel amenities</Text>
            <View style={styles.pillWrap}>
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = (localFilters.amenities || []).includes(amenity);
                return (
                  <TouchableOpacity
                    key={amenity}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'add-outline'}
                      size={14}
                      color={isSelected ? '#FFF' : THEME.colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 7. Trust & Safety Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trust, Ratings & Verification</Text>
            <Text style={styles.sectionSubtitle}>Verified properties and authentic stays</Text>

            {/* Minimum Rating */}
            <View style={[styles.pillWrap, { marginBottom: 12 }]}>
              {RATING_OPTIONS.map((r) => {
                const isSelected = (localFilters.minRating || 0) === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setLocalFilters({ ...localFilters, minRating: r.value })}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Trust Toggles */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() =>
                setLocalFilters({
                  ...localFilters,
                  verifiedHostelOnly: !localFilters.verifiedHostelOnly,
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Verified Listings Only</Text>
                <Text style={styles.toggleDesc}>Hostels physically inspected by StayDirect team</Text>
              </View>
              <Ionicons
                name={localFilters.verifiedHostelOnly ? 'checkbox' : 'square-outline'}
                size={22}
                color={localFilters.verifiedHostelOnly ? THEME.colors.primary : THEME.colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() =>
                setLocalFilters({
                  ...localFilters,
                  completedStayReviewsOnly: !localFilters.completedStayReviewsOnly,
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Completed-Stay Reviews Only</Text>
                <Text style={styles.toggleDesc}>Only ratings written by confirmed student residents</Text>
              </View>
              <Ionicons
                name={localFilters.completedStayReviewsOnly ? 'checkbox' : 'square-outline'}
                size={22}
                color={localFilters.completedStayReviewsOnly ? THEME.colors.primary : THEME.colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() =>
                setLocalFilters({
                  ...localFilters,
                  fastResponseOnly: !localFilters.fastResponseOnly,
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Fast Owner Response (&lt; 1 hr)</Text>
                <Text style={styles.toggleDesc}>Owners who respond actively to chat inquiries</Text>
              </View>
              <Ionicons
                name={localFilters.fastResponseOnly ? 'checkbox' : 'square-outline'}
                size={22}
                color={localFilters.fastResponseOnly ? THEME.colors.primary : THEME.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          <View style={{ height: 90 }} />
        </ScrollView>

        {/* Footer Apply Bar */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>
              Show Hostels {totalResultsCount !== undefined ? `(${totalResultsCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  activeBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  resetBtn: {
    padding: 4,
  },
  resetText: {
    fontSize: 14,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  brokerageAssurance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    marginBottom: 10,
  },
  brokerageAssuranceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  brokerageAssuranceDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  section: {
    marginTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  pillText: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  toggleDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5,
  },
  applyBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
