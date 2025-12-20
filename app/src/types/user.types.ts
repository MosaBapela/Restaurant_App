export interface PaymentCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  isDefault: boolean;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  surname: string;
  contactNumber: string;
  addresses: Address[];
  paymentCards: PaymentCard[];
  createdAt: number;
  isAdmin?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}