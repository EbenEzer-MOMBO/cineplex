# API de Gestion du Profil Client - Cineplex

## Vue d'ensemble

Cette API permet aux clients authentifiés de gérer leur profil : consulter, modifier leurs informations, changer leur mot de passe et supprimer leur compte.

- **URL de base** : `http://localhost/api/v1`
- **Format de réponse** : JSON
- **Authentification** : Bearer Token (Laravel Sanctum)

---

## Authentification

Toutes les routes de cette API nécessitent un token d'authentification valide. Incluez le token dans l'en-tête `Authorization` :

```
Authorization: Bearer {token}
```

---

## 1. Consulter son profil

`GET /api/v1/profile`

Récupère les informations du profil du client authentifié.

### Exemple de Requête

```bash
curl -X GET "http://localhost/api/v1/profile" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer {token}"
```

### Exemple de Réponse (200 OK)

```json
{
  "data": {
    "id": 1,
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+237 650 123 456",
    "created_at": "2026-01-15T10:30:00+00:00",
    "updated_at": "2026-01-20T14:45:00+00:00",
    "bookings_count": 5,
    "favorites_count": 3,
    "total_spent": "25000.00"
  }
}
```

---

## 2. Mettre à jour son profil

`PUT /api/v1/profile`

Met à jour les informations personnelles du client authentifié.

### Paramètres de la Requête

| Paramètre | Type   | Obligatoire | Description                           |
|-----------|--------|-------------|---------------------------------------|
| `name`    | string | Non*        | Nom complet du client                 |
| `email`   | string | Non*        | Adresse email (doit être unique)      |
| `phone`   | string | Non         | Numéro de téléphone                   |

*Au moins un champ doit être fourni.

### Exemple de Requête

```bash
curl -X PUT "http://localhost/api/v1/profile" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Jean-Pierre Dupont",
       "phone": "+237 670 123 456"
     }'
```

### Exemple de Réponse (200 OK)

```json
{
  "status": true,
  "message": "Profil mis à jour avec succès.",
  "data": {
    "id": 1,
    "name": "Jean-Pierre Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+237 670 123 456",
    "created_at": "2026-01-15T10:30:00+00:00",
    "updated_at": "2026-01-20T15:00:00+00:00",
    "bookings_count": 5,
    "favorites_count": 3,
    "total_spent": "25000.00"
  }
}
```

### Réponse d'Erreur (422 Unprocessable Entity)

```json
{
  "status": false,
  "message": "Les données fournies sont invalides.",
  "errors": {
    "email": ["Cet email est déjà utilisé."],
    "phone": ["Le numéro de téléphone ne doit pas dépasser 20 caractères."]
  }
}
```

---

## 3. Changer son mot de passe

`POST /api/v1/profile/change-password`

Permet au client de changer son mot de passe. Toutes les sessions actives (sauf la session courante) seront déconnectées.

### Paramètres de la Requête

| Paramètre            | Type   | Obligatoire | Description                              |
|----------------------|--------|-------------|------------------------------------------|
| `current_password`   | string | Oui         | Mot de passe actuel                      |
| `password`           | string | Oui         | Nouveau mot de passe (min. 8 caractères) |
| `password_confirmation` | string | Oui      | Confirmation du nouveau mot de passe     |

### Exemple de Requête

```bash
curl -X POST "http://localhost/api/v1/profile/change-password" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{
       "current_password": "ancien_mot_de_passe",
       "password": "nouveau_mot_de_passe",
       "password_confirmation": "nouveau_mot_de_passe"
     }'
```

### Exemple de Réponse (200 OK)

```json
{
  "status": true,
  "message": "Mot de passe modifié avec succès. Les autres sessions ont été déconnectées."
}
```

### Réponse d'Erreur (422 Unprocessable Entity)

**Mot de passe actuel incorrect :**

```json
{
  "status": false,
  "message": "Le mot de passe actuel est incorrect.",
  "errors": {
    "current_password": ["Le mot de passe actuel est incorrect."]
  }
}
```

**Validation échouée :**

```json
{
  "status": false,
  "message": "Les données fournies sont invalides.",
  "errors": {
    "password": [
      "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      "La confirmation du mot de passe ne correspond pas."
    ]
  }
}
```

---

## 4. Supprimer son compte

`DELETE /api/v1/profile`

Permet au client de supprimer définitivement son compte. Cette action est irréversible.

**⚠️ Note importante** : Un client ne peut pas supprimer son compte s'il a des réservations en cours (statut `pending` ou `confirmed`).

### Exemple de Requête

```bash
curl -X DELETE "http://localhost/api/v1/profile" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer {token}"
```

### Exemple de Réponse (200 OK)

```json
{
  "status": true,
  "message": "Votre compte a été supprimé avec succès."
}
```

### Réponse d'Erreur (422 Unprocessable Entity)

**Réservations en cours :**

```json
{
  "status": false,
  "message": "Impossible de supprimer le compte. Vous avez 2 réservation(s) en cours."
}
```

---

## 5. Codes de Réponse HTTP

- `200 OK` : La requête a réussi
- `401 Unauthorized` : Token manquant ou invalide
- `422 Unprocessable Entity` : Erreurs de validation
- `500 Internal Server Error` : Erreur serveur

---

## 6. Modèle de Données

### CustomerResource

| Champ             | Type      | Description                                    | Exemple                      |
|-------------------|-----------|------------------------------------------------|------------------------------|
| `id`              | `integer` | ID unique du client                            | `1`                          |
| `name`            | `string`  | Nom complet du client                          | `"Jean Dupont"`              |
| `email`           | `string`  | Adresse email                                  | `"jean@example.com"`         |
| `phone`           | `string`  | Numéro de téléphone                            | `"+237 650 123 456"`         |
| `created_at`      | `string`  | Date de création (ISO 8601)                    | `"2026-01-15T10:30:00+00:00"` |
| `updated_at`      | `string`  | Date de dernière modification (ISO 8601)       | `"2026-01-20T15:00:00+00:00"` |
| `bookings_count`  | `integer` | Nombre de réservations                         | `5`                          |
| `favorites_count` | `integer` | Nombre de films favoris                        | `3`                          |
| `total_spent`     | `string`  | Montant total dépensé (en XAF)                 | `"25000.00"`                 |

---

## 7. Bonnes Pratiques

### Sécurité

- **Toujours utiliser HTTPS** en production
- **Ne jamais exposer les tokens** dans les logs ou messages d'erreur
- **Valider et nettoyer** toutes les entrées utilisateur côté client

### Changement de mot de passe

- Demander **toujours** le mot de passe actuel pour plus de sécurité
- Utiliser des **mots de passe forts** (min. 8 caractères, majuscules, minuscules, chiffres, symboles)
- Informer l'utilisateur que **les autres sessions seront déconnectées**

### Suppression de compte

- **Avertir clairement** l'utilisateur que cette action est irréversible
- Afficher un **récapitulatif** des données qui seront supprimées
- Proposer une **alternative** (désactivation temporaire du compte)
- **Vérifier les réservations en cours** avant de supprimer

---

## 8. Exemple d'Intégration (React Native)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost/api/v1';

// Récupérer le profil
export const getProfile = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

// Mettre à jour le profil
export const updateProfile = async (data: { name?: string; email?: string; phone?: string }) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Changer le mot de passe
export const changePassword = async (data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_URL}/profile/change-password`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Supprimer le compte
export const deleteAccount = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_URL}/profile`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  // Supprimer le token local après suppression du compte
  if (response.ok) {
    await AsyncStorage.removeItem('token');
  }
  
  return response.json();
};
```

---

## 9. Notes Importantes

1. **Token invalide ou expiré** : L'utilisateur doit se reconnecter
2. **Modification d'email** : Un nouvel OTP peut être envoyé si nécessaire
3. **Suppression de compte** : 
   - Toutes les réservations terminées sont conservées pour l'historique
   - Les favoris sont supprimés définitivement
   - Les tokens d'accès sont révoqués
4. **Changement de mot de passe** : Les autres appareils devront se reconnecter
