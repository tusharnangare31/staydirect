import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/Header';
import { useOwnerData } from '../../hooks/useUserInteractions';
import { useAuth } from '../../context/AuthContext';

interface OwnerDashboardScreenProps {
  onAddNewHostel: () => void;
}

export const OwnerDashboardScreen: React.FC<OwnerDashboardScreenProps> = ({
  onAddNewHostel,
}) => {
  const { role, switchDevRole } = useAuth();
  const {
    hostels,
    bookings,
    inquiries,
    updateBookingStatus,
    toggleAvailability,
  } = useOwnerData();

  // Calculated metrics
  const totalBeds = hostels.reduce((acc, h) => acc + (h.total_beds || 0), 0) || 54;
  const vacantBeds = hostels.reduce((acc, h) => acc + (h.available_beds || 0), 0) || 7;
  const occupiedBeds = totalBeds - vacantBeds;

  const handleBookingDecision = (bookingId: string, status: 'approved' | 'rejected') => {
    Alert.alert(
      `${status === 'approved' ? 'Approve' : 'Decline'} Booking`,
      `Are you sure you want to mark this booking as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await updateBookingStatus({ bookingId, status });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Owner Dashboard"
        subtitle="Pune Property Management"
        rightAction={
          <TouchableOpacity
            style={styles.switchRoleBtn}
            onPress={() => switchDevRole('student')}
          >
            <Text style={styles.switchRoleText}>🎓 Student Mode</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Metric Cards Banner */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{totalBeds}</Text>
            <Text style={styles.metricLabel}>Total Beds</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: THEME.colors.secondary }]}>
            <Text style={[styles.metricVal, { color: THEME.colors.primary }]}>{vacantBeds}</Text>
            <Text style={[styles.metricLabel, { color: THEME.colors.primaryLight }]}>Vacant Beds</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{occupiedBeds}</Text>
            <Text style={styles.metricLabel}>Occupied</Text>
          </View>
        </View>

        {/* Add Property CTA */}
        <TouchableOpacity style={styles.addPropertyBtn} onPress={onAddNewHostel}>
          <Ionicons name="add-circle" size={22} color={THEME.colors.white} />
          <Text style={styles.addPropertyText}>List New Hostel / PG in Pune</Text>
        </TouchableOpacity>

        {/* Inquiries & Scheduled Student Visits */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Scheduled Student Visits</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>{inquiries.length}</Text>
            </View>
          </View>

          {inquiries.length > 0 ? (
            inquiries.map((inq: any) => (
              <View key={inq.id} style={styles.inquiryCard}>
                <View style={styles.inquiryHeader}>
                  <Text style={styles.studentName}>
                    {inq.student?.full_name || 'Student Visitor'}
                  </Text>
                  <Text style={styles.visitTimeBadge}>{inq.visit_time}</Text>
                </View>
                <Text style={styles.inquirySub}>
                  Interested in: {inq.preferred_sharing || 'Any Room'} • Date: {inq.visit_date}
                </Text>
                {inq.message ? (
                  <Text style={styles.inquiryNote}>"{inq.message}"</Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={28} color={THEME.colors.textMuted} />
              <Text style={styles.emptyCardText}>No student visits pending today.</Text>
            </View>
          )}
        </View>

        {/* Room Booking Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Direct Booking Requests</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>{bookings.length}</Text>
            </View>
          </View>

          {bookings.length > 0 ? (
            bookings.map((booking: any) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.inquiryHeader}>
                  <Text style={styles.studentName}>
                    {booking.student?.full_name || 'Enrolled Student'}
                  </Text>
                  <Text style={styles.bookingStatus}>{booking.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.inquirySub}>
                  {booking.sharing_type} • ₹{booking.monthly_rent}/mo • Move-in: {booking.move_in_date}
                </Text>

                {booking.status === 'pending' && (
                  <View style={styles.decisionRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleBookingDecision(booking.id, 'rejected')}
                    >
                      <Text style={styles.rejectBtnText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleBookingDecision(booking.id, 'approved')}
                    >
                      <Text style={styles.approveBtnText}>Approve Booking</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={28} color={THEME.colors.textMuted} />
              <Text style={styles.emptyCardText}>All booking requests are up to date.</Text>
            </View>
          )}
        </View>

        {/* Listed Properties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Pune Properties</Text>
          {hostels.length > 0 ? (
            hostels.map((h: any) => (
              <View key={h.id} style={styles.propertyCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.propertyName}>{h.name}</Text>
                  <Text style={styles.propertyArea}>📍 {h.area} • Pune</Text>
                  <Text style={styles.propertyRent}>
                    ₹{h.monthly_rent_min} - ₹{h.monthly_rent_max}/mo
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.availText}>
                    {h.is_available ? 'Available' : 'Full'}
                  </Text>
                  <Switch
                    value={h.is_available}
                    onValueChange={(val) =>
                      toggleAvailability({ hostelId: h.id, isAvailable: val })
                    }
                    trackColor={{ false: '#D1D5DB', true: THEME.colors.primary }}
                    thumbColor={THEME.colors.white}
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="business-outline" size={28} color={THEME.colors.textMuted} />
              <Text style={styles.emptyCardText}>You haven't listed a hostel yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  switchRoleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
  },
  switchRoleText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    ...THEME.shadows.soft,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  addPropertyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
    marginBottom: 20,
    ...THEME.shadows.soft,
  },
  addPropertyText: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  counterBadge: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.pill,
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  inquiryCard: {
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 8,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  visitTimeBadge: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '700',
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inquirySub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  inquiryNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  bookingCard: {
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 8,
  },
  bookingStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.warning,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surfaceVariant,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.error,
  },
  approveBtn: {
    flex: 2,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
  },
  approveBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.white,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  propertyArea: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  propertyRent: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 4,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    padding: 18,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    gap: 6,
  },
  emptyCardText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
});
