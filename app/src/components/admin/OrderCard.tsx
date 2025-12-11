import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Order, OrderStatus } from '../../types/order.types';
import { CURRENCY_SYMBOL } from '../../utils/constants';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: colors.warning,
  confirmed: colors.secondary,
  preparing: colors.primary,
  out_for_delivery: colors.accent,
  delivered: colors.success,
  cancelled: colors.error,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onUpdateStatus,
}) => {
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'out_for_delivery',
      out_for_delivery: 'delivered',
      delivered: null,
      cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
          <Text style={styles.userName}>{order.userName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[order.status] },
          ]}
        >
          <Text style={styles.statusText}>{STATUS_LABELS[order.status]}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={16} color={colors.darkGray} />
          <Text style={styles.infoText}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={colors.darkGray} />
          <Text style={styles.infoText} numberOfLines={1}>
            {order.deliveryAddress.street}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Ionicons name="fast-food-outline" size={16} color={colors.darkGray} />
          <Text style={styles.infoText}>{order.items.length} items</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.total}>
          {CURRENCY_SYMBOL} {order.totalAmount.toFixed(2)}
        </Text>
        
        {nextStatus && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onUpdateStatus(order.id, nextStatus)}
          >
            <Text style={styles.actionButtonText}>
              Mark as {STATUS_LABELS[nextStatus]}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderId: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  userName: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  content: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  total: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  actionButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});
