import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Hostel } from '../types/database.types';
import { useStudentBookings } from '../hooks/useUserInteractions';
import { useAuth } from '../context/AuthContext';
import { PaymentFlowModal } from '../screens/student/payment/PaymentFlowModal';

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  hostel: Hostel;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  onClose,
  hostel,
}) => {
  const { user } = useAuth();
  const { createBooking } = useStudentBookings();

  const [selectedSharing, setSelectedSharing] = useState(
    hostel.rooms && hostel.rooms.length > 0
      ? hostel.rooms[0].sharing_type
      : 'Double Sharing'
  );
  const [durationMonths, setDurationMonths] = useState(6);
  const [moveInDate, setMoveInDate] = useState('2025-07-01');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Selected room calculation
  const selectedRoom = hostel.rooms?.find(
    (r) => r.sharing_type === selectedSharing
  ) || {
    monthly_rent: hostel.monthly_rent_min,
    deposit: hostel.security_deposit,
  };

  const handleSubmitBooking = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please sign in to submit a booking request.');
      return;
    }

    try {
      setIsSubmitting(true);
      const booking = await createBooking({
        hostel_id: hostel.id,
        owner_id: hostel.owner_id,
        sharing_type: selectedSharing,
        monthly_rent: selectedRoom.monthly_rent,
        security_deposit: selectedRoom.deposit,
        duration_months: durationMonths,
        move_in_date: moveInDate,
        notes: notes.trim(),
      });

      setCreatedBooking(booking);

      Alert.alert(
        'Booking Request Submitted! 🎉',
        `Your request for ${hostel.name} has been sent directly to the owner without brokerage. Would you like to pay your refundable deposit now to guarantee your vacancy?`,
        [
          {
            text: 'Pay Later',
            style: 'cancel',
            onPress: onClose,
          },
          {
            text: 'Pay Deposit Now',
            onPress: () => {
              setShowPaymentModal(true);
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Booking Error', e.message || 'Could not submit booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Direct Booking Request</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {hostel.name}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Zero Brokerage Badge banner */}
            <View style={styles.guaranteeBanner}>
              <Ionicons name="shield-checkmark" size={24} color={THEME.colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.guaranteeTitle}>₹0 Brokerage Guaranteed</Text>
                <Text style={styles.guaranteeSub}>
                  You deal directly with the property owner. StayDirect never charges commissions.
                </Text>
              </View>
            </View>

            {/* Room Sharing Type Selection */}
            <Text style={styles.sectionLabel}>Select Room Sharing</Text>
            <View style={styles.optionsRow}>
              {(hostel.rooms && hostel.rooms.length > 0
                ? hostel.rooms.map((r) => r.sharing_type)
                : ['Single Room', 'Double Sharing', 'Triple Sharing']
              ).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedSharing(type)}
                  style={[
                    styles.optionChip,
                    selectedSharing === type && styles.optionChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      selectedSharing === type && styles.optionChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stay Duration */}
            <Text style={styles.sectionLabel}>Stay Duration</Text>
            <View style={styles.optionsRow}>
              {[3, 6, 11, 12].map((months) => (
                <TouchableOpacity
                  key={months}
                  onPress={() => setDurationMonths(months)}
                  style={[
                    styles.durationChip,
                    durationMonths === months && styles.durationChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      durationMonths === months && styles.durationChipTextActive,
                    ]}
                  >
                    {months} Months
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Move-in Date */}
            <Text style={styles.sectionLabel}>Expected Move-in Date (YYYY-MM-DD)</Text>
            <TextInput
              value={moveInDate}
              onChangeText={setMoveInDate}
              placeholder="2025-07-01"
              placeholderTextColor={THEME.colors.textMuted}
              style={styles.textInput}
            />

            {/* Special Instructions */}
            <Text style={styles.sectionLabel}>Notes for Owner (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Vegetarian food preference, study desk needed"
              placeholderTextColor={THEME.colors.textMuted}
              multiline
              numberOfLines={3}
              style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
            />

            {/* Transparent Cost Breakdown */}
            <Text style={styles.sectionLabel}>Transparent Price Breakdown</Text>
            <View style={styles.breakdownBox}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownText}>Monthly Rent ({selectedSharing})</Text>
                <Text style={styles.breakdownVal}>₹{selectedRoom.monthly_rent}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownText}>Refundable Security Deposit</Text>
                <Text style={styles.breakdownVal}>₹{selectedRoom.deposit}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownText, { color: THEME.colors.primary, fontWeight: '700' }]}>
                  Brokerage / Platform Fee
                </Text>
                <Text style={styles.brokerageZeroVal}>₹0 (Free)</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitBooking}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={THEME.colors.white} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Confirm Booking Request</Text>
                  <Ionicons name="arrow-forward" size={18} color={THEME.colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Payment Flow Modal for Deposit */}
    <PaymentFlowModal
      visible={showPaymentModal}
      onClose={() => {
        setShowPaymentModal(false);
        onClose();
      }}
      hostel={hostel}
      room={selectedRoom as any}
      booking={createdBooking}
      moveInDate={moveInDate}
      durationMonths={durationMonths}
      onPaymentSuccess={() => {
        // Handled inside PaymentFlowModal
      }}
    />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 28, 45, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  headerTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  headerSub: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    maxWidth: 240,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.secondary,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  guaranteeTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  guaranteeSub: {
    fontSize: 11,
    color: THEME.colors.primaryLight,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  optionChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  optionChipText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  optionChipTextActive: {
    color: THEME.colors.white,
    fontWeight: '700',
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  durationChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  durationChipText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  durationChipTextActive: {
    color: THEME.colors.white,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: THEME.colors.surfaceVariant,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  breakdownBox: {
    backgroundColor: THEME.colors.surfaceVariant,
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  brokerageZeroVal: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  footer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
  },
  submitBtnText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.sizes.md,
    fontWeight: '800',
  },
});
