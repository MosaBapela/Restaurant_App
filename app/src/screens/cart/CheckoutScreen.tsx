import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CartSummary } from '../../components/cart/CartSummary';
import { AddressSelector } from '../../components/checkout/AddressSelector';
import { OrderSummary } from '../../components/checkout/OrderSummary';
import { PaymentMethodSelector } from '../../components/checkout/PaymentMethodSelector';
import { Button } from '../../components/common/Button';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearCart } from '../../redux/slices/cartSlice';
import { placeOrderStart, placeOrderSuccess } from '../../redux/slices/orderSlice';
import { setSelectedAddress, setSelectedCard } from '../../redux/slices/profileSlice';
import { colors, spacing, typography } from '../../theme';
import { Order, OrderItem } from '../../types/order.types';
import { Address, PaymentCard } from '../../types/user.types';

type Props = NativeStackScreenProps<any, 'Checkout'>;

export const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const { selectedAddress, selectedCard } = useAppSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default address and card on mount
    if (user && !selectedAddress) {
      const defaultAddress = user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
      if (defaultAddress) {
        dispatch(setSelectedAddress(defaultAddress));
      }
    }
    if (user && !selectedCard) {
      const defaultCard = user.paymentCards.find((card) => card.isDefault) || user.paymentCards[0];
      if (defaultCard) {
        dispatch(setSelectedCard(defaultCard));
      }
    }
  }, [user]);

  const handleSelectAddress = (address: Address) => {
    dispatch(setSelectedAddress(address));
  };

  const handleSelectCard = (card: PaymentCard) => {
    dispatch(setSelectedCard(card));
  };

  const handleAddNewAddress = () => {
    navigation.navigate('Profile', { screen: 'ManageAddresses', params: { addNew: true } });
  };

  const handleAddNewCard = () => {
    navigation.navigate('Profile', { screen: 'ManageCards', params: { addNew: true } });
  };

  const calculateTotal = () => {
    const tax = totalAmount * 0.15;
    const delivery = 45;
    return totalAmount + tax + delivery;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address');
      return;
    }
    if (!selectedCard) {
      Alert.alert('Payment Required', 'Please select a payment method');
      return;
    }

    setLoading(true);
    dispatch(placeOrderStart());

    // Simulate API call
    setTimeout(() => {
      const orderItems: OrderItem[] = items.map((item) => ({
        foodItemId: item.foodItem.id,
        foodItemName: item.foodItem.name,
        quantity: item.quantity,
        price: item.totalPrice,
        customization: item.customization,
      }));

      const newOrder: Order = {
        id: `ORD${Date.now()}`,
        userId: user!.uid,
        userName: `${user!.name} ${user!.surname}`,
        userEmail: user!.email,
        userContact: user!.contactNumber,
        items: orderItems,
        deliveryAddress: selectedAddress,
        paymentCard: selectedCard,
        totalAmount: calculateTotal(),
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        estimatedDeliveryTime: Date.now() + 45 * 60 * 1000, // 45 minutes
      };

      dispatch(placeOrderSuccess(newOrder));
      dispatch(clearCart());
      setLoading(false);
      navigation.replace('OrderSuccess', { orderId: newOrder.id });
    }, 2000);
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <OrderSummary items={items} />

        {/* Delivery Address */}
        <AddressSelector
          addresses={user.addresses}
          selectedAddress={selectedAddress}
          onSelectAddress={handleSelectAddress}
          onAddNew={handleAddNewAddress}
        />

        {/* Payment Method */}
        <PaymentMethodSelector
          cards={user.paymentCards}
          selectedCard={selectedCard}
          onSelectCard={handleSelectCard}
          onAddNew={handleAddNewCard}
        />

        {/* Price Summary */}
        <CartSummary subtotal={totalAmount} showDelivery={true} />

        {/* Terms */}
        <Text style={styles.terms}>
          By placing this order, you agree to our Terms & Conditions and Privacy Policy
        </Text>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <Button
          title={`Place Order • R ${calculateTotal().toFixed(2)}`}
          onPress={handlePlaceOrder}
          loading={loading}
          fullWidth
          disabled={!selectedAddress || !selectedCard}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  terms: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});