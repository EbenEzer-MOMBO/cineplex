# API Favoris - Documentation

Cette API permet aux clients de gérer leurs films favoris avec la possibilité de filtrer par statut (à venir ou passé).

## Base URL
```
/api/v1/favorites
```

## Authentification
Toutes les routes nécessitent une authentification via **Sanctum**. Ajoutez le token dans le header :
```
Authorization: Bearer {token}
```

---

## 1. Liste des Favoris

### Endpoint
```http
GET /api/v1/favorites
```

### Description
Récupère la liste des films favoris du client authentifié avec possibilité de filtrer par statut.

### Query Parameters
| Paramètre | Type   | Requis | Valeur par défaut | Description                                    |
|-----------|--------|--------|-------------------|------------------------------------------------|
| status    | string | Non    | all               | Filtre : `all`, `upcoming` (à venir), `past` (passé) |

### Réponse Succès (200)
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 5,
      "movie": {
        "id": 5,
        "title": "Inception",
        "slug": "inception",
        "synopsis": "Un voleur qui s'infiltre dans les rêves...",
        "duration": 148,
        "release_date": "2010-07-16",
        "status": "now_showing",
        "imdb_rating": 8.8,
        "language": "Anglais",
        "genre": "Science-Fiction, Action",
        "director": "Christopher Nolan",
        "cast": "Leonardo DiCaprio, Marion Cotillard",
        "trailer_url": "https://youtube.com/...",
        "poster_url": "https://image.tmdb.org/...",
        "created_at": "2026-01-15T10:30:00Z",
        "updated_at": "2026-01-15T10:30:00Z",
        "images": [
          {
            "id": 1,
            "url": "https://image.tmdb.org/...",
            "type": "backdrop"
          }
        ],
        "sessions": [
          {
            "id": 10,
            "session_date": "2026-02-15",
            "session_time": "20:00:00",
            "price": 3500,
            "hall": "Salle 1",
            "total_seats": 120,
            "available_seats": 45,
            "occupied_seats": 75
          }
        ]
      },
      "added_at": "2026-01-20T14:30:00Z"
    }
  ]
}
```

### Exemples de Filtrage

#### Tous les favoris
```http
GET /api/v1/favorites
GET /api/v1/favorites?status=all
```

#### Films à venir (avec séances futures)
```http
GET /api/v1/favorites?status=upcoming
```

#### Films passés (sans séances futures)
```http
GET /api/v1/favorites?status=past
```

---

## 2. Ajouter un Favori

### Endpoint
```http
POST /api/v1/favorites
```

### Description
Ajoute un film aux favoris du client authentifié.

### Body Parameters
| Paramètre | Type    | Requis | Description                    |
|-----------|---------|--------|--------------------------------|
| movie_id  | integer | Oui    | ID du film à ajouter          |

### Exemple de Requête
```json
{
  "movie_id": 5
}
```

### Réponse Succès (201)
```json
{
  "data": {
    "id": 1,
    "movie_id": 5,
    "movie": {
      "id": 5,
      "title": "Inception",
      "slug": "inception",
      "synopsis": "Un voleur qui s'infiltre dans les rêves...",
      "duration": 148,
      "release_date": "2010-07-16",
      "status": "now_showing",
      "imdb_rating": 8.8,
      "language": "Anglais",
      "genre": "Science-Fiction, Action",
      "director": "Christopher Nolan",
      "cast": "Leonardo DiCaprio, Marion Cotillard",
      "trailer_url": "https://youtube.com/...",
      "poster_url": "https://image.tmdb.org/...",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z",
      "images": [
        {
          "id": 1,
          "url": "https://image.tmdb.org/...",
          "type": "backdrop"
        }
      ]
    },
    "added_at": "2026-01-20T14:30:00Z"
  }
}
```

### Réponse Erreur (422)
```json
{
  "message": "Validation échouée",
  "errors": {
    "movie_id": [
      "Ce film est déjà dans vos favoris."
    ]
  }
}
```

---

## 3. Supprimer un Favori

### Endpoint
```http
DELETE /api/v1/favorites/{favorite}
```

### Description
Retire un film des favoris du client authentifié.

### Path Parameters
| Paramètre | Type    | Requis | Description           |
|-----------|---------|--------|-----------------------|
| favorite  | integer | Oui    | ID du favori à supprimer |

### Exemple de Requête
```http
DELETE /api/v1/favorites/1
```

### Réponse Succès (200)
```json
{
  "message": "Film retiré des favoris avec succès."
}
```

### Réponse Erreur (403)
```json
{
  "message": "Vous n'êtes pas autorisé à supprimer ce favori."
}
```

### Réponse Erreur (404)
```json
{
  "message": "Favori non trouvé."
}
```

---

## 4. Vérifier si un Film est Favori

### Endpoint
```http
GET /api/v1/favorites/check/{movieId}
```

### Description
Vérifie si un film spécifique est dans les favoris du client authentifié.

### Path Parameters
| Paramètre | Type    | Requis | Description     |
|-----------|---------|--------|-----------------|
| movieId   | integer | Oui    | ID du film      |

### Exemple de Requête
```http
GET /api/v1/favorites/check/5
```

### Réponse Succès (200)
```json
{
  "is_favorite": true
}
```

ou

```json
{
  "is_favorite": false
}
```

---

## Codes d'Erreur Communs

| Code | Description                              |
|------|------------------------------------------|
| 200  | Succès                                   |
| 201  | Créé avec succès                         |
| 401  | Non authentifié                          |
| 403  | Non autorisé                             |
| 404  | Ressource non trouvée                    |
| 422  | Erreur de validation                     |
| 500  | Erreur serveur                           |

---

## Logique de Filtrage par Statut

### `status=upcoming` (À venir)
- Retourne les films qui ont **au moins une séance avec une date >= aujourd'hui**
- Permet aux clients de voir les films qu'ils pourront voir bientôt

### `status=past` (Passé)
- Retourne les films qui n'ont **aucune séance future**
- Inclut les films sans séances ou dont toutes les séances sont passées
- Permet aux clients de voir leur historique de films favoris

### `status=all` (Tous - par défaut)
- Retourne tous les films favoris sans filtre
- Triés par date d'ajout décroissante (plus récents en premier)

---

## Exemples d'Utilisation

### Exemple 1 : Ajouter un Film aux Favoris
```bash
curl -X POST http://localhost/api/v1/favorites \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"movie_id": 5}'
```

### Exemple 2 : Liste des Films à Venir
```bash
curl -X GET "http://localhost/api/v1/favorites?status=upcoming" \
  -H "Authorization: Bearer {token}"
```

### Exemple 3 : Supprimer un Favori
```bash
curl -X DELETE http://localhost/api/v1/favorites/1 \
  -H "Authorization: Bearer {token}"
```

### Exemple 4 : Vérifier si un Film est Favori
```bash
curl -X GET http://localhost/api/v1/favorites/check/5 \
  -H "Authorization: Bearer {token}"
```

---

## Notes Importantes

1. **Unicité** : Un client ne peut pas ajouter le même film deux fois dans ses favoris (contrainte unique en base de données)

2. **Cascade Delete** : Si un film ou un client est supprimé, les favoris associés sont automatiquement supprimés

3. **Relations Chargées** : Les réponses incluent automatiquement les images et sessions du film pour éviter les requêtes supplémentaires

4. **Tri** : Les favoris sont toujours triés par date d'ajout décroissante (plus récents en premier)

5. **Sécurité** : Seul le propriétaire d'un favori peut le supprimer
