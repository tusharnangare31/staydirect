import React, { useState, useEffect } from 'react';
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
import { THEME, PUNE_AREAS, PUNE_COLLEGES } from '../../../src/constants/theme';
import { AppInput } from '../../../components/ui/AppInput';
import { AppButton } from '../../../components/ui/AppButton';
import { RoomTypeForm, RoomEntry } from '../../../components/owner/RoomTypeForm';
import { AmenitySelector } from '../../../components/owner/AmenitySelector';
import { ImageUploader } from '../../../components/owner/ImageUploader';
import { ListingStatusBadge } from '../../../components/owner/ListingStatusBadge';
import { useAuth } from '../../../src/context/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Hostel, GenderPreference, HostelType } from '../../../src/types/database.types';

export interface EditHostelScreenProps {
  hostelId: string;
  onGoBack: () => void;
  onSaved: () => void;
}

export const EditHostelScreen: React.FC<EditHostelScreenProps> = ({
  hostelId,
  onGoBack,
  onSaved,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isLoadingHostel, setIsLoadingHostel] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hostel, setHostel] = useState<Hostel | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [area, setArea] = useState<string>('Kothrud');
  const [address, setAddress] = useState<string>('');
  const [nearbyCollege, setNearbyCollege] = useState<string>('');
  const [distanceToCollege, setDistanceToCollege] = useState<string>('');
  const [genderPreference, setGenderPreference] = useState<GenderPreference>('boys');
  const [hostelType, setHostelType] = useState<HostelType>('PG');
  const [isPublished, setIsPublished] = useState<boolean>(false);

  const [rooms, setRooms] = useState<RoomEntry[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Fetch Existing Listing Data
  useEffect(() => {
    async function loadHostelData() {
      try {
        setIsLoadingHostel(true);
        const { data, error } = await supabase
          .from('hostels')
          .select(`
            *,
            images:hostel_images(*),
            rooms:rooms(*),
            amenities:hostel_amenities(amenity:amenities(name))
          `)
          .eq('id', hostelId)
          .single();

        if (error) throw error;
        if (data) {
          setHostel(data);
          setName(data.name || '');
          setDescription(data.description || '');
          setArea(data.area || 'Kothrud');
          setAddress(data.address || '');
          setNearbyCollege(data.nearby_college || '');
          setDistanceToCollege(data.distance_to_college || '');
          setGenderPreference(data.gender_preference || 'boys');
          setHostelType(data.hostel_type || 'PG');
          setIsPublished(!!data.is_published);

          // Rooms
          if (data.rooms && data.rooms.length > 0) {
            setRooms(
              data.rooms.map((r: any) => ({
                id: r.id,
                room_type: r.room_type || r.sharing_type || 'Double Sharing',
                monthly_rent: r.monthly_rent || 8000,
                security_deposit: r.deposit || 0,
                total_beds: r.total_beds || r.total_capacity || 4,
                available_beds: r.available_beds || r.vacant_beds || 0,
                has_ac: !!r.has_ac,
                has_attached_washroom: !!r.has_attached_washroom,
              }))
            );
          }

          // Images
          if (data.images && data.images.length > 0) {
            setImages(data.images.map((img: any) => img.image_url || img.storage_path));
          }

          // Amenities
          if (data.amenities && data.amenities.length > 0) {
            const amenityNames = data.amenities
              .map((a: any) => a.amenity?.name || a.name)
              .filter(Boolean);
            setSelectedAmenities(amenityNames);
          }
        }
      } catch (err: any) {
        console.error('Failed to load hostel for editing:', err);
        Alert.alert('Error Loading Hostel', err.message);
      } finally {
        setIsLoadingHostel(false);
      }
    }

    if (hostelId) {
      loadHostelData();
    }
  }, [hostelId]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter the hostel name.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please provide the street address.');
      return;
    }
    if (rooms.length === 0) {
      Alert.alert('Room Required', 'Please configure at least one room type.');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Photo Required', 'Please attach at least one photo.');
      return;
    }

    try {
      setIsSaving(true);

      const minRent = rooms.reduce((min, r) => Math.min(min, r.monthly_rent), rooms[0].monthly_rent);
      const maxRent = rooms.reduce((max, r) => Math.max(max, r.monthly_rent), rooms[0].monthly_rent);
      const totalBedsCount = rooms.reduce((sum, r) => sum + r.total_beds, 0);
      const vacantBedsCount = rooms.reduce((sum, r) => sum + r.available_beds, 0);

      // 1. Update Hostel row
      const { error: hostelUpdateError } = await supabase
        .from('hostels')
        .update({
          name: name.trim(),
          description: description.trim(),
          area,
          address: address.trim(),
          nearby_college: nearbyCollege,
          distance_to_college: distanceToCollege,
          monthly_rent: minRent,
          monthly_rent_min: minRent,
          monthly_rent_max: maxRent,
          security_deposit: rooms[0]?.security_deposit || 0,
          gender_preference: genderPreference,
          hostel_type: hostelType,
          total_beds: totalBedsCount,
          available_beds: vacantBedsCount,
          is_available: vacantBedsCount > 0,
          is_published: isPublished,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hostelId)
        .eq('owner_id', user?.id);

      if (hostelUpdateError) throw hostelUpdateError;

      // 2. Replace rooms
      await supabase.from('rooms').delete().eq('hostel_id', hostelId);
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
      await supabase.from('rooms').insert(roomPayloads);

      // 3. Replace images
      await supabase.from('hostel_images').delete().eq('hostel_id', hostelId);
      const imagePayloads = images.map((url, idx) => ({
        hostel_id: hostelId,
        image_url: url,
        storage_path: url,
        is_cover: idx === 0,
        display_order: idx,
        sort_order: idx,
      }));
      await supabase.from('hostel_images').insert(imagePayloads);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['owner-hostels-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['owner-hostels'] });
      queryClient.invalidateQueries({ queryKey: ['hostels'] });

      Alert.alert('Saved Successfully', `Changes to "${name}" have been saved.`, [
        { text: 'OK', onPress: onSaved },
      ]);
    } catch (e: any) {
      console.error('Error updating hostel:', e);
      Alert.alert('Save Failed', e.message || 'Could not update listing.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingHostel) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Fetching property details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onGoBack}>
          <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Edit {hostel?.name || 'Property'}
          </Text>
          {hostel && (
            <ListingStatusBadge
              verificationStatus={hostel.verification_status}
              isPublished={hostel.is_published}
            />
          )}
        </View>
        <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={THEME.colors.primary} />
          ) : (
            <Text style={styles.saveHeaderBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status & Publication Control Card */}
        <View style={styles.statusBox}>
          <View style={styles.statusBoxTop}>
            <View>
              <Text style={styles.statusBoxTitle}>Publication Status</Text>
              <Text style={styles.statusBoxSub}>
                {isPublished
                  ? 'Active and visible to students searching in Pune'
                  : 'Unpublished / Hidden from student discovery'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.publishToggleBtn,
                isPublished ? styles.publishedBtn : styles.unpublishedBtn,
              ]}
              onPress={() => setIsPublished(!isPublished)}
            >
              <Ionicons
                name={isPublished ? 'checkmark-circle' : 'pause-circle'}
                size={16}
                color={THEME.colors.white}
              />
              <Text style={styles.publishToggleText}>
                {isPublished ? 'Published' : 'Unpublished'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Information Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Property Details</Text>

          <AppInput
            label="Hostel / PG Name"
            value={name}
            onChangeText={setName}
            placeholder="Property Name"
            required
          />

          {/* Property Type */}
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
          <Text style={styles.fieldLabel}>Student Gender</Text>
          <View style={styles.optionRow}>
            {(['boys', 'girls', 'co-ed'] as GenderPreference[]).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.typeChip, genderPreference === g && styles.typeChipActive]}
                onPress={() => setGenderPreference(g)}
              >
                <Text style={[styles.typeChipText, genderPreference === g && styles.typeChipTextActive]}>
                  {g === 'boys' ? 'Boys' : g === 'girls' ? 'Girls' : 'Co-ed'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Area Selector */}
          <Text style={styles.fieldLabel}>Area in Pune</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaScroll}>
            {PUNE_AREAS.filter((a) => a !== 'All Pune').map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.areaChip, area === a && styles.areaChipActive]}
                onPress={() => setArea(a)}
              >
                <Text style={[styles.areaChipText, area === a && styles.areaChipTextActive]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <AppInput
            label="Street Address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
            required
          />

          {/* Nearby College Landmark */}
          <Text style={styles.fieldLabel}>Nearest Landmark / College</Text>
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
            label="Distance to College"
            value={distanceToCollege}
            onChangeText={setDistanceToCollege}
            placeholder="e.g. 500 meters"
          />

          <AppInput
            label="Description & Rules"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            required
          />
        </View>

        {/* Room Types & Vacancies */}
        <View style={styles.sectionCard}>
          <RoomTypeForm rooms={rooms} onChange={setRooms} />
        </View>

        {/* Photos */}
        <View style={styles.sectionCard}>
          <ImageUploader
            images={images}
            onChange={setImages}
            hostelId={hostelId}
            minImages={1}
            maxImages={8}
          />
        </View>

        {/* Amenities */}
        <View style={styles.sectionCard}>
          <AmenitySelector
            selectedAmenities={selectedAmenities}
            onChange={setSelectedAmenities}
          />
        </View>

        {/* Big Save Button */}
        <AppButton
          title="Save Property Changes"
          onPress={handleSave}
          size="lg"
          variant="primary"
          isLoading={isSaving}
          leftIcon="save-outline"
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditHostelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  saveHeaderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: THEME.colors.secondary,
    borderRadius: 8,
  },
  saveHeaderBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  statusBox: {
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    ...THEME.shadows.soft,
  },
  statusBoxTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  statusBoxSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    maxWidth: 200,
  },
  publishToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  publishedBtn: {
    backgroundColor: THEME.colors.primary,
  },
  unpublishedBtn: {
    backgroundColor: '#B45309',
  },
  publishToggleText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    ...THEME.shadows.soft,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typeChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
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
    marginBottom: 14,
  },
  areaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 6,
  },
  areaChipActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.primary,
  },
  areaChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  areaChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
});
