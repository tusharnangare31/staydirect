import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';

export interface OwnerStatCardProps {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  colorTheme?: 'primary' | 'sage' | 'accent' | 'gold';
  subtitle?: string;
  onPress?: () => void;
}

export const OwnerStatCard: React.FC<OwnerStatCardProps> = ({
  label,
  value,
  icon,
  colorTheme = 'primary',
  subtitle,
  onPress,
}) => {
  const getThemeStyles = () => {
    switch (colorTheme) {
      case 'sage':
        return {
          bg: THEME.colors.secondary,
          iconBg: '#C7DEC1',
          iconColor: THEME.colors.primary,
          valColor: THEME.colors.primary,
          labelColor: THEME.colors.primaryLight,
        };
      case 'accent':
      case 'gold':
        return {
          bg: '#FBF6EE',
          iconBg: '#F3E4CF',
          iconColor: THEME.colors.accent,
          valColor: THEME.colors.textPrimary,
          labelColor: THEME.colors.textSecondary,
        };
      case 'primary':
      default:
        return {
          bg: THEME.colors.surface,
          iconBg: THEME.colors.surfaceVariant,
          iconColor: THEME.colors.primary,
          valColor: THEME.colors.textPrimary,
          labelColor: THEME.colors.textSecondary,
        };
    }
  };

  const themeStyle = getThemeStyles();
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.card, { backgroundColor: themeStyle.bg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: themeStyle.iconBg }]}>
          <Ionicons name={icon} size={18} color={themeStyle.iconColor} />
        </View>
        <Text style={[styles.value, { color: themeStyle.valColor }]}>{value}</Text>
      </View>

      <Text style={[styles.label, { color: themeStyle.labelColor }]} numberOfLines={1}>
        {label}
      </Text>

      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    padding: 14,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.soft,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
});
