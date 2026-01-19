import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const { customer, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B7FFF" />
          <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!isAuthenticated || !customer) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Mon Profil</ThemedText>
        </ThemedView>
        <ThemedView style={styles.content}>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.label}>Nom</ThemedText>
            <ThemedText style={styles.value}>{customer.name}</ThemedText>
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{customer.email}</ThemedText>
          </View>
          {customer.phone && (
            <View style={styles.profileInfo}>
              <ThemedText style={styles.label}>Téléphone</ThemedText>
              <ThemedText style={styles.value}>{customer.phone}</ThemedText>
            </View>
          )}
          
          <View style={styles.logoutContainer}>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#FF3B30" />
              <ThemedText style={styles.logoutText}>Déconnexion</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 20,
  },
  profileInfo: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutContainer: {
    width: '100%',
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 2,
    borderColor: '#FF3B30',
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
});
