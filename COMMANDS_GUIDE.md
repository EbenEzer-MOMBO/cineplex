# 📋 Guide des Commandes - Cineplex

Ce document regroupe toutes les commandes essentielles pour le développement et le déploiement de l'application Cineplex.

---

## 🚀 Développement

### Démarrer le serveur de développement

```powershell
# Démarrage normal
npx expo start

# Démarrage avec cache vidé
npx expo start --clear

# Démarrage avec tunnel (accès depuis n'importe où)
npx expo start --tunnel

# Mode production (optimisé)
npx expo start --no-dev --minify
```

### Ouvrir l'application

```powershell
# Sur Android
npx expo start --android

# Sur iOS
npx expo start --ios

# Sur navigateur web
npx expo start --web
```

---

## 📱 Build Local (Nécessite macOS/Linux pour Android)

### Android

```powershell
# Build de développement
npx expo run:android

# Build avec configuration Java/Android SDK
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:Path"
npx expo run:android
```

### iOS (Nécessite macOS)

```powershell
# Build de développement
npx expo run:ios
```

---

## ☁️ Build en Ligne (EAS Build)

### Prérequis

1. **Créer un compte Expo** : https://expo.dev/signup
2. **Installer EAS CLI** :
   ```powershell
   npm install -g eas-cli
   ```

3. **Se connecter à Expo** :
   ```powershell
   eas login
   ```

4. **Configurer le projet** :
   ```powershell
   eas build:configure
   ```

### Commandes de Build

#### Android

```powershell
# Build APK de prévisualisation (interne)
eas build --platform android --profile preview

# Build APK de production
eas build --platform android --profile production

# Build AAB pour Google Play Store
eas build --platform android --profile production --auto-submit

# Voir tous les builds
eas build:list
```

#### iOS (Nécessite Apple Developer Account - 99$/an)

```powershell
# Build de prévisualisation
eas build --platform ios --profile preview

# Build de production
eas build --platform ios --profile production

# Build pour TestFlight
eas build --platform ios --profile production --auto-submit
```

#### Les deux plateformes

```powershell
# Build pour Android et iOS simultanément
eas build --platform all --profile production
```

### Profils de Build

Les profils sont définis dans `eas.json` :

- **development** : Build de développement avec hot reload
- **preview** : Build de test interne (APK pour Android)
- **production** : Build pour publication sur les stores

### Télécharger un Build

```powershell
# Lister les builds
eas build:list

# Télécharger le dernier build
eas build:download --platform android --profile preview
```

---

## 📦 Gestion des Dépendances

### Installation

```powershell
# Installer toutes les dépendances
npm install

# Installer une dépendance spécifique
npm install <package-name>

# Installer une dépendance de développement
npm install -D <package-name>
```

### Nettoyage

```powershell
# Supprimer node_modules et réinstaller
Remove-Item -Recurse -Force node_modules
npm install

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer le cache Expo
npx expo start --clear
```

---

## 🔧 Maintenance

### Mise à jour des packages

```powershell
# Vérifier les packages obsolètes
npm outdated

# Mettre à jour tous les packages Expo
npx expo install --fix

# Mettre à jour un package spécifique
npm update <package-name>
```

### Prébuild (Générer les dossiers natifs)

```powershell
# Générer les dossiers Android et iOS
npx expo prebuild

# Générer uniquement Android
npx expo prebuild --platform android

# Générer uniquement iOS
npx expo prebuild --platform ios

# Nettoyer et régénérer
npx expo prebuild --clean
```

---

## 🐛 Débogage

### Logs

```powershell
# Voir les logs Android
npx expo run:android --variant debug

# Voir les logs iOS
npx expo run:ios --configuration Debug

# Logs React Native
npx react-native log-android
npx react-native log-ios
```

### Résolution de problèmes

```powershell
# Réinitialiser le cache Metro Bundler
npx expo start --clear

# Supprimer tout et recommencer
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force android
Remove-Item -Recurse -Force ios
Remove-Item -Recurse -Force .expo
npm install
```

---

## 🧪 Tests et Qualité

### Linting

```powershell
# Vérifier le code
npm run lint

# Corriger automatiquement
npm run lint --fix
```

### TypeScript

```powershell
# Vérifier les types
npx tsc --noEmit
```

---

## 📤 Publication

### Mise à jour OTA (Over-The-Air)

```powershell
# Publier une mise à jour sans rebuild
eas update --branch production --message "Description de la mise à jour"

# Publier sur une branche spécifique
eas update --branch preview --message "Test features"
```

### Soumettre aux Stores

```powershell
# Soumettre à Google Play Store
eas submit --platform android

# Soumettre à Apple App Store
eas submit --platform ios

# Les deux stores
eas submit --platform all
```

---

## 🔐 Variables d'Environnement

### Configuration locale

Créer un fichier `.env` :

```env
API_URL=http://192.168.1.138/api/v1
API_TIMEOUT=10000
```

### Configuration EAS Build

```powershell
# Définir une variable pour le build
eas build --platform android --profile production --non-interactive \
  --env API_URL=https://api.cineplex.com/v1
```

Ou dans `eas.json` :

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://api.cineplex.com/v1"
      }
    }
  }
}
```

---

## 📊 Informations Projet

### Vérifier la configuration

```powershell
# Diagnostics Expo
npx expo-doctor

# Informations sur le projet
npx expo config

# Version des packages
npm list
```

---

## 🎯 Workflow Recommandé

### Développement Quotidien

1. Démarrer le serveur :
   ```powershell
   npx expo start
   ```

2. Tester sur émulateur/appareil physique

3. Vérifier les erreurs :
   ```powershell
   npx tsc --noEmit
   npm run lint
   ```

### Avant un Build

1. Nettoyer le cache :
   ```powershell
   npx expo start --clear
   ```

2. Vérifier les dépendances :
   ```powershell
   npx expo-doctor
   ```

3. Tester en mode production :
   ```powershell
   npx expo start --no-dev --minify
   ```

### Build de Test (Preview)

1. Build en ligne :
   ```powershell
   eas build --platform android --profile preview
   ```

2. Télécharger l'APK :
   ```powershell
   eas build:download --platform android --profile preview
   ```

3. Tester sur appareil physique

### Build de Production

1. Mettre à jour la version dans `app.json` :
   ```json
   {
     "version": "1.0.1",
     "android": {
       "versionCode": 2
     }
   }
   ```

2. Build de production :
   ```powershell
   eas build --platform android --profile production
   ```

3. Soumettre au store :
   ```powershell
   eas submit --platform android
   ```

---

## 📝 Notes Importantes

### Windows et Build Android Local

⚠️ **Limitation** : Les builds locaux Android avec Expo ne fonctionnent **pas sur Windows** nativement. Vous devez utiliser :

1. **EAS Build (Recommandé)** : Build en ligne sur les serveurs Expo
2. **WSL2 + Linux** : Windows Subsystem for Linux
3. **Machine virtuelle Linux**
4. **Dual boot Linux**

### Coûts

- **Expo EAS Build** :
  - Gratuit : 30 builds/mois
  - Production : à partir de 29$/mois pour builds illimités
  
- **Apple Developer** : 99$/an (obligatoire pour iOS)

- **Google Play Store** : 25$ (paiement unique)

### Temps de Build

- **EAS Build** : 10-20 minutes en moyenne
- **Build Local** : 5-15 minutes (si disponible)

---

## 🆘 Résolution de Problèmes Courants

### "JAVA_HOME is not set"

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

### "failed to download remote update"

```powershell
npx expo start --clear
# Ou changer l'API_URL dans services/config.ts
```

### "Unable to resolve module"

```powershell
Remove-Item -Recurse -Force node_modules
npm install
npx expo start --clear
```

### "Build failed" sur EAS

```powershell
# Vérifier les logs détaillés
eas build:list
# Cliquer sur le build pour voir les logs complets
```

---

## 🔗 Liens Utiles

- **Documentation Expo** : https://docs.expo.dev
- **EAS Build** : https://docs.expo.dev/build/introduction/
- **EAS Submit** : https://docs.expo.dev/submit/introduction/
- **Expo Dashboard** : https://expo.dev/accounts/[username]/projects/cineplex
- **React Native Docs** : https://reactnative.dev

---

## 📞 Support

En cas de problème, consultez :
1. Les logs de build sur https://expo.dev
2. La documentation Expo
3. Le forum Expo : https://forums.expo.dev
4. Stack Overflow avec le tag `expo`

---

**Dernière mise à jour** : 5 février 2026
**Version** : 1.0.0
