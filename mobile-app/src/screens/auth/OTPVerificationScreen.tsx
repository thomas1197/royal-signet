import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '../../components';
import { theme } from '../../theme';

export const OTPVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = (route.params as any) || { email: '' };

  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 5) {
      Alert.alert('Error', 'Please enter the complete 5-digit code');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement OTP verification logic
      // For now, navigate to create new password
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('CreateNewPassword' as never, { email, otp: otpCode } as never);
      }, 1000);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    Alert.alert('Code Resent', 'A new verification code has been sent to your email');
    setOtp(['', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a verification code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <Button
        title="Verify"
        onPress={handleVerify}
        loading={loading}
        style={styles.verifyButton}
      />

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code? </Text>
        <TouchableOpacity onPress={handleResendCode}>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    padding: theme.spacing[6],
  },
  backButton: {
    width: theme.layout.backButton,
    height: theme.layout.backButton,
    borderRadius: theme.layout.backButton / 2,
    backgroundColor: theme.colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing[8],
    marginBottom: theme.spacing[6],
    ...theme.shadows.soft,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  header: {
    marginBottom: theme.spacing[8],
  },
  title: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.tertiary,
    lineHeight: 24,
  },
  email: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semiBold,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[8],
  },
  otpInput: {
    width: theme.layout.otpBox.width,
    height: theme.layout.otpBox.height,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.background.white,
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  verifyButton: {
    width: '100%',
    marginBottom: theme.spacing[6],
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  resendLink: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
});
