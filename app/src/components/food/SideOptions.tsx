import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { SideOption } from '../../types/food.types';

interface SideOptionsProps {
  options: SideOption[];
  selectedSides: string[];
  onSelectSide: (sideId: string) => void;
  maxSelections?: number;
}

export const SideOptions: React.FC<SideOptionsProps> = ({
  options,
  selectedSides,
  onSelectSide,
  maxSelections = 2,
}) => {
  const canSelectMore = selectedSides.length < maxSelections;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Sides</Text>
        <Text style={styles.subtitle}>
          Select up to {maxSelections} • Included in price
        </Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = selectedSides.includes(option.id);
          const canSelect = isSelected || canSelectMore;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                !canSelect && styles.optionDisabled,
              ]}
              onPress={() => onSelectSide(option.id)}
              disabled={!canSelect}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.name}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.white}
                />
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
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 12,
    padding: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.white,
  },
});