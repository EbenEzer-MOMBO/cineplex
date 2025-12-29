import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    // TODO: Implement OTP verification logic
    console.log('Verify OTP:', otpCode);
    router.push('/(tabs)');
  };

  const handleResend = () => {
    // TODO: Implement resend OTP logic
    console.log('Resend OTP');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/cineplex_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.titleContainer}>
            <View style={styles.titleLine} />
            <ThemedText style={styles.title}>CinePlex</ThemedText>
            <View style={styles.titleLine} />
          </View>
          <ThemedText style={styles.subtitle}>Movies</ThemedText>
          <View style={styles.subtitleLine} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.instructionsTitle}>Verification Code</ThemedText>
          <ThemedText style={styles.instructionsText}>
            Please enter the 6-digit code sent to your email
          </ThemedText>
        </View>

        {/* OTP Inputs */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend */}
        <View style={styles.resendContainer}>
          <ThemedText style={styles.resendText}>Didn't receive the code? </ThemedText>
          <Pressable onPress={handleResend}>
            <ThemedText style={styles.resendLink}>Resend</ThemedText>
          </Pressable>
        </View>

        {/* Verify Button */}
        <Pressable
          style={[styles.verifyButton, otp.join('').length < 6 && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={otp.join('').length < 6}
        >
          <ThemedText style={styles.verifyButtonText}>Verify</ThemedText>
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  titleLine: {
    width: 120,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitleLine: {
    width: 180,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#5B7FFF',
    backgroundColor: 'rgba(91, 127, 255, 0.1)',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  resendLink: {
    fontSize: 14,
    color: '#5B7FFF',
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#5B7FFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#3A3A3C',
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

