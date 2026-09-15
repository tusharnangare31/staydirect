import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { supabase } from '../src/lib/supabase';

export interface ReportScreenProps {
  hostelId?: string;
  hostelTitle?: string;
  reportedUserId?: string;
  reportedUserName?: string;
  onClose?: () => void;
  onSubmitted?: () => void;
}

const REPORT_REASONS = [
  { id: 'Fraudulent listing', label: 'Fraudulent or Fake Listing', icon: 'alert-circle-outline' },
  { id: 'Incorrect rent', label: 'Incorrect Rent or Hidden Brokerage', icon: 'cash-outline' },
  { id: 'Inappropriate content', label: 'Inappropriate Photos or Content', icon: 'image-outline' },
  { id: 'Suspicious user', label: 'Suspicious User or Impersonation', icon: 'person-remove-outline' },
  { id: 'Safety or harassment', label: 'Safety Concern or Harassment', icon: 'shield-outline' },
  { id: 'Other issue', label: 'Other Direct Policy Violation', icon: 'help-circle-outline' },
];

export const ReportScreen: React.FC<ReportScreenProps> = ({
  hostelId,
  hostelTitle,
  reportedUserId,
  reportedUserName,
  onClose,
  onSubmitted,
}) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].id);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim() || description.trim().length < 10) {
      Alert.alert('Details Required', 'Please provide at least 10 characters explaining the issue to help our moderation team.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Sign In Required', 'You must be signed in to submit a trust & safety report.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId || null,
        hostel_id: hostelId || null,
        reason: selectedReason,
        description: description.trim(),
        status: 'open',
      });

      if (error) {
        console.warn('Supabase report insert error:', error.message);
      }

      Alert.alert(
        'Report Filed',
        'Thank you for helping keep StayDirect safe. Our admin moderation team will investigate this report.',
        [
          {
            text: 'OK',
            onPress: () => {
              onSubmitted?.();
              onClose?.();
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Submit Report</Text>
      </View>

      {/* Target Preview */}
      <View style={styles.targetCard}>
        <Ionicons name="flag" size={20} color={THEME.colors.danger} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.targetLabel}>Reporting Target:</Text>
          <Text style={styles.targetValue} numberOfLines={1}>
            {hostelTitle ? `Hostel: ${hostelTitle}` : reportedUserName ? `User: ${reportedUserName}` : 'General Listing Policy Issue'}
          </Text>
        </View>
      </View>

      {/* Reason selector */}
      <Text style={styles.sectionHeading}>Select Reason</Text>
      <View style={styles.reasonList}>
        {REPORT_REASONS.map((r) => {
          const isSelected = selectedReason === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[styles.reasonItem, isSelected && styles.reasonItemSelected]}
              onPress={() => setSelectedReason(r.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={r.icon as any}
                size={18}
                color={isSelected ? THEME.colors.primary : THEME.colors.textSecondary}
              />
              <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>
                {r.label}
              </Text>
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={isSelected ? THEME.colors.primary : THEME.colors.border}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Details text area */}
      <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Provide Specific Details</Text>
      <Text style={styles.sectionSub}>
        Explain what happened (e.g. rent demanded, unauthorized photos, offline brokerage request):
      </Text>

      <TextInput
        style={styles.textArea}
        placeholder="Type details here (minimum 10 characters)..."
        placeholderTextColor={THEME.colors.textTertiary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.noticeBox}>
        <Ionicons name="shield-checkmark-outline" size={16} color={THEME.colors.primary} />
        <Text style={styles.noticeText}>
          StayDirect strictly enforces zero brokerage and verified direct contact. False reports or abuse of the reporting system may lead to account penalties.
        </Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <AppButton
          title={isSubmitting ? 'Submitting Report...' : 'Submit Report to Admins'}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting || description.trim().length < 10}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 20,
  },
  targetLabel: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7F1D1D',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
  },
  reasonList: {
    gap: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 10,
  },
  reasonItemSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#F0FDF4',
  },
  reasonLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: THEME.colors.textPrimary,
  },
  reasonLabelSelected: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: THEME.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    minHeight: 110,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
});
