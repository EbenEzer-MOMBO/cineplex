import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

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
          onPress: () => {
            // TODO: Clear user session/token
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Mon Profil</ThemedText>
        </ThemedView>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.emptyText}>
            Page de profil en construction
          </ThemedText>

          {/* Logout Button */}
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 40,
  },
  logoutContainer: {
    width: '100%',
    maxWidth: 400,
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

