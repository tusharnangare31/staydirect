import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/Header';
import { BookingModal } from '../../components/BookingModal';
import { InquiryModal } from '../../components/InquiryModal';
import { Hostel } from '../../types/database.types';
import { useFavorites } from '../../hooks/useUserInteractions';

const { width } = Dimensions.get('window');

interface HostelDetailScreenProps {
  hostel: Hostel;
  onBack: () => void;
}

export const HostelDetailScreen: React.FC<HostelDetailScreenProps> = ({
  hostel,
  onBack,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isInquiryModalVisible, setIsInquiryModalVisible] = useState(false);

  const { data: favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites?.some((f) => f.hostel_id === hostel.id);

  const images =
    hostel.images && hostel.images.length > 0
      ? hostel.images.map((i) => i.image_url)
      : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80'];

  const handleCallOwner = () => {
    const phone = hostel.owner?.phone || '+919890123456';
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsAppOwner = () => {
    const phone = (hostel.owner?.phone || '+919890123456').replace('+', '');
    const msg = encodeURIComponent(
      `Hello! I am inquiring about "${hostel.name}" in ${hostel.area} on StayDirect. Can we talk about availability?`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
  };

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hostel.latitude},${hostel.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Header
        title={hostel.name}
        subtitle={hostel.area}
        showBack={true}
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.headerFavBtn}
            onPress={() =>
              toggleFavorite({
                hostelId: hostel.id,
                isFavorited: !!isFavorited,
              })
            }
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? '#EF4444' : THEME.colors.white}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Photo Gallery Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
          >
            {images.map((imgUrl, index) => (
              <Image key={index} source={{ uri: imgUrl }} style={styles.carouselImage} />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    activeImageIndex === i && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Gender tag overlay */}
          <View style={styles.genderTag}>
            <Text style={styles.genderTagText}>{hostel.gender_preference.toUpperCase()} PG</Text>
          </View>
        </View>

        {/* Main Property Details */}
        <View style={styles.contentSection}>
          {/* Title and Rating */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hostelName}>{hostel.name}</Text>
              <Text style={styles.addressLine}>📍 {hostel.address}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingVal}>{hostel.rating}</Text>
              <Text style={styles.reviewCount}>({hostel.review_count})</Text>
            </View>
          </View>

          {/* Zero Brokerage Value Box */}
          <View style={styles.zeroBrokerageCard}>
            <Ionicons name="shield-checkmark" size={24} color={THEME.colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.zeroBrokerageTitle}>100% Direct Owner Listing</Text>
              <Text style={styles.zeroBrokerageSub}>
                Zero brokerage charged. Pay rent directly to property owner.
              </Text>
            </View>
            <View style={styles.zeroBadgePill}>
              <Text style={styles.zeroBadgePillText}>₹0 Brokerage</Text>
            </View>
          </View>

          {/* Rent & Deposit Overview */}
          <View style={styles.pricingRow}>
            <View style={styles.priceCard}>
              <Text style={styles.priceCardLabel}>Monthly Rent</Text>
              <Text style={styles.priceCardVal}>
                ₹{hostel.monthly_rent_min.toLocaleString()} - ₹{hostel.monthly_rent_max.toLocaleString()}
              </Text>
              <Text style={styles.priceCardSub}>Per person / month</Text>
            </View>
            <View style={styles.priceCard}>
              <Text style={styles.priceCardLabel}>Security Deposit</Text>
              <Text style={styles.priceCardVal}>
                ₹{hostel.security_deposit.toLocaleString()}
              </Text>
              <Text style={styles.priceCardSub}>100% Refundable</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeader}>About this Property</Text>
          <Text style={styles.descriptionText}>{hostel.description}</Text>

          {/* Nearby Pune Colleges */}
          {hostel.distance_to_college && (
            <View style={styles.collegeDistanceBox}>
              <Ionicons name="school" size={20} color={THEME.colors.primary} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.collegeDistTitle}>{hostel.distance_to_college}</Text>
                <Text style={styles.collegeDistSub}>Prime location for students</Text>
              </View>
            </View>
          )}

          {/* Room Sharing Options */}
          <Text style={styles.sectionHeader}>Available Sharing Options</Text>
          <View style={styles.roomsList}>
            {hostel.rooms && hostel.rooms.length > 0 ? (
              hostel.rooms.map((room) => (
                <View key={room.id} style={styles.roomCard}>
                  <View>
                    <Text style={styles.roomSharingType}>{room.sharing_type}</Text>
                    <Text style={styles.roomFeatures}>
                      {room.has_ac ? '❄️ AC Included' : 'Fan Only'} •{' '}
                      {room.has_attached_washroom ? '🚿 Attached Bath' : 'Common Bath'}
                    </Text>
                    <Text style={styles.roomVacancy}>
                      🟢 {room.vacant_beds} beds currently vacant
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.roomPrice}>₹{room.monthly_rent}</Text>
                    <Text style={styles.roomPriceSub}>/ month</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyNote}>Room options updating shortly.</Text>
            )}
          </View>

          {/* Amenities Grid */}
          <Text style={styles.sectionHeader}>Included Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {hostel.amenities && hostel.amenities.length > 0 ? (
              hostel.amenities.map((amenity) => (
                <View key={amenity.id} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={18} color={THEME.colors.primary} />
                  <Text style={styles.amenityName}>{amenity.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyNote}>Standard Wi-Fi, Food & Security included.</Text>
            )}
          </View>

          {/* Verified Owner Profile Card */}
          <Text style={styles.sectionHeader}>Property Owner</Text>
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>
                {(hostel.owner?.full_name || 'O').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.ownerFullName}>
                  {hostel.owner?.full_name || 'Suresh Kulkarni'}
                </Text>
                <MaterialCommunityIcons name="check-decagram" size={16} color={THEME.colors.primary} />
              </View>
              <Text style={styles.ownerCity}>Verified StayDirect Partner • Pune</Text>
            </View>
          </View>

          {/* Location Map Preview */}
          <Text style={styles.sectionHeader}>Exact Location</Text>
          <TouchableOpacity style={styles.mapBox} onPress={handleOpenGoogleMaps}>
            <Ionicons name="map" size={28} color={THEME.colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.mapTitle}>Open in Google Maps</Text>
              <Text style={styles.mapSubtitle}>{hostel.address}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.circleActionBtn} onPress={handleWhatsAppOwner}>
          <Ionicons name="logo-whatsapp" size={20} color={THEME.colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleCallBtn} onPress={handleCallOwner}>
          <Ionicons name="call" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scheduleVisitBtn}
          onPress={() => setIsInquiryModalVisible(true)}
        >
          <Ionicons name="calendar-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.scheduleVisitText}>Schedule Visit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookNowBtn}
          onPress={() => setIsBookingModalVisible(true)}
        >
          <Text style={styles.bookNowText}>Book Room</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <BookingModal
        visible={isBookingModalVisible}
        onClose={() => setIsBookingModalVisible(false)}
        hostel={hostel}
      />
      <InquiryModal
        visible={isInquiryModalVisible}
        onClose={() => setIsInquiryModalVisible(false)}
        hostel={hostel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  headerFavBtn: {
    padding: 6,
  },
  scrollBody: {
    flex: 1,
  },
  carouselContainer: {
    width,
    height: 240,
    backgroundColor: THEME.colors.surfaceVariant,
    position: 'relative',
  },
  carouselImage: {
    width,
    height: 240,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    width: 18,
    backgroundColor: THEME.colors.white,
  },
  genderTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(23, 59, 44, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  genderTagText: {
    color: THEME.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
  },
  contentSection: {
    padding: THEME.spacing.lg,
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hostelName: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  addressLine: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 3,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  reviewCount: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  zeroBrokerageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.secondary,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.secondaryDark,
  },
  zeroBrokerageTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  zeroBrokerageSub: {
    fontSize: 10,
    color: THEME.colors.primaryLight,
  },
  zeroBadgePill: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.pill,
  },
  zeroBadgePillText: {
    color: THEME.colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  priceCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  priceCardLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  priceCardVal: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 2,
  },
  priceCardSub: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },
  collegeDistanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceVariant,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    marginTop: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  collegeDistTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  collegeDistSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  roomsList: {
    gap: 10,
  },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  roomSharingType: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  roomFeatures: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  roomVacancy: {
    fontSize: 10,
    color: THEME.colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  roomPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  roomPriceSub: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    width: '48%',
  },
  amenityName: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  ownerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  ownerFullName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  ownerCity: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  mapBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  mapSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  emptyNote: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
    gap: 8,
    ...THEME.shadows.medium,
  },
  circleActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.whatsapp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCallBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleVisitBtn: {
    flex: 1,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceVariant,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  scheduleVisitText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  bookNowBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookNowText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.white,
  },
});
