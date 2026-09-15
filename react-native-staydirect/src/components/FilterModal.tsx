import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, PUNE_AREAS } from '../constants/theme';
import { HostelFilters } from '../hooks/useHostels';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: HostelFilters;
  onApplyFilters: (filters: HostelFilters) => void;
  onResetFilters: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  currentFilters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [selectedArea, setSelectedArea] = useState(currentFilters.area || 'All Pune');
  const [selectedGender, setSelectedGender] = useState<'all' | 'boys' | 'girls' | 'co-ed'>(
    currentFilters.gender || 'all'
  );
  const [maxRent, setMaxRent] = useState<number | undefined>(currentFilters.maxRent);
  const [sortBy, setSortBy] = useState<HostelFilters['sortBy']>(
    currentFilters.sortBy || 'newest'
  );

  const handleApply = () => {
    onApplyFilters({
      area: selectedArea,
      gender: selectedGender,
      maxRent,
      sortBy,
      search: currentFilters.search,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedArea('All Pune');
    setSelectedGender('all');
    setMaxRent(undefined);
    setSortBy('newest');
    onResetFilters();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Modal Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter Hostels</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Gender Preference */}
            <Text style={styles.sectionTitle}>Hostel Type / Gender</Text>
            <View style={styles.chipsRow}>
              {[
                { label: 'All Hostels', value: 'all' },
                { label: 'Boys PG', value: 'boys' },
                { label: 'Girls PG', value: 'girls' },
                { label: 'Co-ed Living', value: 'co-ed' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setSelectedGender(opt.value as any)}
                  style={[
                    styles.chip,
                    selectedGender === opt.value && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedGender === opt.value && styles.chipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Popular Pune Areas */}
            <Text style={styles.sectionTitle}>Pune Neighborhoods</Text>
            <View style={styles.chipsRow}>
              {PUNE_AREAS.map((area) => (
                <TouchableOpacity
                  key={area}
                  onPress={() => setSelectedArea(area)}
                  style={[
                    styles.chip,
                    selectedArea === area && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedArea === area && styles.chipTextActive,
                    ]}
                  >
                    {area}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Max Budget */}
            <Text style={styles.sectionTitle}>Max Monthly Budget</Text>
            <View style={styles.chipsRow}>
              {[
                { label: 'Any Budget', value: undefined },
                { label: 'Up to ₹8,000', value: 8000 },
                { label: 'Up to ₹10,000', value: 10000 },
                { label: 'Up to ₹12,000', value: 12000 },
                { label: 'Up to ₹15,000', value: 15000 },
              ].map((b) => (
                <TouchableOpacity
                  key={b.label}
                  onPress={() => setMaxRent(b.value)}
                  style={[
                    styles.chip,
                    maxRent === b.value && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      maxRent === b.value && styles.chipTextActive,
                    ]}
                  >
                    {b.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Options */}
            <Text style={styles.sectionTitle}>Sort Results</Text>
            <View style={styles.chipsRow}>
              {[
                { label: 'Newest Listed', value: 'newest' },
                { label: 'Highest Rated', value: 'rating' },
                { label: 'Price: Low to High', value: 'price_asc' },
                { label: 'Price: High to Low', value: 'price_desc' },
              ].map((s) => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setSortBy(s.value as any)}
                  style={[
                    styles.chip,
                    sortBy === s.value && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      sortBy === s.value && styles.chipTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset All</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 28, 45, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: THEME.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: THEME.colors.white,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceVariant,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.white,
  },
});
