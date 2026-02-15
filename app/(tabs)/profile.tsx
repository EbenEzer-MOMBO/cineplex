import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { authService } from '@/services/auth';
import { changePassword, deleteAccount, getProfile, ProfileData, updateProfile } from '@/services/profileService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View
} from 'react-native';

export default function ProfileScreen() {
  const { customer, isAuthenticated, isLoading, logout, setCustomer } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  
  // États pour l'édition du profil
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Redirection immédiate si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    // Ne charger que si authentifié ET non en cours de chargement
    if (!isLoading && isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, isLoading]);

  const loadProfile = async () => {
    try {
      const token = await authService.getToken();
      console.log('Token récupéré:', token ? 'Présent' : 'Absent'); // Debug
      
      if (!token) {
        console.warn('Aucun token trouvé, redirection vers login');
        router.replace('/auth/login');
        return;
      }
      
      const profileData = await getProfile(token);
      console.log('Profil chargé:', profileData); // Debug
      setProfile(profileData);
      
      // Mettre à jour le contexte avec les nouvelles infos
      if (setCustomer) {
        setCustomer(profileData);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      // Si erreur 401, déconnecter
      if ((error as any)?.message?.includes('Unauthenticated')) {
        Alert.alert(
          'Session expirée',
          'Votre session a expiré. Veuillez vous reconnecter.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    const data = profile || customer;
    if (data) {
      setEditName(data.name);
      setEditEmail(data.email);
      setEditPhone(data.phone || '');
      setEditModalVisible(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setEditLoading(true);
      Keyboard.dismiss(); // Fermer le clavier
      
      const token = await authService.getToken();
      if (!token) {
        Alert.alert('Erreur', 'Token non trouvé. Veuillez vous reconnecter.');
        return;
      }

      // Validation côté client
      if (!editName.trim()) {
        Alert.alert('Erreur', 'Le nom ne peut pas être vide');
        return;
      }

      if (!editEmail.trim()) {
        Alert.alert('Erreur', "L'email ne peut pas être vide");
        return;
      }

      const currentData = profile || customer;
      const updateData: any = {};
      
      if (editName.trim() !== currentData?.name) updateData.name = editName.trim();
      if (editEmail.trim() !== currentData?.email) updateData.email = editEmail.trim();
      if (editPhone.trim() !== (currentData?.phone || '')) updateData.phone = editPhone.trim();

      if (Object.keys(updateData).length === 0) {
        Alert.alert('Information', 'Aucune modification détectée');
        setEditModalVisible(false);
        return;
      }

      console.log('Envoi des données:', updateData); // Debug
      const result = await updateProfile(token, updateData);
      console.log('Résultat:', result); // Debug
      
      setProfile(result.data!);
      if (setCustomer) {
        setCustomer(result.data!);
      }
      
      Alert.alert('Succès', result.message || 'Profil mis à jour avec succès');
      setEditModalVisible(false);
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error); // Debug
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setPasswordLoading(true);
      Keyboard.dismiss(); // Fermer le clavier
      
      const token = await authService.getToken();
      if (!token) {
        Alert.alert('Erreur', 'Token non trouvé. Veuillez vous reconnecter.');
        return;
      }

      const result = await changePassword(token, {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      Alert.alert('Succès', result.message);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement. Êtes-vous sûr ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await authService.getToken();
              if (!token) {
                Alert.alert('Erreur', 'Token non trouvé. Veuillez vous reconnecter.');
                return;
              }

              const result = await deleteAccount(token);
              Alert.alert('Succès', result.message);
              await logout();
              router.replace('/auth/login');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

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

  const displayProfile = profile || customer;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B7FFF" />
        }
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Mon Profil</ThemedText>
        </ThemedView>

        <ThemedView style={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {displayProfile.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={styles.userName}>{displayProfile.name}</ThemedText>
            <ThemedText style={styles.userEmail}>{displayProfile.email}</ThemedText>
          </View>

          {/* Stats Section */}
          {profile && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <IconSymbol name="ticket" size={28} color="#5B7FFF" />
                <ThemedText style={styles.statValue}>{profile.bookings_count}</ThemedText>
                <ThemedText style={styles.statLabel}>Réservations</ThemedText>
              </View>
              <View style={styles.statCard}>
                <IconSymbol name="heart.fill" size={28} color="#FF3B30" />
                <ThemedText style={styles.statValue}>{profile.favorites_count}</ThemedText>
                <ThemedText style={styles.statLabel}>Favoris</ThemedText>
              </View>
              <View style={styles.statCard}>
                <IconSymbol name="creditcard.fill" size={28} color="#34C759" />
                <ThemedText style={styles.statValue}>{parseInt(profile.total_spent).toLocaleString()}</ThemedText>
                <ThemedText style={styles.statLabel}>XAF Dépensés</ThemedText>
              </View>
            </View>
          )}

          {/* Profile Info */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Informations personnelles</ThemedText>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <IconSymbol name="person.fill" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <ThemedText style={styles.infoLabel}>Nom complet</ThemedText>
                  <ThemedText style={styles.infoValue}>{displayProfile.name}</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <IconSymbol name="envelope.fill" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <ThemedText style={styles.infoLabel}>Email</ThemedText>
                  <ThemedText style={styles.infoValue}>{displayProfile.email}</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <IconSymbol name="phone.fill" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <ThemedText style={styles.infoLabel}>Téléphone</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {displayProfile.phone || 'Non renseigné'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Actions</ThemedText>
            
            <Pressable style={styles.actionButton} onPress={handleEditProfile}>
              <View style={styles.actionLeft}>
                <IconSymbol name="pencil" size={22} color="#5B7FFF" />
                <ThemedText style={styles.actionText}>Modifier le profil</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#8E8E93" />
            </Pressable>

            <Pressable style={styles.actionButton} onPress={() => router.push('/bookings')}>
              <View style={styles.actionLeft}>
                <IconSymbol name="ticket.fill" size={22} color="#5B7FFF" />
                <ThemedText style={styles.actionText}>Mes réservations</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#8E8E93" />
            </Pressable>

            <Pressable style={styles.actionButton} onPress={() => setPasswordModalVisible(true)}>
              <View style={styles.actionLeft}>
                <IconSymbol name="lock.fill" size={22} color="#5B7FFF" />
                <ThemedText style={styles.actionText}>Changer le mot de passe</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#8E8E93" />
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleLogout}>
              <View style={styles.actionLeft}>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={22} color="#FF9500" />
                <ThemedText style={[styles.actionText, { color: '#FF9500' }]}>Déconnexion</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#8E8E93" />
            </Pressable>

            <Pressable style={[styles.actionButton, styles.dangerButton]} onPress={handleDeleteAccount}>
              <View style={styles.actionLeft}>
                <IconSymbol name="trash.fill" size={22} color="#FF3B30" />
                <ThemedText style={[styles.actionText, { color: '#FF3B30' }]}>Supprimer le compte</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#8E8E93" />
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Modifier le profil</ThemedText>
                  <Pressable onPress={() => setEditModalVisible(false)}>
                    <IconSymbol name="xmark.circle.fill" size={28} color="#8E8E93" />
                  </Pressable>
                </View>

                <ScrollView 
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Nom complet</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Votre nom"
                  placeholderTextColor="#8E8E93"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Email</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="votre@email.com"
                  placeholderTextColor="#8E8E93"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Téléphone</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="+237 6XX XXX XXX"
                  placeholderTextColor="#8E8E93"
                  keyboardType="phone-pad"
                />
              </View>
                </ScrollView>

                <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={editLoading}
              >
                <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.saveButtonText}>Enregistrer</ThemedText>
                )}
              </Pressable>
            </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Changer le mot de passe</ThemedText>
                  <Pressable onPress={() => setPasswordModalVisible(false)}>
                    <IconSymbol name="xmark.circle.fill" size={28} color="#8E8E93" />
                  </Pressable>
                </View>

                <ScrollView 
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Mot de passe actuel</ThemedText>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Nouveau mot de passe</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Confirmer le mot de passe</ThemedText>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry
                />
              </View>

              <ThemedText style={styles.helpText}>
                Le mot de passe doit contenir au moins 8 caractères.
              </ThemedText>
                </ScrollView>

                <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPasswordModalVisible(false)}
                disabled={passwordLoading}
              >
                <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.saveButtonText}>Modifier</ThemedText>
                )}
              </Pressable>
            </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 24,
    backgroundColor: 'transparent',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5B7FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dangerButton: {
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  helpText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: -8,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#2C2C2E',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#5B7FFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
