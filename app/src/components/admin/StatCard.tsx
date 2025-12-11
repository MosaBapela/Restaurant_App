import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  change,
  changeType,
  iconColor = colors.primary,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      
      {change && (
        <View style={styles.changeContainer}>
          <Ionicons
            name={changeType === 'increase' ? 'trending-up' : 'trending-down'}
            size={16}
            color={changeType === 'increase' ? colors.accent : colors.error}
          />
          <Text
            style={[
              styles.change,
              {
                color: changeType === 'increase' ? colors.accent : colors.error,
              },
            ]}
          >
            {change}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    flex: 1,
    minWidth: 150,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  change: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
