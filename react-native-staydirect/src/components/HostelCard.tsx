import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Hostel } from '../types/database.types';

interface HostelCardProps {
  hostel: Hostel;
  onPress: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export const HostelCard: React.FC<HostelCardProps> = ({
  hostel,
  onPress,
  isFavorited = false,
  onToggleFavorite,
}) => {
  const coverImage =
    hostel.images && hostel.images.length > 0
      ? hostel.images[0].image_url
      : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80';

  const handleCall = (e: any) => {
    e.stopPropagation();
    const phone = hostel.owner?.phone || '+919890123456';
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (e: any) => {
    e.stopPropagation();
    const phone = (hostel.owner?.phone || '+919890123456').replace('+', '');
    const message = encodeURIComponent(
      `Hello! I found your hostel "${hostel.name}" in ${hostel.area} on StayDirect Pune with zero brokerage. Is a bed currently available?`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      {/* Top Media Banner */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: coverImage }} style={styles.image} />

        {/* Gender Badge */}
        <View style={styles.genderBadge}>
          <Text style={styles.genderBadgeText}>
            {hostel.gender_preference.toUpperCase()} PG
          </Text>
        </View>

        {/* Rating & Favorite Row */}
        <View style={styles.topRightRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{hostel.rating}</Text>
          </View>

          {onToggleFavorite && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorited ? '#EF4444' : THEME.colors.textPrimary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Zero Brokerage Strip */}
        <View style={styles.zeroBrokerageStrip}>
          <Ionicons name="shield-checkmark" size={12} color={THEME.colors.primary} />
          <Text style={styles.zeroBrokerageText}>Direct Owner • ₹0 Brokerage</Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {hostel.name}
          </Text>
          {hostel.verification_status === 'verified' && (
            <MaterialCommunityIcons
              name="check-decagram"
              size={18}
              color={THEME.colors.primary}
            />
          )}
        </View>

        {/* Area & Nearby College */}
        <Text style={styles.areaText}>
          📍 {hostel.area} {hostel.distance_to_college ? `• ${hostel.distance_to_college}` : ''}
        </Text>

        {/* Amenities Highlights */}
        {hostel.amenities && hostel.amenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {hostel.amenities.slice(0, 3).map((a, index) => (
              <View key={index} style={styles.amenityChip}>
                <Text style={styles.amenityChipText}>{a.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer: Price & Direct Actions */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.priceText}>
              ₹{hostel.monthly_rent_min.toLocaleString()}
              <Text style={styles.pricePerMonth}> / month</Text>
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={18} color={THEME.colors.white} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Ionicons name="call" size={16} color={THEME.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.detailsBtn} onPress={onPress}>
              <Text style={styles.detailsBtnText}>View</Text>
              <Ionicons name="chevron-forward" size={14} color={THEME.colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.soft,
  },
  imageContainer: {
    height: 170,
    width: '100%',
    position: 'relative',
    backgroundColor: THEME.colors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  genderBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(23, 59, 44, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.sm,
  },
  genderBadgeText: {
    color: THEME.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topRightRow: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    ...THEME.shadows.soft,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  favoriteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.shadows.soft,
  },
  zeroBrokerageStrip: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  zeroBrokerageText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  content: {
    padding: THEME.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  areaText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  amenityChip: {
    backgroundColor: THEME.colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  amenityChipText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  priceLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  priceText: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  pricePerMonth: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  whatsappButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.whatsapp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.pill,
  },
  detailsBtnText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
