# 💳 Flow de Paiement Mobile - Documentation

## 🎯 Principe Général

Le système utilise un flow de paiement mobile unifié pour les **nouvelles réservations** et les **reprises de paiement**, avec un mécanisme de polling pour vérifier le statut du paiement en temps réel.

---

## 📋 Scénarios de Paiement

### Scénario 1 : Nouvelle Réservation

#### Étapes :
1. **Création de la réservation**
   - L'utilisateur sélectionne film, séance, sièges
   - L'utilisateur choisit le mode de paiement (Airtel/Moov)
   - L'utilisateur entre son numéro de téléphone
   
2. **Appel API : `POST /bookings`**
   ```typescript
   {
     movie_session_id: number,
     seat_ids: number[],
     payment_method: 'airtel_money' | 'moov_money',
     payment_phone: string
   }
   ```

3. **Réponse de l'API**
   ```typescript
   {
     data: {
       id: number,           // ID de la réservation
       bill_id: string,      // ID de la facture pour le polling
       payment_status: 'pending',
       // ... autres champs
     }
   }
   ```

4. **Délai d'initialisation**
   - Si `bill_id` est présent → **Attendre 15 secondes** en arrière-plan
   - Pas de modal affiché pendant cette période
   - Permet au système de paiement mobile de s'initialiser correctement

5. **Polling automatique**
   - Après les 15 secondes → Afficher le modal "En attente de confirmation"
   - Lancer `verifyPaymentWithPolling()`
   - **20 tentatives** toutes les **3 secondes** (1 minute au total)
   - L'utilisateur reçoit une notification sur son téléphone
   - Il valide le paiement sur l'app mobile Airtel/Moov

6. **Résultats possibles**
   - ✅ **Paiement réussi** → Redirection vers page de succès
   - ❌ **Paiement échoué** → Alerte + possibilité de réessayer depuis "Mes réservations"
   - ⏱️ **Timeout** → Alerte + message "Vous pouvez réessayer depuis Mes réservations"

---

### Scénario 2 : Reprise de Paiement

#### Contexte :
L'utilisateur a une réservation avec `payment_status: 'pending'` qu'il souhaite finaliser.

#### Étapes :

1. **Accès depuis "Mes réservations"**
   - L'utilisateur clique sur une réservation en attente
   - Badge "Payer" affiché sur la carte

2. **Chargement des données**
   - Les informations de la réservation sont pré-remplies :
     - Film, séance, sièges
     - Montant total
     - Numéro de téléphone (si disponible)
     - Méthode de paiement (si disponible)

3. **Appel API : `POST /payment/initiate`**
   ```typescript
   {
     booking_id: number,
     payment_method: 'airtel_money' | 'moov_money',
     msisdn: string  // Format: +237XXXXXXXXX
   }
   ```

4. **Réponse de l'API**
   ```typescript
   {
     success: true,
     bill_id: string,
     message: string
   }
   ```

5. **Délai d'initialisation** (identique au Scénario 1)
   - **Attente de 15 secondes** en arrière-plan
   - Pas de modal pendant cette période

6. **Polling automatique**
   - Affichage du modal "En attente de confirmation"
   - Vérification toutes les 3 secondes pendant 1 minute
   - L'utilisateur valide sur son téléphone

7. **Résultats possibles** (identiques au Scénario 1)

---

## 🔄 Mécanisme de Polling

### Fonction : `verifyPaymentWithPolling()`

```typescript
async function verifyPaymentWithPolling(
  token: string,
  billId: string,
  maxAttempts: number = 20,    // 20 tentatives
  intervalMs: number = 3000    // 3 secondes
): Promise<VerifyPaymentResponse>
```

### Fonctionnement :

1. **Appel API répété** : `POST /payment/verify`
   ```typescript
   { bill_id: string }
   ```

2. **Réponses possibles** :
   - `status: 'pending'` → Continue le polling
   - `status: 'completed'` → ✅ Arrête et retourne succès
   - `status: 'failed'` → ❌ Arrête et retourne échec

3. **Timeout** :
   - Après 20 tentatives (60 secondes) sans résultat définitif
   - Retourne `status: 'failed'` avec message de timeout

### Logs de Debug :
```typescript
console.log(`Début du polling: ${maxAttempts} tentatives, intervalle ${intervalMs}ms`);
console.log(`Tentative ${i + 1}/${maxAttempts} - Vérification du paiement...`);
console.log(`Résultat tentative ${i + 1}: ${result.status}`);
console.log(`Attente de ${intervalMs}ms avant la prochaine tentative...`);
console.log('Polling terminé - Délai expiré.');
```

---

## 🎨 Interface Utilisateur

### Modal de Paiement (`PaymentModal`)

Affiche 3 états distincts :

#### 1. **Waiting** (En attente)
- Animation de chargement
- Message : "En attente de confirmation..."
- Instruction : "Validez le paiement sur votre téléphone"
- **Durée** : jusqu'à 60 secondes
- **Note** : Ce modal s'affiche seulement après le délai de 15 secondes

#### 2. **Success** (Succès)
- Icône de succès (✓)
- Message : "Paiement réussi!"
- Redirection automatique

#### 3. **Error** (Erreur)
- Icône d'erreur (✕)
- Message d'erreur spécifique
- Bouton de fermeture

---

## 🛠️ Code Simplifié

### Nouvelle Réservation

```typescript
const booking = await createBooking(token, {
  movie_session_id: session.id,
  seat_ids: selectedSeatIds,
  payment_method: 'airtel_money',
  payment_phone: '670000000',
});

if (booking.bill_id && booking.payment_status === 'pending') {
  // Attendre 15 secondes pour l'initialisation du système de paiement
  console.log('Attente de 15 secondes avant d\'afficher le modal...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // Afficher le modal en mode "waiting"
  setPaymentStatus('waiting');
  setShowPaymentModal(true);
  
  const result = await verifyPaymentWithPolling(
    token,
    booking.bill_id,
    20,    // 20 tentatives
    3000   // 3 secondes
  );
  
  if (result.status === 'completed') {
    // Succès → Redirection
    router.push(`/booking-success/${bookingId}`);
  } else {
    // Échec ou timeout → Alerte
    Alert.alert('Paiement en attente', 'Réessayez depuis Mes réservations');
  }
}
```

### Reprise de Paiement

```typescript
const response = await initiatePayment(token, {
  booking_id: bookingId,
  payment_method: 'moov_money',
  msisdn: '+237670000000',
});

if (response.success && response.bill_id) {
  // Attendre 15 secondes pour l'initialisation du système de paiement
  console.log('Attente de 15 secondes avant d\'afficher le modal...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // Afficher le modal en mode "waiting"
  setPaymentStatus('waiting');
  setShowPaymentModal(true);
  
  const result = await verifyPaymentWithPolling(
    token,
    response.bill_id,
    20,
    3000
  );
  
  if (result.status === 'completed') {
    // Succès
    router.push(`/booking-success/${bookingId}`);
  } else {
    // Échec
    Alert.alert('Paiement échoué', result.message);
  }
}
```

---

## 📊 Diagramme de Flow

```
┌─────────────────────────────────────┐
│  Utilisateur sélectionne            │
│  Film + Séance + Sièges             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Utilisateur choisit                │
│  Méthode + Numéro                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  POST /bookings                     │
│  → Créer réservation + Init paiement│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Réponse: { bill_id, status }       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Modal: "Validez sur votre tél."   │
│  Polling: 20x toutes les 3s         │
└──────────────┬──────────────────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
┌─────────┐        ┌──────────┐
│ Succès  │        │  Échec   │
│ (1 min) │        │ (timeout)│
└────┬────┘        └─────┬────┘
     │                   │
     ▼                   ▼
┌─────────┐        ┌──────────────┐
│ Page de │        │ Mes          │
│ Succès  │        │ Réservations │
└─────────┘        └──────────────┘
```

---

## ⚠️ Gestion des Erreurs

### Erreurs Possibles

1. **Timeout du polling**
   - Message : "Le délai de paiement a expiré. Veuillez réessayer."
   - Action : Redirection vers "Mes réservations"

2. **Paiement refusé**
   - Message : "Paiement refusé. Vérifiez votre solde."
   - Action : Possibilité de réessayer

3. **Erreur réseau**
   - Message : "Impossible de se connecter au serveur"
   - Action : Réessayer

4. **Numéro invalide**
   - Validation côté client avant envoi
   - Format : 07XXXXXXX (Airtel) ou 06XXXXXXX (Moov)

---

## 🔐 Sécurité

- ✅ **Token JWT** requis pour toutes les opérations
- ✅ **Validation côté serveur** des numéros de téléphone
- ✅ **Vérification de disponibilité** des sièges avant création
- ✅ **Expiration automatique** des réservations non payées (configuré côté serveur)
- ✅ **Bill ID unique** pour chaque tentative de paiement

---

## 📱 Expérience Utilisateur

### Temps de Réponse

| Étape | Temps Moyen | Max |
|-------|-------------|-----|
| Création réservation | 1-2s | 5s |
| Initialisation paiement | 1-2s | 5s |
| Attente avant polling | 15s | 15s |
| Validation utilisateur | 10-30s | 60s |
| Polling total | 30-60s | 75s |

### Messages Clairs

- ✅ **Initiating** : "Initialisation en cours..."
- ⏳ **Waiting** : "Validez le paiement sur votre téléphone"
- ✅ **Success** : "Paiement réussi! Redirection..."
- ❌ **Error** : Message d'erreur spécifique + action recommandée

---

## 🧪 Testing

### Test Nouvelle Réservation

1. Sélectionner un film et une séance
2. Choisir des sièges
3. Choisir Airtel Money + 07XXXXXXXX
4. Confirmer le paiement
5. ✅ Vérifier que le modal "waiting" s'affiche
6. ✅ Vérifier les logs de polling dans la console
7. Valider le paiement sur le téléphone
8. ✅ Vérifier la redirection vers la page de succès

### Test Reprise de Paiement

1. Créer une réservation sans finaliser le paiement
2. Aller dans "Mes réservations"
3. Cliquer sur une réservation "pending"
4. Vérifier que les données sont pré-remplies
5. Modifier si nécessaire
6. Confirmer le paiement
7. ✅ Même flow que nouvelle réservation

---

## 📖 Fichiers Concernés

| Fichier | Rôle |
|---------|------|
| `app/booking-payment/[id].tsx` | Écran de paiement (nouveau + reprise) |
| `services/bookingService.ts` | API de création de réservation |
| `services/paymentService.ts` | API d'initiation et vérification |
| `components/payment-modal.tsx` | Modal de paiement avec états |
| `components/payment-option.tsx` | Sélection Airtel/Moov |
| `components/phone-input.tsx` | Saisie et validation du numéro |

---

## 🎉 Résumé

✅ **Flow unifié** pour nouvelle réservation et reprise  
✅ **Polling automatique** avec feedback en temps réel  
✅ **Gestion des timeouts** et erreurs  
✅ **Expérience utilisateur fluide** avec états clairs  
✅ **Logs détaillés** pour le debug  

**Date** : 15 février 2026  
**Version** : 2.0 (Flow unifié avec polling)  
**Status** : ✅ Opérationnel
