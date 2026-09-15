import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { VerificationStatus } from '../../src/types/database.types';

export interface ListingStatusBadgeProps {
  verificationStatus: VerificationStatus;
  isPublished?: boolean;
}

export const ListingStatusBadge: React.FC<ListingStatusBadgeProps> = ({
  verificationStatus,
  isPublished,
}) => {
  // Determine badge config
  if (verificationStatus === 'verified' && isPublished) {
    return (
      <View style={[styles.badge, styles.badgeActive]}>
        <Ionicons name="checkmark-circle" size={12} color="#15803D" />
        <Text style={[styles.text, styles.textActive]}>Active</Text>
      </View>
    );
  }

  if (verificationStatus === 'verified' && !isPublished) {
    return (
      <View style={[styles.badge, styles.badgeUnpublished]}>
        <Ionicons name="pause-circle" size={12} color="#B45309" />
        <Text style={[styles.text, styles.textUnpublished]}>Unpublished</Text>
      </View>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <View style={[styles.badge, styles.badgeRejected]}>
        <Ionicons name="close-circle" size={12} color="#B91C1C" />
        <Text style={[styles.text, styles.textRejected]}>Rejected</Text>
      </View>
    );
  }

  if (!isPublished && verificationStatus === 'pending') {
    return (
      <View style={[styles.badge, styles.badgeDraft]}>
        <Ionicons name="document-text" size={12} color="#5C6470" />
        <Text style={[styles.text, styles.textDraft]}>Draft</Text>
      </View>
    );
  }

  // Pending verification
  return (
    <View style={[styles.badge, styles.badgePending]}>
      <Ionicons name="time" size={12} color="#D97706" />
      <Text style={[styles.text, styles.textPending]}>Verification Pending</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
  },
  textActive: {
    color: '#15803D',
  },
  badgeUnpublished: {
    backgroundColor: '#FEF3C7',
  },
  textUnpublished: {
    color: '#B45309',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  textRejected: {
    color: '#B91C1C',
  },
  badgeDraft: {
    backgroundColor: '#F1EFE6',
  },
  textDraft: {
    color: '#5C6470',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  textPending: {
    color: '#D97706',
  },
});
