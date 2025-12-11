import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { PaymentCard } from '../../types/user.types';

interface CardDisplayProps {
  card: PaymentCard;
  onPress?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  isSelected?: boolean;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  onPress,
  onDelete,
  showActions = true,
  isSelected = false,
}) => {
  const getCardIcon = (cardNumber: string) => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'card-outline';
    if (firstDigit === '5') return 'card-outline';
    return 'card-outline';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getCardIcon(card.cardNumber)}
          size={32}
          color={colors.primary}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.cardNumber}>{card.cardNumber}</Text>
        <Text style={styles.cardHolder}>{card.cardHolder}</Text>
        <Text style={styles.expiry}>Expires: {card.expiryDate}</Text>
        {card.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      {showActions && (
        <View style={styles.actions}>
          {isSelected && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
            </View>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.lightGray,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  containerSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  cardNumber: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  cardHolder: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    marginBottom: 4,
  },
  expiry: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  defaultText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkmark: {
    marginRight: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});