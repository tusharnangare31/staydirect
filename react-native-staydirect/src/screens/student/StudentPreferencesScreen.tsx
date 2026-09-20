import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, PUNE_AREAS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { useStudentPreferences, DEFAULT_STUDENT_PREFERENCES } from '../../hooks/useStudentPreferences';
import { StudentPreferences, FoodPreference } from '../../types/database.types';

interface StudentPreferencesScreenProps {
  onBack: () => void;
  onSaved?: () => void;
  isOnboarding?: boolean;
}

const BUDGET_RANGES = [
  { label: '₹5k - ₹8k', min: 5000, max: 8000 },
  { label: '₹8k - ₹12k', min: 8000, max: 12000 },
  { label: '₹12k - ₹16k', min: 12000, max: 16000 },
  { label: '₹16k+', min: 16000, max: 30000 },
];

const ROOM_TYPE_OPTIONS = [
  'Single Room (Private)',
  'Double Sharing',
  'Triple Sharing',
  'Four Sharing',
];

const GENDER_OPTIONS: { label: string; value: 'any' | 'boys' | 'girls' | 'co-ed' }[] = [
  { label: 'Any', value: 'any' },
  { label: 'Boys Only', value: 'boys' },
  { label: 'Girls Only', value: 'girls' },
  { label: 'Co-ed / Independent', value: 'co-ed' },
];

const FOOD_OPTIONS: { label: string; value: FoodPreference }[] = [
  { label: 'Any', value: 'any' },
  { label: 'Pure Veg Mess', value: 'veg' },
  { label: 'Non-Veg Allowed', value: 'non_veg' },
  { label: 'Food Included in Rent', value: 'food_included' },
  { label: 'Self Cooking', value: 'food_not_included' },
];

const AMENITIES_OPTIONS = [
  'High-speed Wi-Fi',
  '3 Times Daily Meals (Mess)',
  '24/7 CCTV & Security Guard',
  'Power Backup (Inverter)',
  'Automated Washing Machine',
  'Air Conditioning (AC)',
  'Dedicated Quiet Study Hall',
  'Biometric Access Control',
  'RO Drinking Water',
  'Daily Housekeeping',
];

export const StudentPreferencesScreen: React.FC<StudentPreferencesScreenProps> = ({
  onBack,
  onSaved,
  isOnboarding = false,
}) => {
  const { preferences, isLoading, savePreferences } = useStudentPreferences();

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState({ min: 6000, max: 14000 });
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [genderPref, setGenderPref] = useState<'any' | 'boys' | 'girls' | 'co-ed'>('any');
  const [foodPref, setFoodPref] = useState<FoodPreference>('any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);

  // Initialize state from existing preferences
  useEffect(() => {
    if (preferences) {
      setSelectedAreas(preferences.preferred_areas || []);
      setBudgetRange({
        min: Number(preferences.min_budget) || 6000,
        max: Number(preferences.max_budget) || 14000,
      });
      setSelectedRoomTypes(preferences.preferred_room_types || []);
      setGenderPref((preferences.gender_preference as any) || 'any');
      setFoodPref((preferences.food_preference as any) || 'any');
      setSelectedAmenities(preferences.required_amenities || []);
      setPersonalizationEnabled(preferences.personalization_enabled ?? true);
    }
  }, [preferences]);

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      if (selectedAreas.length >= 4) {
        Alert.alert('Maximum Areas', 'You can select up to 4 preferred Pune areas.');
        return;
      }
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const toggleRoomType = (rt: string) => {
    setSelectedRoomTypes(
      selectedRoomTypes.includes(rt)
        ? selectedRoomTypes.filter((item) => item !== rt)
        : [...selectedRoomTypes, rt]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(
      selectedAmenities.includes(amenity)
        ? selectedAmenities.filter((a) => a !== amenity)
        : [...selectedAmenities, amenity]
    );
  };

  const handleSave = async () => {
    try {
      await savePreferences.mutateAsync({
        preferred_areas: selectedAreas,
        min_budget: budgetRange.min,
        max_budget: budgetRange.max,
        preferred_room_types: selectedRoomTypes,
        gender_preference: genderPref,
        food_preference: foodPref,
        required_amenities: selectedAmenities,
        personalization_enabled: personalizationEnabled,
      });

      Alert.alert(
        'Preferences Saved',
        'Your recommendation engine and hostel discovery have been tailored to your preferences.',
        [
          {
            text: 'Explore Hostels',
            onPress: () => {
              onSaved?.();
              onBack();
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Notice', 'Preferences saved locally.');
      onSaved?.();
      onBack();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isOnboarding ? 'Tailor Your Hostel Search' : 'Search & Recommendation Preferences'}
        subtitle="Explainable matching • Pune students"
        showBack={!isOnboarding}
        onBack={onBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy & Transparency Banner */}
        <View style={styles.transparencyCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="sparkles" size={18} color="#0284C7" />
            <Text style={styles.transparencyTitle}>How StayDirect Uses Your Preferences</Text>
          </View>
          <Text style={styles.transparencyText}>
            We never share your preferences with external brokers or make sensitive assumptions. Recommendations are calculated strictly from your selections and platform verification data with plain-English badges.
          </Text>
        </View>

        {/* 1. Preferred Pune Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Preferred Pune Locations (Up to 4)</Text>
          <Text style={styles.sectionSubtitle}>Select hubs near your college or company</Text>
          <View style={styles.pillContainer}>
            {PUNE_AREAS.map((area) => {
              const isSelected = selectedAreas.includes(area);
              return (
                <TouchableOpacity
                  key={area}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => toggleArea(area)}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark' : 'location-outline'}
                    size={13}
                    color={isSelected ? '#FFF' : THEME.colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{area}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Monthly Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Monthly Budget Range</Text>
          <Text style={styles.sectionSubtitle}>Direct owner rent (zero brokerage)</Text>
          <View style={styles.pillContainer}>
            {BUDGET_RANGES.map((b, idx) => {
              const isSelected = budgetRange.min === b.min && budgetRange.max === b.max;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setBudgetRange({ min: b.min, max: b.max })}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{b.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Room & Sharing Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Room Sharing Preference</Text>
          <View style={styles.pillContainer}>
            {ROOM_TYPE_OPTIONS.map((rt) => {
              const isSelected = selectedRoomTypes.includes(rt);
              return (
                <TouchableOpacity
                  key={rt}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => toggleRoomType(rt)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{rt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Gender Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Hostel Gender Category</Text>
          <View style={styles.pillContainer}>
            {GENDER_OPTIONS.map((g) => {
              const isSelected = genderPref === g.value;
              return (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setGenderPref(g.value)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{g.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Food Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Food & Mess Preferences</Text>
          <View style={styles.pillContainer}>
            {FOOD_OPTIONS.map((f) => {
              const isSelected = foodPref === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setFoodPref(f.value)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 6. Required Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Required Amenities</Text>
          <View style={styles.pillContainer}>
            {AMENITIES_OPTIONS.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <TouchableOpacity
                  key={amenity}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => toggleAmenity(amenity)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{amenity}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 7. Personalization Toggle */}
        <View style={styles.personalizationRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.personalizationTitle}>Enable Personalized Recommendations</Text>
            <Text style={styles.personalizationDesc}>
              Turn off to view hostels sorted solely by platform verification and reviews without personalized matching.
            </Text>
          </View>
          <Switch
            value={personalizationEnabled}
            onValueChange={setPersonalizationEnabled}
            trackColor={{ false: '#CBD5E1', true: THEME.colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={savePreferences.isPending}
          >
            {savePreferences.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            )}
          </TouchableOpacity>

          {isOnboarding && (
            <TouchableOpacity style={styles.skipBtn} onPress={onBack}>
              <Text style={styles.skipBtnText}>Skip for Now</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 16,
  },
  transparencyCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  transparencyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },
  transparencyText: {
    fontSize: 12,
    color: '#0284C7',
    marginTop: 4,
    lineHeight: 16,
  },
  section: {
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  pillText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  personalizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
  },
  personalizationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  personalizationDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  actionContainer: {
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  skipBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
});
