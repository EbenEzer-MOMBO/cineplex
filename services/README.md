# Services - Documentation

Ce dossier contient tous les services d'API pour l'application Cineplex.

## Session Service (`sessionService.ts`)

Service pour gérer les séances de films.

### Types

#### `Session`
Représente une séance de film avec toutes ses informations.

```typescript
interface Session {
  id: number;
  movie_id: number;
  session_date: string;        // ISO 8601
  start_time: string;           // HH:mm:ss
  end_time: string;             // HH:mm:ss
  price_per_ticket: number;     // Prix en XAF
  available_seats: number;
  status: 'available' | 'full' | 'cancelled';
  status_label: string;
  created_at: string;
  updated_at: string;
  movie?: Movie;                // Inclus dans les réponses
  is_past: boolean;
  is_today: boolean;
  formatted_date: string;       // Format: "samedi 25 janvier 2026"
  formatted_time: string;       // Format: "19:00"
}
```

### Fonctions disponibles

#### `getSessions(params?)`
Récupère la liste de toutes les séances avec filtres optionnels.

**Paramètres:**
```typescript
{
  date_from?: string;      // YYYY-MM-DD
  date_to?: string;        // YYYY-MM-DD
  movie_id?: number;
  date?: string;           // YYYY-MM-DD
  per_page?: number;
  page?: number;
}
```

**Exemple:**
```typescript
const sessions = await getSessions({ 
  movie_id: 3, 
  date: '2026-01-25' 
});
```

#### `getSessionById(id)`
Récupère les détails d'une séance spécifique.

**Exemple:**
```typescript
const session = await getSessionById(1);
```

#### `getTodaySessions()`
Récupère toutes les séances d'aujourd'hui.

**Exemple:**
```typescript
const todaySessions = await getTodaySessions();
```

#### `getUpcomingSessions(params?)`
Récupère les séances à venir à partir d'aujourd'hui.

**Paramètres:**
```typescript
{
  per_page?: number;
  page?: number;
}
```

#### `getMovieSessions(movieId, params?)`
Récupère les séances d'un film spécifique.

**Paramètres:**
```typescript
movieId: number;
params?: {
  date?: string;  // YYYY-MM-DD
}
```

**Exemple:**
```typescript
const movieSessions = await getMovieSessions(3, { 
  date: '2026-01-25' 
});
```

#### `checkSessionAvailability(sessionId)`
Vérifie si une séance est disponible pour réservation.

**Retourne:** `boolean`

**Exemple:**
```typescript
const isAvailable = await checkSessionAvailability(1);
if (isAvailable) {
  console.log('Vous pouvez réserver cette séance');
}
```

### Fonctions utilitaires

#### `formatTime(time: string): string`
Formate une heure au format HH:mm.

**Exemple:**
```typescript
formatTime('19:00:00'); // "19:00"
```

#### `formatShortDate(date: string): string`
Formate une date au format court.

**Exemple:**
```typescript
formatShortDate('2026-01-25'); // "25 janv."
```

---

## Composant SessionSelectorModal

Modal de sélection de séance utilisé dans le flux de réservation.

### Props

```typescript
interface SessionSelectorModalProps {
  visible: boolean;           // Contrôle la visibilité du modal
  movieId: number;           // ID du film pour lequel récupérer les séances
  onClose: () => void;       // Callback appelé à la fermeture
  onSelect: (session: Session) => void;  // Callback avec la séance sélectionnée
}
```

### Utilisation

```typescript
import { SessionSelectorModal } from '@/components/session-selector-modal';
import { Session } from '@/services/sessionService';

function BookingScreen() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    console.log('Séance sélectionnée:', session);
  };

  return (
    <>
      <Button onPress={() => setShowModal(true)}>
        Choisir une séance
      </Button>

      <SessionSelectorModal
        visible={showModal}
        movieId={3}
        onClose={() => setShowModal(false)}
        onSelect={handleSessionSelect}
      />
    </>
  );
}
```

### Fonctionnalités

- ✅ Chargement automatique des séances du film
- ✅ Groupement des séances par date
- ✅ Sélection de date avec chips horizontales
- ✅ Affichage des informations clés (heure, prix, places disponibles)
- ✅ Gestion des états (loading, error, empty)
- ✅ Désactivation des séances non disponibles
- ✅ Design moderne et responsive

---

## Configuration API

La configuration de l'API est centralisée dans `services/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://cineplex-main-fkwtm3.laravel.cloud/api/v1',
  TIMEOUT: 10000, // 10 secondes
  RETRY_ATTEMPTS: 3,
} as const;

export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_CONFIG.BASE_URL}/${cleanPath}`;
}
```

**Avantages de cette approche:**
- ✅ Une seule source de vérité pour l'URL de l'API
- ✅ Facile à changer pour différents environnements (dev/staging/prod)
- ✅ Fonction utilitaire `buildApiUrl()` pour construire les URLs
- ✅ Configuration centralisée avec timeout et retry

**Pour changer l'URL de l'API:**
Modifiez uniquement `services/config.ts`, tous les services l'utiliseront automatiquement.

### Gestion des erreurs

Toutes les fonctions du service peuvent lancer des erreurs. Il est recommandé de les gérer avec try/catch:

```typescript
try {
  const sessions = await getSessions({ movie_id: 3 });
  // Traiter les sessions
} catch (error) {
  console.error('Erreur lors du chargement des séances:', error);
  // Afficher un message d'erreur à l'utilisateur
}
```

---

## Exemple complet d'intégration

Voir `app/booking/[id].tsx` pour un exemple complet d'intégration du service de sélection de session dans le flux de réservation.
