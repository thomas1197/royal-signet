import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { configureGoogleSignIn } from './src/services/googleAuth';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { initializeFirebaseAppCheck } from './src/services/appCheck';

function AppContent() {
  const { mode } = useTheme();

  useEffect(() => {
    // Initialize Firebase App Check (protection against abuse)
    initializeFirebaseAppCheck();

    // Initialize Google Sign-In configuration
    configureGoogleSignIn();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
