export const FOOD_CATEGORIES: FoodCategory[] = [
  'Burgers',
  'Pizza',
  'Dessert',
  'Beverages',
  'Alcohols',
  'Mains',
  'Starters',
];

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const CURRENCY_SYMBOL = 'R';

export const TAX_RATE = 0.15; // 15% VAT
export const DELIVERY_FEE = 45; // R45 delivery fee