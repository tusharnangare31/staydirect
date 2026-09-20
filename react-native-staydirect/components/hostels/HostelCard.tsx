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
  recommendationReason?: string;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const HostelCard: React.FC<HostelCardProps> = ({
  hostel,
  onPress,
  recommendationReason,
  userCoords,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(hostel.id);

  // First image with fallback
  const firstImage =
    hostel.images && hostel.images.length > 0
      ? (hostel.images[0] as any).image_url || hostel.images[0].storage_path
      : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80';

  // Room types summary
  const roomTypes =
    hostel.rooms && hostel.rooms.length > 0
      ? hostel.rooms.map((r: any) => r.room_type || r.sharing_type).filter(Boolean).slice(0, 2).join(' • ')
      : 'Single & Shared Beds';

  // Available beds count
  const totalAvailableBeds =
    hostel.available_beds !== undefined
      ? hostel.available_beds
      : hostel.rooms?.reduce((acc: number, r: any) => acc + (r.available_beds || r.vacant_beds || 0), 0) ?? 3;

  const rent = hostel.monthly_rent_min || hostel.monthly_rent || 8000;
  const rating = hostel.rating || 4.8;
  const reviewCount = hostel.review_count !== undefined ? hostel.review_count : 42;
  const isVerified = hostel.verification_status === 'verified';

  // Extract top amenities (up to 3 chips)
  const amenityChips = React.useMemo(() => {
    if (!hostel.amenities || hostel.amenities.length === 0) {
      return ['Wi-Fi', 'CCTV', 'Meals'];
    }
    return hostel.amenities
      .map((a: any) => (typeof a === 'string' ? a : a.name || a.amenity?.name || ''))
      .filter(Boolean)
      .slice(0, 3);
  }, [hostel.amenities]);

  const handleHeartPress = (e: any) => {
    e?.stopPropagation?.();
    toggleFavorite(hostel.id);
  };

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

        {/* Top left badges */}
        <View style={styles.topLeftBadges}>
          <View style={styles.brokerageBadge}>
            <Text style={styles.brokerageText}>₹0 BROKERAGE</Text>
          </View>

          {hostel.gender_preference && (
            <View style={[
              styles.genderBadge,
              hostel.gender_preference === 'girls' ? styles.genderGirls :
              hostel.gender_preference === 'boys' ? styles.genderBoys : styles.genderCoed
            ]}>
              <Text style={styles.genderText}>
                {hostel.gender_preference.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={[styles.favoriteBtn, saved && styles.favoriteBtnActive]}
          onPress={handleHeartPress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={18}
            color={saved ? '#E53E3E' : THEME.colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Optional explainable recommendation pill on image */}
        {recommendationReason ? (
          <View style={styles.recommendationBadge}>
            <Ionicons name="sparkles" size={11} color="#FFF" />
            <Text style={styles.recommendationText} numberOfLines={1}>
              {recommendationReason}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Details body */}
      <View style={styles.body}>
        {/* Verification & Location row */}
        <View style={styles.metaRow}>
          <View style={styles.locationGroup}>
            <Ionicons name="location-sharp" size={13} color={THEME.colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {hostel.area}, Pune
            </Text>
          </View>

          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#059669" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Hostel Name */}
        <Text style={styles.name} numberOfLines={1}>
          {hostel.name}
        </Text>

        {/* Rating & Owner response indicator */}
        <View style={styles.ratingAndResponseRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingScore}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
          </View>

          <View style={styles.responseRateContainer}>
            <Ionicons name="flash-outline" size={12} color="#0284C7" />
            <Text style={styles.responseRateText}>Replies &lt; 1h</Text>
          </View>
        </View>

        {/* Room types & beds */}
        <View style={styles.roomTypeRow}>
          <Ionicons name="bed-outline" size={13} color={THEME.colors.textSecondary} />
          <Text style={styles.roomTypeText} numberOfLines={1}>
            {roomTypes}
          </Text>
        </View>

        {/* Important Amenities chips */}
        <View style={styles.amenitiesRow}>
          {amenityChips.map((chip, idx) => (
            <View key={idx} style={styles.amenityChip}>
              <Text style={styles.amenityChipText} numberOfLines={1}>
                {chip.length > 18 ? chip.slice(0, 16) + '...' : chip}
              </Text>
            </View>
          ))}
        </View>

        {/* Price & Vacancy Bottom Strip */}
        <View style={styles.bottomStrip}>
          <View>
            <Text style={styles.rentLabel}>Starting rent</Text>
            <View style={styles.priceRow}>
              <Text style={styles.rentAmount}>
                {formatIndianRupees(rent)}
              </Text>
              <Text style={styles.rentPeriod}>/mo</Text>
            </View>
          </View>

          {totalAvailableBeds > 0 ? (
            <View style={styles.vacancyBadge}>
              <View style={styles.vacancyDot} />
              <Text style={styles.vacancyText}>{totalAvailableBeds} beds available</Text>
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

export const HostelCardSkeleton: React.FC = () => (
  <View style={[styles.card, styles.skeletonCard]}>
    <View style={styles.skeletonImage} />
    <View style={styles.body}>
      <View style={styles.skeletonLineSmall} />
      <View style={styles.skeletonLineLarge} />
      <View style={styles.skeletonLineMedium} />
      <View style={styles.skeletonLineFooter} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.small,
  },
  imageContainer: {
    position: 'relative',
    height: 165,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topLeftBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brokerageBadge: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  brokerageText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  genderBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  genderGirls: {
    backgroundColor: '#BE185D',
  },
  genderBoys: {
    backgroundColor: '#1D4ED8',
  },
  genderCoed: {
    backgroundColor: '#047857',
  },
  genderText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteBtnActive: {
    backgroundColor: '#FFF',
  },
  recommendationBadge: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  recommendationText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  body: {
    padding: 13,
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
    gap: 3,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  ratingAndResponseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  reviewCount: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  responseRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  responseRateText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284C7',
  },
  roomTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  roomTypeText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  amenityChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  amenityChipText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  bottomStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rentLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rentAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  rentPeriod: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginLeft: 2,
  },
  vacancyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vacancyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  vacancyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  vacancyFullBadge: {
    backgroundColor: '#FEF3C7',
  },
  vacancyFullText: {
    color: '#B45309',
  },
  // Skeleton Styles
  skeletonCard: {
    opacity: 0.7,
  },
  skeletonImage: {
    height: 165,
    backgroundColor: '#E2E8F0',
  },
  skeletonLineSmall: {
    height: 12,
    width: '40%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLineLarge: {
    height: 18,
    width: '85%',
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLineMedium: {
    height: 12,
    width: '60%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonLineFooter: {
    height: 24,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
});
