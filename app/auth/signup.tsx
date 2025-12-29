import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignUp = () => {
    // TODO: Implement sign up logic
    console.log('Sign up:', { name, email, password, phone });
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
            placeholder="Nom"
            placeholderTextColor="#636366"
            value={name}
            onChangeText={setName}
          />

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

          <TextInput
            style={styles.input}
            placeholder="Numéro de téléphone"
            placeholderTextColor="#636366"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Sign Up Button */}
        <Pressable style={styles.signUpButton} onPress={handleSignUp}>
          <ThemedText style={styles.signUpButtonText}>Créer un compte</ThemedText>
        </Pressable>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <ThemedText style={styles.signInText}>
            Vous avez déjà un compte ?{' '}
          </ThemedText>
          <Pressable onPress={() => router.push('/auth/login')}>
            <ThemedText style={styles.signInLink}>Se connecter maintenant !</ThemedText>
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
  signUpButton: {
    backgroundColor: '#5B7FFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signInText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  signInLink: {
    fontSize: 14,
    color: '#5B7FFF',
    fontWeight: 'bold',
  },
});

