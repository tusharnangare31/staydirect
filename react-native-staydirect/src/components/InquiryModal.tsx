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
import { useStudentInquiries } from '../hooks/useUserInteractions';
import { useAuth } from '../context/AuthContext';

interface InquiryModalProps {
  visible: boolean;
  onClose: () => void;
  hostel: Hostel;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  visible,
  onClose,
  hostel,
}) => {
  const { user } = useAuth();
  const { createInquiry } = useStudentInquiries();

  const [visitDate, setVisitDate] = useState('Tomorrow');
  const [visitTime, setVisitTime] = useState('4:00 PM - 6:00 PM');
  const [preferredSharing, setPreferredSharing] = useState('Double Sharing');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitInquiry = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please sign in to schedule a visit with the owner.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createInquiry({
        hostel_id: hostel.id,
        owner_id: hostel.owner_id,
        preferred_sharing: preferredSharing,
        visit_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        visit_time: visitTime,
        message: message.trim() || 'Interested in scheduling a visit.',
      });

      Alert.alert(
        'Visit Scheduled! 📅',
        `Your visit request has been sent to ${hostel.owner?.full_name || 'the owner'} directly without broker involvement. You will receive a confirmation call shortly.`,
        [{ text: 'Done', onPress: onClose }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not schedule visit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              <Text style={styles.title}>Schedule Free Hostel Visit</Text>
              <Text style={styles.subTitle} numberOfLines={1}>
                {hostel.name} • {hostel.area}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Direct owner badge */}
            <View style={styles.ownerBadge}>
              <Ionicons name="person-circle" size={32} color={THEME.colors.primary} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.ownerName}>{hostel.owner?.full_name || 'Verified Property Owner'}</Text>
                <Text style={styles.ownerSub}>Free guided visit • Zero brokerage fee</Text>
              </View>
            </View>

            {/* Visit Day */}
            <Text style={styles.sectionLabel}>When would you like to visit?</Text>
            <View style={styles.chipsRow}>
              {['Today Evening', 'Tomorrow', 'This Saturday', 'This Sunday'].map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setVisitDate(d)}
                  style={[styles.chip, visitDate === d && styles.chipActive]}
                >
                  <Text style={[styles.chipText, visitDate === d && styles.chipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time Slot */}
            <Text style={styles.sectionLabel}>Preferred Time Slot</Text>
            <View style={styles.chipsRow}>
              {[
                '10:00 AM - 12:00 PM',
                '2:00 PM - 4:00 PM',
                '4:00 PM - 6:00 PM',
                '6:00 PM - 8:00 PM',
              ].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setVisitTime(t)}
                  style={[styles.chip, visitTime === t && styles.chipActive]}
                >
                  <Text style={[styles.chipText, visitTime === t && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preferred Sharing */}
            <Text style={styles.sectionLabel}>Room Interested In</Text>
            <View style={styles.chipsRow}>
              {['Single Room', 'Double Sharing', 'Triple Sharing'].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setPreferredSharing(s)}
                  style={[styles.chip, preferredSharing === s && styles.chipActive]}
                >
                  <Text style={[styles.chipText, preferredSharing === s && styles.chipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Message to Owner */}
            <Text style={styles.sectionLabel}>Message or Questions (Optional)</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="e.g. Coming with parents to inspect hygiene and mess food"
              placeholderTextColor={THEME.colors.textMuted}
              multiline
              numberOfLines={3}
              style={styles.textInput}
            />
          </ScrollView>

          {/* Footer Submit */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitInquiry}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={THEME.colors.white} />
              ) : (
                <>
                  <Ionicons name="calendar" size={18} color={THEME.colors.white} />
                  <Text style={styles.submitBtnText}>Confirm Visit Schedule</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
    maxHeight: '85%',
    paddingBottom: 24,
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
  title: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  subTitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    maxWidth: 240,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceVariant,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  ownerSub: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
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
    height: 70,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 12,
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
    fontSize: 14,
    fontWeight: '800',
  },
});
