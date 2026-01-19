# API Séances - Documentation

## Vue d'ensemble

L'API Séances permet de gérer et consulter les séances de films disponibles dans le cinéma Cineplex.

**Base URL**: `http://localhost/api/v1/sessions`

**Format de réponse**: JSON

**Authentication**: Aucune authentication requise pour les endpoints publics

---

## Endpoints

### 1. Liste des séances

Récupère la liste de toutes les séances disponibles avec filtres optionnels.

**Endpoint**: `GET /api/v1/sessions`

**Paramètres de requête** (optionnels):

| Paramètre | Type | Description |
|-----------|------|-------------|
| `date_from` | string | Date de début au format `YYYY-MM-DD` |
| `date_to` | string | Date de fin au format `YYYY-MM-DD` |
| `movie_id` | integer | ID du film pour filtrer les séances |
| `date` | string | Date spécifique au format `YYYY-MM-DD` |
| `per_page` | integer | Nombre de résultats par page (défaut: 15) |
| `page` | integer | Numéro de page |

**Exemple de requête**:
```bash
GET /api/v1/sessions?date_from=2026-01-20&movie_id=3&per_page=10
```

**Réponse succès** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 3,
      "session_date": "2026-01-25T00:00:00.000000Z",
      "start_time": "19:00:00",
      "end_time": "20:40:00",
      "price_per_ticket": 5000,
      "available_seats": 150,
      "status": "available",
      "status_label": "Disponible",
      "created_at": "2026-01-01T18:37:13+00:00",
      "updated_at": "2026-01-01T18:37:13+00:00",
      "movie": {
        "id": 3,
        "title": "Ballerina",
        "studio": null,
        "synopsis": "Enfant, Eve Macarro a assisté impuissante au meurtre de son père...",
        "poster_url": "https://image.tmdb.org/t/p/w500/cAMk3C3uUbwSgoZ6EMoPjXI2tt.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/1yktYsxkmUtUFTUnCAUaqG6FEiz.jpg",
        "imdb_rating": 7.3,
        "rating": 4,
        "status": "now_showing",
        "status_label": "À l'affiche",
        "created_at": "2026-01-01T18:31:14+00:00",
        "updated_at": "2026-01-01T18:48:00+00:00"
      },
      "is_past": false,
      "is_today": false,
      "formatted_date": "samedi 25 janvier 2026",
      "formatted_time": "19:00"
    }
  ],
  "links": {
    "first": "http://localhost/api/v1/sessions?page=1",
    "last": "http://localhost/api/v1/sessions?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "page": null,
        "active": false
      },
      {
        "url": "http://localhost/api/v1/sessions?page=1",
        "label": "1",
        "page": 1,
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "page": null,
        "active": false
      }
    ],
    "path": "http://localhost/api/v1/sessions",
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

---

### 2. Détails d'une séance

Récupère les informations détaillées d'une séance spécifique.

**Endpoint**: `GET /api/v1/sessions/{id}`

**Paramètres d'URL**:

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | integer | ID de la séance (requis) |

**Exemple de requête**:
```bash
GET /api/v1/sessions/1
```

**Réponse succès** (200 OK):
```json
{
  "data": {
    "id": 1,
    "movie_id": 3,
    "session_date": "2026-01-25T00:00:00.000000Z",
    "start_time": "19:00:00",
    "end_time": "20:40:00",
    "price_per_ticket": 5000,
    "available_seats": 150,
    "status": "available",
    "status_label": "Disponible",
    "created_at": "2026-01-01T18:37:13+00:00",
    "updated_at": "2026-01-01T18:37:13+00:00",
    "movie": {
      "id": 3,
      "title": "Ballerina",
      "studio": null,
      "synopsis": "Enfant, Eve Macarro a assisté impuissante au meurtre de son père...",
      "poster_url": "https://image.tmdb.org/t/p/w500/cAMk3C3uUbwSgoZ6EMoPjXI2tt.jpg",
      "backdrop_url": "https://image.tmdb.org/t/p/w1280/1yktYsxkmUtUFTUnCAUaqG6FEiz.jpg",
      "imdb_rating": 7.3,
      "rating": 4,
      "status": "now_showing",
      "status_label": "À l'affiche",
      "created_at": "2026-01-01T18:31:14+00:00",
      "updated_at": "2026-01-01T18:48:00+00:00"
    },
    "is_past": false,
    "is_today": false,
    "formatted_date": "samedi 25 janvier 2026",
    "formatted_time": "19:00"
  }
}
```

**Réponse erreur** (404 Not Found):
```json
{
  "message": "No query results for model [App\\Models\\MovieSession] 999"
}
```

---

### 3. Séances du jour

Récupère toutes les séances disponibles pour aujourd'hui.

**Endpoint**: `GET /api/v1/sessions/today`

**Paramètres de requête**: Aucun

**Exemple de requête**:
```bash
GET /api/v1/sessions/today
```

**Réponse succès** (200 OK):
```json
{
  "data": [
    {
      "id": 5,
      "movie_id": 1,
      "session_date": "2026-01-19T00:00:00.000000Z",
      "start_time": "14:00:00",
      "end_time": "16:30:00",
      "price_per_ticket": 4500,
      "available_seats": 200,
      "status": "available",
      "status_label": "Disponible",
      "created_at": "2026-01-19T10:00:00+00:00",
      "updated_at": "2026-01-19T10:00:00+00:00",
      "movie": {
        "id": 1,
        "title": "Avatar : De feu et de cendres",
        "poster_url": "https://image.tmdb.org/t/p/w500/cfGTBeMJU5C4Q2yEq8Nh6rPspn6.jpg",
        "status": "now_showing",
        "status_label": "À l'affiche"
      },
      "is_past": false,
      "is_today": true,
      "formatted_date": "dimanche 19 janvier 2026",
      "formatted_time": "14:00"
    },
    {
      "id": 6,
      "movie_id": 1,
      "session_date": "2026-01-19T00:00:00.000000Z",
      "start_time": "19:00:00",
      "end_time": "21:30:00",
      "price_per_ticket": 5000,
      "available_seats": 200,
      "status": "available",
      "status_label": "Disponible",
      "created_at": "2026-01-19T10:00:00+00:00",
      "updated_at": "2026-01-19T10:00:00+00:00",
      "movie": {
        "id": 1,
        "title": "Avatar : De feu et de cendres",
        "poster_url": "https://image.tmdb.org/t/p/w500/cfGTBeMJU5C4Q2yEq8Nh6rPspn6.jpg",
        "status": "now_showing",
        "status_label": "À l'affiche"
      },
      "is_past": false,
      "is_today": true,
      "formatted_date": "dimanche 19 janvier 2026",
      "formatted_time": "19:00"
    }
  ]
}
```

---

### 4. Séances à venir

Récupère toutes les séances disponibles à partir d'aujourd'hui.

**Endpoint**: `GET /api/v1/sessions/upcoming`

**Paramètres de requête** (optionnels):

| Paramètre | Type | Description |
|-----------|------|-------------|
| `per_page` | integer | Nombre de résultats par page (défaut: 15) |
| `page` | integer | Numéro de page |

**Exemple de requête**:
```bash
GET /api/v1/sessions/upcoming?per_page=20
```

**Réponse succès** (200 OK):
```json
{
  "data": [
    {
      "id": 5,
      "movie_id": 1,
      "session_date": "2026-01-19T00:00:00.000000Z",
      "start_time": "14:00:00",
      "end_time": "16:30:00",
      "price_per_ticket": 4500,
      "available_seats": 200,
      "status": "available",
      "status_label": "Disponible",
      "created_at": "2026-01-19T10:00:00+00:00",
      "updated_at": "2026-01-19T10:00:00+00:00",
      "movie": {
        "id": 1,
        "title": "Avatar : De feu et de cendres",
        "poster_url": "https://image.tmdb.org/t/p/w500/cfGTBeMJU5C4Q2yEq8Nh6rPspn6.jpg",
        "status": "now_showing",
        "status_label": "À l'affiche"
      },
      "is_past": false,
      "is_today": true,
      "formatted_date": "dimanche 19 janvier 2026",
      "formatted_time": "14:00"
    },
    {
      "id": 7,
      "movie_id": 3,
      "session_date": "2026-01-20T00:00:00.000000Z",
      "start_time": "18:00:00",
      "end_time": "19:40:00",
      "price_per_ticket": 5000,
      "available_seats": 150,
      "status": "available",
      "status_label": "Disponible",
      "created_at": "2026-01-19T10:00:00+00:00",
      "updated_at": "2026-01-19T10:00:00+00:00",
      "movie": {
        "id": 3,
        "title": "Ballerina",
        "poster_url": "https://image.tmdb.org/t/p/w500/cAMk3C3uUbwSgoZ6EMoPjXI2tt.jpg",
        "status": "now_showing",
        "status_label": "À l'affiche"
      },
      "is_past": false,
      "is_today": false,
      "formatted_date": "lundi 20 janvier 2026",
      "formatted_time": "18:00"
    }
  ],
  "links": {
    "first": "http://localhost/api/v1/sessions/upcoming?page=1",
    "last": "http://localhost/api/v1/sessions/upcoming?page=2",
    "prev": null,
    "next": "http://localhost/api/v1/sessions/upcoming?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 2,
    "links": [...],
    "path": "http://localhost/api/v1/sessions/upcoming",
    "per_page": 20,
    "to": 20,
    "total": 35
  }
}
```

---

### 5. Séances d'un film

Récupère les séances disponibles pour un film spécifique.

**Endpoint**: `GET /api/v1/movies/{movie_id}/sessions`

**Paramètres d'URL**:

| Paramètre | Type | Description |
|-----------|------|-------------|
| `movie_id` | integer | ID du film (requis) |

**Paramètres de requête** (optionnels):

| Paramètre | Type | Description |
|-----------|------|-------------|
| `date` | string | Date spécifique au format `YYYY-MM-DD` |

**Exemple de requête**:
```bash
GET /api/v1/movies/3/sessions
GET /api/v1/movies/3/sessions?date=2026-01-25
```

**Réponse succès** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 3,
      "session_date": "2026-01-25",
      "start_time": "14:00",
      "end_time": "15:40",
      "price_per_ticket": 5000,
      "status": "available",
      "available_seats": 150
    },
    {
      "id": 2,
      "movie_id": 3,
      "session_date": "2026-01-25",
      "start_time": "17:00",
      "end_time": "18:40",
      "price_per_ticket": 5000,
      "status": "available",
      "available_seats": 150
    },
    {
      "id": 3,
      "movie_id": 3,
      "session_date": "2026-01-25",
      "start_time": "20:00",
      "end_time": "21:40",
      "price_per_ticket": 5500,
      "status": "available",
      "available_seats": 150
    }
  ]
}
```

---

## Modèle de données

### Objet Session

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique de la séance |
| `movie_id` | integer | ID du film associé |
| `session_date` | string | Date de la séance (ISO 8601) |
| `start_time` | string | Heure de début (HH:mm:ss) |
| `end_time` | string | Heure de fin (HH:mm:ss) |
| `price_per_ticket` | number | Prix du ticket en XAF |
| `available_seats` | integer | Nombre de places disponibles |
| `status` | string | Statut de la séance (voir ci-dessous) |
| `status_label` | string | Libellé traduit du statut |
| `created_at` | string | Date de création (ISO 8601) |
| `updated_at` | string | Date de mise à jour (ISO 8601) |
| `movie` | object | Objet film (si inclus) |
| `is_past` | boolean | Indique si la séance est passée |
| `is_today` | boolean | Indique si la séance est aujourd'hui |
| `formatted_date` | string | Date formatée en français |
| `formatted_time` | string | Heure formatée (HH:mm) |

### Statuts de séance

| Valeur | Label | Description |
|--------|-------|-------------|
| `available` | Disponible | Séance ouverte à la réservation |
| `full` | Complet | Séance complète, aucune place disponible |
| `cancelled` | Annulé | Séance annulée |

---

## Codes de réponse HTTP

| Code | Description |
|------|-------------|
| `200` | Succès - La requête a réussi |
| `404` | Non trouvé - La ressource demandée n'existe pas |
| `422` | Entité non traitable - Erreur de validation |
| `500` | Erreur serveur - Une erreur interne s'est produite |

---

## Exemples d'utilisation

### Exemple 1: Afficher les séances du jour dans une application mobile

```javascript
// Récupérer les séances d'aujourd'hui
fetch('http://localhost/api/v1/sessions/today')
  .then(response => response.json())
  .then(data => {
    const sessions = data.data;
    sessions.forEach(session => {
      console.log(`${session.movie.title} - ${session.formatted_time} - ${session.price_per_ticket} XAF`);
    });
  });
```

### Exemple 2: Filtrer les séances par film et date

```javascript
// Récupérer les séances d'un film spécifique pour une date donnée
const movieId = 3;
const date = '2026-01-25';

fetch(`http://localhost/api/v1/sessions?movie_id=${movieId}&date=${date}`)
  .then(response => response.json())
  .then(data => {
    console.log(`${data.meta.total} séances trouvées`);
    data.data.forEach(session => {
      console.log(`${session.formatted_time} - ${session.available_seats} places disponibles`);
    });
  });
```

### Exemple 3: Afficher toutes les séances à venir

```javascript
// Récupérer les séances à venir avec pagination
async function getUpcomingSessions(page = 1) {
  const response = await fetch(`http://localhost/api/v1/sessions/upcoming?page=${page}&per_page=10`);
  const data = await response.json();
  
  console.log(`Page ${data.meta.current_page} sur ${data.meta.last_page}`);
  console.log(`Total: ${data.meta.total} séances`);
  
  data.data.forEach(session => {
    console.log(`${session.formatted_date} à ${session.formatted_time}`);
    console.log(`Film: ${session.movie.title}`);
    console.log(`Prix: ${session.price_per_ticket} XAF`);
    console.log('---');
  });
  
  // Charger la page suivante si disponible
  if (data.links.next) {
    await getUpcomingSessions(page + 1);
  }
}

getUpcomingSessions();
```

### Exemple 4: Vérifier la disponibilité d'une séance

```javascript
// Vérifier si une séance est disponible
async function checkSessionAvailability(sessionId) {
  const response = await fetch(`http://localhost/api/v1/sessions/${sessionId}`);
  
  if (response.ok) {
    const data = await response.json();
    const session = data.data;
    
    if (session.status === 'available' && !session.is_past) {
      console.log(`✅ Séance disponible - ${session.available_seats} places restantes`);
      return true;
    } else if (session.status === 'full') {
      console.log('❌ Séance complète');
      return false;
    } else if (session.status === 'cancelled') {
      console.log('❌ Séance annulée');
      return false;
    } else if (session.is_past) {
      console.log('❌ Séance passée');
      return false;
    }
  } else {
    console.log('❌ Séance introuvable');
    return false;
  }
}

checkSessionAvailability(1);
```

---

## Notes importantes

1. **Filtrage automatique**: Par défaut, seules les séances avec le statut `available` et dont la date est supérieure ou égale à aujourd'hui sont retournées par les endpoints `/sessions`, `/today` et `/upcoming`.

2. **Pagination**: Les endpoints qui retournent plusieurs résultats sont paginés. Utilisez les paramètres `page` et `per_page` pour naviguer.

3. **Format de date**: Toutes les dates sont au format ISO 8601 (UTC).

4. **Prix**: Les prix sont en Francs CFA (XAF) sans décimales.

5. **Relations**: L'objet `movie` est automatiquement inclus dans toutes les réponses de séances.

6. **Tri**: Les séances sont triées par date et heure de début (ordre croissant).

---

## Support

Pour toute question ou problème concernant l'API, veuillez contacter l'équipe technique de Cineplex.

**Version de l'API**: v1  
**Dernière mise à jour**: 19 janvier 2026
