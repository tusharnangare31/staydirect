import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useSubmitReview } from '../hooks/useReviews';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  hostelId: string;
  hostelName: string;
  bookingId?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  hostelId,
  hostelName,
  bookingId,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [foodRating, setFoodRating] = useState<number>(4);
  const [safetyRating, setSafetyRating] = useState<number>(5);
  const [locationRating, setLocationRating] = useState<number>(5);
  const [valueRating, setValueRating] = useState<number>(5);
  const [selectedImageTags, setSelectedImageTags] = useState<string[]>([]);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  const submitMutation = useSubmitReview();

  const toggleImageTag = (tag: string) => {
    setSelectedImageTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setErrorText('');
    if (!comment.trim() || comment.trim().length < 10) {
      setErrorText('Please share at least 10 characters detailing your experience.');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        hostelId,
        bookingId,
        rating,
        cleanlinessRating,
        foodRating,
        safetyRating,
        locationRating,
        valueRating,
        title: title.trim() || 'Student Verified Review',
        comment: comment.trim(),
        imageUrls: selectedImageTags,
      });
      onClose();
      setTitle('');
      setComment('');
      setSelectedImageTags([]);
    } catch (err: any) {
      setErrorText(err.message || 'Failed to submit review');
    }
  };

  const renderStarPicker = (
    currentValue: number,
    onChange: (val: number) => void,
    size: number = 28
  ) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityLabel={`Rate ${star} out of 5 stars`}
            accessibilityRole="button"
          >
            <Ionicons
              name={star <= currentValue ? 'star' : 'star-outline'}
              size={size}
              color={star <= currentValue ? '#F59E0B' : '#D1D5DB'}
              style={{ marginHorizontal: 3 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#059669" />
                  <Text style={styles.verifiedBadgeText}>VERIFIED STAY REVIEW</Text>
                </View>
              </View>
              <Text style={styles.modalTitle} numberOfLines={1}>
                Review {hostelName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close review modal"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={22} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Overall Rating Selection */}
            <View style={styles.overallRatingBox}>
              <Text style={styles.sectionLabel}>Overall Experience</Text>
              <Text style={styles.ratingNumber}>{rating}.0 / 5.0</Text>
              {renderStarPicker(rating, setRating, 34)}
            </View>

            {/* Sub-categories */}
            <View style={styles.categoryGrid}>
              <View style={styles.categoryItem}>
                <Text style={styles.catLabel}>🧹 Cleanliness</Text>
                {renderStarPicker(cleanlinessRating, setCleanlinessRating, 20)}
              </View>
              <View style={styles.categoryItem}>
                <Text style={styles.catLabel}>🛡️ Safety & CCTV</Text>
                {renderStarPicker(safetyRating, setSafetyRating, 20)}
              </View>
              <View style={styles.categoryItem}>
                <Text style={styles.catLabel}>📍 Location & Campus</Text>
                {renderStarPicker(locationRating, setLocationRating, 20)}
              </View>
              <View style={styles.categoryItem}>
                <Text style={styles.catLabel}>💰 Value for Money</Text>
                {renderStarPicker(valueRating, setValueRating, 20)}
              </View>
              <View style={styles.categoryItem}>
                <Text style={styles.catLabel}>🍲 Food / Mess</Text>
                {renderStarPicker(foodRating, setFoodRating, 20)}
              </View>
            </View>

            {/* Optional Photo / Verification Highlights */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Verified Room Features (Optional)</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {['Study Desk', 'Clean Washroom', 'High-Speed Wi-Fi', '24/7 Hot Water', 'Mess Food Quality', 'Lockers'].map((tag) => {
                  const active = selectedImageTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: active ? THEME.colors.primary : '#F1F5F9',
                        borderWidth: 1,
                        borderColor: active ? THEME.colors.primary : '#E2E8F0',
                      }}
                      onPress={() => toggleImageTag(tag)}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: active ? '#FFFFFF' : '#475569',
                        }}
                      >
                        {active ? '✓ ' : '+ '}
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Review Headline</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Spacious rooms, zero brokerage experience"
                placeholderTextColor={THEME.colors.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={80}
              />
            </View>

            {/* Detailed Feedback */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.inputLabel}>Your Feedback & Advice</Text>
                <Text style={styles.charCount}>{comment.length}/500</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Tell other Pune students about Wi-Fi speed, warden behavior, study atmosphere, and food..."
                placeholderTextColor={THEME.colors.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {errorText ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            ) : null}

            {/* Anti-brokerage assurance */}
            <View style={styles.trustBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.trustText}>
                StayDirect reviews are 100% verified. Never post contact numbers or brokers' promo codes.
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={submitMutation.isPending}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submitMutation.isPending && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={16} color="#fff" />
                    <Text style={styles.submitText}>Submit Review</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  overallRatingBox: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 6,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  categoryItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  charCount: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 90,
    paddingTop: 10,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    flex: 1,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  trustText: {
    fontSize: 12,
    color: '#065F46',
    flex: 1,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
