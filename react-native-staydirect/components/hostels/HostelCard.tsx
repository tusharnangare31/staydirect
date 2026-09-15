import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, formatIndianRupees } from '../../src/constants/theme';
import { Hostel } from '../../src/types/database.types';
import { useFavorites } from '../../src/hooks/useFavorites';

interface HostelCardProps {
  hostel: Hostel;
  onPress: () => void;
  userCoords?: { latitude: number; longitude: number } | null;
}

// Haversine distance calculator in km
function calculateDistance(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): string | null {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)} km`;
}

export const HostelCard: React.FC<HostelCardProps> = ({
  hostel,
  onPress,
  userCoords,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(hostel.id);

  // First image with fallback
  const firstImage =
    hostel.images && hostel.images.length > 0
      ? hostel.images[0].storage_path
      : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80';

  // Room types summary
  const roomTypes =
    hostel.rooms && hostel.rooms.length > 0
      ? hostel.rooms.map((r) => r.room_type).join(' • ')
      : 'Single & Shared Beds';

  // Available beds count
  const totalAvailableBeds =
    hostel.rooms?.reduce((acc, r) => acc + (r.available_beds || 0), 0) ?? 0;

  // Calculated distance (default reference to Pune University/COEP center if not provided)
  const defaultPuneCenter = { latitude: 18.5293, longitude: 73.8566 };
  const targetCoords = userCoords || defaultPuneCenter;
  const distance = calculateDistance(
    targetCoords.latitude,
    targetCoords.longitude,
    hostel.latitude,
    hostel.longitude
  );

  const handleHeartPress = (e: any) => {
    e.stopPropagation?.();
    toggleFavorite(hostel.id);
  };

  const isVerified = hostel.verification_status === 'verified';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={onPress}
    >
      {/* Image container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: firstImage }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Zero Brokerage Badge */}
        <View style={styles.brokerageBadge}>
          <Text style={styles.brokerageText}>₹0 BROKERAGE</Text>
        </View>

        {/* Gender Badge */}
        {hostel.gender_preference && (
          <View style={styles.genderBadge}>
            <Text style={styles.genderText}>
              {hostel.gender_preference.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={[styles.favoriteBtn, saved && styles.favoriteBtnActive]}
          onPress={handleHeartPress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={19}
            color={saved ? '#E53E3E' : THEME.colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Distance Pill if coords available */}
        {distance && (
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={11} color={THEME.colors.white} />
            <Text style={styles.distanceText}>{distance} away</Text>
          </View>
        )}
      </View>

      {/* Details body */}
      <View style={styles.body}>
        {/* Verification & Location row */}
        <View style={styles.metaRow}>
          <View style={styles.locationGroup}>
            <Ionicons name="location-sharp" size={14} color={THEME.colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {hostel.area}, {hostel.city || 'Pune'}
            </Text>
          </View>

          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color={THEME.colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Hostel Name */}
        <Text style={styles.name} numberOfLines={1}>
          {hostel.name}
        </Text>

        {/* Room types */}
        <View style={styles.roomTypeRow}>
          <Ionicons name="bed-outline" size={13} color={THEME.colors.textSecondary} />
          <Text style={styles.roomTypeText} numberOfLines={1}>
            {roomTypes}
          </Text>
        </View>

        {/* Price & Vacancy Bottom Strip */}
        <View style={styles.bottomStrip}>
          <View>
            <Text style={styles.rentLabel}>Starting from</Text>
            <View style={styles.priceRow}>
              <Text style={styles.rentAmount}>
                {formatIndianRupees(hostel.monthly_rent)}
              </Text>
              <Text style={styles.rentPeriod}>/month</Text>
            </View>
          </View>

          {totalAvailableBeds > 0 ? (
            <View style={styles.vacancyBadge}>
              <Text style={styles.vacancyText}>{totalAvailableBeds} beds vacant</Text>
            </View>
          ) : (
            <View style={[styles.vacancyBadge, styles.vacancyFullBadge]}>
              <Text style={[styles.vacancyText, styles.vacancyFullText]}>Filling fast</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.small,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: THEME.colors.borderLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  brokerageBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 2,
    ...THEME.shadows.small,
  },
  brokerageText: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.white,
    letterSpacing: 0.5,
  },
  genderBadge: {
    position: 'absolute',
    top: 10,
    left: 112,
    backgroundColor: 'rgba(23, 59, 44, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 2,
  },
  genderText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.white,
    letterSpacing: 0.4,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    ...THEME.shadows.small,
  },
  favoriteBtnActive: {
    backgroundColor: '#FFF5F5',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    backgroundColor: 'rgba(17, 28, 45, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    color: THEME.colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  body: {
    padding: THEME.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  roomTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  roomTypeText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  bottomStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  rentLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  rentAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  rentPeriod: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  vacancyBadge: {
    backgroundColor: '#EBF8F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vacancyText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  vacancyFullBadge: {
    backgroundColor: '#FEF3C7',
  },
  vacancyFullText: {
    color: '#B45309',
  },
});
