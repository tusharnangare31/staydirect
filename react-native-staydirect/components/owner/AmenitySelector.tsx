import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';

export interface AmenityItem {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const AMENITIES_CATALOG: AmenityItem[] = [
  { id: 'wifi', name: 'High-Speed Wi-Fi', icon: 'wifi' },
  { id: 'meals', name: 'Home Meals Included', icon: 'restaurant' },
  { id: 'laundry', name: 'Washing Machine', icon: 'shirt' },
  { id: 'ac', name: 'Air Conditioning', icon: 'snow' },
  { id: 'security', name: '24/7 Security & CCTV', icon: 'shield-checkmark' },
  { id: 'power', name: 'Power Backup Inverter', icon: 'flash' },
  { id: 'parking', name: 'Bike & Car Parking', icon: 'car' },
  { id: 'study', name: 'Quiet Study Hall', icon: 'book' },
  { id: 'water', name: 'RO Filtered Water', icon: 'water' },
  { id: 'cleaning', name: 'Daily Housekeeping', icon: 'sparkles' },
  { id: 'geyser', name: 'Hot Water Geyser', icon: 'flame' },
  { id: 'gym', name: 'Fitness Gym', icon: 'barbell' },
];

export interface AmenitySelectorProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
}

export const AmenitySelector: React.FC<AmenitySelectorProps> = ({
  selectedAmenities,
  onChange,
}) => {
  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      onChange(selectedAmenities.filter((a) => a !== name));
    } else {
      onChange([...selectedAmenities, name]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
      <Text style={styles.helperText}>
        Select all services and amenities available for students staying in this hostel.
      </Text>

      <View style={styles.grid}>
        {AMENITIES_CATALOG.map((item) => {
          const isSelected = selectedAmenities.includes(item.name);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.tile, isSelected && styles.tileSelected]}
              onPress={() => toggleAmenity(item.name)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconCircle,
                  isSelected && styles.iconCircleSelected,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={isSelected ? THEME.colors.white : THEME.colors.primary}
                />
              </View>
              <Text
                style={[styles.tileText, isSelected && styles.tileTextSelected]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={10} color={THEME.colors.white} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    position: 'relative',
  },
  tileSelected: {
    backgroundColor: '#FAFDF9',
    borderColor: THEME.colors.primary,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconCircleSelected: {
    backgroundColor: THEME.colors.primary,
  },
  tileText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    lineHeight: 14,
  },
  tileTextSelected: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
