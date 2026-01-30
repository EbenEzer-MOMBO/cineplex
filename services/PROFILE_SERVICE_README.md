# Profile Service - Documentation

## Vue d'ensemble

Le `profileService` gère toutes les opérations liées au profil utilisateur dans l'application Cineplex.

## Fonctionnalités

### 1. Récupération du profil
```typescript
const profile = await getProfile(token);
```

Récupère les informations complètes du profil incluant :
- Informations personnelles (nom, email, téléphone)
- Statistiques (nombre de réservations, favoris, montant total dépensé)

### 2. Mise à jour du profil
```typescript
await updateProfile(token, {
  name: "Nouveau nom",
  email: "nouveau@email.com",
  phone: "+237 6XX XXX XXX"
});
```

Met à jour les informations du profil. Tous les champs sont optionnels.

### 3. Changement de mot de passe
```typescript
await changePassword(token, {
  current_password: "ancien_mot_de_passe",
  password: "nouveau_mot_de_passe",
  password_confirmation: "nouveau_mot_de_passe"
});
```

Change le mot de passe de l'utilisateur. Toutes les autres sessions seront déconnectées.

### 4. Suppression du compte
```typescript
await deleteAccount(token);
```

Supprime définitivement le compte utilisateur. Cette action est irréversible.

**⚠️ Note** : Un compte ne peut pas être supprimé s'il a des réservations en cours.

## Types

### ProfileData
```typescript
interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  bookings_count: number;
  favorites_count: number;
  total_spent: string;
}
```

### UpdateProfileRequest
```typescript
interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}
```

### ChangePasswordRequest
```typescript
interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}
```

## Gestion des erreurs

Toutes les méthodes peuvent lever des exceptions. Il est recommandé de les entourer de try-catch :

```typescript
try {
  await updateProfile(token, data);
  Alert.alert('Succès', 'Profil mis à jour');
} catch (error) {
  Alert.alert('Erreur', error.message);
}
```

## Utilisation dans les composants

```typescript
import { getProfile, updateProfile } from '@/services/profileService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dans votre composant
const loadProfile = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) return;
  
  const profile = await getProfile(token);
  setProfile(profile);
};
```

## Intégration avec le contexte Auth

Le service de profil fonctionne en tandem avec le contexte d'authentification :

```typescript
const { customer, setCustomer } = useAuth();

// Après mise à jour du profil
const result = await updateProfile(token, data);
setCustomer(result.data); // Met à jour le contexte
```

## Sécurité

- Toutes les requêtes nécessitent un token d'authentification valide
- Le token doit être passé dans l'en-tête Authorization
- Les mots de passe sont validés côté serveur
- La suppression de compte vérifie les réservations en cours
