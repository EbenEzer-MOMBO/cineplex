# API d'Authentification Client - Cineplex

## Vue d'ensemble

Cette documentation décrit l'API d'authentification pour les clients de l'application mobile Cineplex. L'authentification utilise Laravel Sanctum pour la gestion des tokens API avec vérification par code OTP envoyé par email.

## Flux d'authentification

1. **Inscription** : Le client s'inscrit → Reçoit un code OTP par email
2. **Vérification OTP** : Le client entre le code OTP → Compte vérifié + Token d'accès
3. **Connexion** : Si non vérifié → Reçoit un code OTP / Si vérifié → Token d'accès direct
4. **Renvoi OTP** : En cas d'expiration ou de perte du code

## URL de base

```
/api/v1/auth
```

## Endpoints

### 1. Inscription (Register)

Créer un nouveau compte client.

**Endpoint:** `POST /api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Corps de la requête:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0612345678",
  "password": "Password123!",
  "password_confirmation": "Password123!"
}
```

**Paramètres:**
- `name` (string, requis) - Nom complet du client
- `email` (string, requis) - Adresse email unique
- `phone` (string, optionnel) - Numéro de téléphone
- `password` (string, requis) - Mot de passe (minimum 8 caractères)
- `password_confirmation` (string, requis) - Confirmation du mot de passe

**Réponse réussie (201):**
```json
{
  "message": "Inscription réussie. Un code de vérification a été envoyé à votre adresse email.",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "created_at": "2026-01-02T10:00:00+00:00",
    "updated_at": "2026-01-02T10:00:00+00:00"
  },
  "requires_verification": true
}
```

**Note importante:** Après l'inscription, le client doit vérifier son email avec le code OTP reçu avant de pouvoir utiliser l'application. Aucun token n'est fourni à ce stade.

**Erreurs possibles:**
- `422 Unprocessable Entity` - Erreurs de validation
  ```json
  {
    "message": "The email has already been taken.",
    "errors": {
      "email": ["Cette adresse email est déjà utilisée."]
    }
  }
  ```

---

### 2. Connexion (Login)

Authentifier un client existant.

**Endpoint:** `POST /api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Corps de la requête:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Paramètres:**
- `email` (string, requis) - Adresse email du client
- `password` (string, requis) - Mot de passe

**Réponse réussie - Compte vérifié (200):**
```json
{
  "message": "Connexion réussie.",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "created_at": "2026-01-02T10:00:00+00:00",
    "updated_at": "2026-01-02T10:00:00+00:00"
  },
  "token": "2|xyz789...",
  "requires_verification": false
}
```

**Réponse - Compte non vérifié (200):**
```json
{
  "message": "Un code de vérification a été envoyé à votre adresse email.",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "created_at": "2026-01-02T10:00:00+00:00",
    "updated_at": "2026-01-02T10:00:00+00:00"
  },
  "requires_verification": true
}
```

**Note:** Si le compte n'est pas vérifié, un code OTP est envoyé par email et aucun token n'est fourni. Le client doit d'abord vérifier son compte.

**Erreurs possibles:**
- `422 Unprocessable Entity` - Identifiants invalides
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "email": ["Ces identifiants ne correspondent pas à nos enregistrements."]
    }
  }
  ```
- `422 Unprocessable Entity` - Rate limiting (après 5 tentatives échouées)
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "email": ["Trop de tentatives de connexion. Veuillez réessayer dans 60 secondes."]
    }
  }
  ```

**Notes:**
- Tous les tokens précédents sont révoqués lors d'une nouvelle connexion
- Rate limiting: 5 tentatives maximum par minute par adresse email

---

### 3. Vérification du code OTP (Verify OTP)

Vérifier le code OTP reçu par email et activer le compte.

**Endpoint:** `POST /api/v1/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Corps de la requête:**
```json
{
  "email": "john@example.com",
  "otp_code": "123456"
}
```

**Paramètres:**
- `email` (string, requis) - Adresse email du client
- `otp_code` (string, requis) - Code OTP à 6 chiffres

**Réponse réussie (200):**
```json
{
  "message": "Votre compte a été vérifié avec succès.",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "created_at": "2026-01-02T10:00:00+00:00",
    "updated_at": "2026-01-02T10:00:00+00:00"
  },
  "token": "3|abc123..."
}
```

**Erreurs possibles:**
- `422 Unprocessable Entity` - Code OTP invalide
  ```json
  {
    "message": "Le code OTP est invalide.",
    "errors": {
      "otp_code": ["Le code OTP est invalide."]
    }
  }
  ```
- `422 Unprocessable Entity` - Code OTP expiré
  ```json
  {
    "message": "Le code OTP a expiré.",
    "errors": {
      "otp_code": ["Le code OTP a expiré. Veuillez demander un nouveau code."]
    }
  }
  ```

**Notes:**
- Le code OTP est valide pendant 10 minutes
- Une fois vérifié, tous les anciens tokens sont révoqués et un nouveau token est généré
- Le compte est marqué comme vérifié (`verified = true`)

---

### 4. Renvoyer le code OTP (Resend OTP)

Renvoyer un nouveau code OTP par email.

**Endpoint:** `POST /api/v1/auth/resend-otp`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Corps de la requête:**
```json
{
  "email": "john@example.com"
}
```

**Paramètres:**
- `email` (string, requis) - Adresse email du client

**Réponse réussie (200):**
```json
{
  "message": "Un nouveau code de vérification a été envoyé à votre adresse email."
}
```

**Erreurs possibles:**
- `400 Bad Request` - Compte déjà vérifié
  ```json
  {
    "message": "Votre compte est déjà vérifié."
  }
  ```
- `422 Unprocessable Entity` - Email invalide
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "email": ["Aucun compte ne correspond à cette adresse email."]
    }
  }
  ```

---

### 5. Profil (Profile)

Récupérer les informations du client authentifié.

**Endpoint:** `GET /api/v1/auth/profile`

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Réponse réussie (200):**
```json
{
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "created_at": "2026-01-02T10:00:00+00:00",
    "updated_at": "2026-01-02T10:00:00+00:00"
  }
}
```

**Erreurs possibles:**
- `401 Unauthorized` - Token manquant ou invalide
  ```json
  {
    "message": "Unauthenticated."
  }
  ```

---

### 6. Déconnexion (Logout)

Révoquer le token d'authentification actuel.

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Réponse réussie (200):**
```json
{
  "message": "Déconnexion réussie."
}
```

**Erreurs possibles:**
- `401 Unauthorized` - Token manquant ou invalide
  ```json
  {
    "message": "Unauthenticated."
  }
  ```

---

## Gestion des tokens

### Stockage du token
Après une inscription ou connexion réussie, stockez le token de manière sécurisée dans votre application mobile (par exemple, dans le keychain iOS ou keystore Android).

### Utilisation du token
Incluez le token dans l'en-tête `Authorization` de toutes les requêtes authentifiées:

```
Authorization: Bearer {votre_token}
```

### Expiration des tokens
Les tokens Sanctum n'expirent pas par défaut. Ils restent valides jusqu'à ce qu'ils soient révoqués explicitement via:
- Déconnexion (`/logout`)
- Nouvelle connexion (tous les tokens précédents sont révoqués)

---

## Codes de statut HTTP

| Code | Signification |
|------|---------------|
| 200  | Succès |
| 201  | Créé avec succès |
| 401  | Non authentifié |
| 422  | Erreur de validation |
| 429  | Trop de requêtes (rate limiting) |
| 500  | Erreur serveur |

---

## Exemples d'utilisation

### Exemple avec cURL - Inscription

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'
```

### Exemple avec cURL - Vérification OTP

```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john@example.com",
    "otp_code": "123456"
  }'
```

### Exemple avec cURL - Renvoi OTP

```bash
curl -X POST http://localhost:8000/api/v1/auth/resend-otp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### Exemple avec cURL - Connexion

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Exemple avec cURL - Profil

```bash
curl -X GET http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer 1|abcdef123456..." \
  -H "Accept: application/json"
```

### Exemple avec cURL - Déconnexion

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer 1|abcdef123456..." \
  -H "Accept: application/json"
```

---

## Code OTP

### Génération et Envoi
- Code à 6 chiffres généré aléatoirement
- Envoyé par email via notification Laravel
- Valide pendant 10 minutes
- Un nouveau code invalide l'ancien

### Format de l'email
L'email contient :
- Le code OTP à 6 chiffres
- La durée de validité (10 minutes)
- Le contexte (inscription, connexion, renvoi)

## Sécurité

### Recommandations
1. **HTTPS uniquement** - Utilisez toujours HTTPS en production
2. **Stockage sécurisé** - Stockez les tokens dans un emplacement sécurisé (keychain/keystore)
3. **Validation côté client** - Validez les données avant l'envoi pour une meilleure UX
4. **Gestion des erreurs** - Gérez correctement les erreurs 401 (redirection vers login)
5. **Rate limiting** - Respectez les limites de taux pour éviter le blocage
6. **Vérification OTP** - Ne stockez jamais le code OTP côté client
7. **Expiration** - Gérez l'expiration du code OTP (10 minutes)

### Rate Limiting
- **Login**: 5 tentatives par minute par adresse email
- Après 5 échecs, attendez 60 secondes avant de réessayer

---

## Configuration Laravel

### Guards configurés
- `customer-api` - Guard Sanctum pour l'API mobile (utilisé par défaut)
- `customer` - Guard session pour usage futur

### Provider
- `customers` - Provider Eloquent utilisant le modèle `Customer`

### Middleware
Les routes protégées utilisent le middleware `auth:sanctum` qui vérifie automatiquement la validité du token Bearer.

---

## Structure de la base de données

### Table customers
| Colonne | Type | Description |
|---------|------|-------------|
| id | bigint | Identifiant unique |
| name | string | Nom du client |
| email | string | Email (unique) |
| password | string | Mot de passe hashé |
| phone | string | Numéro de téléphone (optionnel) |
| verified | boolean | Compte vérifié (default: false) |
| otp_code | string(6) | Code OTP actuel (nullable) |
| otp_expires_at | timestamp | Date d'expiration OTP (nullable) |
| remember_token | string | Token de session (nullable) |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de mise à jour |

### Table personal_access_tokens
Gérée automatiquement par Laravel Sanctum pour stocker les tokens API.

---

## Support

Pour toute question ou problème, contactez l'équipe de développement.

