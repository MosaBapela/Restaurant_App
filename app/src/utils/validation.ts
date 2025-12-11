export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  return { isValid: true };
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return {
      isValid: false,
      error: 'Invalid phone number format (e.g., 0821234567)',
    };
  }
  return { isValid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  if (name.length < 2) {
    return {
      isValid: false,
      error: `${fieldName} must be at least 2 characters`,
    };
  }
  return { isValid: true };
};

/**
 * Validate card number
 */
export const validateCardNumber = (cardNumber: string): ValidationResult => {
  if (!cardNumber) {
    return { isValid: false, error: 'Card number is required' };
  }
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length !== 16) {
    return { isValid: false, error: 'Card number must be 16 digits' };
  }
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Card number must contain only digits' };
  }
  return { isValid: true };
};

/**
 * Validate expiry date
 */
export const validateExpiryDate = (expiry: string): ValidationResult => {
  if (!expiry) {
    return { isValid: false, error: 'Expiry date is required' };
  }
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(expiry)) {
    return { isValid: false, error: 'Invalid expiry format (MM/YY)' };
  }
  const [month, year] = expiry.split('/').map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }
  return { isValid: true };
};

/**
 * Validate CVV
 */
export const validateCVV = (cvv: string): ValidationResult => {
  if (!cvv) {
    return { isValid: false, error: 'CVV is required' };
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return { isValid: false, error: 'CVV must be 3 or 4 digits' };
  }
  return { isValid: true };
};

/**
 * Validate address
 */
export const validateAddress = (address: {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}): ValidationResult => {
  if (!address.street) {
    return { isValid: false, error: 'Street address is required' };
  }
  if (!address.city) {
    return { isValid: false, error: 'City is required' };
  }
  if (!address.province) {
    return { isValid: false, error: 'Province is required' };
  }
  if (!address.postalCode) {
    return { isValid: false, error: 'Postal code is required' };
  }
  if (!/^\d{4}$/.test(address.postalCode)) {
    return { isValid: false, error: 'Postal code must be 4 digits' };
  }
  return { isValid: true };
};
