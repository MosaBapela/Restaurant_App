export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Process payment
 * Replace with actual payment gateway integration
 */
export const processPayment = async (
  amount: number,
  cardToken: string
): Promise<PaymentResult> => {
  try {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock success response
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment failed',
    };
  }
};

/**
 * Refund payment
 * Replace with actual payment gateway integration
 */
export const refundPayment = async (
  transactionId: string
): Promise<PaymentResult> => {
  try {
    // Simulate refund processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      transactionId: `ref_${Date.now()}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Refund failed',
    };
  }
};

/**
 * Validate card
 * Basic validation before payment
 */
export const validateCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
};