import { FoodItem } from '../types/food.types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Welcome: undefined;
  Closing: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  FoodDetail: { foodItem: FoodItem; editMode?: boolean };
};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  OrderHistory: undefined;
  ManageAddresses: { addNew?: boolean };
  ManageCards: { addNew?: boolean };
  Help: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  ManageFood: undefined;
  AddEditFood: { foodItem?: FoodItem };
  OrderManagement: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  FavoritesTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
  AdminTab: undefined;
};

export type RootStackParamList = {
  Auth: { screen: keyof AuthStackParamList };
  Main: undefined;
  Admin: { screen: keyof AdminStackParamList };
} & HomeStackParamList &
  CartStackParamList &
  ProfileStackParamList;