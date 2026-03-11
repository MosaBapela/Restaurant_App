import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { EmptyState } from "../../components/common/EmptyState";
import { Header } from "../../components/common/Header";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setOrders } from "../../redux/slices/orderSlice";
import {
    fetchUserOrders,
    subscribeToUserOrders,
} from "../../services/firebase/orderService";
import { colors, spacing, typography } from "../../theme";
import { Order } from "../../types/order.types";
import { CURRENCY_SYMBOL } from "../../utils/constants";

type Props = NativeStackScreenProps<any, "OrderHistory">;

const ORDER_STATUS_COLORS = {
  pending: colors.warning,
  confirmed: colors.secondary,
  preparing: colors.primary,
  out_for_delivery: colors.accent,
  delivered: colors.success,
  cancelled: colors.error,
};

const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const OrderHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.order);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadOrders = React.useCallback(async () => {
    if (!user?.uid) return;
    setRefreshing(true);
    try {
      const list = await fetchUserOrders(user.uid);
      dispatch(setOrders(list));
    } catch (err) {
      // keep prior local state if fetch fails
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, user?.uid]);

  React.useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserOrders(
      user.uid,
      (list) => {
        dispatch(setOrders(list));
      },
      () => {
        // keep previous orders if realtime listener errors
      },
    );

    return unsubscribe;
  }, [dispatch, user?.uid]);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {}}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: ORDER_STATUS_COLORS[item.status] },
          ]}
        >
          <Text style={styles.statusText}>
            {ORDER_STATUS_LABELS[item.status]}
          </Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        <View style={styles.infoRow}>
          <Ionicons
            name="fast-food-outline"
            size={18}
            color={colors.darkGray}
          />
          <Text style={styles.infoText}>
            {item.items.length} {item.items.length === 1 ? "item" : "items"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.darkGray} />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.deliveryAddress.street}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {CURRENCY_SYMBOL} {item.totalAmount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Order History" onBackPress={() => navigation.goBack()} />

      {orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No Orders Yet"
          message="You haven't placed any orders yet. Start exploring our menu!"
        />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={loadOrders}
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
  listContent: {
    padding: spacing.md,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  orderId: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
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
  orderContent: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    flex: 1,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: typography.sizes.base,
    color: colors.darkGray,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});
