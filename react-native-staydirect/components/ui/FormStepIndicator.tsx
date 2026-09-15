import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';

export interface FormStepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  stepTitles?: string[];
}

const DEFAULT_TITLES = ['Basic Info', 'Rooms & Rent', 'Photos & Amenities', 'Location & Publish'];

export const FormStepIndicator: React.FC<FormStepIndicatorProps> = ({
  currentStep,
  totalSteps = 4,
  stepTitles = DEFAULT_TITLES,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }, (_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={stepNumber}>
              {/* Step Circle */}
              <View style={styles.stepCol}>
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isActive && styles.circleActive,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color={THEME.colors.white} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumText,
                        isActive && styles.stepNumTextActive,
                      ]}
                    >
                      {stepNumber}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                    isCompleted && styles.stepLabelCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {stepTitles[idx] || `Step ${stepNumber}`}
                </Text>
              </View>

              {/* Connecting Line */}
              {stepNumber < totalSteps && (
                <View
                  style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 76,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  circleCompleted: {
    borderColor: THEME.colors.success,
    backgroundColor: THEME.colors.success,
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  stepNumTextActive: {
    color: THEME.colors.white,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  stepLabelCompleted: {
    color: THEME.colors.success,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: THEME.colors.borderLight,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  lineCompleted: {
    backgroundColor: THEME.colors.success,
  },
});
