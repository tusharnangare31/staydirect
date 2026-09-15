import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const { role, switchDevRole } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={THEME.colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <Ionicons name="home" size={18} color={THEME.colors.secondary} />
          </View>
        )}

        <View>
          <Text style={styles.brandTitle}>{title || 'StayDirect'}</Text>
          <View style={styles.subRow}>
            <Ionicons name="location-sharp" size={11} color={THEME.colors.accent} />
            <Text style={styles.brandSubtitle}>{subtitle || 'Pune • Zero Brokerage'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightAction || (
          <TouchableOpacity
            style={styles.roleToggle}
            onPress={() => switchDevRole(role === 'student' ? 'owner' : 'student')}
          >
            <Text style={styles.roleToggleText}>
              {role === 'student' ? '🎓 Student' : '🏢 Owner'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.primaryLight,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  backButton: {
    padding: THEME.spacing.xs,
    marginRight: THEME.spacing.xs,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: 'rgba(221, 233, 213, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(221, 233, 213, 0.25)',
  },
  brandTitle: {
    color: THEME.colors.white,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  brandSubtitle: {
    color: THEME.colors.secondary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleToggleText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
});
