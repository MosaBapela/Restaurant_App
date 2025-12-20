import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { CartItem as CartItemType } from '../../types/cart.types';
import { CURRENCY_SYMBOL } from '../../utils/constants';
import { QuantitySelector } from '../food/QuantitySelector';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onEdit: (item: CartItemType) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onEdit,
}) => {
  const hasCustomizations =
    item.customization.selectedSides.length > 0 ||
    item.customization.selectedExtras.length > 0 ||
    item.customization.removedIngredients.length > 0 ||
    item.customization.selectedDrink;

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.foodItem.image }} style={styles.image} />
      
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.foodItem.name}
          </Text>
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.price}>
          {CURRENCY_SYMBOL} {item.totalPrice.toFixed(2)}
        </Text>
        
        {hasCustomizations && (
          <View style={styles.customizations}>
            {item.customization.selectedSides.length > 0 && (
              <Text style={styles.customizationText}>
                Sides: {item.customization.selectedSides.join(', ')}
              </Text>
            )}
            {item.customization.selectedDrink && (
              <Text style={styles.customizationText}>
                Drink: {item.customization.selectedDrink}
              </Text>
            )}
            {item.customization.selectedExtras.length > 0 && (
              <Text style={styles.customizationText}>
                Extras: {item.customization.selectedExtras.join(', ')}
              </Text>
            )}
            {item.customization.removedIngredients.length > 0 && (
              <Text style={styles.customizationText}>
                No: {item.customization.removedIngredients.join(', ')}
              </Text>
            )}
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Text style={styles.editText}>Edit customization</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.footer}>
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={() => onUpdateQuantity(item.id, item.quantity + 1)}
            onDecrement={() => onUpdateQuantity(item.id, item.quantity - 1)}
            min={1}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  removeButton: {
    padding: spacing.xs,
  },
  price: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  customizations: {
    marginBottom: spacing.sm,
  },
  customizationText: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    marginBottom: 2,
  },
  editText: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});