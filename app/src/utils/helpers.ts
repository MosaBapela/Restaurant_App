import { CURRENCY_SYMBOL, DELIVERY_FEE, TAX_RATE } from './constants';

/**
 * Format price with currency symbol
 */
export const formatPrice = (price: number): string => {
  return `${CURRENCY_SYMBOL} ${price.toFixed(2)}`;
};

/**
 * Calculate tax amount
 */
export const calculateTax = (subtotal: number): number => {
  return subtotal * TAX_RATE;
};

/**
 * Calculate total with tax and delivery
 */
export const calculateTotal = (
  subtotal: number,
  includeDelivery: boolean = false
): number => {
  const tax = calculateTax(subtotal);
  const delivery = includeDelivery ? DELIVERY_FEE : 0;
  return subtotal + tax + delivery;
};

/**
 * Format date to readable string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate unique ID
 */
export const generateId = (prefix: string = ''): string => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

/**
 * Mask card number
 */
export const maskCardNumber = (cardNumber: string): string => {
  return cardNumber.replace(/(\d{4})\d{8}(\d{4})/, '$1 **** **** $2');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (South African format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Calculate estimated delivery time
 */
export const calculateEstimatedDelivery = (orderTime: number): number => {
  return orderTime + 45 * 60 * 1000; // 45 minutes
};

/**
 * Get time difference in minutes
 */
export const getTimeDifferenceInMinutes = (
  startTime: number,
  endTime: number
): number => {
  return Math.floor((endTime - startTime) / (1000 * 60));
};
