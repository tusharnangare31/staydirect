import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { supabase } from '../../src/lib/supabase';

export interface OwnerProfileScreenProps {
  onSwitchToStudentView?: () => void;
  onNavigateToVerification?: () => void;
  onSwitchToAdminView?: () => void;
}

export const OwnerProfileScreen: React.FC<OwnerProfileScreenProps> = ({
  onSwitchToStudentView,
  onNavigateToVerification,
  onSwitchToAdminView,
}) => {
  const { user, profile, refreshProfile, signOut, switchDevRole } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [company, setCompany] = useState(profile?.college_or_company || '');
  const [city, setCity] = useState(profile?.city || 'Pune');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = () => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setCompany(profile?.college_or_company || '');
    setCity(profile?.city || 'Pune');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          college_or_company: company.trim(),
          city: city.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      await refreshProfile();
      setIsEditModalOpen(false);
      Alert.alert('Profile Updated', 'Your owner details were saved successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out of StayDirect?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const handleContactSupport = (type: 'call' | 'whatsapp' | 'email') => {
    if (type === 'call') {
      Linking.openURL('tel:+919876543210');
    } else if (type === 'whatsapp') {
      Linking.openURL('https://wa.me/919876543210?text=Hello%20StayDirect%20Support');
    } else {
      Linking.openURL('mailto:support@staydirect.pune');
    }
  };

  const isVerified = !!profile?.is_verified;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Ionicons name="business" size={32} color={THEME.colors.primary} />
          </View>

          <View style={styles.headerTextCol}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText} numberOfLines={1}>
                {profile?.full_name || 'Property Owner'}
              </Text>
              {isVerified && (
                <Ionicons name="checkmark-circle" size={18} color={THEME.colors.success} />
              )}
            </View>

            <Text style={styles.emailText} numberOfLines={1}>
              {user?.email}
            </Text>

            <View
              style={[
                styles.verificationBadge,
                isVerified ? styles.verificationBadgeVerified : styles.verificationBadgePending,
              ]}
            >
              <Ionicons
                name={isVerified ? 'shield-checkmark' : 'time'}
                size={12}
                color={isVerified ? '#15803D' : '#D97706'}
              />
              <Text
                style={[
                  styles.verificationText,
                  isVerified ? styles.verificationTextVerified : styles.verificationTextPending,
                ]}
              >
                {isVerified ? 'Verified Owner Partner' : 'Verification Under Review'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.editProfileBtn} onPress={handleOpenEdit}>
          <Ionicons name="create-outline" size={15} color={THEME.colors.primary} />
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Account Details Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Details</Text>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color={THEME.colors.textSecondary} />
          <Text style={styles.infoLabel}>Phone Number</Text>
          <Text style={styles.infoVal}>{profile?.phone || 'Not provided'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={16} color={THEME.colors.textSecondary} />
          <Text style={styles.infoLabel}>Company / Trust</Text>
          <Text style={styles.infoVal}>{profile?.college_or_company || 'Independent Owner'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={THEME.colors.textSecondary} />
          <Text style={styles.infoLabel}>Operating City</Text>
          <Text style={styles.infoVal}>{profile?.city || 'Pune, Maharashtra'}</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Ionicons name="shield-outline" size={16} color={THEME.colors.textSecondary} />
          <Text style={styles.infoLabel}>Account Role</Text>
          <Text style={styles.infoVal}>Hostel Property Partner</Text>
        </View>

        {/* Verification Action Button */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isVerified ? '#F0FDF4' : '#FFFBEB',
            padding: 12,
            borderRadius: 10,
            marginTop: 12,
            borderWidth: 1,
            borderColor: isVerified ? '#BBF7D0' : '#FDE68A',
            gap: 10,
          }}
          onPress={onNavigateToVerification}
        >
          <Ionicons
            name={isVerified ? 'shield-checkmark' : 'id-card-outline'}
            size={20}
            color={isVerified ? '#16A34A' : '#D97706'}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: isVerified ? '#166534' : '#92400E' }}>
              {isVerified ? 'Partner Verification Approved' : 'Submit Property Verification'}
            </Text>
            <Text style={{ fontSize: 11, color: isVerified ? '#15803D' : '#B45309', marginTop: 2 }}>
              {isVerified
                ? 'Your Pune listings show the official StayDirect Partner Badge.'
                : 'Upload electricity bill or property tax receipt for admin review.'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={isVerified ? '#16A34A' : '#D97706'} />
        </TouchableOpacity>
      </View>

      {/* Zero Brokerage Promise Banner */}
      <View style={styles.brokerageCard}>
        <View style={styles.brokerageHeader}>
          <Ionicons name="sparkles" size={18} color={THEME.colors.accent} />
          <Text style={styles.brokerageTitle}>100% Direct & Zero Brokerage</Text>
        </View>
        <Text style={styles.brokerageSub}>
          StayDirect guarantees zero commissions on student bookings. You deal directly with students and parents in Pune.
        </Text>
      </View>

      {/* Dev Switcher for Seamless Testing */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Application Modes</Text>
        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => {
            switchDevRole('student');
            onSwitchToStudentView?.();
          }}
        >
          <View style={styles.switchIconBox}>
            <Ionicons name="school" size={18} color={THEME.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Switch to Student Discovery Mode</Text>
            <Text style={styles.switchSub}>
              Browse Pune hostels from a student's perspective
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 10, paddingTop: 10 }]}
          onPress={() => {
            switchDevRole('admin');
            onSwitchToAdminView?.();
          }}
        >
          <View style={[styles.switchIconBox, { backgroundColor: '#1E293B' }]}>
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Switch to Admin Control Panel</Text>
            <Text style={styles.switchSub}>
              Review verifications, moderate listings, handle reports & users
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Help & Support */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Help & Support (Pune Desk)</Text>

        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() => handleContactSupport('whatsapp')}
        >
          <Ionicons name="logo-whatsapp" size={18} color={THEME.colors.whatsapp} />
          <Text style={styles.supportBtnText}>WhatsApp Partner Support</Text>
          <Ionicons name="open-outline" size={14} color={THEME.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() => handleContactSupport('call')}
        >
          <Ionicons name="call-outline" size={18} color={THEME.colors.primary} />
          <Text style={styles.supportBtnText}>Call Pune Partner Helpline</Text>
          <Ionicons name="open-outline" size={14} color={THEME.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.supportBtn, { borderBottomWidth: 0 }]}
          onPress={() => handleContactSupport('email')}
        >
          <Ionicons name="mail-outline" size={18} color={THEME.colors.primary} />
          <Text style={styles.supportBtnText}>Email Support</Text>
          <Ionicons name="open-outline" size={14} color={THEME.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <AppButton
        title="Log Out of StayDirect"
        onPress={handleSignOut}
        variant="danger"
        size="md"
        leftIcon="log-out-outline"
        style={{ marginTop: 8 }}
      />

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Owner Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <AppInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Ramesh Kulkarni"
              required
            />

            <AppInput
              label="Contact Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 98220 12345"
              keyboardType="phone-pad"
              helperText="Students will reach you at this number."
            />

            <AppInput
              label="Company / Hostel Trust"
              value={company}
              onChangeText={setCompany}
              placeholder="e.g. Kulkarni Hospitality Services"
            />

            <AppInput
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="Pune"
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                onPress={() => setIsEditModalOpen(false)}
                variant="outline"
                size="md"
                style={{ flex: 1 }}
              />
              <AppButton
                title="Save Changes"
                onPress={handleSaveProfile}
                variant="primary"
                size="md"
                isLoading={isSaving}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default OwnerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    ...THEME.shadows.soft,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: THEME.colors.secondaryDark,
  },
  headerTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  emailText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  verificationBadgeVerified: {
    backgroundColor: '#DCFCE7',
  },
  verificationBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  verificationText: {
    fontSize: 10,
    fontWeight: '800',
  },
  verificationTextVerified: {
    color: '#15803D',
  },
  verificationTextPending: {
    color: '#D97706',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 9,
    borderRadius: 8,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  sectionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    ...THEME.shadows.soft,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  brokerageCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    marginBottom: 16,
    ...THEME.shadows.medium,
  },
  brokerageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  brokerageTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.white,
  },
  brokerageSub: {
    fontSize: 11,
    color: THEME.colors.secondary,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  switchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  switchSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    gap: 10,
  },
  supportBtnText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 20,
    ...THEME.shadows.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});
