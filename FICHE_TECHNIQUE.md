# 📋 FICHE TECHNIQUE - Cineplex

## 📱 INFORMATIONS GÉNÉRALES

| Propriété | Valeur |
|-----------|--------|
| **Nom de l'application** | Cineplex |
| **Version** | 1.0.0 |
| **Package ID (Android)** | com.cineplex.app |
| **Version Code (Android)** | 1 |
| **Slug** | cineplex |
| **Schéma URI** | cineplex:// |
| **Type** | Application mobile native (iOS/Android) |
| **Orientation** | Portrait uniquement |
| **Interface** | Mode sombre (dark mode) |
| **Date de création** | Février 2026 |
| **Dernière mise à jour** | 5 mars 2026 |

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Framework & Runtime

| Technologie | Version | Description |
|-------------|---------|-------------|
| **React** | 19.1.0 | Bibliothèque UI |
| **React Native** | 0.81.5 | Framework mobile cross-platform |
| **Expo** | ~54.0.33 | Plateforme de développement |
| **Expo Router** | ~6.0.23 | Routing file-based |
| **TypeScript** | ~5.9.2 | Langage de programmation typé |
| **Node.js** | Compatible ≥18.x | Environnement d'exécution |

### Architecture Activée

- ✅ **New Architecture** : Activée (React Native 0.81+)
- ✅ **React Compiler** : Activé (optimisations automatiques)
- ✅ **Typed Routes** : Activé (routes typées avec TypeScript)

---

## 📦 DÉPENDANCES PRINCIPALES

### Navigation & Routing

```json
{
  "expo-router": "~6.0.23",
  "@react-navigation/native": "^7.1.8",
  "@react-navigation/bottom-tabs": "^7.4.0",
  "@react-navigation/elements": "^2.6.3",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.0"
}
```

### UI & Interface

```json
{
  "@expo/vector-icons": "^15.0.3",
  "phosphor-react-native": "^2.3.1",
  "expo-symbols": "~1.0.8",
  "expo-linear-gradient": "~15.0.8",
  "expo-image": "~3.0.11",
  "react-native-qrcode-svg": "^6.3.21",
  "react-native-svg": "^15.12.1"
}
```

### État & Stockage

```json
{
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

### Animations & Gestures

```json
{
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-worklets": "0.5.1"
}
```

### Fonctionnalités Expo

```json
{
  "expo-constants": "~18.0.12",
  "expo-font": "~14.0.11",
  "expo-haptics": "~15.0.8",
  "expo-linking": "~8.0.11",
  "expo-splash-screen": "~31.0.13",
  "expo-status-bar": "~3.0.9",
  "expo-system-ui": "~6.0.9",
  "expo-web-browser": "~15.0.10"
}
```

### Support Web (PWA)

```json
{
  "react-dom": "19.1.0",
  "react-native-web": "~0.21.0"
}
```

---

## 🎨 CONFIGURATION VISUELLE

### Thème

- **Mode d'interface** : Dark (mode sombre uniquement)
- **Palette de couleurs** :
  - Primary : `#5B7FFF` (Bleu)
  - Success : `#4CAF50` (Vert)
  - Warning : `#FF9800` (Orange)
  - Error : `#F44336` (Rouge)
  - Background (dark) : `#000000`

### Assets & Ressources

| Type | Fichier | Description |
|------|---------|-------------|
| **Icône** | `./assets/images/icon.png` | Icône de l'app (iOS/Android) |
| **Splash Screen** | `./assets/images/splash-icon.png` | Écran de démarrage (200px de large) |
| **Favicon** | `./assets/images/favicon.png` | Icône web |
| **Adaptive Icon BG** | `#000000` | Couleur de fond (Android) |

### Configuration du Splash Screen

```json
{
  "image": "./assets/images/splash-icon.png",
  "imageWidth": 200,
  "resizeMode": "contain",
  "backgroundColor": "#ffffff",
  "dark": {
    "backgroundColor": "#000000"
  }
}
```

---

## 🔧 CONFIGURATION PLATEFORME

### iOS

| Propriété | Valeur |
|-----------|--------|
| **Support iPad** | Oui |
| **Orientation** | Portrait |
| **Build Configuration (Dev)** | Debug |
| **Build Configuration (Prod)** | Release |

### Android

| Propriété | Valeur |
|-----------|--------|
| **Package** | com.cineplex.app |
| **Version Code** | 1 |
| **Edge-to-Edge** | Activé |
| **Predictive Back Gesture** | Désactivé |
| **Type de Build (Preview)** | APK |
| **Type de Build (Production)** | APK |
| **Gradle Command (Dev)** | `:app:assembleDebug` |

### Web

| Propriété | Valeur |
|-----------|--------|
| **Output** | Static |
| **Support PWA** | Oui |
| **Favicon** | `./assets/images/favicon.png` |

---

## 🌐 CONFIGURATION API

### Backend

| Propriété | Valeur |
|-----------|--------|
| **URL de Production** | `https://cineplex-main-fkwtm3.laravel.cloud/api/v1` |
| **Timeout** | 10 000 ms (10 secondes) |
| **Nombre de tentatives** | 3 |
| **Format** | REST API (JSON) |

### Headers par défaut

```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Endpoints principaux

| Service | Endpoint Base |
|---------|---------------|
| **Authentification** | `/auth/*` |
| **Films** | `/movies/*` |
| **Séances** | `/sessions/*` |
| **Réservations** | `/bookings/*` |
| **Sièges** | `/seats/*` |
| **Paiements** | `/payments/*` |
| **Favoris** | `/favorites/*` |
| **Profil** | `/profile/*` |

---

## 📂 STRUCTURE DU PROJET

```
cineplex/
├── app/                          # Routes de l'application (Expo Router)
│   ├── (tabs)/                   # Navigation par onglets
│   │   ├── index.tsx             # 🏠 Accueil (liste des films)
│   │   ├── favorites.tsx         # ⭐ Mes favoris
│   │   ├── tickets.tsx           # 🎟️ Mes tickets
│   │   ├── profile.tsx           # 👤 Mon profil
│   │   └── _layout.tsx           # Layout des onglets
│   ├── auth/                     # Authentification
│   │   ├── login.tsx             # 🔐 Connexion
│   │   ├── signup.tsx            # ✍️ Inscription
│   │   ├── otp.tsx               # 📱 Validation OTP
│   │   └── forgot-password.tsx   # 🔑 Mot de passe oublié
│   ├── movie/[id].tsx            # 🎬 Détails du film
│   ├── booking/[id].tsx          # 📅 Sélection de séance
│   ├── booking-seats/[id].tsx    # 💺 Sélection de sièges
│   ├── buffet/[id].tsx           # 🍿 Buffet (optionnel)
│   ├── booking-payment/[id].tsx  # 💳 Paiement
│   ├── booking-success/[id].tsx  # ✅ Confirmation
│   ├── ticket-details/[id].tsx   # 🎫 Détails du ticket (QR codes)
│   ├── bookings.tsx              # 📚 Historique des réservations
│   ├── modal.tsx                 # 📋 Modal générique
│   └── _layout.tsx               # Layout racine
├── components/                   # Composants réutilisables
│   ├── ui/                       # Composants UI de base
│   │   ├── icon.tsx
│   │   ├── icon-symbol.tsx
│   │   └── collapsible.tsx
│   ├── header.tsx                # En-tête personnalisé
│   ├── movie-card.tsx            # Carte de film
│   ├── movie-section.tsx         # Section de films
│   ├── seat-grid.tsx             # Grille de sièges
│   ├── session-selector-modal.tsx # Modal de sélection de séance
│   ├── payment-modal.tsx         # Modal de paiement
│   ├── payment-option.tsx        # Option de paiement
│   ├── selection-button.tsx      # Bouton de sélection
│   ├── ticket-counter.tsx        # Compteur de tickets
│   ├── phone-input.tsx           # Champ téléphone
│   ├── stepper.tsx               # Indicateur d'étapes
│   ├── spotlight.tsx             # Mise en avant
│   ├── haptic-tab.tsx            # Onglet avec retour haptique
│   └── ...
├── contexts/                     # Contextes React
│   └── auth-context.tsx          # Contexte d'authentification
├── services/                     # Services API
│   ├── api.ts                    # Client API de base
│   ├── config.ts                 # Configuration API
│   ├── auth.ts                   # Service d'authentification
│   ├── bookingService.ts         # Service de réservation
│   ├── favoritesService.ts       # Service de favoris
│   ├── paymentService.ts         # Service de paiement
│   ├── profileService.ts         # Service de profil
│   ├── seatService.ts            # Service de sièges
│   └── sessionService.ts         # Service de séances
├── types/                        # Types TypeScript
│   ├── api.ts                    # Types pour l'API
│   └── auth.ts                   # Types pour l'authentification
├── constants/                    # Constantes et configurations
├── assets/                       # Images et ressources
│   └── images/
├── eas.json                      # Configuration EAS Build
├── app.json                      # Configuration Expo
├── package.json                  # Dépendances npm
├── tsconfig.json                 # Configuration TypeScript
└── README.md                     # Documentation principale
```

### Nombre total de fichiers

- **19 écrans** (pages/routes)
- **21 composants** réutilisables
- **1 contexte** (AuthContext)
- **8 services** API

---

## 🎯 FONCTIONNALITÉS IMPLÉMENTÉES

### 🔐 Authentification

- ✅ Inscription avec email et téléphone
- ✅ Connexion avec email/mot de passe
- ✅ Validation OTP par SMS
- ✅ Réinitialisation de mot de passe
- ✅ Gestion de session (AsyncStorage + Context)
- ✅ Token JWT pour les API

### 🎬 Films

- ✅ Liste des films à l'affiche
- ✅ Liste des films à venir
- ✅ Détails du film (titre, synopsis, durée, réalisateur, casting)
- ✅ Lecture de bande-annonce (YouTube)
- ✅ Ajout/retrait des favoris
- ✅ Notation et avis

### 🎫 Réservation

- ✅ Sélection de séance (date, heure, salle)
- ✅ Choix du nombre de participants
- ✅ Plan de salle interactif
- ✅ Sélection de sièges multiples
- ✅ Affichage du prix en temps réel
- ✅ Buffet optionnel (snacks, boissons)
- ✅ Récapitulatif de la réservation
- ✅ Paiement mobile :
  - Airtel Money
  - Moov Money
- ✅ Génération de tickets avec QR codes individuels
- ✅ Confirmation par email

### 🎟️ Tickets

- ✅ Liste des réservations confirmées
- ✅ Affichage en grille dynamique
- ✅ QR codes individuels par siège
- ✅ Détails de la séance
- ✅ Statut du ticket (actif, utilisé, expiré)

### 👤 Profil

- ✅ Affichage des informations personnelles
- ✅ Modification du profil (nom, email, téléphone)
- ✅ Changement de mot de passe
- ✅ Historique des réservations
- ✅ Gestion des favoris
- ✅ Déconnexion

### ⭐ Favoris

- ✅ Liste des films favoris
- ✅ Ajout/retrait depuis les détails du film
- ✅ Synchronisation avec le backend

---

## 🚀 COMMANDES & SCRIPTS

### Développement

```powershell
# Démarrer le serveur de développement
npm start
# ou
npx expo start

# Démarrer avec cache vidé
npx expo start --clear

# Ouvrir sur Android
npm run android
# ou
npx expo start --android

# Ouvrir sur iOS
npm run ios
# ou
npx expo start --ios

# Version web
npm run web
# ou
npx expo start --web

# Linter
npm run lint
```

### Build & Déploiement

```powershell
# Build APK de test (preview)
eas build --platform android --profile preview

# Build de production
eas build --platform android --profile production

# Build iOS (production)
eas build --platform ios --profile production

# Télécharger le dernier build
eas build:download --platform android

# Soumettre à Google Play Store
eas submit --platform android --profile production
```

### Maintenance

```powershell
# Réinitialiser le projet
npm run reset-project

# Nettoyer le cache
npx expo start --clear

# Réinstaller les dépendances
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🔑 VARIABLES D'ENVIRONNEMENT

### Configuration API (services/config.ts)

| Variable | Valeur | Description |
|----------|--------|-------------|
| `BASE_URL` | `https://cineplex-main-fkwtm3.laravel.cloud/api/v1` | URL de l'API de production |
| `TIMEOUT` | `10000` | Timeout des requêtes (ms) |
| `RETRY_ATTEMPTS` | `3` | Nombre de tentatives en cas d'échec |

### EAS Build (eas.json)

| Variable | Valeur | Description |
|----------|--------|-------------|
| `projectId` | `619d3e03-3a44-4b94-b3bc-8f885f5f02c4` | ID du projet EAS |
| `cli.version` | `>= 13.2.0` | Version minimale de EAS CLI |
| `appVersionSource` | `remote` | Source de la version de l'app |

---

## 📊 CONFIGURATION DES BUILDS

### Profile "development"

```json
{
  "developmentClient": true,
  "distribution": "internal",
  "android": {
    "gradleCommand": ":app:assembleDebug"
  },
  "ios": {
    "buildConfiguration": "Debug"
  }
}
```

### Profile "preview"

```json
{
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  },
  "ios": {
    "simulator": false
  }
}
```

### Profile "production"

```json
{
  "android": {
    "buildType": "apk"
  },
  "ios": {
    "simulator": false
  }
}
```

---

## 🧪 ENVIRONNEMENTS DE TEST

### Émulateur Android

- **Version minimale** : Android 7.0 (API 24)
- **Version cible** : Android 14 (API 34)
- **Architecture** : arm64-v8a, armeabi-v7a, x86_64

### Simulateur iOS

- **Version minimale** : iOS 13.4
- **Version cible** : iOS 17
- **Support iPad** : Oui

### Expo Go

- Supporte les tests rapides sur appareil physique
- Scanner le QR code pour ouvrir l'app
- Limitations : certaines fonctionnalités natives non disponibles

---

## 🔒 SÉCURITÉ

### Authentification

- ✅ JWT (JSON Web Tokens)
- ✅ Stockage sécurisé avec AsyncStorage
- ✅ Expiration automatique des tokens
- ✅ Refresh tokens

### Communication API

- ✅ HTTPS uniquement en production
- ✅ Headers de sécurité
- ✅ Validation des données côté client

### Données sensibles

- ✅ Pas de stockage de mots de passe en clair
- ✅ Pas de données de paiement stockées localement
- ✅ QR codes sécurisés avec identifiants uniques

---

## 📈 PERFORMANCE

### Optimisations activées

- ✅ **React Compiler** : Optimisations automatiques du rendu
- ✅ **New Architecture** : Amélioration des performances native
- ✅ **Hermes Engine** : Moteur JavaScript optimisé (Android)
- ✅ **Code Splitting** : Chargement dynamique des routes
- ✅ **Image Optimization** : Expo Image pour le cache et l'optimisation

### Métriques cibles

| Métrique | Cible |
|----------|-------|
| **Temps de démarrage** | < 3 secondes |
| **Temps de réponse API** | < 2 secondes |
| **FPS** | 60 fps (animations fluides) |
| **Taille de l'APK** | < 50 MB |

---

## 🐛 DEBUGGING & LOGS

### Outils disponibles

- **React DevTools** : Inspection des composants
- **Network Inspector** : Requêtes réseau
- **Expo Dev Client** : Debugging avancé
- **Console logs** : `console.log`, `console.warn`, `console.error`

### Commandes utiles

```powershell
# Activer le menu de développement
# Android : Secouer l'appareil ou Ctrl+M
# iOS : Cmd+D

# Ouvrir React DevTools
npx react-devtools

# Afficher les logs
npx expo start
# Puis appuyer sur 'j' pour ouvrir le debugger
```

---

## 📚 DOCUMENTATION DISPONIBLE

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation principale |
| `FICHE_TECHNIQUE.md` | Cette fiche technique |
| `COMMANDS_GUIDE.md` | Guide complet des commandes |
| `BUILD_GUIDE.md` | Guide de génération d'APK |
| `DATA_MODEL.md` | Modèle de données |
| `API_AUTH.md` | Documentation API - Authentification |
| `API_BOOKINGS.md` | Documentation API - Réservations |
| `API_FAVORITES.md` | Documentation API - Favoris |
| `API_MOVIES.md` | Documentation API - Films |
| `API_SESSIONS.md` | Documentation API - Séances |
| `API_SEATS.md` | Documentation API - Sièges |
| `API_PAYMENT.md` | Documentation API - Paiement |
| `API_PROFILE.md` | Documentation API - Profil |
| `services/README.md` | Vue d'ensemble des services |
| `services/BOOKING_SERVICE_README.md` | Service de réservation |
| `services/FAVORITES_SERVICE_README.md` | Service de favoris |
| `services/PROFILE_SERVICE_README.md` | Service de profil |

---

## 🔄 HISTORIQUE DES VERSIONS

### Version 1.0.0 (Mars 2026)

**Fonctionnalités principales** :

- ✅ Authentification complète (inscription, connexion, OTP)
- ✅ Parcours de films (à l'affiche, prochainement)
- ✅ Détails des films avec bande-annonce
- ✅ Système de favoris
- ✅ Réservation de séances avec sélection de sièges
- ✅ Paiement mobile (Airtel Money, Moov Money)
- ✅ Génération de tickets avec QR codes
- ✅ Profil utilisateur avec historique
- ✅ Mode sombre uniquement

**Commits récents** :

```
5b1b900 - Refactor authentication handling and update app configuration
1abc9e8 - Enhance booking and payment functionalities
1c4d318 - Update package-lock.json for brace-expansion version 5.0.1
2f0479b - Update API configuration to switch to production URL
c7b81d5 - Update app configuration and enhance user experience
fd16c03 - Enhance booking flow with session selection and payment
```

---

## 📞 SUPPORT & RESSOURCES

### Documentation officielle

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [React Navigation](https://reactnavigation.org)

### Outils de développement

- **EAS CLI** : `npm install -g eas-cli`
- **Expo CLI** : Inclus dans le projet
- **Android Studio** : Pour l'émulateur Android
- **Xcode** : Pour le simulateur iOS (macOS uniquement)

### Contact équipe

Pour toute question technique :
1. Consulter la documentation dans les fichiers `.md`
2. Vérifier les logs de l'application
3. Contacter l'équipe de développement Cineplex

---

## ⚠️ LIMITATIONS CONNUES

### Plateforme

- ❌ Builds locaux Android non supportés sur Windows
- ✅ Utiliser EAS Build (en ligne) à la place

### Fonctionnalités

- ⚠️ Mode clair non implémenté (uniquement mode sombre)
- ⚠️ Paiement par carte bancaire non disponible (en développement)
- ⚠️ Notifications push en cours d'implémentation

### Compatibilité

- **Android** : Minimum API 24 (Android 7.0)
- **iOS** : Minimum iOS 13.4
- **Web** : Support PWA (fonctionnalités limitées)

---

## 🎯 ROADMAP FUTURE (À venir)

### Version 1.1

- [ ] Notifications push (réservations, nouveaux films)
- [ ] Mode clair (light mode)
- [ ] Support multilingue (FR/EN)
- [ ] Paiement par carte bancaire
- [ ] Partage de tickets

### Version 1.2

- [ ] Programme de fidélité
- [ ] Recommandations personnalisées
- [ ] Commentaires et critiques
- [ ] Réservation de groupe
- [ ] Support Apple Pay / Google Pay

---

**Document généré le** : 5 mars 2026  
**Version du document** : 1.0  
**Équipe** : Cineplex Development Team
