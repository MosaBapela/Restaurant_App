import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Address } from '../../types/user.types';

interface AddressCardProps {
  address: Address;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  isSelected?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
  isSelected = false,
}) => {
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
        <Ionicons name="location" size={24} color={colors.primary} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.street}>{address.street}</Text>
        <Text style={styles.details}>
          {address.city}, {address.province} {address.postalCode}
        </Text>
        {address.isDefault && (
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
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="pencil-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
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
  street: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  details: {
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
    gap: spacing.xs,
  },
  checkmark: {
    marginRight: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
});
