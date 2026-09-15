import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, PUNE_AREAS, PUNE_COLLEGES, formatIndianRupees } from '../../src/constants/theme';
import { FormStepIndicator } from '../../components/ui/FormStepIndicator';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { RoomTypeForm, RoomEntry } from '../../components/owner/RoomTypeForm';
import { AmenitySelector } from '../../components/owner/AmenitySelector';
import { ImageUploader } from '../../components/owner/ImageUploader';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { GenderPreference, HostelType } from '../../src/types/database.types';

// Area coordinates presets in Pune
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Hinjewadi: { lat: 18.5913, lng: 73.7389 },
  Wakad: { lat: 18.5987, lng: 73.7663 },
  Kothrud: { lat: 18.5074, lng: 73.8077 },
  'Viman Nagar': { lat: 18.5679, lng: 73.9143 },
  Baner: { lat: 18.5590, lng: 73.7868 },
  Kharadi: { lat: 18.5514, lng: 73.9348 },
  'FC Road': { lat: 18.5255, lng: 73.8415 },
  Shivajinagar: { lat: 18.5314, lng: 73.8446 },
  Katraj: { lat: 18.4575, lng: 73.8677 },
};

export interface AddHostelScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddHostelScreen: React.FC<AddHostelScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Wizard Step (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State: Step 1 Basic Info
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [area, setArea] = useState<string>('Kothrud');
  const [address, setAddress] = useState<string>('');
  const [city] = useState<string>('Pune');
  const [genderPreference, setGenderPreference] = useState<GenderPreference>('boys');
  const [hostelType, setHostelType] = useState<HostelType>('PG');
  const [nearbyCollege, setNearbyCollege] = useState<string>('MIT World Peace University');
  const [distanceToCollege, setDistanceToCollege] = useState<string>('500 meters');

  // Form State: Step 2 Rooms & Rent
  const [rooms, setRooms] = useState<RoomEntry[]>([
    {
      room_type: 'Double Sharing',
      monthly_rent: 8500,
      security_deposit: 15000,
      total_beds: 6,
      available_beds: 2,
      has_ac: false,
      has_attached_washroom: true,
    },
  ]);

  // Form State: Step 3 Photos & Amenities
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80',
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'High-Speed Wi-Fi',
    'Home Meals Included',
    'Washing Machine',
    '24/7 Security & CCTV',
    'RO Filtered Water',
    'Hot Water Geyser',
  ]);

  // Form State: Step 4 Location & Coordinates
  const defaultCoords = AREA_COORDINATES[area] || { lat: 18.5204, lng: 73.8567 };
  const [latitude, setLatitude] = useState<string>(String(defaultCoords.lat));
  const [longitude, setLongitude] = useState<string>(String(defaultCoords.lng));

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Hostel / PG name is required';
    if (!address.trim()) errs.address = 'Full street address is required';
    if (!description.trim() || description.length < 20) {
      errs.description = 'Please provide at least 20 characters describing the property';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!rooms || rooms.length === 0) {
      errs.rooms = 'Please add at least one room configuration';
      Alert.alert('Room Required', 'Please configure at least one room type with rent.');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (images.length === 0) {
      errs.images = 'At least 1 photo is required';
      Alert.alert('Photo Required', 'Please upload at least one photo of your hostel.');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Step Advancement
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    if (currentStep < 4) {
      // Sync coordinates if area changed
      if (currentStep === 1 && AREA_COORDINATES[area]) {
        setLatitude(String(AREA_COORDINATES[area].lat));
        setLongitude(String(AREA_COORDINATES[area].lng));
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onCancel();
    }
  };

  // Final Submission to Supabase
  const handleSaveListing = async (submitForVerification = true) => {
    try {
      if (!user?.id) {
        Alert.alert('Session Error', 'Please log in again to add your hostel.');
        return;
      }

      setIsSubmitting(true);

      // Aggregate pricing & beds
      const minRent = rooms.reduce((min, r) => Math.min(min, r.monthly_rent), rooms[0]?.monthly_rent || 8000);
      const maxRent = rooms.reduce((max, r) => Math.max(max, r.monthly_rent), rooms[0]?.monthly_rent || 8000);
      const totalBedsCount = rooms.reduce((sum, r) => sum + (r.total_beds || 1), 0);
      const vacantBedsCount = rooms.reduce((sum, r) => sum + (r.available_beds || 0), 0);
      const securityDeposit = rooms[0]?.security_deposit || 0;

      // 1. Insert Hostel row
      const { data: hostelData, error: hostelError } = await supabase
        .from('hostels')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          description: description.trim(),
          area,
          city: 'Pune',
          address: address.trim(),
          nearby_college: nearbyCollege,
          distance_to_college: distanceToCollege,
          latitude: parseFloat(latitude) || 18.5204,
          longitude: parseFloat(longitude) || 73.8567,
          monthly_rent: minRent,
          monthly_rent_min: minRent,
          monthly_rent_max: maxRent,
          security_deposit: securityDeposit,
          gender_preference: genderPreference,
          hostel_type: hostelType,
          total_beds: totalBedsCount,
          available_beds: vacantBedsCount,
          is_available: vacantBedsCount > 0,
          is_published: false, // published requires verification or manual toggle after approval
          verification_status: 'pending',
        })
        .select()
        .single();

      if (hostelError) {
        console.error('Failed to create hostel:', hostelError);
        throw hostelError;
      }

      const hostelId = hostelData.id;

      // 2. Insert Rooms
      if (rooms.length > 0) {
        const roomPayloads = rooms.map((r) => ({
          hostel_id: hostelId,
          room_type: r.room_type,
          sharing_type: r.room_type,
          monthly_rent: r.monthly_rent,
          deposit: r.security_deposit || 0,
          total_capacity: r.total_beds,
          total_beds: r.total_beds,
          vacant_beds: r.available_beds,
          available_beds: r.available_beds,
          has_ac: !!r.has_ac,
          has_attached_washroom: !!r.has_attached_washroom,
        }));

        const { error: roomsError } = await supabase.from('rooms').insert(roomPayloads);
        if (roomsError) {
          console.warn('Rooms insertion note:', roomsError.message);
        }
      }

      // 3. Insert Images
      if (images.length > 0) {
        const imagePayloads = images.map((imgUrl, idx) => ({
          hostel_id: hostelId,
          image_url: imgUrl,
          storage_path: imgUrl,
          is_cover: idx === 0,
          display_order: idx,
          sort_order: idx,
        }));

        const { error: imgError } = await supabase.from('hostel_images').insert(imagePayloads);
        if (imgError) {
          console.warn('Images insertion note:', imgError.message);
        }
      }

      // Invalidate queries so owner dashboard updates immediately
      queryClient.invalidateQueries({ queryKey: ['owner-hostels-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['owner-hostels'] });
      queryClient.invalidateQueries({ queryKey: ['hostels'] });

      Alert.alert(
        submitForVerification ? 'Listing Submitted!' : 'Draft Saved!',
        submitForVerification
          ? `Your listing for "${name}" in ${area} was successfully submitted for StayDirect verification review.`
          : `Your draft has been saved. You can complete and submit it whenever you are ready.`,
        [{ text: 'Great', onPress: onSuccess }]
      );
    } catch (e: any) {
      console.error('Listing creation error:', e);
      Alert.alert('Error Saving Listing', e.message || 'Something went wrong while saving your property.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Add Hostel / PG Listing</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 4-Step Progress Indicator */}
      <FormStepIndicator currentStep={currentStep} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= STEP 1: BASIC INFORMATION ================= */}
        {currentStep === 1 && (
          <View style={styles.stepBox}>
            <Text style={styles.stepHeading}>Step 1: Basic Information</Text>
            <Text style={styles.stepDesc}>
              Provide property name, location in Pune, and student preferences.
            </Text>

            <AppInput
              label="Hostel / PG Name"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="e.g. Shanti Niwas Luxury PG"
              error={errors.name}
              required
            />

            {/* Property Type Selector */}
            <Text style={styles.fieldLabel}>Property Type</Text>
            <View style={styles.optionRow}>
              {(['PG', 'hostel', 'co-living'] as HostelType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, hostelType === type && styles.typeChipActive]}
                  onPress={() => setHostelType(type)}
                >
                  <Text style={[styles.typeChipText, hostelType === type && styles.typeChipTextActive]}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Gender Preference */}
            <Text style={styles.fieldLabel}>Student Preference</Text>
            <View style={styles.optionRow}>
              {(['boys', 'girls', 'co-ed'] as GenderPreference[]).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.typeChip, genderPreference === g && styles.typeChipActive]}
                  onPress={() => setGenderPreference(g)}
                >
                  <Ionicons
                    name={g === 'boys' ? 'man' : g === 'girls' ? 'woman' : 'people'}
                    size={14}
                    color={genderPreference === g ? THEME.colors.white : THEME.colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.typeChipText, genderPreference === g && styles.typeChipTextActive]}>
                    {g === 'boys' ? 'Boys Only' : g === 'girls' ? 'Girls Only' : 'Co-Living / Any'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pune Area Selector */}
            <Text style={styles.fieldLabel}>Neighborhood / Area in Pune</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaScroll}>
              {PUNE_AREAS.filter((a) => a !== 'All Pune').map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.areaChip, area === a && styles.areaChipActive]}
                  onPress={() => {
                    setArea(a);
                    if (AREA_COORDINATES[a]) {
                      setLatitude(String(AREA_COORDINATES[a].lat));
                      setLongitude(String(AREA_COORDINATES[a].lng));
                    }
                  }}
                >
                  <Text style={[styles.areaChipText, area === a && styles.areaChipTextActive]}>
                    {a}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <AppInput
              label="Full Address"
              value={address}
              onChangeText={(val) => {
                setAddress(val);
                if (errors.address) setErrors({ ...errors, address: '' });
              }}
              placeholder="e.g. Lane 3, Dahanukar Colony, Near Kothrud Bus Stand"
              error={errors.address}
              multiline
              numberOfLines={3}
              required
            />

            {/* Nearby College Landmark */}
            <Text style={styles.fieldLabel}>Nearest Educational Institution</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaScroll}>
              {PUNE_COLLEGES.map((c) => (
                <TouchableOpacity
                  key={c.name}
                  style={[styles.areaChip, nearbyCollege === c.name && styles.areaChipActive]}
                  onPress={() => setNearbyCollege(c.name)}
                >
                  <Text style={[styles.areaChipText, nearbyCollege === c.name && styles.areaChipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <AppInput
              label="Distance to Landmark"
              value={distanceToCollege}
              onChangeText={setDistanceToCollege}
              placeholder="e.g. 500 meters / 5 min walk"
            />

            <AppInput
              label="Description & House Rules"
              value={description}
              onChangeText={(val) => {
                setDescription(val);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="Mention curfew timings, food options, visiting rules, cleanliness and community vibe..."
              multiline
              numberOfLines={4}
              error={errors.description}
              helperText="Minimum 20 characters describing your property."
              required
            />
          </View>
        )}

        {/* ================= STEP 2: ROOMS & RENT ================= */}
        {currentStep === 2 && (
          <View style={styles.stepBox}>
            <Text style={styles.stepHeading}>Step 2: Rooms & Pricing</Text>
            <Text style={styles.stepDesc}>
              Configure different sharing options, bed capacities, and vacancy numbers.
            </Text>

            <RoomTypeForm rooms={rooms} onChange={setRooms} />
          </View>
        )}

        {/* ================= STEP 3: PHOTOS & AMENITIES ================= */}
        {currentStep === 3 && (
          <View style={styles.stepBox}>
            <Text style={styles.stepHeading}>Step 3: Photos & Amenities</Text>
            <Text style={styles.stepDesc}>
              High quality photos significantly increase student visits. Select amenities provided.
            </Text>

            <ImageUploader
              images={images}
              onChange={setImages}
              hostelId="draft-hostel"
              minImages={1}
              maxImages={8}
            />

            <AmenitySelector
              selectedAmenities={selectedAmenities}
              onChange={setSelectedAmenities}
            />
          </View>
        )}

        {/* ================= STEP 4: LOCATION & REVIEW ================= */}
        {currentStep === 4 && (
          <View style={styles.stepBox}>
            <Text style={styles.stepHeading}>Step 4: Location & Review</Text>
            <Text style={styles.stepDesc}>
              Verify your coordinates and property summary before publishing.
            </Text>

            {/* GPS Location Coordinates Card */}
            <View style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <Ionicons name="map" size={18} color={THEME.colors.primary} />
                <Text style={styles.reviewCardTitle}>Geographical Coordinates (Pune)</Text>
              </View>

              <View style={styles.coordInputsRow}>
                <View style={styles.flexHalf}>
                  <AppInput
                    label="Latitude"
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numeric"
                    leftIcon="navigate"
                  />
                </View>
                <View style={styles.flexHalf}>
                  <AppInput
                    label="Longitude"
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numeric"
                    leftIcon="navigate"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.gpsAutoBtn}
                onPress={() => {
                  if (AREA_COORDINATES[area]) {
                    setLatitude(String(AREA_COORDINATES[area].lat));
                    setLongitude(String(AREA_COORDINATES[area].lng));
                    Alert.alert('Coordinates Synced', `Set to centroid of ${area}, Pune.`);
                  }
                }}
              >
                <Ionicons name="locate" size={14} color={THEME.colors.primary} />
                <Text style={styles.gpsAutoBtnText}>Auto-calibrate to {area} Center</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Review Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Listing Summary Preview</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Property Name:</Text>
                <Text style={styles.summaryVal}>{name || 'Untitled Hostel'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Category:</Text>
                <Text style={styles.summaryVal}>
                  {hostelType.toUpperCase()} ({genderPreference})
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Area & City:</Text>
                <Text style={styles.summaryVal}>
                  {area}, {city}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Address:</Text>
                <Text style={styles.summaryVal} numberOfLines={2}>
                  {address}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Starting Rent:</Text>
                <Text style={[styles.summaryVal, styles.boldGreen]}>
                  {formatIndianRupees(rooms[0]?.monthly_rent || 8000)}/mo
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total / Vacant Beds:</Text>
                <Text style={styles.summaryVal}>
                  {rooms.reduce((s, r) => s + r.available_beds, 0)} available /{' '}
                  {rooms.reduce((s, r) => s + r.total_beds, 0)} total
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Photos Attached:</Text>
                <Text style={styles.summaryVal}>{images.length} photos ready</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amenities Selected:</Text>
                <Text style={styles.summaryVal}>{selectedAmenities.length} items</Text>
              </View>
            </View>

            {/* Zero Brokerage Promise Banner */}
            <View style={styles.promiseBanner}>
              <Ionicons name="shield-checkmark" size={20} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.promiseTitle}>StayDirect Verified Promise</Text>
                <Text style={styles.promiseText}>
                  Zero brokerage fees will ever be charged to students or property owners. Direct bookings and inquiries only.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Floating Navigation Bar */}
      <View style={styles.bottomNav}>
        {currentStep > 1 && (
          <AppButton
            title="Back"
            onPress={handleBack}
            variant="outline"
            size="md"
            style={styles.backButton}
            fullWidth={false}
          />
        )}

        {currentStep < 4 ? (
          <AppButton
            title="Next Step"
            onPress={handleNext}
            variant="primary"
            size="md"
            rightIcon="arrow-forward"
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.finalActionsRow}>
            <AppButton
              title="Save Draft"
              onPress={() => handleSaveListing(false)}
              variant="secondary"
              size="md"
              disabled={isSubmitting}
              style={{ flex: 1 }}
            />
            <AppButton
              title="Submit Listing"
              onPress={() => handleSaveListing(true)}
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              rightIcon="checkmark-circle"
              style={{ flex: 1 }}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddHostelScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  stepBox: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.soft,
  },
  stepHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.primary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
  },
  typeChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryDark,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  typeChipTextActive: {
    color: THEME.colors.white,
  },
  areaScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  areaChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 8,
  },
  areaChipActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.primary,
  },
  areaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  areaChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  reviewCard: {
    backgroundColor: '#FAFDF9',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    marginBottom: 16,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  reviewCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  coordInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexHalf: {
    flex: 1,
  },
  gpsAutoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  gpsAutoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  summaryCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  summaryLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    textAlign: 'right',
    maxWidth: '55%',
  },
  boldGreen: {
    color: THEME.colors.primary,
    fontWeight: '900',
  },
  promiseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F7F3',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBE5D6',
  },
  promiseTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  promiseText: {
    fontSize: 10,
    color: THEME.colors.primaryLight,
    lineHeight: 14,
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
    gap: 10,
  },
  backButton: {
    minWidth: 80,
  },
  finalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
});
