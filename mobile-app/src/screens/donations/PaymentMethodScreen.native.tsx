/**
 * PaymentMethodScreen.tsx
 *
 * Payment processing screen where users:
 * - Review donation details
 * - Enter credit card information (via Stripe)
 * - Complete the donation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CardField, useStripe, StripeProvider } from '@stripe/stripe-react-native';
import { auth, functions } from '../../services/firebase';
import { getUserFriendlyErrorMessage, logError } from '../../utils/errorHandling';
import { STRIPE_PUBLISHABLE_KEY } from '@env';
import { httpsCallable } from 'firebase/functions';

// Colors from brand
const COLORS = {
  primary: '#8B0101',
  secondary: '#FFF9E9',
  text: '#333333',
  textLight: '#666666',
  white: '#FFFFFF',
  border: '#E0E0E0',
  success: '#4CAF50',
  error: '#F44336',
};

type RootStackParamList = {
  PaymentMethod: {
    amount: number;
    donationType: 'tithe' | 'offering' | 'special';
    note: string;
  };
  DonationHistory: undefined;
  Home: undefined;
};

type PaymentMethodRouteProp = RouteProp<RootStackParamList, 'PaymentMethod'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function PaymentMethodScreen() {
  const route = useRoute<PaymentMethodRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { createPaymentMethod, confirmPayment } = useStripe();

  // Donation details from navigation params
  const { amount, donationType, note } = route.params;

  // Payment state
  const [cardComplete, setCardComplete] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  /**
   * Create payment intent on the server
   */
  const createPaymentIntent = async (): Promise<{ clientSecret: string; paymentIntentId: string } | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to make a donation');
      }

      // Call Firebase Cloud Function to create payment intent
      const createPaymentIntentFn = httpsCallable(functions, 'createPaymentIntent');

      const result = await createPaymentIntentFn({
        amount: Math.round(amount * 100), // Convert to pence
        currency: 'gbp',
        donationType,
        note,
      });

      const data = result.data as { clientSecret: string; paymentIntentId: string };

      if (!data.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      return data;
    } catch (error: any) {
      logError('Error creating payment intent', error);

      // Handle specific Firebase function errors
      if (error.code === 'unauthenticated') {
        Alert.alert(
          'Authentication Required',
          'Please log in to make a donation',
          [{ text: 'OK' }]
        );
      } else if (error.code === 'failed-precondition') {
        Alert.alert(
          'Payment System Unavailable',
          'Our payment system is temporarily unavailable. Please try again later.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          getUserFriendlyErrorMessage(error)
        );
      }

      return null;
    }
  };

  /**
   * Handle payment submission
   */
  const handlePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Incomplete Card', 'Please enter complete card details');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create payment method from card details
      const { paymentMethod, error: pmError } = await createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Step 2: Create payment intent on server
      const paymentIntentData = await createPaymentIntent();

      if (!paymentIntentData) {
        setProcessing(false);
        return;
      }

      // Step 3: Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await confirmPayment(
        paymentIntentData.clientSecret,
        {
          paymentMethodType: 'Card',
          paymentMethodData: {
            paymentMethodId: paymentMethod.id,
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Payment successful!
      setProcessing(false);

      Alert.alert(
        'Thank You! 🙏',
        `Your ${donationType} of £${amount.toFixed(2)} has been received. You'll receive a receipt via email shortly.`,
        [
          {
            text: 'View Receipt',
            onPress: () => navigation.navigate('DonationHistory'),
          },
          {
            text: 'Done',
            onPress: () => navigation.navigate('Home'),
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      setProcessing(false);
      logError('Payment processing error', error);

      // Handle common card errors
      const errorMessage = error.message?.toLowerCase() || '';

      if (errorMessage.includes('insufficient') || errorMessage.includes('declined')) {
        Alert.alert(
          'Card Declined',
          'Your card was declined. Please try a different payment method or contact your bank.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('expired')) {
        Alert.alert(
          'Card Expired',
          'Your card has expired. Please use a different card.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('incorrect') || errorMessage.includes('invalid')) {
        Alert.alert(
          'Invalid Card',
          'The card information is incorrect. Please check your card details.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Payment Failed',
          getUserFriendlyErrorMessage(error),
          [{ text: 'OK' }]
        );
      }
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    Alert.alert(
      'Cancel Donation',
      'Are you sure you want to cancel this donation?',
      [
        {
          text: 'No, Continue',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Your Donation</Text>
          <Text style={styles.headerSubtitle}>
            Your gift helps us continue our mission to serve our community
          </Text>
        </View>

        {/* Donation Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Donation Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type:</Text>
            <Text style={styles.summaryValue}>
              {donationType.charAt(0).toUpperCase() + donationType.slice(1)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount:</Text>
            <Text style={styles.summaryAmount}>£{amount.toFixed(2)}</Text>
          </View>

          {note ? (
            <View style={styles.summaryNote}>
              <Text style={styles.summaryLabel}>Note:</Text>
              <Text style={styles.summaryValue}>{note}</Text>
            </View>
          ) : null}

          <View style={styles.taxNotice}>
            <Text style={styles.taxNoticeText}>
              ✅ Tax-deductible donation
            </Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <View style={styles.cardFieldContainer}>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: COLORS.white,
                textColor: COLORS.text,
                placeholderColor: COLORS.textLight,
                fontSize: 16,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
          </View>

          <View style={styles.secureNotice}>
            <Text style={styles.secureText}>🔒 Secure payment powered by Stripe</Text>
            <Text style={styles.secureSubtext}>
              Your payment information is encrypted and secure
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.payButton,
              (!cardComplete || processing) && styles.payButtonDisabled,
            ]}
            onPress={handlePayment}
            disabled={!cardComplete || processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.payButtonText}>
                Donate £{amount.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={processing}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By completing this donation, you agree that Royal Signet Church is a 501(c)(3)
            nonprofit organization and your donation is tax-deductible to the extent allowed by law.
          </Text>
        </View>
      </ScrollView>
    </StripeProvider>
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
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryNote: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  taxNotice: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  taxNoticeText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '500',
  },
  paymentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  cardFieldContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 12,
  },
  secureNotice: {
    marginTop: 12,
    alignItems: 'center',
  },
  secureText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: 4,
  },
  secureSubtext: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.textLight,
    opacity: 0.5,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
});
