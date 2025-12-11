import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { CartItem } from '../../types/cart.types';
import { CURRENCY_SYMBOL } from '../../utils/constants';

interface OrderSummaryProps {
  items: CartItem[];
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.foodItem.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {CURRENCY_SYMBOL} {item.totalPrice.toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  itemsList: {
    maxHeight: 200,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: typography.sizes.base,
    color: colors.text,
    flex: 1,
  },
  itemQuantity: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    marginLeft: spacing.sm,
  },
  itemPrice: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});