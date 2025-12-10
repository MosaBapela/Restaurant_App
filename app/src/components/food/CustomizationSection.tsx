import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface CustomizationSectionProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
  isRemovable?: boolean;
}

export const CustomizationSection: React.FC<CustomizationSectionProps> = ({
  title,
  options,
  selectedOptions,
  onToggleOption,
  isRemovable = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);
          
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                isRemovable && isSelected && styles.optionRemoved,
              ]}
              onPress={() => onToggleOption(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  isRemovable && isSelected && styles.optionTextRemoved,
                ]}
              >
                {option}
              </Text>
              {isRemovable && isSelected && (
                <Ionicons name="close-circle" size={18} color={colors.error} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  optionRemoved: {
    backgroundColor: colors.lightGray,
    borderColor: colors.error,
  },
  optionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  optionTextRemoved: {
    textDecorationLine: 'line-through',
    color: colors.darkGray,
  },
});
