import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useOwnerListings } from '../../src/hooks/useOwnerListings';
import { InquiryStatus } from '../../src/types/database.types';

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'scheduled_visit', label: 'Visits' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'closed', label: 'Closed' },
];

export const OwnerInquiriesScreen: React.FC = () => {
  const { inquiries, isLoading, isRefetching, refetch, updateInquiryStatus } =
    useOwnerListings('all');
  const [filter, setFilter] = useState<string>('all');

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter === 'all') return true;
    return inq.status === filter;
  });

  const handleCall = (phone?: string | null) => {
    if (!phone) {
      Alert.alert('No Phone', 'Student has not provided a phone number.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone?: string | null, studentName?: string) => {
    if (!phone) {
      Alert.alert('No Phone', 'Student has not provided a phone number.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${studentName || 'there'}, thank you for inquiring about my hostel on StayDirect. When would you like to schedule a visit?`
    );
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
  };

  const handleChangeStatus = (inquiryId: string, currentStatus: InquiryStatus) => {
    Alert.alert('Update Inquiry Status', 'Choose the new progress status for this student:', [
      { text: 'Mark as Contacted', onPress: () => updateInquiryStatus({ inquiryId, status: 'contacted' }) },
      { text: 'Scheduled Visit', onPress: () => updateInquiryStatus({ inquiryId, status: 'scheduled_visit' }) },
      { text: 'Closed / Admitted', onPress: () => updateInquiryStatus({ inquiryId, status: 'closed' }) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Student Inquiries & Visits</Text>
        <Text style={styles.subtitle}>
          Connect with interested students directly without brokers
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {STATUS_FILTERS.map((f) => {
            const isSelected = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[THEME.colors.primary]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={THEME.colors.primary} />
            <Text style={styles.loaderText}>Loading inquiries...</Text>
          </View>
        ) : filteredInquiries.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={48} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Inquiries Found</Text>
            <Text style={styles.emptySub}>
              {filter === 'all'
                ? 'When Pune students contact your properties, inquiries will appear here.'
                : `No inquiries with status "${filter}".`}
            </Text>
          </View>
        ) : (
          filteredInquiries.map((inq) => {
            const student = inq.student;
            const studentName = student?.full_name || 'Interested Student';
            const studentPhone = student?.phone || null;
            const studentCollege = student?.college_or_company || 'Pune College Student';
            const hostelName = inq.hostel?.name || 'Your Hostel';

            const dateStr = new Date(inq.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <View key={inq.id} style={styles.inquiryCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.studentAvatar}>
                    <Ionicons name="person" size={16} color={THEME.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{studentName}</Text>
                    <Text style={styles.studentCollege}>{studentCollege}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      inq.status === 'new' && styles.statusPillNew,
                      inq.status === 'scheduled_visit' && styles.statusPillVisit,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        inq.status === 'new' && styles.statusPillTextNew,
                        inq.status === 'scheduled_visit' && styles.statusPillTextVisit,
                      ]}
                    >
                      {inq.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Property context */}
                <View style={styles.propertyStrip}>
                  <Ionicons name="business" size={14} color={THEME.colors.primary} />
                  <Text style={styles.propertyName} numberOfLines={1}>
                    {hostelName}
                  </Text>
                  <Text style={styles.inquiryDate}>{dateStr}</Text>
                </View>

                {inq.message && (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>"{inq.message}"</Text>
                  </View>
                )}

                {/* Contact & Status Controls */}
                <View style={styles.actionRow}>
                  {studentPhone && (
                    <>
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => handleCall(studentPhone)}
                      >
                        <Ionicons name="call" size={14} color={THEME.colors.white} />
                        <Text style={styles.callBtnText}>Call</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.whatsappBtn}
                        onPress={() => handleWhatsApp(studentPhone, studentName)}
                      >
                        <Ionicons name="logo-whatsapp" size={14} color={THEME.colors.white} />
                        <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.statusChangeBtn}
                    onPress={() => handleChangeStatus(inq.id, inq.status)}
                  >
                    <Ionicons name="swap-vertical" size={14} color={THEME.colors.primary} />
                    <Text style={styles.statusChangeText}>Status</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default OwnerInquiriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  filterTabs: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryDark,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  filterTextActive: {
    color: THEME.colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderBox: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  emptyBox: {
    backgroundColor: THEME.colors.surface,
    padding: 28,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  inquiryCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 14,
    ...THEME.shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  studentCollege: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: THEME.colors.background,
  },
  statusPillNew: {
    backgroundColor: '#FEF3C7',
  },
  statusPillVisit: {
    backgroundColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
  },
  statusPillTextNew: {
    color: '#D97706',
  },
  statusPillTextVisit: {
    color: '#15803D',
  },
  propertyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.background,
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  propertyName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  inquiryDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  messageBox: {
    backgroundColor: '#FAFDF9',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  callBtnText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.whatsapp,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  whatsappBtnText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  statusChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  statusChangeText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
