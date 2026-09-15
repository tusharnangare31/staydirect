import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const isInteractive = !isLoading && !disabled;

  // Variant Styles
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: THEME.colors.secondary,
          borderColor: THEME.colors.secondaryDark,
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: THEME.colors.primary,
          borderWidth: 1.5,
        };
      case 'danger':
        return {
          backgroundColor: THEME.colors.error,
          borderColor: THEME.colors.error,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'primary':
      default:
        return {
          backgroundColor: THEME.colors.primary,
          borderColor: THEME.colors.primaryDark,
          borderWidth: 1,
        };
    }
  };

  // Text color based on variant
  const getTextColor = (): string => {
    switch (variant) {
      case 'secondary':
        return THEME.colors.primary;
      case 'outline':
      case 'ghost':
        return THEME.colors.primary;
      case 'danger':
      case 'primary':
      default:
        return THEME.colors.white;
    }
  };

  // Padding based on size
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 14, minHeight: 36 };
      case 'lg':
        return { paddingVertical: 14, paddingHorizontal: 22, minHeight: 52 };
      case 'md':
      default:
        return { paddingVertical: 11, paddingHorizontal: 18, minHeight: 46 };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 15;
      case 'md':
      default:
        return 13;
    }
  };

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getContainerStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={getFontSize() + 3}
              color={textColor}
              style={styles.leftIcon}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize: getFontSize() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={getFontSize() + 3}
              color={textColor}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    marginLeft: 6,
  },
});
