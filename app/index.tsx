import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useDispatch } from 'react-redux';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeFoods } from './src/redux/slices/foodSlice';
import { store } from './src/redux/store';
// Suppress noisy React DOM warnings about React Native responder props on web.
// These warnings look like: "Unknown event handler property `onResponderGrant`. It will be ignored."
// They are harmless in this codebase because we intentionally use RN responder props in some places.
// We only patch console.error in development on web to keep the browser console clean.
if (Platform.OS === 'web' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - monkey patch in dev only
  console.error = (...args: any[]) => {
    try {
      const first = String(args[0] ?? '');
      if (/Unknown event handler property `onResponder/i.test(first)) {
        // ignore this specific React DOM warning
        return;
      }
    } catch (e) {
      // fall through to original
    }
    originalError.apply(console, args as any);
  };
}

// Small startup component to run one-time initializers that require the store
function Startup({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  useEffect(() => {
    // dispatch the initialize thunk which will load foods from Firestore
    // and seed mock data if the collection is empty.
    // Cast to any because the thunk return type isn't needed here.
    dispatch(initializeFoods() as any);
  }, [dispatch]);

  return <>{children}</>;
}

export default function App() {
  const Content = (
    <Provider store={store}>
      <Startup>
        <AppNavigator />
        <StatusBar style="auto" />
      </Startup>
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