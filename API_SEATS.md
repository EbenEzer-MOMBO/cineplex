# API Sièges - Documentation

## Vue d'ensemble

L'API Sièges permet de récupérer la liste des sièges disponibles pour une séance spécifique, avec leur statut en temps réel.

**Base URL**: `http://localhost/api/v1/sessions/{session_id}/seats`

**Format de réponse**: JSON

**Authentication**: Aucune authentication requise

---

## Endpoint

### Récupérer les sièges d'une séance

Récupère la liste complète des sièges pour une séance donnée, avec leur statut actuel.

**Endpoint**: `GET /api/v1/sessions/{session_id}/seats`

**Paramètres d'URL**:

| Paramètre | Type | Description |
|-----------|------|-------------|
| `session_id` | integer | ID de la séance (requis) |

**Exemple de requête**:
```bash
GET /api/v1/sessions/4/seats
```

**Réponse succès** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "row": "A",
      "number": 1,
      "section": "left",
      "section_label": "Gauche",
      "status": "available",
      "status_label": "Disponible",
      "seat_code": "A-left-1",
      "is_available": true
    },
    {
      "id": 2,
      "row": "A",
      "number": 2,
      "section": "left",
      "section_label": "Gauche",
      "status": "available",
      "status_label": "Disponible",
      "seat_code": "A-left-2",
      "is_available": true
    },
    {
      "id": 3,
      "row": "A",
      "number": 3,
      "section": "left",
      "section_label": "Gauche",
      "status": "occupied",
      "status_label": "Occupé",
      "seat_code": "A-left-3",
      "is_available": false
    },
    {
      "id": 8,
      "row": "A",
      "number": 1,
      "section": "center",
      "section_label": "Centre",
      "status": "available",
      "status_label": "Disponible",
      "seat_code": "A-center-1",
      "is_available": true
    },
    {
      "id": 25,
      "row": "B",
      "number": 1,
      "section": "left",
      "section_label": "Gauche",
      "status": "vip",
      "status_label": "VIP",
      "seat_code": "B-left-1",
      "is_available": false
    }
  ]
}
```

**Réponse erreur** (404 Not Found):
```json
{
  "message": "No query results for model [App\\Models\\MovieSession] 999"
}
```

---

## Modèle de données

### Objet Siège

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique du siège |
| `row` | string | Rangée (A-J) |
| `number` | integer | Numéro du siège dans la section (1-10) |
| `section` | string | Section du siège (voir ci-dessous) |
| `section_label` | string | Libellé traduit de la section |
| `status` | string | Statut du siège (voir ci-dessous) |
| `status_label` | string | Libellé traduit du statut |
| `seat_code` | string | Code unique du siège (format: `ROW-SECTION-NUMBER`) |
| `is_available` | boolean | Indique si le siège est disponible à la réservation |

### Sections

| Valeur | Label | Position | Nombre de sièges |
|--------|-------|----------|------------------|
| `left` | Gauche | Côté gauche | 7 sièges (1-7) |
| `center` | Centre | Au centre | 10 sièges (1-10) |
| `right` | Droite | Côté droit | 7 sièges (1-7) |

### Statuts des sièges

| Valeur | Label | Description | Disponible |
|--------|-------|-------------|------------|
| `available` | Disponible | Siège libre, peut être réservé | ✅ Oui |
| `occupied` | Occupé | Siège déjà réservé | ❌ Non |
| `selected` | Sélectionné | Siège en cours de sélection (panier) | ❌ Non |
| `vip` | VIP | Siège premium (tarif supérieur) | ❌ Non* |

*Les sièges VIP peuvent être réservés mais nécessitent un traitement spécial (tarif différent).

---

## Organisation de la salle

### Schéma visuel

```
        ÉCRAN
━━━━━━━━━━━━━━━━━━━━━━━━━━

Rangée A:  [1-7]  [1-10]  [1-7]
           LEFT   CENTER  RIGHT

Rangée B:  [1-7]  [1-10]  [1-7]
           LEFT   CENTER  RIGHT

Rangée C:  [1-7]  [1-10]  [1-7]
           LEFT   CENTER  RIGHT

...

Rangée J:  [1-7]  [1-10]  [1-7]
           LEFT   CENTER  RIGHT

Total: 240 sièges
```

### Détails
- **10 rangées** : A, B, C, D, E, F, G, H, I, J
- **3 sections par rangée** : Gauche (7), Centre (10), Droite (7)
- **24 sièges par rangée**
- **240 sièges au total**

---

## Exemples d'utilisation

### Exemple 1: Afficher le plan de salle

```javascript
// Récupérer tous les sièges d'une séance
fetch('http://localhost/api/v1/sessions/4/seats')
  .then(response => response.json())
  .then(data => {
    const seats = data.data;
    
    // Organiser les sièges par rangée et section
    const seatMap = {};
    
    seats.forEach(seat => {
      if (!seatMap[seat.row]) {
        seatMap[seat.row] = { left: [], center: [], right: [] };
      }
      seatMap[seat.row][seat.section].push(seat);
    });
    
    // Afficher le plan
    Object.keys(seatMap).sort().forEach(row => {
      console.log(`Rangée ${row}:`);
      console.log('  Gauche:', seatMap[row].left.length, 'sièges');
      console.log('  Centre:', seatMap[row].center.length, 'sièges');
      console.log('  Droite:', seatMap[row].right.length, 'sièges');
    });
  });
```

### Exemple 2: Compter les sièges disponibles

```javascript
// Compter les sièges disponibles par section
async function countAvailableSeats(sessionId) {
  const response = await fetch(`http://localhost/api/v1/sessions/${sessionId}/seats`);
  const data = await response.json();
  
  const counts = {
    left: 0,
    center: 0,
    right: 0,
    total: 0
  };
  
  data.data.forEach(seat => {
    if (seat.is_available) {
      counts[seat.section]++;
      counts.total++;
    }
  });
  
  console.log('Places disponibles:');
  console.log(`- Gauche: ${counts.left}`);
  console.log(`- Centre: ${counts.center}`);
  console.log(`- Droite: ${counts.right}`);
  console.log(`- Total: ${counts.total}`);
  
  return counts;
}

countAvailableSeats(4);
```

### Exemple 3: Filtrer les sièges par statut

```javascript
// Récupérer uniquement les sièges disponibles
async function getAvailableSeats(sessionId) {
  const response = await fetch(`http://localhost/api/v1/sessions/${sessionId}/seats`);
  const data = await response.json();
  
  const availableSeats = data.data.filter(seat => seat.is_available);
  
  console.log(`${availableSeats.length} sièges disponibles sur ${data.data.length}`);
  
  return availableSeats;
}

// Récupérer les sièges occupés
async function getOccupiedSeats(sessionId) {
  const response = await fetch(`http://localhost/api/v1/sessions/${sessionId}/seats`);
  const data = await response.json();
  
  const occupiedSeats = data.data.filter(seat => seat.status === 'occupied');
  
  console.log('Sièges occupés:');
  occupiedSeats.forEach(seat => {
    console.log(`- ${seat.seat_code}`);
  });
  
  return occupiedSeats;
}
```

### Exemple 4: Recommander les meilleurs sièges

```javascript
// Recommander les meilleurs sièges (centre, rangées D-F)
async function getBestSeats(sessionId, count = 2) {
  const response = await fetch(`http://localhost/api/v1/sessions/${sessionId}/seats`);
  const data = await response.json();
  
  // Filtrer les sièges disponibles au centre, rangées D-F
  const bestSeats = data.data.filter(seat => 
    seat.is_available &&
    seat.section === 'center' &&
    ['D', 'E', 'F'].includes(seat.row)
  );
  
  // Prendre les sièges du milieu (numéros 4-7)
  const middleSeats = bestSeats.filter(seat => 
    seat.number >= 4 && seat.number <= 7
  );
  
  // Retourner les N premiers
  const recommended = middleSeats.slice(0, count);
  
  console.log(`Sièges recommandés (${recommended.length}):`);
  recommended.forEach(seat => {
    console.log(`- ${seat.seat_code} (${seat.section_label})`);
  });
  
  return recommended;
}

getBestSeats(4, 2);
```

### Exemple 5: Vérifier la disponibilité d'un siège spécifique

```javascript
// Vérifier si un siège spécifique est disponible
async function isSeatAvailable(sessionId, seatCode) {
  const response = await fetch(`http://localhost/api/v1/sessions/${sessionId}/seats`);
  const data = await response.json();
  
  const seat = data.data.find(s => s.seat_code === seatCode);
  
  if (!seat) {
    console.log(`❌ Siège ${seatCode} introuvable`);
    return false;
  }
  
  if (seat.is_available) {
    console.log(`✅ Siège ${seatCode} disponible`);
    return true;
  } else {
    console.log(`❌ Siège ${seatCode} non disponible (${seat.status_label})`);
    return false;
  }
}

// Exemples d'utilisation
isSeatAvailable(4, 'E-center-5');  // Rangée E, Centre, Siège 5
isSeatAvailable(4, 'A-left-1');     // Rangée A, Gauche, Siège 1
```

---

## Tri des résultats

Les sièges sont automatiquement triés dans l'ordre suivant :
1. **Rangée** (A → J)
2. **Section** (left → center → right)
3. **Numéro** (1 → 7 ou 10)

Cela permet d'afficher les sièges dans un ordre logique pour construire un plan de salle.

---

## Performance

- **Temps de réponse** : < 100ms pour 240 sièges
- **Taille de la réponse** : ~15-20 KB (240 sièges)
- **Cache** : Aucun cache appliqué (données en temps réel)

---

## Codes de réponse HTTP

| Code | Description |
|------|-------------|
| `200` | Succès - La liste des sièges est retournée |
| `404` | Non trouvé - La séance n'existe pas |
| `500` | Erreur serveur - Une erreur interne s'est produite |

---

## Notes importantes

1. **Temps réel** : Les statuts des sièges reflètent toujours l'état actuel de la base de données.

2. **Pas de pagination** : Tous les sièges (240) sont retournés en une seule requête.

3. **Format du code siège** : Le `seat_code` suit le format `ROW-SECTION-NUMBER` (ex: `E-center-5`).

4. **Disponibilité** : Le champ `is_available` est un raccourci pour vérifier si `status === 'available'`.

5. **Sièges VIP** : Les sièges avec le statut `vip` peuvent nécessiter un traitement spécial dans votre application (tarif différent, accès restreint, etc.).

6. **Ordre garanti** : Les sièges sont toujours retournés dans le même ordre (rangée → section → numéro).

---

## Intégration avec l'API Sessions

Cette API est complémentaire à l'API Sessions. Workflow typique :

1. **Lister les séances** : `GET /api/v1/sessions/upcoming`
2. **Sélectionner une séance** : `GET /api/v1/sessions/{id}`
3. **Afficher le plan de salle** : `GET /api/v1/sessions/{id}/seats` ⬅️ Cette API
4. **Réserver des sièges** : `POST /api/v1/bookings` (à implémenter)

---

## Support

Pour toute question concernant l'API Sièges, veuillez contacter l'équipe technique de Cineplex.

**Version de l'API**: v1  
**Dernière mise à jour**: 19 janvier 2026
