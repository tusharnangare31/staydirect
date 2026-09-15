import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';

export interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  prefix?: string;
  suffix?: string;
  required?: boolean;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  prefix,
  suffix,
  required,
  multiline,
  numberOfLines,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredStar}>*</Text>}
      </View>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          !!error && styles.inputContainerError,
          multiline && styles.inputContainerMultiline,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={isFocused ? THEME.colors.primary : THEME.colors.textMuted}
            style={styles.leftIcon}
          />
        )}

        {prefix && <Text style={styles.affixText}>{prefix}</Text>}

        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor={THEME.colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
        />

        {suffix && <Text style={styles.affixText}>{suffix}</Text>}

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconBtn}
          >
            <Ionicons
              name={rightIcon}
              size={18}
              color={error ? THEME.colors.error : THEME.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle" size={13} color={THEME.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  requiredStar: {
    color: THEME.colors.error,
    marginLeft: 3,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#FAFDF9',
  },
  inputContainerError: {
    borderColor: THEME.colors.error,
    backgroundColor: '#FFF9F9',
  },
  inputContainerMultiline: {
    minHeight: 88,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  leftIcon: {
    marginRight: 8,
  },
  affixText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    paddingVertical: 8,
  },
  inputMultiline: {
    height: '100%',
  },
  rightIconBtn: {
    padding: 4,
    marginLeft: 6,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 11,
    color: THEME.colors.error,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
});
