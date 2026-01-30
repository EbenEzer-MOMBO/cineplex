# Service de Réservations - Documentation

Ce service gère toutes les opérations liées aux réservations de films, incluant la création, la consultation et l'annulation de réservations.

## Flux de Réservation et Paiement

### Processus Actuel (2 Scénarios)

#### Scénario 1 : Première Réservation

1. **Création de la réservation** : Appel à `createBooking()` qui crée la réservation avec le statut `pending`
2. **Paiement automatique** : L'API initie automatiquement le paiement mobile
3. **Résultats possibles** :
   - ✅ **Paiement réussi** : Redirection vers la page de succès
   - ❌ **Paiement échoué** : Redirection vers "Mes réservations" avec la possibilité de réessayer

#### Scénario 2 : Reprise de Paiement

1. **Accès depuis "Mes réservations"** : L'utilisateur clique sur une réservation avec statut `pending`
2. **Récupération des données** : Appel à `getBookingById()` pour charger les informations
3. **Initiation du paiement** : Appel à `initiatePayment()` avec l'ID de la réservation existante
4. **Vérification** : Polling avec `verifyPaymentWithPolling()` pour confirmer le paiement
5. **Confirmation** : La réservation passe au statut `confirmed` une fois le paiement réussi

### Avantages de ce Flux

- ✅ **Traçabilité complète** : chaque réservation a un ID unique dès le début
- ✅ **Meilleure gestion des erreurs** : on peut identifier quelle réservation a échoué
- ✅ **Reprise de paiement** : possibilité de finaliser un paiement échoué sans recréer la réservation
- ✅ **Historique complet** : toutes les tentatives de paiement sont tracées
- ✅ **Libération automatique** : les sièges sont libérés si le paiement n'est pas finalisé dans le délai imparti
- ✅ **Expérience utilisateur améliorée** : l'utilisateur peut reprendre là où il s'est arrêté

## Fonctions Disponibles

### `createBooking(token, data)`

Crée une nouvelle réservation avec les sièges sélectionnés et les articles buffet optionnels.

**Paramètres :**
```typescript
{
  movie_session_id: number;      // ID de la séance
  seat_ids: number[];            // Liste des IDs des sièges
  buffet_items?: [               // Articles buffet (optionnel)
    {
      buffet_item_id: number;
      quantity: number;
    }
  ];
  payment_method: 'airtel_money' | 'moov_money';  // Méthode de paiement
  payment_phone: string;         // Numéro de téléphone (+237XXXXXXXXX)
}
```

**Retour :**
```typescript
{
  id: number;                    // ID de la réservation (à utiliser pour le paiement)
  booking_number: string;        // Numéro de réservation (ex: BK202601291A2B3C)
  movie_session_id: number;
  movie: { ... };
  movie_session: { ... };
  seats: [ ... ];
  buffet_items: [ ... ];
  total_amount: number;          // Montant total en XAF
  payment_status: 'pending';     // Statut initial
  status: 'pending';             // Statut initial
  ...
}
```

**Exemple d'utilisation :**
```typescript
import { createBooking } from '@/services/bookingService';
import { authService } from '@/services/auth';

const token = await authService.getToken();

const booking = await createBooking(token, {
  movie_session_id: 5,
  seat_ids: [45, 46],
  buffet_items: [
    { buffet_item_id: 1, quantity: 2 },
    { buffet_item_id: 3, quantity: 2 }
  ],
  payment_method: 'airtel_money',
  payment_phone: '+237650123456'
});

console.log('Réservation créée:', booking.id);
// Maintenant, utiliser booking.id pour initier le paiement
```

### `getBookings(token, page)`

Récupère la liste paginée des réservations du client authentifié.

**Paramètres :**
- `token` (string) : Token d'authentification
- `page` (number, optionnel) : Numéro de page (défaut: 1)

**Retour :**
```typescript
{
  data: Booking[];              // Liste des réservations
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}
```

**Exemple d'utilisation :**
```typescript
import { getBookings } from '@/services/bookingService';
import { authService } from '@/services/auth';

const token = await authService.getToken();
const response = await getBookings(token, 1);

console.log(`Total: ${response.meta.total} réservations`);
response.data.forEach(booking => {
  console.log(`${booking.booking_number} - ${booking.status_label}`);
});
```

### `getBookingById(token, bookingId)`

Récupère les détails complets d'une réservation spécifique.

**Paramètres :**
- `token` (string) : Token d'authentification
- `bookingId` (number) : ID de la réservation

**Retour :** Objet `Booking` complet

**Exemple d'utilisation :**
```typescript
import { getBookingById } from '@/services/bookingService';
import { authService } from '@/services/auth';

const token = await authService.getToken();
const booking = await getBookingById(token, 1);

console.log(`Réservation: ${booking.booking_number}`);
console.log(`Film: ${booking.movie.title}`);
console.log(`Montant: ${booking.total_amount} XAF`);
console.log(`Statut: ${booking.status_label}`);
```

### `cancelBooking(token, bookingId)`

Annule une réservation et libère les sièges réservés.

**⚠️ Important :** Seules les réservations avec `payment_status: 'pending'` peuvent être annulées par le client.

**Paramètres :**
- `token` (string) : Token d'authentification
- `bookingId` (number) : ID de la réservation

**Retour :**
```typescript
{
  message: string;  // Message de confirmation
}
```

**Exemple d'utilisation :**
```typescript
import { cancelBooking } from '@/services/bookingService';
import { authService } from '@/services/auth';

const token = await authService.getToken();

try {
  const result = await cancelBooking(token, 1);
  console.log(result.message); // "Réservation annulée avec succès."
} catch (error) {
  console.error('Erreur:', error.message);
  // Peut être: "Vous ne pouvez pas annuler une réservation déjà payée."
}
```

## Types de Données

### Booking

```typescript
interface Booking {
  id: number;
  booking_number: string;
  movie_session_id: number;
  movie: BookingMovie;
  movie_session: BookingSession;
  seats: BookingSeat[];
  buffet_items: BookingBuffetItem[];
  adult_count: number;
  child_count: number;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_status_label: string;
  payment_method: 'airtel_money' | 'moov_money';
  payment_method_label: string;
  payment_phone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  status_label: string;
  created_at: string;
  updated_at: string;
}
```

### BookingSeat

```typescript
interface BookingSeat {
  id: number;
  row: string;
  number: number;
  section: string;
  status: string;
}
```

### BookingBuffetItem

```typescript
interface BookingBuffetItem {
  id: number;
  name: string;
  type: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}
```

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

## Gestion des Erreurs

Toutes les fonctions peuvent lever des exceptions avec des messages d'erreur explicites :

```typescript
try {
  const booking = await createBooking(token, data);
} catch (error) {
  // Erreurs possibles:
  // - "Un ou plusieurs sièges ne sont plus disponibles."
  // - "L'article Popcorn Géant n'est plus disponible."
  // - "Impossible de se connecter au serveur"
  console.error(error.message);
}
```

## Exemple Complet : Processus de Réservation

```typescript
import { createBooking, getBookingById } from '@/services/bookingService';
import { initiatePayment, verifyPaymentWithPolling } from '@/services/paymentService';
import { authService } from '@/services/auth';

async function completeBookingProcess() {
  const token = await authService.getToken();
  
  try {
    // ÉTAPE 1 : Créer la réservation
    console.log('Création de la réservation...');
    const booking = await createBooking(token, {
      movie_session_id: 5,
      seat_ids: [45, 46],
      payment_method: 'airtel_money',
      payment_phone: '+237650123456'
    });
    
    console.log(`Réservation créée: ${booking.booking_number}`);
    console.log(`ID: ${booking.id}`);
    console.log(`Montant: ${booking.total_amount} XAF`);
    
    // ÉTAPE 2 : Initier le paiement avec l'ID de la réservation
    console.log('Initiation du paiement...');
    const paymentResponse = await initiatePayment(token, {
      booking_id: booking.id,
      payment_method: 'airtel_money',
      msisdn: '650123456'
    });
    
    if (!paymentResponse.success || !paymentResponse.bill_id) {
      throw new Error('Échec de l\'initiation du paiement');
    }
    
    console.log('Paiement initié. En attente de confirmation...');
    
    // ÉTAPE 3 : Vérifier le paiement (polling pendant 60 secondes)
    const verifyResult = await verifyPaymentWithPolling(
      token,
      paymentResponse.bill_id,
      20,    // 20 tentatives
      3000   // toutes les 3 secondes
    );
    
    if (verifyResult.status === 'completed') {
      console.log('✅ Paiement confirmé !');
      
      // ÉTAPE 4 : Récupérer les détails finaux de la réservation
      const finalBooking = await getBookingById(token, booking.id);
      console.log(`Statut: ${finalBooking.status_label}`);
      console.log(`Paiement: ${finalBooking.payment_status_label}`);
      
      return finalBooking;
    } else {
      console.log('❌ Paiement échoué');
      throw new Error(verifyResult.message);
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
    throw error;
  }
}
```

## Notes Importantes

1. **Numéro de Téléphone** : 
   - Pour `createBooking()` : format international `+237XXXXXXXXX`
   - Pour `initiatePayment()` : format local `XXXXXXXXX` (sans +237)

2. **Transaction Atomique** : La création de réservation utilise des transactions DB pour garantir la cohérence

3. **Verrouillage des Sièges** : Les sièges sont verrouillés pendant la transaction pour éviter les doubles réservations

4. **Libération Automatique** : Les sièges sont automatiquement libérés si le paiement échoue ou n'est pas confirmé

5. **Annulation** : Seules les réservations non payées (`payment_status: 'pending'`) peuvent être annulées

6. **Remboursement** : Pour les réservations payées, contactez le support pour un remboursement

## Intégration avec PaymentService

Le `bookingService` doit être utilisé **avant** le `paymentService` :

```typescript
// ✅ BON : Créer la réservation d'abord
const booking = await createBooking(token, data);
const payment = await initiatePayment(token, {
  booking_id: booking.id,
  ...
});

// ❌ MAUVAIS : Ne pas initier le paiement sans réservation
const payment = await initiatePayment(token, {
  booking_id: 999,  // ID inexistant
  ...
});
```

## Support

Pour toute question ou problème, consultez la documentation de l'API dans `API_BOOKINGS.md`.
