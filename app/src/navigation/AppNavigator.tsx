import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { CheckoutScreen } from '../screens/cart/CheckoutScreen';
import { OrderSuccessScreen } from '../screens/cart/OrderSuccessScreen';
import { FoodDetailScreen } from '../screens/home/FoodDetailScreen';
import { AdminStackNavigator } from './AdminStackNavigator';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList } from './navigationTypes';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user?.isAdmin ? (
        <>
          {/* Admin users get their own stack (no bottom tabs) */}
          <Stack.Screen name="Admin" component={AdminStackNavigator} />
          <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen
            name="OrderSuccess"
            component={OrderSuccessScreen}
            options={{
              gestureEnabled: false,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen
            name="OrderSuccess"
            component={OrderSuccessScreen}
            options={{
              gestureEnabled: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
