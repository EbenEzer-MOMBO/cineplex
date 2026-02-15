# 🏗️ Guide de Build APK - Cineplex

Ce guide vous explique comment générer un APK de votre application Cineplex.

---

## ⚠️ Important : Limitation Windows

**Sur Windows, vous NE POUVEZ PAS faire de build local Android avec Expo.** Vous devez utiliser **EAS Build** (build en ligne sur les serveurs Expo).

---

## ☁️ Méthode Recommandée : EAS Build (En Ligne)

### 📋 Prérequis

1. **Compte Expo** (gratuit)
   - Créez un compte sur https://expo.dev/signup

2. **Installer EAS CLI**
   ```powershell
   npm install -g eas-cli
   ```

3. **Se connecter**
   ```powershell
   eas login
   ```
   Entrez votre email et mot de passe Expo.

---

## 🚀 Étapes pour Générer un APK

### Étape 1 : Configuration Initiale (Une seule fois)

Si c'est votre premier build, configurez EAS :

```powershell
eas build:configure
```

Cette commande crée automatiquement le fichier `eas.json` (déjà créé dans ce projet).

### Étape 2 : Lancer le Build

#### Build de Test (Preview)

Pour un APK de test interne :

```powershell
eas build --platform android --profile preview
```

#### Build de Production

Pour un APK de production :

```powershell
eas build --platform android --profile production
```

### Étape 3 : Attendre le Build

- Le build prend environ **10-20 minutes**
- Vous recevrez un email quand le build est terminé
- Vous pouvez suivre la progression sur https://expo.dev

### Étape 4 : Télécharger l'APK

Une fois le build terminé :

```powershell
# Télécharger automatiquement le dernier build
eas build:download --platform android --profile preview
```

Ou téléchargez manuellement depuis l'URL fournie dans le terminal ou par email.

---

## 📱 Installer l'APK

### Sur Émulateur

1. Glissez-déposez l'APK sur l'émulateur
2. Ou utilisez :
   ```powershell
   adb install chemin/vers/votre/app.apk
   ```

### Sur Appareil Physique

1. Activez les "Sources inconnues" dans les paramètres Android
2. Transférez l'APK sur votre téléphone
3. Ouvrez le fichier et installez

---

## 🔧 Configuration des Profils

Les profils sont définis dans `eas.json` :

### Preview (Test Interne)

```json
{
  "preview": {
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    }
  }
}
```

- **Usage** : Tests internes, partage avec l'équipe
- **Format** : APK (facile à installer)
- **Distribution** : Interne uniquement

### Production

```json
{
  "production": {
    "android": {
      "buildType": "apk"
    }
  }
}
```

- **Usage** : Version finale pour publication
- **Format** : APK ou AAB (pour Google Play)
- **Distribution** : Public

---

## 📊 Gestion des Versions

Avant chaque build de production, mettez à jour la version dans `app.json` :

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

- **version** : Version lisible (ex: "1.0.1", "2.3.4")
- **versionCode** : Numéro interne incrémental (1, 2, 3, ...)

---

## 🎯 Commandes Utiles

### Lister tous vos builds

```powershell
eas build:list
```

### Voir les détails d'un build

```powershell
eas build:view [BUILD_ID]
```

### Annuler un build en cours

```powershell
eas build:cancel
```

### Télécharger un build spécifique

```powershell
eas build:download --id [BUILD_ID]
```

---

## 💰 Tarification

### Plan Gratuit

- **30 builds/mois**
- Suffisant pour le développement et les tests

### Plans Payants

- **Production** : 29$/mois - Builds illimités
- **Enterprise** : 99$/mois - Builds prioritaires + support

Plus d'infos : https://expo.dev/pricing

---

## 🐛 Résolution de Problèmes

### Build échoué

1. **Vérifier les logs** :
   ```powershell
   eas build:list
   ```
   Cliquez sur le build pour voir les logs détaillés.

2. **Erreurs communes** :
   - Package name manquant → Vérifiez `android.package` dans `app.json`
   - Dépendances incompatibles → Exécutez `npx expo-doctor`
   - Erreur de signature → Laissez EAS gérer les certificats

### Build trop long

- Les builds gratuits peuvent être en file d'attente
- Temps moyen : 10-20 minutes
- Vérifiez votre position dans la file : https://expo.dev

### Impossible de télécharger l'APK

```powershell
# Méthode alternative
eas build:list
# Copiez l'URL de l'artifact et téléchargez avec un navigateur
```

---

## 🔐 Certificats et Signatures

EAS Build gère **automatiquement** :
- Génération du keystore
- Signature de l'APK
- Stockage sécurisé des certificats

Vous n'avez **rien à configurer manuellement** !

---

## 📤 Publication sur Google Play Store

### Prérequis

1. **Compte Google Play Developer** : 25$ (paiement unique)
2. **Build de type AAB** (Android App Bundle)

### Générer un AAB

Modifiez `eas.json` :

```json
{
  "production": {
    "android": {
      "buildType": "app-bundle"
    }
  }
}
```

Puis :

```powershell
eas build --platform android --profile production
```

### Soumettre au Store

```powershell
eas submit --platform android
```

Suivez les instructions pour connecter votre compte Google Play.

---

## 🎨 Personnalisation du Build

### Changer l'icône de l'app

Remplacez les fichiers dans `assets/images/` :
- `icon.png` (1024x1024)
- `android-icon-foreground.png`
- `android-icon-background.png`

### Changer le nom de l'app

Dans `app.json` :

```json
{
  "expo": {
    "name": "Mon App",
    "android": {
      "package": "com.monentreprise.monapp"
    }
  }
}
```

---

## 📝 Checklist Avant Build de Production

- [ ] Tester l'app en mode production local : `npx expo start --no-dev --minify`
- [ ] Vérifier les erreurs TypeScript : `npx tsc --noEmit`
- [ ] Mettre à jour la version dans `app.json`
- [ ] Vérifier l'URL de l'API de production dans `services/config.ts`
- [ ] Tester sur plusieurs appareils/émulateurs
- [ ] Vérifier les permissions dans `app.json`
- [ ] Optimiser les images et assets

---

## 🔗 Ressources

- **Documentation EAS Build** : https://docs.expo.dev/build/introduction/
- **EAS Dashboard** : https://expo.dev/accounts/[votre-compte]/projects/cineplex
- **Forum Expo** : https://forums.expo.dev
- **Statut des serveurs** : https://status.expo.dev

---

## ⏱️ Timeline Typique

1. **Configuration initiale** : 5-10 minutes (une seule fois)
2. **Lancer le build** : 1 minute
3. **Attente du build** : 10-20 minutes
4. **Téléchargement** : 2-5 minutes
5. **Installation** : 1 minute

**Total** : ~20-30 minutes du build à l'installation

---

## 🎉 Build Réussi !

Une fois l'APK installé, vous pouvez :
- Partager l'APK avec votre équipe
- Tester en conditions réelles
- Préparer la publication sur Google Play Store

---

**Astuce** : Sauvegardez l'URL de téléchargement de chaque build pour y accéder plus tard !

**Dernière mise à jour** : 5 février 2026
