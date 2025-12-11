/**
 * DonationScreen.tsx
 *
 * Main donation screen where users can:
 * - Select donation amount (preset or custom)
 * - Choose donation type (tithe, offering, special)
 * - Add optional note
 * - Proceed to payment
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';
import { sanitizeText, sanitizeAmount } from '../../utils/sanitization';
import { donationAmountSchema, donationNoteSchema } from '../../utils/validation';
import { getUserFriendlyErrorMessage, logError } from '../../utils/errorHandling';

// Square checkout URL
const SQUARE_CHECKOUT_URL = 'https://checkout.square.site/merchant/MLZA29TW3YN5R/checkout/PKSTKBTX34X2CXFFXVFNXS4G';

type RootStackParamList = {
  PaymentMethod: {
    amount: number;
    donationType: 'tithe' | 'offering' | 'special';
    note: string;
  };
  DonationHistory: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Preset donation amounts
const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

// Donation types
const DONATION_TYPES = [
  { id: 'tithe', label: 'Tithe', description: '10% of income given to God', iconName: 'hand-right' as const },
  { id: 'offering', label: 'Offering', description: 'General church support', iconName: 'heart' as const },
  { id: 'special', label: 'Special Gift', description: 'Building, missions, or special projects', iconName: 'star' as const },
] as const;

export default function DonationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  // Form state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationType, setDonationType] = useState<'tithe' | 'offering' | 'special'>('offering');
  const [note, setNote] = useState<string>('');

  // UI state
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Validation errors
  const [amountError, setAmountError] = useState<string>('');
  const [noteError, setNoteError] = useState<string>('');

  /**
   * Handle preset amount selection
   */
  const handlePresetAmount = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustomAmount(false);
    setCustomAmount('');
    setAmountError('');
  };

  /**
   * Handle custom amount input
   */
  const handleCustomAmountChange = (text: string) => {
    setIsCustomAmount(true);
    setSelectedAmount(null);

    // Only allow numbers and decimal point
    const sanitized = text.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setCustomAmount(sanitized);
    setAmountError('');
  };

  /**
   * Handle note input
   */
  const handleNoteChange = (text: string) => {
    // Sanitize input
    const sanitized = sanitizeText(text);
    setNote(sanitized);
    setNoteError('');
  };

  /**
   * Validate form and proceed to payment
   */
  const handleProceedToPayment = async () => {
    setAmountError('');
    setNoteError('');

    try {
      setLoading(true);

      // Determine final amount
      let finalAmount: number;
      if (isCustomAmount) {
        const amountStr = customAmount.trim();
        if (!amountStr) {
          setAmountError('Please enter a donation amount');
          setLoading(false);
          return;
        }

        // Sanitize and validate amount
        const sanitizedAmount = sanitizeAmount(amountStr);
        const validation = donationAmountSchema.safeParse(parseFloat(sanitizedAmount));

        if (!validation.success) {
          setAmountError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        finalAmount = validation.data;
      } else {
        if (!selectedAmount) {
          setAmountError('Please select or enter a donation amount');
          setLoading(false);
          return;
        }
        finalAmount = selectedAmount;
      }

      // Validate note if provided
      if (note.trim()) {
        const sanitizedNote = sanitizeText(note);
        const noteValidation = donationNoteSchema.safeParse(sanitizedNote);

        if (!noteValidation.success) {
          setNoteError(noteValidation.error.errors[0].message);
          setLoading(false);
          return;
        }
      }

      // Open Square checkout page
      const canOpen = await Linking.canOpenURL(SQUARE_CHECKOUT_URL);

      if (canOpen) {
        // Show confirmation before redirecting
        Alert.alert(
          'Redirecting to Checkout',
          `You'll be taken to our secure payment page to complete your ${donationType} of £${finalAmount.toFixed(2)}.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Continue',
              onPress: async () => {
                await Linking.openURL(SQUARE_CHECKOUT_URL);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Unable to Open Checkout',
          'Please try again or contact support.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      logError('Error opening checkout', error);
      Alert.alert(
        'Error',
        getUserFriendlyErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to donation history
   */
  const handleViewHistory = () => {
    navigation.navigate('DonationHistory');
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader
        title="Give"
        subtitle="Your generosity helps us serve our community"
        showLogo={true}
        theme={theme}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Donation Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donation Type</Text>
          <View style={styles.donationTypesContainer}>
            {DONATION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.donationTypeCard,
                  donationType === type.id && styles.donationTypeCardSelected,
                ]}
                onPress={() => setDonationType(type.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={type.iconName}
                  size={32}
                  color={donationType === type.id ? theme.colors.primary : theme.colors.text.tertiary}
                  style={styles.donationTypeIcon}
                />
                <Text style={[
                  styles.donationTypeLabel,
                  donationType === type.id && styles.donationTypeLabelSelected,
                ]}>
                  {type.label}
                </Text>
                <Text style={[
                  styles.donationTypeDescription,
                  donationType === type.id && styles.donationTypeDescriptionSelected,
                ]}>
                  {type.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Amount</Text>

          {/* Preset Amounts */}
          <View style={styles.presetAmountsContainer}>
            {PRESET_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.presetAmountButton,
                  selectedAmount === amount && styles.presetAmountButtonSelected,
                ]}
                onPress={() => handlePresetAmount(amount)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.presetAmountText,
                  selectedAmount === amount && styles.presetAmountTextSelected,
                ]}>
                  £{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount */}
          <View style={styles.customAmountContainer}>
            <Text style={styles.customAmountLabel}>Or enter custom amount:</Text>
            <View style={styles.customAmountInputContainer}>
              <Text style={styles.currencySymbol}>£</Text>
              <TextInput
                style={styles.customAmountInput}
                placeholder="0.00"
                placeholderTextColor={theme.colors.text.placeholder}
                value={customAmount}
                onChangeText={handleCustomAmountChange}
                keyboardType="decimal-pad"
                maxLength={7}
              />
            </View>
            {amountError ? (
              <Text style={styles.errorText}>{amountError}</Text>
            ) : null}
          </View>
        </View>

        {/* Optional Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a message or prayer request..."
            placeholderTextColor={theme.colors.text.placeholder}
            value={note}
            onChangeText={handleNoteChange}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{note.length}/500</Text>
          {noteError ? (
            <Text style={styles.errorText}>{noteError}</Text>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceedToPayment}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.background.white} />
            ) : (
              <Text style={styles.proceedButtonText}>
                Proceed to Secure Checkout
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleViewHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.historyButtonText}>View Donation History</Text>
          </TouchableOpacity>
        </View>

        {/* Secure Payment Notice */}
        <View style={styles.footer}>
          <Ionicons
            name="lock-closed"
            size={16}
            color={theme.colors.text.tertiary}
            style={styles.footerIcon}
          />
          <Text style={styles.footerText}>
            Secure payments powered by Square. Your donation helps us continue our mission to serve our community and share God's love.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[24],
  },
  section: {
    marginBottom: theme.spacing[8],
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  donationTypesContainer: {
    flexDirection: 'column',
    gap: theme.spacing[3],
  },
  donationTypeCard: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.ui.borderLight,
  },
  donationTypeCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  donationTypeIcon: {
    marginBottom: theme.spacing[2],
  },
  donationTypeLabel: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  donationTypeLabelSelected: {
    color: theme.colors.primary,
  },
  donationTypeDescription: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  donationTypeDescriptionSelected: {
    color: theme.colors.text.primary,
  },
  presetAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  presetAmountButton: {
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.ui.borderLight,
    minWidth: 100,
    alignItems: 'center',
  },
  presetAmountButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  presetAmountText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  presetAmountTextSelected: {
    color: theme.colors.background.white,
  },
  customAmountContainer: {
    marginTop: theme.spacing[3],
  },
  customAmountLabel: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  customAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.ui.borderLight,
    paddingHorizontal: theme.spacing[4],
  },
  currencySymbol: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.primary,
    marginRight: theme.spacing[2],
  },
  customAmountInput: {
    flex: 1,
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.primary,
    paddingVertical: theme.spacing[4],
  },
  noteInput: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.ui.borderLight,
    padding: theme.spacing[4],
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    minHeight: 120,
  },
  characterCount: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'right',
    marginTop: theme.spacing[1],
  },
  errorText: {
    fontFamily: theme.typography.fonts.satoshi,
    color: theme.colors.error,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing[2],
  },
  buttonContainer: {
    gap: theme.spacing[3],
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing[5],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  proceedButtonText: {
    fontFamily: theme.typography.fonts.satoshi,
    color: theme.colors.background.white,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
  },
  historyButton: {
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  historyButtonText: {
    fontFamily: theme.typography.fonts.satoshi,
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing[8],
    paddingTop: theme.spacing[5],
    borderTopWidth: 1,
    borderTopColor: theme.colors.ui.borderLight,
  },
  footerIcon: {
    marginRight: theme.spacing[2],
    marginTop: 2,
  },
  footerText: {
    flex: 1,
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    lineHeight: 18,
  },
});
