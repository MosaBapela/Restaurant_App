import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Extra } from '../../types/food.types';
import { CURRENCY_SYMBOL } from '../../utils/constants';

interface ExtrasOptionsProps {
  extras: Extra[];
  selectedExtras: string[];
  onToggleExtra: (extraId: string) => void;
}

export const ExtrasOptions: React.FC<ExtrasOptionsProps> = ({
  extras,
  selectedExtras,
  onToggleExtra,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Ons</Text>
        <Text style={styles.subtitle}>Extra charges apply</Text>
      </View>
      
      <View style={styles.extrasContainer}>
        {extras.map((extra) => {
          const isSelected = selectedExtras.includes(extra.id);
          
          return (
            <TouchableOpacity
              key={extra.id}
              style={[styles.extra, isSelected && styles.extraSelected]}
              onPress={() => onToggleExtra(extra.id)}
              activeOpacity={0.7}
            >
              {extra.image && (
                <Image source={{ uri: extra.image }} style={styles.extraImage} />
              )}
              <View style={styles.extraInfo}>
                <Text
                  style={[
                    styles.extraName,
                    isSelected && styles.extraNameSelected,
                  ]}
                >
                  {extra.name}
                </Text>
                <Text
                  style={[
                    styles.extraPrice,
                    isSelected && styles.extraPriceSelected,
                  ]}
                >
                  +{CURRENCY_SYMBOL} {extra.price.toFixed(2)}
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                )}
              </View>
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
  extrasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  extra: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
  },
  extraSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  extraImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.sm,
  },
  extraInfo: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  extraName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    textAlign: 'center',
  },
  extraNameSelected: {
    color: colors.white,
  },
  extraPrice: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  extraPriceSelected: {
    color: colors.white,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
});
