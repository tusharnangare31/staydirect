import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { THEME, formatIndianRupees } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';
import { useFavorites } from '../../src/hooks/useFavorites';
import { InquiryModal } from '../../src/components/InquiryModal';
import { BookingModal } from '../../src/components/BookingModal';
import { Hostel } from '../../src/types/database.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HostelDetailRouteProps {
  id?: string;
  hostel?: Hostel;
  onBack?: () => void;
}

export default function HostelDetailRoute({
  id,
  hostel: initialHostel,
  onBack,
}: HostelDetailRouteProps) {
  const targetId = id || initialHostel?.id;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Fetch real details from Supabase if not provided or to refresh
  const { data: hostelData, isLoading, error } = useQuery({
    queryKey: ['hostel-details', targetId],
    enabled: !!targetId,
    initialData: initialHostel,
    queryFn: async () => {
      if (!targetId) return null;
      const { data, error } = await supabase
        .from('hostels')
        .select(`
          id,
          owner_id,
          name,
          description,
          city,
          area,
          address,
          latitude,
          longitude,
          monthly_rent,
          security_deposit,
          gender_preference,
          verification_status,
          is_published,
          created_at,
          images:hostel_images(storage_path, sort_order),
          rooms:rooms(id, room_type, monthly_rent, total_beds, available_beds),
          amenities:hostel_amenities(amenity:amenities(name)),
          owner:profiles!hostels_owner_id_fkey(
            id,
            full_name,
            phone,
            is_verified,
            college_or_company
          )
        `)
        .eq('id', targetId)
        .single();

      if (error) {
        console.warn('Supabase fetch hostel error:', error.message);
        if (initialHostel) return initialHostel;
        throw error;
      }

      return data as Hostel;
    },
  });

  const hostel = hostelData || initialHostel;

  if (isLoading && !hostel) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading hostel details from Pune database...</Text>
      </View>
    );
  }

  if (!hostel) {
    return (
      <View style={styles.centerBox}>
        <Ionicons name="alert-circle-outline" size={48} color="#E53E3E" />
        <Text style={styles.errorTitle}>Hostel Not Found</Text>
        <Text style={styles.errorSub}>The requested hostel listing could not be retrieved.</Text>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Return to Listings</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const isSaved = isFavorite(hostel.id);
  const images =
    hostel.images && hostel.images.length > 0
      ? hostel.images.map((img) => img.storage_path)
      : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80'];

  const ownerPhone = (hostel.owner as any)?.phone || '+919890123456';
  const ownerName = (hostel.owner as any)?.full_name || 'Verified Property Owner';
  const isOwnerVerified =
    (hostel.owner as any)?.is_verified || hostel.verification_status === 'verified';

  // Direct Phone Call
  const handleCallOwner = () => {
    const cleanPhone = ownerPhone.replace(/[^\d+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Phone Call', `Call the owner directly at: ${cleanPhone}`);
        }
      })
      .catch(() => {
        Alert.alert('Phone Call', `Call the owner directly at: ${cleanPhone}`);
      });
  };

  // Direct WhatsApp Chat
  const handleWhatsAppOwner = () => {
    const cleanPhone = ownerPhone.replace(/[^\d]/g, '');
    const text = encodeURIComponent(
      `Hello ${ownerName}, I found your hostel "${hostel.name}" on StayDirect Pune. I would like to inquire about room availability and rent with zero brokerage.`
    );
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp Error', 'Could not launch WhatsApp on this device.');
    });
  };

  // Open Google Maps
  const handleOpenMaps = () => {
    if (hostel.latitude && hostel.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${hostel.latitude},${hostel.longitude}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Map Error', 'Unable to open Google Maps.');
      });
    } else {
      const query = encodeURIComponent(`${hostel.name}, ${hostel.area}, Pune`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Floating Back & Favorite Bar */}
      <View style={styles.floatingNav}>
        {onBack && (
          <TouchableOpacity style={styles.circleIconBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        )}

        <View style={styles.navRightRow}>
          <TouchableOpacity
            style={[styles.circleIconBtn, isSaved && styles.circleIconBtnActive]}
            onPress={() => toggleFavorite(hostel.id)}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={20}
              color={isSaved ? '#E53E3E' : THEME.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Gallery */}
        <View style={styles.galleryWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imgUri, index) => (
              <Image
                key={index}
                source={{ uri: imgUri }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, activeImageIndex === i && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Zero Brokerage Badge */}
          <View style={styles.galleryBrokerageBadge}>
            <Text style={styles.galleryBrokerageText}>₹0 BROKERAGE DIRECT</Text>
          </View>
        </View>

        {/* Main Details Body */}
        <View style={styles.detailsBody}>
          {/* Area & Verification */}
          <View style={styles.headerInfoRow}>
            <View style={styles.locationChip}>
              <Ionicons name="location-sharp" size={13} color={THEME.colors.primary} />
              <Text style={styles.locationChipText}>
                {hostel.area}, {hostel.city || 'Pune'}
              </Text>
            </View>

            {hostel.gender_preference && (
              <View style={styles.genderChip}>
                <Text style={styles.genderChipText}>
                  {hostel.gender_preference.toUpperCase()} PG
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{hostel.name}</Text>
          <Text style={styles.addressText}>{hostel.address || `${hostel.area}, Pune`}</Text>

          {/* Zero Brokerage Notice Card */}
          <View style={styles.brokerageCard}>
            <MaterialCommunityIcons name="shield-check" size={24} color={THEME.colors.primary} />
            <View style={styles.brokerageCardContent}>
              <Text style={styles.brokerageCardTitle}>Direct-From-Owner Guarantee</Text>
              <Text style={styles.brokerageCardDesc}>
                Contact Suresh directly. No commissions, no agency agreements, no brokerage charges.
              </Text>
            </View>
          </View>

          {/* Pricing & Deposit Strip */}
          <View style={styles.pricingCard}>
            <View style={styles.priceColumn}>
              <Text style={styles.pricingLabel}>Monthly Rent (Starting)</Text>
              <Text style={styles.pricingValue}>
                {formatIndianRupees(hostel.monthly_rent)}
                <Text style={styles.pricingPeriod}> /mo</Text>
              </Text>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.priceColumn}>
              <Text style={styles.pricingLabel}>Security Deposit</Text>
              <Text style={styles.pricingValueDeposit}>
                {hostel.security_deposit
                  ? formatIndianRupees(hostel.security_deposit)
                  : '1 Month Rent'}
              </Text>
            </View>
          </View>

          {/* Available Room Sharing Tiers */}
          <Text style={styles.sectionHeading}>Available Room Options</Text>
          <View style={styles.roomsList}>
            {hostel.rooms && hostel.rooms.length > 0 ? (
              hostel.rooms.map((room, idx) => (
                <View key={room.id || idx} style={styles.roomCard}>
                  <View style={styles.roomCardLeft}>
                    <Ionicons name="bed" size={18} color={THEME.colors.primary} />
                    <View>
                      <Text style={styles.roomTypeName}>{room.room_type}</Text>
                      <Text style={styles.roomVacancy}>
                        {room.available_beds > 0
                          ? `${room.available_beds} beds available out of ${room.total_beds}`
                          : 'Currently full (Waitlist available)'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.roomRentPrice}>
                    {formatIndianRupees(room.monthly_rent)}
                    <Text style={styles.roomRentSub}>/mo</Text>
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.roomCard}>
                <Text style={styles.roomTypeName}>Twin & Triple Sharing Available</Text>
                <Text style={styles.roomRentPrice}>
                  {formatIndianRupees(hostel.monthly_rent)}/mo
                </Text>
              </View>
            )}
          </View>

          {/* Amenities */}
          <Text style={styles.sectionHeading}>Facilities & Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {[
              'High-speed Wi-Fi',
              'Daily Meals (Mess)',
              'Air Conditioning (AC)',
              '24/7 CCTV & Security',
              'Washing Machine',
              'Power Backup (Inverter)',
              'Attached Washroom',
              'RO Water Purifier',
            ].map((amenity) => (
              <View key={amenity} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={15} color={THEME.colors.primary} />
                <Text style={styles.amenityItemText}>{amenity}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.sectionHeading}>About the Property</Text>
          <Text style={styles.descriptionText}>
            {hostel.description ||
              `Spacious student accommodation situated in the prime educational zone of ${hostel.area}, Pune. Equipped with high-speed internet, clean hygienic mess, round-the-clock security, and comfortable bedding. Walking distance from major bus stops, grocery marts, and reading rooms.`}
          </Text>

          {/* Map Location Section */}
          <Text style={styles.sectionHeading}>Location & Surroundings</Text>
          <View style={styles.mapCard}>
            <View style={styles.mapCardHeader}>
              <Ionicons name="map-outline" size={20} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mapTitle}>{hostel.area}, Pune</Text>
                <Text style={styles.mapSubtitle}>
                  Coordinates: {hostel.latitude?.toFixed(4) || '18.5204'}° N,{' '}
                  {hostel.longitude?.toFixed(4) || '73.8567'}° E
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.mapsBtn} onPress={handleOpenMaps}>
              <Ionicons name="navigate" size={16} color={THEME.colors.white} />
              <Text style={styles.mapsBtnText}>Open in Google Maps & Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Owner Profile Card */}
          <Text style={styles.sectionHeading}>Property Owner</Text>
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Ionicons name="person" size={24} color={THEME.colors.primary} />
            </View>

            <View style={styles.ownerInfo}>
              <View style={styles.ownerNameRow}>
                <Text style={styles.ownerNameText}>{ownerName}</Text>
                {isOwnerVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} />
                )}
              </View>
              <Text style={styles.ownerMetaText}>Verified Property Host • Fast Responder</Text>
              <Text style={styles.ownerContactText}>{ownerPhone}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Strip: Call, WhatsApp, Inquiry, Book */}
      <View style={styles.bottomBar}>
        {/* Direct Call */}
        <TouchableOpacity style={styles.iconActionBtn} onPress={handleCallOwner}>
          <Ionicons name="call" size={18} color={THEME.colors.primary} />
          <Text style={styles.iconActionText}>Call</Text>
        </TouchableOpacity>

        {/* Direct WhatsApp */}
        <TouchableOpacity style={styles.iconActionBtn} onPress={handleWhatsAppOwner}>
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          <Text style={styles.iconActionText}>WhatsApp</Text>
        </TouchableOpacity>

        {/* Free Physical Visit Inquiry */}
        <TouchableOpacity
          style={styles.inquiryBtn}
          onPress={() => setIsInquiryModalOpen(true)}
        >
          <Ionicons name="calendar-outline" size={15} color={THEME.colors.primary} />
          <Text style={styles.inquiryBtnText}>Schedule Visit</Text>
        </TouchableOpacity>

        {/* Zero Brokerage Book Now */}
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => setIsBookingModalOpen(true)}
        >
          <Text style={styles.bookBtnText}>Book Bed</Text>
        </TouchableOpacity>
      </View>

      {/* Inquiry Modal */}
      <InquiryModal
        visible={isInquiryModalOpen}
        hostel={hostel}
        onClose={() => setIsInquiryModalOpen(false)}
      />

      {/* Booking Modal */}
      <BookingModal
        visible={isBookingModalOpen}
        hostel={hostel}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E53E3E',
    marginTop: 12,
  },
  errorSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: THEME.colors.white,
    fontWeight: '700',
  },
  floatingNav: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.medium,
  },
  circleIconBtnActive: {
    backgroundColor: '#FFF5F5',
  },
  navRightRow: {
    flexDirection: 'row',
    gap: 8,
  },
  galleryWrapper: {
    height: 270,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 270,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
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
  galleryBrokerageBadge: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  galleryBrokerageText: {
    color: THEME.colors.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  detailsBody: {
    padding: THEME.spacing.lg,
  },
  headerInfoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  locationChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  genderChip: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  genderChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
  },
  brokerageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F7F3',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBE5D6',
    marginBottom: 16,
  },
  brokerageCardContent: {
    flex: 1,
  },
  brokerageCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginBottom: 2,
  },
  brokerageCardDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 15,
  },
  pricingCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 20,
  },
  priceColumn: {
    flex: 1,
  },
  priceDivider: {
    width: 1,
    backgroundColor: THEME.colors.borderLight,
    marginHorizontal: 12,
  },
  pricingLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  pricingValue: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  pricingPeriod: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  pricingValueDeposit: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  roomsList: {
    gap: 8,
    marginBottom: 20,
  },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  roomCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  roomTypeName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  roomVacancy: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
  },
  roomRentPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  roomRentSub: {
    fontSize: 10,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  amenityItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 19,
    color: THEME.colors.textSecondary,
    marginBottom: 20,
  },
  mapCard: {
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 20,
    gap: 12,
  },
  mapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  mapSubtitle: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  mapsBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownerNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  ownerMetaText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
  },
  ownerContactText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    ...THEME.shadows.large,
  },
  iconActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconActionText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  inquiryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 11,
    borderRadius: 8,
  },
  inquiryBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  bookBtn: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
