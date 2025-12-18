import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { HelpScreen } from '../screens/profile/HelpScreen';
import { ManageAddressesScreen } from '../screens/profile/ManageAddressesScreen';
import { ManageCardsScreen } from '../screens/profile/ManageCardsScreen';
import { OrderHistoryScreen } from '../screens/profile/OrderHistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ProfileDebugScreen } from '../screens/debug/ProfileDebugScreen';
import { ProfileStackParamList } from './navigationTypes';

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
  <Stack.Screen name="ProfileDebug" component={ProfileDebugScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="ManageAddresses" component={ManageAddressesScreen} />
      <Stack.Screen name="ManageCards" component={ManageCardsScreen} />
    </Stack.Navigator>
  );
};
