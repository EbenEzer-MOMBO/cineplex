# Intégration du Service de Sélection de Séances

## ✅ Fichiers créés

### 1. `services/sessionService.ts`
Service complet pour la gestion des séances avec l'API.

**Fonctionnalités:**
- ✅ Récupération de toutes les séances avec filtres
- ✅ Récupération d'une séance par ID
- ✅ Séances du jour
- ✅ Séances à venir
- ✅ Séances par film
- ✅ Vérification de disponibilité
- ✅ Fonctions utilitaires de formatage

**Types TypeScript:**
- `Session` - Interface complète pour une séance
- `SessionsResponse` - Réponse paginée
- `SingleSessionResponse` - Réponse pour une séance unique

### 2. `components/session-selector-modal.tsx`
Modal moderne pour la sélection de séances.

**Fonctionnalités:**
- ✅ Chargement automatique des séances du film
- ✅ Groupement par date avec sélecteur horizontal
- ✅ Affichage des informations clés:
  - Heure de début
  - Durée (début - fin)
  - Prix du ticket
  - Places disponibles
- ✅ États de chargement (loading, error, empty)
- ✅ Désactivation visuelle des séances:
  - Séances complètes
  - Séances passées
  - Séances annulées
- ✅ Design responsive et moderne

### 3. `services/index.ts`
Export centralisé de tous les services.

### 4. `services/README.md`
Documentation complète du service avec exemples d'utilisation.

### 5. `INTEGRATION_SESSIONS.md`
Ce fichier - documentation de l'intégration.

---

## 🔧 Modifications apportées

### `app/booking/[id].tsx`

**Imports ajoutés:**
```typescript
import { SessionSelectorModal } from '@/components/session-selector-modal';
import { Session } from '@/services/sessionService';
```

**État ajouté:**
```typescript
const [selectedSession, setSelectedSession] = useState<Session | null>(null);
const [showSessionModal, setShowSessionModal] = useState(false);
```

**Fonctions ajoutées:**
```typescript
const handleSessionSelect = (session: Session) => {
  setSelectedSession(session);
};

const formatSessionDisplay = (session: Session): string => {
  const time = session.start_time.substring(0, 5);
  const date = new Date(session.session_date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
  return `${date} à ${time}`;
};
```

**Composant modal ajouté:**
```typescript
<SessionSelectorModal
  visible={showSessionModal}
  movieId={parseInt(id as string)}
  onClose={() => setShowSessionModal(false)}
  onSelect={handleSessionSelect}
/>
```

**Bouton de sélection mis à jour:**
```typescript
<SelectionButton
  label="Sélectionner une Séance"
  value={selectedSession ? formatSessionDisplay(selectedSession) : ''}
  required
  onPress={() => setShowSessionModal(true)}
/>
```

---

## 🎯 Flux utilisateur

1. **Page de réservation** (`/booking/[id]`)
   - L'utilisateur clique sur "Sélectionner une Séance"
   
2. **Modal s'ouvre**
   - Chargement automatique des séances pour le film sélectionné
   - Affichage groupé par date
   
3. **Sélection de date**
   - L'utilisateur peut choisir parmi les dates disponibles
   - Les chips de date sont scrollables horizontalement
   
4. **Liste des séances**
   - Affichage de toutes les séances pour la date sélectionnée
   - Informations visibles: heure, durée, prix, places
   - Séances non disponibles sont grisées
   
5. **Sélection finale**
   - Clic sur une séance disponible
   - Modal se ferme
   - Séance affichée dans le bouton au format: "25 janv. à 19:00"
   - Bouton "Suivant" devient actif

---

## 🔌 API utilisée

Basée sur la documentation `API_SESSIONS.md`.

**Endpoint principal utilisé:**
```
GET /api/v1/movies/{movie_id}/sessions
```

**Réponse attendue:**
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
    }
  ]
}
```

---

## 🎨 Design

**Couleurs utilisées:**
- Primaire: `#5B7FFF` (bleu)
- Succès: `#34C759` (vert pour le prix)
- Fond: `#1C1C1E` (noir)
- Cartes: `#2C2C2E` (gris foncé)
- Texte secondaire: `#8E8E93` (gris)
- Erreur: `#FF3B30` (rouge)

**Icônes:**
- Horloge pour la durée
- Billet pour le prix
- Personnes pour les places disponibles
- Chevron pour la navigation
- Croix pour fermer

---

## 📝 Points à noter

1. **Type de données:**
   - `selectedSession` est maintenant de type `Session | null` au lieu de `string`
   - Permet d'accéder à toutes les données de la séance (prix, places, etc.)

2. **Validation:**
   - Le bouton "Suivant" n'est actif que si une séance est sélectionnée
   - Les séances passées/complètes/annulées ne sont pas cliquables

3. **Format d'affichage:**
   - Date: format court "25 janv."
   - Heure: format "HH:mm" (ex: "19:00")
   - Prix: format avec séparateurs de milliers et "f" (ex: "5 000f")

4. **Gestion des erreurs:**
   - Affichage d'un message d'erreur avec bouton "Réessayer"
   - État vide si aucune séance disponible
   - Loading spinner pendant le chargement

---

## 🚀 Prochaines étapes possibles

1. **Amélioration de la sélection:**
   - Ajouter un filtre par heure (matin, après-midi, soir)
   - Tri par prix
   - Afficher uniquement les séances avec places disponibles

2. **Persistance:**
   - Sauvegarder la séance sélectionnée dans un contexte global
   - Permettre de revenir en arrière sans perdre la sélection

3. **Optimisations:**
   - Cache des séances déjà chargées
   - Rafraîchissement automatique de la disponibilité

4. **Accessibilité:**
   - Labels ARIA pour les lecteurs d'écran
   - Navigation au clavier

---

## 🐛 Debug

Pour déboguer le service de sessions:

```typescript
// Dans sessionService.ts, ajouter des logs:
console.log('Fetching sessions for movie:', movieId);
console.log('API Response:', response);

// Dans le modal:
console.log('Sessions loaded:', sessions.length);
console.log('Selected date:', selectedDate);
```

---

## 📚 Documentation de référence

- `API_SESSIONS.md` - Documentation complète de l'API
- `services/README.md` - Documentation du service
- `DATA_MODEL.md` - Modèle de données

---

**Version:** 1.0.0  
**Date:** 19 janvier 2026  
**Auteur:** Cineplex Development Team
