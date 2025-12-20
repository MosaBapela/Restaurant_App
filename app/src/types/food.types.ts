export type FoodCategory =
  | 'Burgers'
  | 'Pizza'
  | 'Dessert'
  | 'Beverages'
  | 'Alcohols'
  | 'Mains'
  | 'Starters';

export interface SideOption {
  id: string;
  name: string;
  included: boolean;
}

export interface DrinkOption {
  id: string;
  name: string;
  price: number;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: FoodCategory;
  rating: number;
  sideOptions?: SideOption[];
  drinkOptions?: DrinkOption[];
  extras?: Extra[];
  removableIngredients?: string[];
  isAvailable: boolean;
}