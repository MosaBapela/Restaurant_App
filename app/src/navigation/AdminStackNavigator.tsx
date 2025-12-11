import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { AddEditFoodScreen } from '../screens/admin/AddEditFoodScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ManageFoodScreen } from '../screens/admin/ManageFoodScreen';
import { OrderManagementScreen } from '../screens/admin/OrderManagementScreen';
import { AdminStackParamList } from './navigationTypes';

const Stack = createStackNavigator<AdminStackParamList>();

export const AdminStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ManageFood" component={ManageFoodScreen} />
      <Stack.Screen name="AddEditFood" component={AddEditFoodScreen} />
      <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
    </Stack.Navigator>
  );
};