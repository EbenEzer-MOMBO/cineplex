# Documentation API Movies - Cineplex Backend

## 📋 Vue d'ensemble

Cette documentation décrit toutes les routes et endpoints disponibles pour la gestion des films dans l'application Cineplex.

---

## 🔐 Authentification

### Backoffice (Web)
- **Middleware** : `auth`, `verified`
- **Type** : Session Laravel (Fortify)
- **Accès** : Réservé aux administrateurs

### API Mobile
- **Middleware** : `auth:sanctum` (pour les routes protégées)
- **Type** : Token Sanctum
- **Routes publiques** : Disponibles sans authentification

---

## 🌐 Routes Backoffice (Web)

Toutes les routes backoffice utilisent Inertia.js et retournent des composants React.

### **Liste des films**
```
GET /movies
```
**Controller** : `MovieController@index`  
**Middleware** : `auth`, `verified`  
**Description** : Affiche la liste paginée de tous les films

**Réponse** : Page Inertia `Movies/Index`

---

### **Créer un film (formulaire)**
```
GET /movies/create
```
**Controller** : `MovieController@create`  
**Middleware** : `auth`, `verified`  
**Description** : Affiche le formulaire de création d'un film

**Réponse** : Page Inertia `Movies/Create`

---

### **Enregistrer un nouveau film**
```
POST /movies
```
**Controller** : `MovieController@store`  
**Middleware** : `auth`, `verified`  
**Validation** : `StoreMovieRequest`

**Body** :
```json
{
  "title": "Titre du film",
  "studio": "Studio de production",
  "synopsis": "Synopsis du film",
  "poster_url": "https://example.com/poster.jpg",
  "backdrop_url": "https://example.com/backdrop.jpg",
  "imdb_rating": 8.5,
  "rating": 4,
  "status": "now_showing",
  "images": [
    {
      "image_url": "https://example.com/image1.jpg",
      "order": 0
    }
  ]
}
```

**Réponse** : Redirection vers `/movies` avec message de succès

---

### **Afficher un film**
```
GET /movies/{movie}
```
**Controller** : `MovieController@show`  
**Middleware** : `auth`, `verified`  
**Description** : Affiche les détails d'un film avec ses images et séances

**Réponse** : Page Inertia `Movies/Show`

---

### **Modifier un film (formulaire)**
```
GET /movies/{movie}/edit
```
**Controller** : `MovieController@edit`  
**Middleware** : `auth`, `verified`  
**Description** : Affiche le formulaire de modification d'un film

**Réponse** : Page Inertia `Movies/Edit`

---

### **Mettre à jour un film**
```
PUT/PATCH /movies/{movie}
```
**Controller** : `MovieController@update`  
**Middleware** : `auth`, `verified`  
**Validation** : `UpdateMovieRequest`

**Body** : Même structure que POST (tous les champs sont optionnels)

**Réponse** : Redirection vers `/movies/{movie}` avec message de succès

---

### **Supprimer un film**
```
DELETE /movies/{movie}
```
**Controller** : `MovieController@destroy`  
**Middleware** : `auth`, `verified`  
**Description** : Supprime un film et toutes ses relations (cascade)

**Réponse** : Redirection vers `/movies` avec message de succès

---

## 📱 Routes API Mobile (v1)

Base URL : `/api/v1/movies`

Toutes les routes API retournent du JSON avec le format standard Laravel Resource.

### **Liste des films**
```
GET /api/v1/movies
```
**Controller** : `Api\MovieController@index`  
**Auth** : Non requis  
**Description** : Retourne la liste paginée des films avec filtres et recherche

**Query Parameters** :
- `status` : Filtrer par statut (now_showing, coming_soon, archived)
- `search` : Rechercher par titre
- `sort_by` : Trier par champ (défaut: created_at)
- `sort_order` : Ordre de tri (asc, desc - défaut: desc)
- `per_page` : Nombre de résultats par page (défaut: 15)

**Exemple** :
```
GET /api/v1/movies?status=now_showing&per_page=10
```

**Réponse** :
```json
{
  "data": [
    {
      "id": 1,
      "title": "Titre du film",
      "studio": "Studio",
      "synopsis": "Synopsis...",
      "poster_url": "https://...",
      "backdrop_url": "https://...",
      "imdb_rating": 8.5,
      "rating": 4,
      "status": "now_showing",
      "status_label": "À l'affiche",
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T10:00:00Z",
      "images": [...],
      "sessions_count": 5
    }
  ],
  "links": {...},
  "meta": {...}
}
```

---

### **Films à l'affiche**
```
GET /api/v1/movies/now-showing
```
**Controller** : `Api\MovieController@nowShowing`  
**Auth** : Non requis  
**Description** : Retourne uniquement les films actuellement à l'affiche

**Query Parameters** :
- `per_page` : Nombre de résultats par page (défaut: 15)

**Réponse** : Même format que la liste des films

---

### **Films à venir**
```
GET /api/v1/movies/coming-soon
```
**Controller** : `Api\MovieController@comingSoon`  
**Auth** : Non requis  
**Description** : Retourne uniquement les films à venir (prochainement)

**Query Parameters** :
- `per_page` : Nombre de résultats par page (défaut: 15)

**Réponse** : Même format que la liste des films

---

### **Rechercher des films**
```
GET /api/v1/movies/search?q={query}
```
**Controller** : `Api\MovieController@search`  
**Auth** : Non requis  
**Description** : Recherche des films par titre ou studio

**Query Parameters** :
- `q` : Terme de recherche (requis, min: 2 caractères)

**Exemple** :
```
GET /api/v1/movies/search?q=avatar
```

**Réponse** :
```json
{
  "data": [
    {
      "id": 1,
      "title": "Avatar",
      "studio": "20th Century Studios",
      ...
    }
  ]
}
```

---

### **Détails d'un film**
```
GET /api/v1/movies/{movie}
```
**Controller** : `Api\MovieController@show`  
**Auth** : Non requis  
**Description** : Retourne les détails complets d'un film avec ses images et séances disponibles

**Réponse** :
```json
{
  "data": {
    "id": 1,
    "title": "Titre du film",
    "studio": "Studio",
    "synopsis": "Synopsis complet...",
    "poster_url": "https://...",
    "backdrop_url": "https://...",
    "imdb_rating": 8.5,
    "rating": 4,
    "status": "now_showing",
    "status_label": "À l'affiche",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z",
    "images": [
      {
        "id": 1,
        "movie_id": 1,
        "image_url": "https://...",
        "order": 0,
        "created_at": "2026-01-01T10:00:00Z"
      }
    ],
    "sessions": [
      {
        "id": 1,
        "movie_id": 1,
        "session_date": "2026-01-15",
        "start_time": "14:00",
        "end_time": "16:30",
        "price_per_ticket": 2500.00,
        "status": "available",
        "status_label": "Disponible",
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
      }
    ]
  }
}
```

---

### **Séances d'un film**
```
GET /api/v1/movies/{movie}/sessions
```
**Controller** : `Api\MovieController@sessions`  
**Auth** : Non requis  
**Description** : Retourne uniquement les séances disponibles d'un film

**Query Parameters** :
- `date` : Filtrer par date (format: YYYY-MM-DD)

**Exemple** :
```
GET /api/v1/movies/1/sessions?date=2026-01-15
```

**Réponse** :
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "session_date": "2026-01-15",
      "start_time": "14:00",
      "end_time": "16:30",
      "price_per_ticket": 2500.00,
      "status": "available",
      "status_label": "Disponible",
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

---

## 🎯 Validation des données

### **StoreMovieRequest** (Création)

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| title | string | ✅ | max:255 |
| studio | string | ❌ | max:255 |
| synopsis | text | ❌ | - |
| poster_url | string | ❌ | max:500, url |
| backdrop_url | string | ❌ | max:500, url |
| imdb_rating | numeric | ❌ | min:0, max:10 |
| rating | integer | ❌ | min:1, max:5 |
| status | enum | ✅ | in:now_showing,coming_soon,archived |
| images | array | ❌ | - |
| images.*.image_url | string | ✅ (si images présent) | max:500, url |
| images.*.order | integer | ❌ | min:0 |

### **UpdateMovieRequest** (Modification)

Même validation que `StoreMovieRequest` mais tous les champs sont optionnels (règle `sometimes`).

---

## 📦 Format des réponses API

### **Success Response**
```json
{
  "data": {...},
  "meta": {...},
  "links": {...}
}
```

### **Error Response**
```json
{
  "message": "Message d'erreur",
  "errors": {
    "field": ["Message de validation"]
  }
}
```

---

## 🧪 Exemples d'utilisation

### **cURL - Liste des films à l'affiche**
```bash
curl -X GET "http://localhost/api/v1/movies/now-showing" \
  -H "Accept: application/json"
```

### **cURL - Créer un film (Backoffice)**
```bash
curl -X POST "http://localhost/movies" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: {token}" \
  -d '{
    "title": "Avatar 3",
    "studio": "20th Century Studios",
    "status": "coming_soon",
    "rating": 5
  }'
```

### **JavaScript - Rechercher un film**
```javascript
const response = await fetch('/api/v1/movies/search?q=avatar');
const data = await response.json();
console.log(data.data);
```

---

## ✅ Points importants

1. **Cascade Delete** : La suppression d'un film supprime automatiquement ses images et relations
2. **Filtrage automatique** : Les séances retournées sont filtrées pour ne montrer que les séances disponibles et futures
3. **Pagination** : Toutes les listes sont paginées (défaut: 15 éléments)
4. **Eager Loading** : Les relations sont chargées automatiquement pour optimiser les performances
5. **Versioning API** : Toutes les routes API sont préfixées par `/api/v1/`

---

**Date de création** : 1er janvier 2026  
**Version API** : v1  
**Base URL API** : `http://localhost/api/v1`

