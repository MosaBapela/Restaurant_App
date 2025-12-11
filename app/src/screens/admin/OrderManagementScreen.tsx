import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { OrderCard } from '../../components/admin/OrderCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Header } from '../../components/common/Header';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateOrderStatus } from '../../redux/slices/orderSlice';
import type { RootState } from '../../redux/store';
import { colors, spacing, typography } from '../../theme';
import { Order, OrderStatus } from '../../types/order.types';

type Props = NativeStackScreenProps<any, 'OrderManagement'>;

const STATUS_FILTERS: (OrderStatus | 'all')[] = [
  'all',
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const FILTER_LABELS = {
  all: 'All',
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const OrderManagementScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state: RootState) => state.order);
  const [selectedFilter, setSelectedFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders =
    selectedFilter === 'all'
      ? orders
        : orders.filter((order: Order) => order.status === selectedFilter);

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    dispatch(updateOrderStatus({ orderId, status }));
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onPress={() => {}}
      onUpdateStatus={handleUpdateStatus}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Order Management"
        onBackPress={() => navigation.goBack()}
      />

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === item && styles.filterTextActive,
                ]}
              >
                {FILTER_LABELS[item]}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No Orders"
          message={
            selectedFilter === 'all'
              ? 'No orders have been placed yet'
              : `No ${FILTER_LABELS[selectedFilter].toLowerCase()} orders`
          }
        />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    backgroundColor: colors.white,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
  },
});