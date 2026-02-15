# 🎬 Cineplex - Application Mobile de Réservation de Cinéma

Application mobile React Native / Expo pour la réservation de places de cinéma.

---

## 📚 Documentation

### Guides de Développement

- **[COMMANDS_GUIDE.md](./COMMANDS_GUIDE.md)** 📋 - Guide complet de toutes les commandes (développement, build, déploiement)
- **[BUILD_GUIDE.md](./BUILD_GUIDE.md)** 🏗️ - Guide détaillé pour générer un APK Android

### Documentation API

- **[API_AUTH.md](./API_AUTH.md)** - Authentification et gestion des utilisateurs
- **[API_BOOKINGS.md](./API_BOOKINGS.md)** - Réservations et paiements
- **[API_FAVORITES.md](./API_FAVORITES.md)** - Gestion des favoris
- **[API_MOVIES.md](./API_MOVIES.md)** - Liste et détails des films
- **[API_SESSIONS.md](./API_SESSIONS.md)** - Séances de cinéma
- **[API_SEATS.md](./API_SEATS.md)** - Sélection de sièges
- **[API_PAYMENT.md](./API_PAYMENT.md)** - Paiement mobile (Airtel Money, Moov Money)
- **[API_PROFILE.md](./API_PROFILE.md)** - Profil utilisateur

### Documentation Services

- **[services/README.md](./services/README.md)** - Vue d'ensemble des services
- **[services/BOOKING_SERVICE_README.md](./services/BOOKING_SERVICE_README.md)** - Service de réservation
- **[services/FAVORITES_SERVICE_README.md](./services/FAVORITES_SERVICE_README.md)** - Service de favoris
- **[services/PROFILE_SERVICE_README.md](./services/PROFILE_SERVICE_README.md)** - Service de profil

### Modèle de Données

- **[DATA_MODEL.md](./DATA_MODEL.md)** - Structure des données de l'application

---

## 🚀 Démarrage Rapide

### Installation

```powershell
# Installer les dépendances
npm install
```

### Configuration

1. **Configurer l'URL de l'API**

   Modifiez `services/config.ts` :
   
   ```typescript
   // Pour développement local (remplacez par votre IP)
   export const BASE_URL = 'http://192.168.1.138/api/v1';
   
   // Pour production
   export const BASE_URL = 'https://api.cineplex.com/api/v1';
   ```

2. **Démarrer le serveur de développement**

   ```powershell
   npx expo start
   ```

3. **Ouvrir l'app**

   - Scanner le QR code avec Expo Go (iOS/Android)
   - Appuyer sur `a` pour ouvrir sur émulateur Android
   - Appuyer sur `i` pour ouvrir sur simulateur iOS

---

## 📱 Fonctionnalités

### ✅ Implémentées

- 🔐 **Authentification**
  - Inscription / Connexion
  - OTP par SMS
  - Réinitialisation de mot de passe
  
- 🎬 **Films**
  - Liste des films (à l'affiche, prochainement)
  - Détails du film
  - Bande-annonce
  - Favoris
  
- 🎫 **Réservation**
  - Sélection de séance
  - Choix du nombre de participants
  - Sélection de sièges (plan interactif)
  - Buffet (optionnel)
  - Paiement mobile (Airtel Money, Moov Money)
  - Génération de tickets avec QR codes
  
- 👤 **Profil**
  - Informations personnelles
  - Modification du profil
  - Changement de mot de passe
  - Historique des réservations
  
- 🎟️ **Tickets**
  - Liste des réservations confirmées
  - QR codes individuels par siège
  - Affichage en grille dynamique

---

## 🛠️ Stack Technique

- **Framework** : React Native avec Expo
- **Routing** : Expo Router (file-based)
- **Langage** : TypeScript
- **UI** : React Native Components
- **Icônes** : SF Symbols
- **Stockage** : AsyncStorage
- **API** : REST avec fetch
- **QR Codes** : react-native-qrcode-svg

---

## 📂 Structure du Projet

```
cineplex/
├── app/                      # Pages de l'application (Expo Router)
│   ├── (tabs)/               # Navigation par onglets
│   │   ├── index.tsx         # Accueil (liste des films)
│   │   ├── favorites.tsx     # Favoris
│   │   ├── tickets.tsx       # Mes tickets
│   │   └── profile.tsx       # Profil utilisateur
│   ├── auth/                 # Écrans d'authentification
│   ├── booking/              # Flux de réservation
│   ├── booking-seats/        # Sélection de sièges
│   ├── booking-payment/      # Paiement
│   ├── booking-success/      # Confirmation
│   ├── ticket-details/       # Détails des tickets (QR codes)
│   └── movie/                # Détails du film
├── components/               # Composants réutilisables
├── services/                 # Services API
│   ├── api.ts                # Client API de base
│   ├── auth.ts               # Service d'authentification
│   ├── bookingService.ts     # Service de réservation
│   ├── favoritesService.ts   # Service de favoris
│   ├── profileService.ts     # Service de profil
│   ├── paymentService.ts     # Service de paiement
│   ├── seatService.ts        # Service de sièges
│   └── sessionService.ts     # Service de séances
├── contexts/                 # Contextes React
├── types/                    # Types TypeScript
├── constants/                # Constantes et thèmes
└── assets/                   # Images et ressources
```

---

## 🔧 Commandes Principales

### Développement

```powershell
# Démarrer le serveur
npx expo start

# Démarrer avec cache vidé
npx expo start --clear

# Ouvrir sur Android
npx expo start --android

# Ouvrir sur iOS
npx expo start --ios
```

### Build

```powershell
# Build APK de test (en ligne via EAS)
eas build --platform android --profile preview

# Build de production
eas build --platform android --profile production

# Télécharger le dernier build
eas build:download --platform android
```

📖 **Pour plus de détails, consultez [COMMANDS_GUIDE.md](./COMMANDS_GUIDE.md) et [BUILD_GUIDE.md](./BUILD_GUIDE.md)**

---

## 🌐 Configuration API

L'application se connecte à l'API backend. Modifiez `services/config.ts` selon votre environnement :

### Développement Local

```typescript
export const BASE_URL = 'http://VOTRE_IP_LOCAL/api/v1';
```

**⚠️ Important** : Utilisez l'IP de votre machine hôte, pas `localhost` (ne fonctionne pas sur émulateur/appareil).

### Production

```typescript
export const BASE_URL = 'https://api.cineplex.com/api/v1';
```

---

## 📦 Dépendances Principales

```json
{
  "expo": "^53.0.0",
  "expo-router": "^4.0.0",
  "react": "18.3.1",
  "react-native": "0.76.5",
  "react-native-qrcode-svg": "^6.3.15",
  "react-native-svg": "15.8.0",
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

---

## 🐛 Résolution de Problèmes

### Erreur "failed to download remote update"

```powershell
npx expo start --clear
```

### Erreur "Unable to resolve module"

```powershell
Remove-Item -Recurse -Force node_modules
npm install
npx expo start --clear
```

### Problème de connexion API

1. Vérifiez l'URL dans `services/config.ts`
2. Assurez-vous que l'appareil est sur le même réseau
3. Utilisez l'IP de la machine hôte, pas `localhost`

### Build local échoue sur Windows

⚠️ **Les builds locaux Android ne fonctionnent pas sur Windows avec Expo.**

✅ **Solution** : Utilisez EAS Build (en ligne). Voir [BUILD_GUIDE.md](./BUILD_GUIDE.md)

---

## 🎨 Thème et Style

L'application supporte les thèmes clair et sombre automatiquement selon les préférences système.

**Couleurs principales** :
- Primary : `#5B7FFF` (Bleu)
- Success : `#4CAF50` (Vert)
- Warning : `#FF9800` (Orange)
- Error : `#F44336` (Rouge)

---

## 📝 License

Ce projet est propriétaire.

---

## 👥 Équipe

Développé par l'équipe Cineplex.

---

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation dans les fichiers `.md`
2. Vérifiez les logs de l'application
3. Contactez l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : 5 février 2026

---

## 🔗 Ressources Utiles

- [Documentation Expo](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
