import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { authService } from '@/services/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function OTPScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer le code à 6 chiffres');
      return;
    }

    if (!email) {
      Alert.alert('Erreur', 'Email manquant');
      return;
    }

    try {
      setLoading(true);

      const response = await authService.verifyOTP({
        email: email,
        otp_code: otpCode,
      });

      if (response.token && response.customer) {
        // Connexion automatique après vérification
        await login(response.token, response.customer);
        Alert.alert(
          'Succès',
          'Votre compte a été vérifié avec succès !',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      if (error?.errors?.otp_code) {
        Alert.alert('Erreur', error.errors.otp_code[0]);
      } else if (error?.message) {
        Alert.alert('Erreur', error.message);
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la vérification');
      }
      
      // Réinitialiser le code OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Email manquant');
      return;
    }

    try {
      setResending(true);

      const response = await authService.resendOTP({
        email: email,
      });

      Alert.alert('Succès', response.message || 'Un nouveau code a été envoyé');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      
      if (error?.message) {
        Alert.alert('Erreur', error.message);
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi du code');
      }
    } finally {
      setResending(false);
    }
  };

  const isOtpComplete = otp.join('').length === 6;

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
        <Pressable style={styles.backButton} onPress={() => router.back()} disabled={loading}>
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
          <ThemedText style={styles.instructionsTitle}>Code de Vérification</ThemedText>
          <ThemedText style={styles.instructionsText}>
            Veuillez entrer le code à 6 chiffres envoyé à {email}
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
              editable={!loading}
            />
          ))}
        </View>

        {/* Resend */}
        <View style={styles.resendContainer}>
          <ThemedText style={styles.resendText}>Vous n'avez pas reçu le code ? </ThemedText>
          <Pressable onPress={handleResend} disabled={resending || loading}>
            {resending ? (
              <ActivityIndicator size="small" color="#5B7FFF" />
            ) : (
              <ThemedText style={styles.resendLink}>Renvoyer</ThemedText>
            )}
          </Pressable>
        </View>

        {/* Verify Button */}
        <Pressable
          style={[styles.verifyButton, (!isOtpComplete || loading) && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={!isOtpComplete || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.verifyButtonText}>Vérifier</ThemedText>
          )}
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
    paddingHorizontal: 20,
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
    gap: 4,
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
    backgroundColor: '#3A4A8F',
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
