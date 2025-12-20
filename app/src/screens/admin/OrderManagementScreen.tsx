import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
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
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import type { RootState } from '../../redux/store';
import { auth } from '../../services/firebase/config';
import { fetchAllOrders as serviceFetchAllOrders, updateOrderStatus as serviceUpdateOrderStatus } from '../../services/firebase/orderService';
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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredOrders =
    selectedFilter === 'all'
      ? orders
        : orders.filter((order: Order) => order.status === selectedFilter);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    // Optimistic update in Redux
    dispatch(updateOrderStatus({ orderId, status }));
    try {
      await serviceUpdateOrderStatus(orderId, status);
    } catch (err: any) {
      // Log auth state for debugging
      // eslint-disable-next-line no-console
      console.debug('[OrderManagement] update status failed for', { orderId, uid: auth?.currentUser?.uid ?? null });
      // eslint-disable-next-line no-console
      console.warn('[OrderManagement] update status failed, refreshing orders', err);
      // rollback by reloading orders from server
      try {
        const list = await serviceFetchAllOrders();
        dispatch(setOrders(list));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[OrderManagement] refresh after failed update also failed', e);
      }
      Alert.alert('Error', err?.message || 'Failed to update order status');
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const list = await serviceFetchAllOrders();
      dispatch(setOrders(list));
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('[OrderManagement] fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const list = await serviceFetchAllOrders();
      dispatch(setOrders(list));
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('[OrderManagement] refresh failed', err);
    } finally {
      setRefreshing(false);
    }
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
      {loading && <LoadingSpinner />}
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
          refreshing={refreshing}
          onRefresh={onRefresh}
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