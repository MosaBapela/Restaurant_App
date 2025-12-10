export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  foodItemId: string;
  foodItemName: string;
  quantity: number;
  price: number;
  customization: CartItemCustomization;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userContact: string;
  items: OrderItem[];
  deliveryAddress: Address;
  paymentCard: PaymentCard;
  totalAmount: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  estimatedDeliveryTime?: number;
}