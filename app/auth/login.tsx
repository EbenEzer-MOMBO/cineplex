import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log('Login:', { email, password });
    router.push('/(tabs)');
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

        {/* Form */}
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

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#636366"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable onPress={() => router.push('/auth/forgot-password')}>
            <ThemedText style={styles.forgotPassword}>Mot de passe oublié ?</ThemedText>
          </Pressable>
        </View>

        {/* Login Button */}
        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <ThemedText style={styles.loginButtonText}>Se connecter</ThemedText>
        </Pressable>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <ThemedText style={styles.signUpText}>
            Vous n'avez pas de compte ?{' '}
          </ThemedText>
          <Pressable onPress={() => router.push('/auth/signup')}>
            <ThemedText style={styles.signUpLink}>Créer un compte maintenant !</ThemedText>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
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
  form: {
    gap: 20,
    marginBottom: 40,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#FFFFFF',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#5B7FFF',
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: '#5B7FFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signUpText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  signUpLink: {
    fontSize: 14,
    color: '#5B7FFF',
    fontWeight: 'bold',
  },
});

