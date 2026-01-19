# API Paiement Mobile - Documentation

## Vue d'ensemble

L'API de paiement permet d'initier et de gérer les paiements mobiles (Airtel Money, Moov Money) pour les réservations de cinéma Cineplex.

**Base URL**: `http://localhost/api/v1/payments`

**Format de réponse**: JSON

**Authentication**: Token Sanctum requis pour toutes les routes

---

## Endpoints

### 1. Initier un paiement

Démarre le processus de paiement mobile pour une réservation.

**Endpoint**: `POST /api/v1/payments/initiate`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Corps de la requête**:
```json
{
  "booking_id": 1,
  "payment_method": "airtel_money",
  "msisdn": "22890123456"
}
```

**Paramètres**:

| Paramètre | Type | Description | Requis |
|-----------|------|-------------|--------|
| `booking_id` | integer | ID de la réservation | ✅ Oui |
| `payment_method` | string | `airtel_money` ou `moov_money` | ✅ Oui |
| `msisdn` | string | Numéro de téléphone (8-15 chiffres) | ✅ Oui |

**Réponse succès** (200 OK):
```json
{
  "success": true,
  "bill_id": "BILL-12345678",
  "transaction_reference": "TXN-65A2F3B1C4D5E",
  "message": "Veuillez vérifier votre téléphone pour procéder au paiement. Vous avez 30 secondes..."
}
```

**Réponse erreur** (400 Bad Request):
```json
{
  "success": false,
  "message": "Cette réservation a déjà été payée ou annulée."
}
```

**Réponse erreur** (422 Unprocessable Entity):
```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": {
    "msisdn": [
      "Le format du numéro de téléphone est invalide."
    ]
  }
}
```

---

### 2. Vérifier un paiement

Vérifie le statut d'un paiement en cours.

**Endpoint**: `POST /api/v1/payments/verify`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Corps de la requête**:
```json
{
  "bill_id": "BILL-12345678"
}
```

**Paramètres**:

| Paramètre | Type | Description | Requis |
|-----------|------|-------------|--------|
| `bill_id` | string | ID de la facture retourné lors de l'initiation | ✅ Oui |

**Réponse succès - Paiement confirmé** (200 OK):
```json
{
  "success": true,
  "status": "completed",
  "message": "Le paiement a été confirmé avec succès.",
  "booking": {
    "id": 1,
    "booking_number": "BK-2026-001",
    "total_amount": 10000,
    "payment_status": "completed",
    "status": "confirmed",
    "movie": {
      "id": 1,
      "title": "Avatar : De feu et de cendres"
    },
    "session": {
      "id": 4,
      "session_date": "2026-01-25",
      "start_time": "20:00"
    }
  }
}
```

**Réponse - Paiement en attente** (200 OK):
```json
{
  "success": false,
  "status": "pending",
  "message": "Paiement en attente de confirmation."
}
```

**Réponse - Paiement échoué** (200 OK):
```json
{
  "success": false,
  "status": "failed",
  "message": "Le paiement a échoué."
}
```

---

### 3. Annuler une transaction

Annule une transaction en attente et libère les sièges réservés.

**Endpoint**: `POST /api/v1/payments/cancel`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Corps de la requête**:
```json
{
  "transaction_reference": "TXN-65A2F3B1C4D5E"
}
```

**Paramètres**:

| Paramètre | Type | Description | Requis |
|-----------|------|-------------|--------|
| `transaction_reference` | string | Référence de la transaction | ✅ Oui |

**Réponse succès** (200 OK):
```json
{
  "success": true,
  "message": "La transaction a été annulée avec succès."
}
```

**Réponse erreur** (400 Bad Request):
```json
{
  "success": false,
  "message": "Cette transaction a déjà été complétée et ne peut pas être annulée."
}
```

---

### 4. Historique des transactions

Récupère l'historique des transactions du client connecté.

**Endpoint**: `GET /api/v1/payments/history`

**Headers**:
```
Authorization: Bearer {token}
```

**Paramètres de requête** (optionnels):

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page (défaut: 1) |
| `per_page` | integer | Résultats par page (défaut: 15) |

**Exemple de requête**:
```bash
GET /api/v1/payments/history?page=1
```

**Réponse succès** (200 OK):
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "reference": "TXN-65A2F3B1C4D5E",
        "bill_id": "BILL-12345678",
        "amount": 10000,
        "payment_method": "airtel_money",
        "payer_msisdn": "22890123456",
        "status": "completed",
        "completed_at": "2026-01-19T15:30:45+00:00",
        "created_at": "2026-01-19T15:28:12+00:00",
        "booking": {
          "id": 1,
          "booking_number": "BK-2026-001",
          "movie": {
            "id": 1,
            "title": "Avatar : De feu et de cendres"
          },
          "session": {
            "id": 4,
            "session_date": "2026-01-25",
            "start_time": "20:00"
          }
        }
      }
    ],
    "first_page_url": "http://localhost/api/v1/payments/history?page=1",
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

---

## Workflow de paiement

### Étapes complètes

1. **Créer une réservation** (non implémenté dans cette doc)
   - Le client sélectionne ses sièges
   - Une réservation est créée avec `payment_status: pending`

2. **Initier le paiement** : `POST /payments/initiate`
   - Envoie les informations de paiement
   - Reçoit un `bill_id` et `transaction_reference`
   - Un push USSD est envoyé au téléphone du client

3. **Le client confirme sur son téléphone**
   - Le client entre son code PIN
   - Le paiement est traité par l'opérateur

4. **Vérifier le paiement** : `POST /payments/verify`
   - Appeler cette route toutes les 5 secondes pendant 30 secondes
   - Quand `status: completed`, le paiement est confirmé
   - Les sièges sont marqués comme `occupied`

5. **En cas d'échec ou d'abandon**
   - Appeler `POST /payments/cancel` pour libérer les sièges
   - Ou attendre l'expiration automatique (30 secondes)

---

## Diagramme de flux

```
┌─────────────────┐
│  Créer          │
│  Réservation    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Initier        │
│  Paiement       │◄──── POST /payments/initiate
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Push USSD      │
│  envoyé         │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Client entre   │
│  son code PIN   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Vérifier       │◄──── POST /payments/verify (polling)
│  Paiement       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    v         v
┌───────┐ ┌───────┐
│Success│ │Failed │
└───┬───┘ └───┬───┘
    │         │
    v         v
┌───────┐ ┌───────┐
│Sièges │ │Sièges │
│Occupés│ │Libérés│
└───────┘ └───────┘
```

---

## Statuts des transactions

| Statut | Description |
|--------|-------------|
| `pending` | Transaction créée, en attente d'initiation |
| `processing` | Push USSD envoyé, en attente de confirmation |
| `completed` | Paiement confirmé avec succès |
| `failed` | Paiement échoué ou annulé |

---

## Méthodes de paiement

| Valeur | Label | Opérateur |
|--------|-------|-----------|
| `airtel_money` | Airtel Money | Airtel |
| `moov_money` | Moov Money | Moov Africa |

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| `200` | Succès |
| `400` | Requête invalide (réservation déjà payée, transaction déjà complétée, etc.) |
| `401` | Non authentifié |
| `404` | Ressource non trouvée |
| `422` | Erreur de validation |
| `500` | Erreur serveur |

---

## Exemples d'utilisation

### Exemple 1: Workflow complet avec polling

```javascript
// 1. Initier le paiement
async function initiatePayment(bookingId, paymentMethod, msisdn) {
  const response = await fetch('http://localhost/api/v1/payments/initiate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      booking_id: bookingId,
      payment_method: paymentMethod,
      msisdn: msisdn
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log(data.message);
    return data.bill_id;
  } else {
    throw new Error(data.message);
  }
}

// 2. Vérifier le paiement avec polling
async function verifyPaymentWithPolling(billId, maxAttempts = 6) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch('http://localhost/api/v1/payments/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bill_id: billId })
    });
    
    const data = await response.json();
    
    if (data.status === 'completed') {
      console.log('✅ Paiement confirmé!');
      return data.booking;
    }
    
    if (data.status === 'failed') {
      console.log('❌ Paiement échoué');
      throw new Error(data.message);
    }
    
    // Attendre 5 secondes avant la prochaine vérification
    console.log(`⏳ Tentative ${i + 1}/${maxAttempts}...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  throw new Error('Timeout: Le paiement n\'a pas été confirmé dans le délai imparti.');
}

// Utilisation
try {
  const billId = await initiatePayment(1, 'airtel_money', '22890123456');
  const booking = await verifyPaymentWithPolling(billId);
  console.log('Réservation confirmée:', booking);
} catch (error) {
  console.error('Erreur:', error.message);
}
```

### Exemple 2: Annuler une transaction

```javascript
async function cancelPayment(transactionReference) {
  const response = await fetch('http://localhost/api/v1/payments/cancel', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transaction_reference: transactionReference
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Transaction annulée');
  } else {
    console.log('❌ Erreur:', data.message);
  }
}
```

### Exemple 3: Afficher l'historique

```javascript
async function getPaymentHistory(page = 1) {
  const response = await fetch(`http://localhost/api/v1/payments/history?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`Page ${data.data.current_page} sur ${data.data.last_page}`);
    data.data.data.forEach(transaction => {
      console.log(`${transaction.reference} - ${transaction.amount} XAF - ${transaction.status}`);
      console.log(`  Film: ${transaction.booking.movie.title}`);
      console.log(`  Date: ${transaction.booking.session.session_date}`);
    });
  }
}
```

---

## Configuration

Ajoutez ces variables dans votre fichier `.env` :

```env
PAYMENT_AUTH_URL=https://staging.billing-easy.net/shap/api/v1/merchant/auth
PAYMENT_INVOICE_URL=https://staging.billing-easy.net/shap/api/v1/merchant/create-invoice
PAYMENT_USSD_PUSH_URL=https://staging.billing-easy.net/shap/api/v1/merchant/send-ussd-push
PAYMENT_CHECK_BILL_URL=https://stg.billing-easy.com/api/v1/merchant/e_bills

PAYMENT_API_ID=your_api_id
PAYMENT_API_SECRET=your_api_secret
PAYMENT_USER_NAME=your_username
PAYMENT_SHARED_KEY=your_shared_key
```

---

## Notes importantes

1. **Timeout** : Le client a 30 secondes pour confirmer le paiement sur son téléphone.

2. **Polling** : Vérifiez le statut toutes les 5 secondes pendant 30 secondes maximum.

3. **Sièges** : Les sièges sont automatiquement libérés si le paiement échoue ou est annulé.

4. **Sécurité** : Toutes les routes nécessitent une authentification Sanctum.

5. **Montants** : Les montants sont en Francs CFA (XAF) sans décimales.

6. **Numéro de téléphone** : Format international sans le `+` (ex: `22890123456`).

---

## Support

Pour toute question concernant l'API de paiement, veuillez contacter l'équipe technique de Cineplex.

**Version de l'API**: v1  
**Dernière mise à jour**: 19 janvier 2026
