import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { CURRENCY_SYMBOL, DELIVERY_FEE, TAX_RATE } from '../../utils/constants';

interface CartSummaryProps {
  subtotal: number;
  showDelivery?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  showDelivery = false,
}) => {
  const tax = subtotal * TAX_RATE;
  const delivery = showDelivery ? DELIVERY_FEE : 0;
  const total = subtotal + tax + delivery;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>
          {CURRENCY_SYMBOL} {subtotal.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Tax (15%)</Text>
        <Text style={styles.value}>
          {CURRENCY_SYMBOL} {tax.toFixed(2)}
        </Text>
      </View>
      
      {showDelivery && (
        <View style={styles.row}>
          <Text style={styles.label}>Delivery Fee</Text>
          <Text style={styles.value}>
            {CURRENCY_SYMBOL} {DELIVERY_FEE.toFixed(2)}
          </Text>
        </View>
      )}
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {CURRENCY_SYMBOL} {total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.base,
    color: colors.darkGray,
  },
  value: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});