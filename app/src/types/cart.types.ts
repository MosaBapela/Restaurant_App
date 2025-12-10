export interface CartItemCustomization {
  selectedSides: string[];
  selectedDrink: string | null;
  selectedExtras: string[];
  removedIngredients: string[];
}

export interface CartItem {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  customization: CartItemCustomization;
  totalPrice: number;
  timestamp: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}
