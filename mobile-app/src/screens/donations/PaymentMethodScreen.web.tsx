/**
 * PaymentMethodScreen.web.tsx
 *
 * Web version of payment screen
 * Note: Stripe payments are not supported on web in this app.
 * Use the mobile app (iOS/Android) for donations.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Colors from brand
const COLORS = {
  primary: '#8B0101',
  secondary: '#FFF9E9',
  text: '#333333',
  textLight: '#666666',
  white: '#FFFFFF',
  border: '#E0E0E0',
  info: '#2196F3',
};

type RootStackParamList = {
  PaymentMethod: {
    amount: number;
    donationType: 'tithe' | 'offering' | 'special';
    note: string;
  };
  Home: undefined;
};

type PaymentMethodRouteProp = RouteProp<RootStackParamList, 'PaymentMethod'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function PaymentMethodScreen() {
  const route = useRoute<PaymentMethodRouteProp>();
  const navigation = useNavigation<NavigationProp>();

  // Donation details from navigation params
  const { amount, donationType, note } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mobile App Required</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>📱</Text>
        <Text style={styles.infoTitle}>Donations via Mobile App</Text>
        <Text style={styles.infoText}>
          To complete your donation, please use the Royal Signet mobile app on iOS or Android.
        </Text>

        {/* Donation Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Your Donation:</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type:</Text>
            <Text style={styles.summaryValue}>
              {donationType.charAt(0).toUpperCase() + donationType.slice(1)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount:</Text>
            <Text style={styles.summaryAmount}>${amount.toFixed(2)}</Text>
          </View>

          {note ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Note:</Text>
              <Text style={styles.summaryValue}>{note}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.instructions}>
          Download the Royal Signet app from the App Store or Google Play to make secure donations.
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 500,
    width: '100%',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  summarySection: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  instructions: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
