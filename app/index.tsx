import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { AppNavigator } from './src/navigation/AppNavigator';
import { store } from './src/redux/store';

export default function App() {
  const Content = (
    <Provider store={store}>
      <AppNavigator />
      <StatusBar style="auto" />
    </Provider>
  );

  // On web, GestureHandlerRootView can interfere with scrolling/wheel events.
  // Only wrap in GestureHandlerRootView for native platforms.
  if (Platform.OS === 'web') {
    // Ensure html/body have full height and allow scrolling on web.
    // Some hosting environments or libraries can set `overflow: hidden` on
    // the document which prevents react-native-web ScrollView from working.
    if (typeof document !== 'undefined') {
      try {
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'auto';
      } catch (e) {
        // ignore if setting styles fails in some environments
      }
    }
    // Ensure the web root fills the viewport so nested ScrollView can
    // calculate its height and allow normal page scrolling on web.
    // Using minHeight: '100vh' fixes cases where the parent doesn't have
    // an explicit height, which prevents flex:1 from working on web.
    // Cast to any to satisfy TypeScript: react-native-web accepts string
    // units like '100vh' but the RN types expect DimensionValue.
    return <View style={{ flex: 1, minHeight: '100vh' } as any}>{Content}</View>;
  }

  return <GestureHandlerRootView style={{ flex: 1 }}>{Content}</GestureHandlerRootView>;
}