import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authService } from '@/services/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (password !== passwordConfirmation) {
      newErrors.passwordConfirmation = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: passwordConfirmation,
        phone: phone.trim() || undefined,
      });

      // Rediriger vers la page OTP
      router.push({
        pathname: '/auth/otp',
        params: { email: email.trim().toLowerCase() },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error?.errors) {
        // Erreurs de validation Laravel
        const apiErrors: { [key: string]: string } = {};
        Object.keys(error.errors).forEach((key) => {
          apiErrors[key] = error.errors[key][0];
        });
        setErrors(apiErrors);
      } else if (error?.message) {
        Alert.alert('Erreur', error.message);
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name.trim() && email.trim() && password && passwordConfirmation;

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
          <View>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Nom"
              placeholderTextColor="#636366"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              editable={!loading}
            />
            {errors.name && <ThemedText style={styles.errorText}>{errors.name}</ThemedText>}
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              placeholderTextColor="#636366"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email && <ThemedText style={styles.errorText}>{errors.email}</ThemedText>}
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mot de passe"
              placeholderTextColor="#636366"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              secureTextEntry
              editable={!loading}
            />
            {errors.password && <ThemedText style={styles.errorText}>{errors.password}</ThemedText>}
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.passwordConfirmation && styles.inputError]}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#636366"
              value={passwordConfirmation}
              onChangeText={(text) => {
                setPasswordConfirmation(text);
                if (errors.passwordConfirmation) {
                  setErrors({ ...errors, passwordConfirmation: '' });
                }
              }}
              secureTextEntry
              editable={!loading}
            />
            {errors.passwordConfirmation && <ThemedText style={styles.errorText}>{errors.passwordConfirmation}</ThemedText>}
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Numéro de téléphone (optionnel)"
              placeholderTextColor="#636366"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors({ ...errors, phone: '' });
                }
              }}
              keyboardType="phone-pad"
              editable={!loading}
            />
            {errors.phone && <ThemedText style={styles.errorText}>{errors.phone}</ThemedText>}
          </View>
        </View>

        {/* Sign Up Button */}
        <Pressable 
          style={[styles.signUpButton, (!isFormValid || loading) && styles.signUpButtonDisabled]} 
          onPress={handleSignUp}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.signUpButtonText}>Créer un compte</ThemedText>
          )}
        </Pressable>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <ThemedText style={styles.signInText}>
            Vous avez déjà un compte ?{' '}
          </ThemedText>
          <Pressable onPress={() => router.push('/auth/login')} disabled={loading}>
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  signUpButton: {
    backgroundColor: '#5B7FFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonDisabled: {
    backgroundColor: '#3A4A8F',
    opacity: 0.6,
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
