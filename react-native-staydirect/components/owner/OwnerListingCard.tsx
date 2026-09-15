import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, formatIndianRupees } from '../../src/constants/theme';
import { Hostel } from '../../src/types/database.types';
import { ListingStatusBadge } from './ListingStatusBadge';

export interface OwnerListingCardProps {
  hostel: Hostel;
  onEdit: (hostel: Hostel) => void;
  onTogglePublish?: (hostel: Hostel) => void;
  onDelete?: (hostelId: string) => void;
  onUpdateRent?: (hostel: Hostel) => void;
}

export const OwnerListingCard: React.FC<OwnerListingCardProps> = ({
  hostel,
  onEdit,
  onTogglePublish,
  onDelete,
  onUpdateRent,
}) => {
  const images = hostel.images || [];
  const coverImage =
    images.length > 0
      ? (images[0] as any).storage_path || (images[0] as any).image_url
      : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80';

  const monthlyRent = hostel.monthly_rent || hostel.monthly_rent_min || 8000;
  const totalBeds =
    hostel.rooms && hostel.rooms.length > 0
      ? hostel.rooms.reduce((acc, r) => acc + (r.total_beds || r.total_capacity || 0), 0)
      : hostel.total_beds || 10;
  const availableBeds =
    hostel.rooms && hostel.rooms.length > 0
      ? hostel.rooms.reduce((acc, r) => acc + (r.available_beds || r.vacant_beds || 0), 0)
      : hostel.available_beds || 0;

  const isPublished = !!hostel.is_published;
  const isVerified = hostel.verification_status === 'verified';
  const isDraft = !isPublished && hostel.verification_status === 'pending';

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to permanently delete "${hostel.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(hostel.id),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Top Banner Image + Status Badge */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: coverImage }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeOverlay}>
          <ListingStatusBadge
            verificationStatus={hostel.verification_status}
            isPublished={hostel.is_published}
          />
        </View>

        {hostel.gender_preference && (
          <View style={styles.genderBadge}>
            <Text style={styles.genderText}>
              {hostel.gender_preference.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Info Body */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {hostel.name}
          </Text>
          <Text style={styles.rentText}>
            {formatIndianRupees(monthlyRent)}
            <Text style={styles.rentPeriod}>/mo</Text>
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={THEME.colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {hostel.area}, {hostel.city || 'Pune'}
          </Text>
        </View>

        {/* Beds & Availability Strip */}
        <View style={styles.bedsStrip}>
          <View style={styles.bedMetric}>
            <Ionicons name="bed-outline" size={14} color={THEME.colors.textSecondary} />
            <Text style={styles.bedMetricText}>
              Total Beds: <Text style={styles.boldNum}>{totalBeds}</Text>
            </Text>
          </View>

          <View style={styles.bedDivider} />

          <View style={styles.bedMetric}>
            <Ionicons
              name={availableBeds > 0 ? 'checkmark-circle' : 'alert-circle'}
              size={14}
              color={availableBeds > 0 ? THEME.colors.success : THEME.colors.warning}
            />
            <Text
              style={[
                styles.bedMetricText,
                { color: availableBeds > 0 ? THEME.colors.success : THEME.colors.warning },
              ]}
            >
              Vacant: <Text style={styles.boldNum}>{availableBeds}</Text>
            </Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionsRow}>
          {/* Edit Details */}
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => onEdit(hostel)}
          >
            <Ionicons name="create-outline" size={15} color={THEME.colors.primary} />
            <Text style={styles.actionBtnSecondaryText}>Edit</Text>
          </TouchableOpacity>

          {/* Quick Rent Update */}
          {onUpdateRent && (
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => onUpdateRent(hostel)}
            >
              <Ionicons name="pricetag-outline" size={15} color={THEME.colors.primary} />
              <Text style={styles.actionBtnSecondaryText}>Rent</Text>
            </TouchableOpacity>
          )}

          {/* Publish / Unpublish Toggle */}
          {isVerified && onTogglePublish && (
            <TouchableOpacity
              style={[
                styles.publishBtn,
                isPublished ? styles.unpublishBtn : styles.publishActiveBtn,
              ]}
              onPress={() => onTogglePublish(hostel)}
            >
              <Ionicons
                name={isPublished ? 'pause' : 'cloud-upload'}
                size={14}
                color={THEME.colors.white}
              />
              <Text style={styles.publishBtnText}>
                {isPublished ? 'Unpublish' : 'Publish'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Delete Draft Button */}
          {isDraft && onDelete && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeletePress}
            >
              <Ionicons name="trash-outline" size={15} color={THEME.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    ...THEME.shadows.soft,
  },
  imageWrapper: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  genderBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(23, 59, 44, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  genderText: {
    color: THEME.colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  body: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  rentText: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  rentPeriod: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  bedsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bedMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  bedMetricText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  boldNum: {
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  bedDivider: {
    width: 1,
    height: 14,
    backgroundColor: THEME.colors.border,
    marginHorizontal: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  publishActiveBtn: {
    backgroundColor: THEME.colors.primary,
  },
  unpublishBtn: {
    backgroundColor: '#B45309',
  },
  publishBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginLeft: 'auto',
  },
});
