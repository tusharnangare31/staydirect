import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

export type FeedbackStateType =
  | 'offline'
  | 'no_results'
  | 'payment_failed'
  | 'booking_failed'
  | 'upload_failed'
  | 'unauthorized'
  | 'server_error'
  | 'pending_verification'
  | 'no_favorites';

interface StateFeedbackProps {
  type: FeedbackStateType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  isRetrying?: boolean;
}

const CONFIG: Record<
  FeedbackStateType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    bgCircle: string;
    defaultTitle: string;
    defaultMessage: string;
    retryLabel?: string;
  }
> = {
  offline: {
    icon: 'cloud-offline-outline',
    iconColor: '#D97706',
    bgCircle: '#FEF3C7',
    defaultTitle: 'No Internet Connection',
    defaultMessage: 'Please check your Wi-Fi or mobile data network to browse verified Pune hostels.',
    retryLabel: 'Check Connection',
  },
  no_results: {
    icon: 'search-outline',
    iconColor: THEME.colors.primary,
    bgCircle: '#ECFDF5',
    defaultTitle: 'No Matching Hostels Found',
    defaultMessage: 'Try adjusting your budget, sharing preferences, or selecting another student area.',
    retryLabel: 'Reset Filters',
  },
  payment_failed: {
    icon: 'alert-circle-outline',
    iconColor: '#DC2626',
    bgCircle: '#FEE2E2',
    defaultTitle: 'Payment Incomplete',
    defaultMessage: 'Your transaction could not be processed. If funds were debited, Razorpay will auto-refund within 2-3 business days.',
    retryLabel: 'Retry Payment',
  },
  booking_failed: {
    icon: 'close-circle-outline',
    iconColor: '#DC2626',
    bgCircle: '#FEE2E2',
    defaultTitle: 'Booking Request Unsuccessful',
    defaultMessage: 'The selected sharing bed may have recently filled up. Please select an alternate room or contact the owner.',
    retryLabel: 'Try Again',
  },
  upload_failed: {
    icon: 'cloud-upload-outline',
    iconColor: '#DC2626',
    bgCircle: '#FEE2E2',
    defaultTitle: 'Image Upload Failed',
    defaultMessage: 'Could not upload property image. Please ensure photo is under 5MB and your network is stable.',
    retryLabel: 'Retry Upload',
  },
  unauthorized: {
    icon: 'lock-closed-outline',
    iconColor: '#7C3AED',
    bgCircle: '#EDE9FE',
    defaultTitle: 'Authentication Required',
    defaultMessage: 'Please sign in or create an account to access this feature or book rooms directly.',
    retryLabel: 'Sign In Now',
  },
  server_error: {
    icon: 'server-outline',
    iconColor: '#DC2626',
    bgCircle: '#FEE2E2',
    defaultTitle: 'Temporary Service Hiccup',
    defaultMessage: 'Our servers are taking longer than usual to respond. Rest assured, your data is safe.',
    retryLabel: 'Refresh Page',
  },
  pending_verification: {
    icon: 'time-outline',
    iconColor: '#D97706',
    bgCircle: '#FEF3C7',
    defaultTitle: 'Verification Under Review',
    defaultMessage: 'Our Pune operations team is auditing your property tax and electricity bill. Listings become public once approved.',
    retryLabel: 'Check Status',
  },
  no_favorites: {
    icon: 'heart-outline',
    iconColor: '#EC4899',
    bgCircle: '#FDF2F8',
    defaultTitle: 'No Saved Hostels Yet',
    defaultMessage: 'Tap the heart icon on any Pune hostel card to save it for quick comparison later.',
    retryLabel: 'Explore Hostels',
  },
};

export const StateFeedback: React.FC<StateFeedbackProps> = ({
  type,
  title,
  message,
  onRetry,
  onSecondaryAction,
  secondaryActionLabel,
  isRetrying = false,
}) => {
  const cfg = CONFIG[type] || CONFIG.server_error;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={[styles.iconCircle, { backgroundColor: cfg.bgCircle }]}>
        <Ionicons name={cfg.icon} size={36} color={cfg.iconColor} />
      </View>
      <Text style={styles.title}>{title || cfg.defaultTitle}</Text>
      <Text style={styles.message}>{message || cfg.defaultMessage}</Text>

      <View style={styles.buttonRow}>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={onRetry}
            disabled={isRetrying}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={cfg.retryLabel || 'Retry'}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.retryText}>{cfg.retryLabel || 'Try Again'}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {onSecondaryAction && secondaryActionLabel && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onSecondaryAction}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={secondaryActionLabel}
          >
            <Text style={styles.secondaryText}>{secondaryActionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 320,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
});
