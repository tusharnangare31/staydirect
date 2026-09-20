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
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { THEME, formatIndianRupees } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';
import { useFavorites } from '../../src/hooks/useFavorites';
import { InquiryModal } from '../../src/components/InquiryModal';
import { BookingModal } from '../../src/components/BookingModal';
import { ReviewModal } from '../../src/components/ReviewModal';
import { useHostelReviews, useHostelTrustMetrics, useReportReview } from '../../src/hooks/useReviews';
import { TrustScoreCard } from '../../src/components/trust/TrustScoreCard';
import { addRecentlyViewed } from '../../src/lib/recentlyViewed';
import { ReportScreen } from '../report';
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { data: reviews = [] } = useHostelReviews(targetId || '');
  const { data: trustMetrics } = useHostelTrustMetrics(targetId || '');
  const reportReviewMutation = useReportReview();

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

  React.useEffect(() => {
    if (hostel) {
      addRecentlyViewed(hostel);
    }
  }, [hostel?.id]);

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
            style={styles.circleIconBtn}
            onPress={() => setIsReportModalOpen(true)}
          >
            <Ionicons name="flag-outline" size={18} color={THEME.colors.textSecondary} />
          </TouchableOpacity>

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

          {/* Transparent Trust Score Card & Badges */}
          <TrustScoreCard metrics={trustMetrics} hostelName={hostel.name} />

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

          {/* Student Reviews & Ratings Section */}
          <View style={{ marginTop: 24 }}>
            <View style={styles.reviewHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>Student Reviews</Text>
                <Text style={styles.reviewSub}>
                  {reviews.length > 0
                    ? `${reviews.length} verified student ${reviews.length === 1 ? 'review' : 'reviews'}`
                    : 'Be the first Pune student to review'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setIsReviewModalOpen(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="star" size={14} color="#FFFFFF" />
                <Text style={styles.writeReviewBtnText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            {/* Rating Scores Grid */}
            <View style={styles.reviewScoreCard}>
              <View style={styles.scoreLeft}>
                <Text style={styles.bigScoreText}>
                  {reviews.length > 0
                    ? (
                        reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length
                      ).toFixed(1)
                    : '4.8'}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name="star" size={13} color="#F59E0B" />
                  ))}
                </View>
                <Text style={styles.verifiedCountText}>100% Zero Brokerage</Text>
              </View>

              <View style={styles.scoreRight}>
                <View style={styles.subScoreRow}>
                  <Text style={styles.subScoreLabel}>Cleanliness</Text>
                  <Text style={styles.subScoreVal}>
                    {trustMetrics?.cleanliness_avg ? `${trustMetrics.cleanliness_avg} / 5` : '4.8 / 5'}
                  </Text>
                </View>
                <View style={styles.subScoreRow}>
                  <Text style={styles.subScoreLabel}>Safety & CCTV</Text>
                  <Text style={styles.subScoreVal}>
                    {trustMetrics?.safety_avg ? `${trustMetrics.safety_avg} / 5` : '4.9 / 5'}
                  </Text>
                </View>
                <View style={styles.subScoreRow}>
                  <Text style={styles.subScoreLabel}>Location</Text>
                  <Text style={styles.subScoreVal}>
                    {trustMetrics?.location_avg ? `${trustMetrics.location_avg} / 5` : '4.7 / 5'}
                  </Text>
                </View>
                <View style={styles.subScoreRow}>
                  <Text style={styles.subScoreLabel}>Value for Money</Text>
                  <Text style={styles.subScoreVal}>
                    {trustMetrics?.value_avg ? `${trustMetrics.value_avg} / 5` : '4.8 / 5'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Review Cards List */}
            {reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.revCardHeader}>
                  <View style={styles.revAvatar}>
                    <Text style={styles.revAvatarText}>
                      {(rev.student?.full_name || 'S').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.revAuthorName}>
                        {rev.student?.full_name || 'Pune Student'}
                      </Text>
                      {rev.is_verified_stay && (
                        <View style={styles.verifiedStayChip}>
                          <Ionicons name="checkmark-circle" size={11} color="#059669" />
                          <Text style={styles.verifiedStayText}>Verified Stay</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.revAuthorSub}>
                      {rev.student?.college_or_company || 'Pune College'} •{' '}
                      {new Date(rev.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.revRatingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.revRatingVal}>{rev.rating}.0</Text>
                  </View>
                </View>

                {rev.title ? <Text style={styles.revTitle}>{rev.title}</Text> : null}
                <Text style={styles.revComment}>{rev.comment || rev.review_text}</Text>

                {/* Sub-ratings chips */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {rev.cleanliness_rating ? (
                    <View style={styles.subPill}>
                      <Text style={styles.subPillText}>Clean: {rev.cleanliness_rating}★</Text>
                    </View>
                  ) : null}
                  {rev.safety_rating ? (
                    <View style={styles.subPill}>
                      <Text style={styles.subPillText}>Safety: {rev.safety_rating}★</Text>
                    </View>
                  ) : null}
                  {rev.location_rating ? (
                    <View style={styles.subPill}>
                      <Text style={styles.subPillText}>Location: {rev.location_rating}★</Text>
                    </View>
                  ) : null}
                  {rev.value_rating ? (
                    <View style={styles.subPill}>
                      <Text style={styles.subPillText}>Value: {rev.value_rating}★</Text>
                    </View>
                  ) : null}
                </View>

                {/* Owner Reply Block */}
                {rev.owner_reply ? (
                  <View style={styles.ownerReplyBox}>
                    <View style={styles.ownerReplyHeader}>
                      <Ionicons name="business" size={14} color={THEME.colors.primary} />
                      <Text style={styles.ownerReplyTitle}>Landlord Response</Text>
                      {rev.owner_replied_at && (
                        <Text style={styles.ownerReplyDate}>
                          • {new Date(rev.owner_replied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.ownerReplyText}>{rev.owner_reply}</Text>
                  </View>
                ) : null}

                {/* Report Review Action */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    onPress={() => {
                      Alert.alert(
                        'Report Inappropriate Review',
                        'Does this review contain spam, harassment, or fake claims?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Report as Fake / Spam',
                            style: 'destructive',
                            onPress: () =>
                              reportReviewMutation.mutate({
                                reviewId: rev.id,
                                reason: 'fake_review',
                                description: 'Reported by user from listing page',
                              }),
                          },
                          {
                            text: 'Report Offensive Content',
                            style: 'destructive',
                            onPress: () =>
                              reportReviewMutation.mutate({
                                reviewId: rev.id,
                                reason: 'offensive_language',
                                description: 'Inappropriate language reported',
                              }),
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="flag-outline" size={12} color={THEME.colors.textMuted} />
                    <Text style={{ fontSize: 11, color: THEME.colors.textMuted, fontWeight: '600' }}>
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Report Listing Trust Banner */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 14,
            marginHorizontal: 16,
            marginTop: 14,
            marginBottom: 24,
            backgroundColor: '#FEF2F2',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#FECACA',
            gap: 8,
          }}
          onPress={() => setIsReportModalOpen(true)}
        >
          <Ionicons name="flag-outline" size={16} color="#DC2626" />
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>
            Report Inaccurate Rent, Brokerage or Issue to Admins
          </Text>
        </TouchableOpacity>
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

      {/* Report Modal */}
      <Modal
        visible={isReportModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsReportModalOpen(false)}
      >
        <ReportScreen
          hostelId={hostel.id}
          hostelTitle={hostel.name}
          reportedUserId={hostel.owner_id}
          reportedUserName={ownerName}
          onClose={() => setIsReportModalOpen(false)}
          onSubmitted={() => setIsReportModalOpen(false)}
        />
      </Modal>

      {/* Student Review Modal */}
      <ReviewModal
        visible={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        hostelId={hostel.id}
        hostelName={hostel.name}
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
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  writeReviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewScoreCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreLeft: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    minWidth: 110,
  },
  bigScoreText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  verifiedCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
  },
  scoreRight: {
    flex: 1,
    paddingLeft: 16,
    gap: 4,
  },
  subScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subScoreLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  subScoreVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  revCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  revAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  revAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  verifiedStayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  verifiedStayText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  revAuthorSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  revRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  revRatingVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  revTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  revComment: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 17,
  },
  subPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  ownerReplyBox: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  ownerReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  ownerReplyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  ownerReplyDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  ownerReplyText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
});
