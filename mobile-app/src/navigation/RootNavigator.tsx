import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { BottomTabNavigator } from './BottomTabNavigator';
import {
  SplashScreen,
  LoginScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  OTPVerificationScreen,
  CreateNewPasswordScreen,
} from '../screens/auth';
import { UpdateDetailScreen } from '../screens/updates/UpdateDetailScreen';
import { SermonDetailScreen } from '../screens/sermons/SermonDetailScreen';
import { EventDetailScreen } from '../screens/events/EventDetailScreen';
import DonationScreen from '../screens/donations/DonationScreen';
import PaymentMethodScreen from '../screens/donations/PaymentMethodScreen';
import DonationHistoryScreen from '../screens/donations/DonationHistoryScreen';
// Sunday School screens
import {
  SundaySchoolDashboardScreen,
  KidsCheckInScreen,
  ChildRegistrationScreen,
} from '../screens/sundaySchool';
// Admin screens
import { MemberDirectoryScreen } from '../screens/admin';
// Onboarding screens
import { FamilyOnboardingScreen } from '../screens/onboarding';
import { needsOnboarding } from '../services/family';
import { theme } from '../theme';

const Stack = createStackNavigator();

// Check onboarding component
const OnboardingCheck = ({ navigation }: any) => {
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const showOnboarding = await needsOnboarding();
      if (showOnboarding) {
        navigation.replace('FamilyOnboarding');
      } else {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main App Stack with detail screens
const MainApp = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingCheck" component={OnboardingCheck} />
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="UpdateDetail" component={UpdateDetailScreen} />
      <Stack.Screen name="SermonDetail" component={SermonDetailScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen
        name="Donation"
        component={DonationScreen}
        options={{
          headerShown: true,
          title: 'Make a Donation',
          headerStyle: { backgroundColor: '#8B0101' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{
          headerShown: true,
          title: 'Payment',
          headerStyle: { backgroundColor: '#8B0101' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="DonationHistory"
        component={DonationHistoryScreen}
        options={{
          headerShown: true,
          title: 'Donation History',
          headerStyle: { backgroundColor: '#8B0101' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      {/* Sunday School Screens */}
      <Stack.Screen
        name="SundaySchoolDashboard"
        component={SundaySchoolDashboardScreen}
      />
      <Stack.Screen
        name="KidsCheckIn"
        component={KidsCheckInScreen}
      />
      <Stack.Screen
        name="ChildRegistration"
        component={ChildRegistrationScreen}
      />
      {/* Admin Screens */}
      <Stack.Screen
        name="MemberDirectory"
        component={MemberDirectoryScreen}
      />
      {/* Onboarding Screens */}
      <Stack.Screen
        name="FamilyOnboarding"
        component={FamilyOnboardingScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator
export const RootNavigator = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainApp /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
