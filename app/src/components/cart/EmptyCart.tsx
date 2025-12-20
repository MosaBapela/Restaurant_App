import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../common/Button';

interface EmptyCartProps {
  onStartShopping: () => void;
}

export const EmptyCart: React.FC<EmptyCartProps> = ({ onStartShopping }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="cart-outline" size={120} color={colors.gray} />
      </View>
      
      <Text style={styles.title}>Your cart is empty</Text>
      <Text style={styles.message}>
        Looks like you haven't added any items to your cart yet
      </Text>
      
      <Button
        title="Start Shopping"
        onPress={onStartShopping}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  button: {
    minWidth: 200,
  },
});