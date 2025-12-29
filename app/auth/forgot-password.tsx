import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    // TODO: Implement reset password logic
    console.log('Reset password for:', email);
    router.push('/auth/otp');
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
          <ThemedText style={styles.instructionsTitle}>Mot de passe oublié ?</ThemedText>
          <ThemedText style={styles.instructionsText}>
            Entrez votre email et nous vous enverrons un code de vérification pour réinitialiser votre mot de passe
          </ThemedText>
        </View>

        {/* Email Input */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#636366"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Send Code Button */}
        <Pressable
          style={[styles.sendButton, !email && styles.sendButtonDisabled]}
          onPress={handleResetPassword}
          disabled={!email}
        >
          <ThemedText style={styles.sendButtonText}>Envoyer le code</ThemedText>
        </Pressable>

        {/* Back to Login */}
        <View style={styles.backToLoginContainer}>
          <Pressable onPress={() => router.push('/auth/login')}>
            <ThemedText style={styles.backToLoginLink}>Se connecter maintenant !</ThemedText>
          </Pressable>
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 24,
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
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#5B7FFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#3A3A3C',
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  backToLoginText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  backToLoginLink: {
    fontSize: 14,
    color: '#5B7FFF',
    fontWeight: 'bold',
  },
});

