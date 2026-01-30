# API Réservations - Documentation

Cette API permet aux clients de créer, consulter et annuler des réservations de films avec sélection de sièges et articles buffet.

## Base URL
```
/api/v1/bookings
```

## Authentification
Toutes les routes nécessitent une authentification via **Sanctum**. Ajoutez le token dans le header :
```
Authorization: Bearer {token}
```

---

## 1. Liste des Réservations

### Endpoint
```http
GET /api/v1/bookings
```

### Description
Récupère la liste des réservations du client authentifié, triées par date de création décroissante.

### Réponse Succès (200)
```json
{
  "data": [
    {
      "id": 1,
      "booking_number": "BK202601291A2B3C",
      "movie_session_id": 5,
      "movie": {
        "id": 3,
        "title": "Ballerina",
        "poster_url": "https://image.tmdb.org/...",
        "status": "now_showing"
      },
      "movie_session": {
        "id": 5,
        "session_date": "2026-02-15",
        "start_time": "20:00:00",
        "end_time": "22:00:00",
        "price_per_ticket": 3500,
        "hall": "Salle 1"
      },
      "seats": [
        {
          "id": 45,
          "row": "E",
          "number": 5,
          "section": "standard",
          "status": "booked"
        },
        {
          "id": 46,
          "row": "E",
          "number": 6,
          "section": "standard",
          "status": "booked"
        }
      ],
      "buffet_items": [
        {
          "id": 1,
          "name": "Popcorn Géant",
          "type": "snack",
          "quantity": 2,
          "unit_price": 1500,
          "subtotal": 3000
        },
        {
          "id": 3,
          "name": "Coca-Cola 50cl",
          "type": "drink",
          "quantity": 2,
          "unit_price": 1000,
          "subtotal": 2000
        }
      ],
      "adult_count": 2,
      "child_count": 0,
      "total_amount": 12000,
      "payment_status": "completed",
      "payment_status_label": "Payé",
      "payment_method": "airtel_money",
      "payment_method_label": "Airtel Money",
      "payment_phone": "+237650123456",
      "status": "confirmed",
      "status_label": "Confirmée",
      "created_at": "2026-01-29T15:30:00Z",
      "updated_at": "2026-01-29T15:32:00Z"
    }
  ],
  "links": {
    "first": "http://localhost/api/v1/bookings?page=1",
    "last": "http://localhost/api/v1/bookings?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

---

## 2. Créer une Réservation

### Endpoint
```http
POST /api/v1/bookings
```

### Description
Crée une nouvelle réservation avec sélection de sièges, articles buffet optionnels, et initie le paiement mobile.

### Body Parameters
| Paramètre         | Type    | Requis | Description                                    |
|-------------------|---------|--------|------------------------------------------------|
| movie_session_id  | integer | Oui    | ID de la séance                                |
| seat_ids          | array   | Oui    | Liste des IDs des sièges (min: 1)             |
| buffet_items      | array   | Non    | Articles buffet à commander                    |
| payment_method    | string  | Oui    | `airtel_money` ou `moov_money`                |
| payment_phone     | string  | Oui    | Numéro de téléphone pour le paiement          |

#### Structure de `buffet_items`
```json
{
  "buffet_item_id": 1,
  "quantity": 2
}
```

### Exemple de Requête
```json
{
  "movie_session_id": 5,
  "seat_ids": [45, 46],
  "buffet_items": [
    {
      "buffet_item_id": 1,
      "quantity": 2
    },
    {
      "buffet_item_id": 3,
      "quantity": 2
    }
  ],
  "payment_method": "airtel_money",
  "payment_phone": "+237650123456"
}
```

### Réponse Succès (201)
```json
{
  "message": "Réservation créée avec succès. Veuillez confirmer le paiement sur votre téléphone.",
  "data": {
    "id": 1,
    "booking_number": "BK202601291A2B3C",
    "movie_session_id": 5,
    "movie": { ... },
    "movie_session": { ... },
    "seats": [ ... ],
    "buffet_items": [ ... ],
    "adult_count": 2,
    "child_count": 0,
    "total_amount": 12000,
    "payment_status": "pending",
    "payment_status_label": "En attente",
    "payment_method": "airtel_money",
    "payment_method_label": "Airtel Money",
    "payment_phone": "+237650123456",
    "status": "pending",
    "status_label": "En attente",
    "created_at": "2026-01-29T15:30:00Z",
    "updated_at": "2026-01-29T15:30:00Z"
  },
  "payment": {
    "reference": "PAY123456789",
    "status": "pending"
  }
}
```

### Réponse Erreur (422) - Sièges Non Disponibles
```json
{
  "message": "Un ou plusieurs sièges ne sont plus disponibles."
}
```

### Réponse Erreur (422) - Article Buffet Indisponible
```json
{
  "message": "L'article Popcorn Géant n'est plus disponible."
}
```

### Réponse Erreur (422) - Échec Paiement
```json
{
  "message": "Échec de l'initiation du paiement.",
  "error": "Numéro de téléphone invalide"
}
```

---

## 3. Détails d'une Réservation

### Endpoint
```http
GET /api/v1/bookings/{booking}
```

### Description
Récupère les détails complets d'une réservation spécifique.

### Path Parameters
| Paramètre | Type    | Requis | Description          |
|-----------|---------|--------|----------------------|
| booking   | integer | Oui    | ID de la réservation |

### Exemple de Requête
```http
GET /api/v1/bookings/1
```

### Réponse Succès (200)
```json
{
  "data": {
    "id": 1,
    "booking_number": "BK202601291A2B3C",
    "movie_session_id": 5,
    "movie": { ... },
    "movie_session": { ... },
    "seats": [ ... ],
    "buffet_items": [ ... ],
    "adult_count": 2,
    "child_count": 0,
    "total_amount": 12000,
    "payment_status": "completed",
    "payment_status_label": "Payé",
    "payment_method": "airtel_money",
    "payment_method_label": "Airtel Money",
    "payment_phone": "+237650123456",
    "status": "confirmed",
    "status_label": "Confirmée",
    "created_at": "2026-01-29T15:30:00Z",
    "updated_at": "2026-01-29T15:32:00Z"
  }
}
```

### Réponse Erreur (403)
```json
{
  "message": "Vous n'êtes pas autorisé à voir cette réservation."
}
```

### Réponse Erreur (404)
```json
{
  "message": "Réservation non trouvée."
}
```

---

## 4. Annuler une Réservation

### Endpoint
```http
POST /api/v1/bookings/{booking}/cancel
```

### Description
Annule une réservation et libère les sièges réservés. Seules les réservations non payées peuvent être annulées.

### Path Parameters
| Paramètre | Type    | Requis | Description          |
|-----------|---------|--------|----------------------|
| booking   | integer | Oui    | ID de la réservation |

### Exemple de Requête
```http
POST /api/v1/bookings/1/cancel
```

### Réponse Succès (200)
```json
{
  "message": "Réservation annulée avec succès."
}
```

### Réponse Erreur (403)
```json
{
  "message": "Vous n'êtes pas autorisé à annuler cette réservation."
}
```

### Réponse Erreur (422) - Déjà Annulée
```json
{
  "message": "Cette réservation est déjà annulée."
}
```

### Réponse Erreur (422) - Déjà Payée
```json
{
  "message": "Vous ne pouvez pas annuler une réservation déjà payée. Contactez le support."
}
```

---

## Statuts de Réservation

### Payment Status
| Valeur    | Label      | Description                    |
|-----------|------------|--------------------------------|
| pending   | En attente | Paiement en attente            |
| completed | Payé       | Paiement confirmé              |
| failed    | Échoué     | Paiement échoué                |
| refunded  | Remboursé  | Paiement remboursé             |

### Booking Status
| Valeur    | Label      | Description                    |
|-----------|------------|--------------------------------|
| pending   | En attente | Réservation en attente         |
| confirmed | Confirmée  | Réservation confirmée          |
| cancelled | Annulée    | Réservation annulée            |

### Payment Method
| Valeur        | Label        |
|---------------|--------------|
| airtel_money  | Airtel Money |
| moov_money    | Moov Money   |

---

## Calcul du Montant Total

Le montant total d'une réservation est calculé comme suit :

```
Total = (Nombre de sièges × Prix par ticket) + Somme des articles buffet

Exemple :
- 2 sièges × 3500 XAF = 7000 XAF
- 2 Popcorn × 1500 XAF = 3000 XAF
- 2 Coca-Cola × 1000 XAF = 2000 XAF
Total = 12000 XAF
```

---

## Processus de Réservation

### Étape 1 : Sélection de la Séance
Le client sélectionne un film et une séance.

### Étape 2 : Sélection des Sièges
Le client consulte les sièges disponibles via `/api/v1/sessions/{session}/seats` et sélectionne les sièges souhaités.

### Étape 3 : Articles Buffet (Optionnel)
Le client peut ajouter des articles buffet à sa commande.

### Étape 4 : Création de la Réservation
Le client envoie une requête POST avec :
- IDs des sièges
- Articles buffet (optionnel)
- Mode de paiement
- Numéro de téléphone

### Étape 5 : Initiation du Paiement
L'API initie automatiquement le paiement mobile. Le client reçoit une notification USSD sur son téléphone.

### Étape 6 : Confirmation du Paiement
Le client confirme le paiement sur son téléphone. L'API met à jour automatiquement le statut via webhook.

### Étape 7 : Réservation Confirmée
Une fois le paiement confirmé, la réservation passe au statut "confirmed" et le client reçoit son numéro de réservation.

---

## Gestion des Sièges

### Verrouillage des Sièges
- Les sièges sont verrouillés pendant la création de la réservation (transaction DB)
- Si un siège n'est plus disponible, la réservation échoue
- Les sièges sont marqués "booked" après création réussie

### Libération des Sièges
- Les sièges sont automatiquement libérés si :
  - La réservation est annulée
  - Le paiement échoue
  - Le paiement n'est pas confirmé dans le délai imparti

---

## Codes d'Erreur Communs

| Code | Description                              |
|------|------------------------------------------|
| 200  | Succès                                   |
| 201  | Créé avec succès                         |
| 401  | Non authentifié                          |
| 403  | Non autorisé                             |
| 404  | Ressource non trouvée                    |
| 422  | Erreur de validation ou logique métier   |
| 500  | Erreur serveur                           |

---

## Exemples d'Utilisation

### Exemple 1 : Créer une Réservation Simple (Sans Buffet)
```bash
curl -X POST http://localhost/api/v1/bookings \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "movie_session_id": 5,
    "seat_ids": [45, 46],
    "payment_method": "airtel_money",
    "payment_phone": "+237650123456"
  }'
```

### Exemple 2 : Créer une Réservation avec Buffet
```bash
curl -X POST http://localhost/api/v1/bookings \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "movie_session_id": 5,
    "seat_ids": [45, 46],
    "buffet_items": [
      {"buffet_item_id": 1, "quantity": 2},
      {"buffet_item_id": 3, "quantity": 2}
    ],
    "payment_method": "moov_money",
    "payment_phone": "+237670123456"
  }'
```

### Exemple 3 : Consulter Mes Réservations
```bash
curl -X GET http://localhost/api/v1/bookings \
  -H "Authorization: Bearer {token}"
```

### Exemple 4 : Annuler une Réservation
```bash
curl -X POST http://localhost/api/v1/bookings/1/cancel \
  -H "Authorization: Bearer {token}"
```

---

## Notes Importantes

1. **Numéro de Réservation** : Format `BK{YYYYMMDD}{6 caractères uniques}` (ex: BK202601291A2B3C)

2. **Transaction Atomique** : La création de réservation utilise des transactions DB pour garantir la cohérence

3. **Verrouillage Pessimiste** : Les sièges sont verrouillés pendant la transaction pour éviter les doubles réservations

4. **Paiement Automatique** : Le paiement est initié automatiquement après création de la réservation

5. **Annulation** : Seules les réservations non payées peuvent être annulées par le client

6. **Remboursement** : Pour les réservations payées, contactez le support pour un remboursement

7. **Articles Buffet** : Les prix sont enregistrés au moment de la réservation (pas de changement rétroactif)
