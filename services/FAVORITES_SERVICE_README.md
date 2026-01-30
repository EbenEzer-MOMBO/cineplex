# Favorites Service - Documentation

## Vue d'ensemble

Le `favoritesService` gère toutes les opérations liées aux films favoris dans l'application Cineplex.

## Fonctionnalités

### 1. Récupération des favoris
```typescript
const favorites = await getFavorites(token, 'all');
```

Récupère la liste des films favoris avec filtrage par statut :
- `'all'` : Tous les favoris (par défaut)
- `'upcoming'` : Films avec séances à venir
- `'past'` : Films sans séances futures

### 2. Ajout d'un favori
```typescript
const favorite = await addFavorite(token, movieId);
```

Ajoute un film aux favoris. Retourne le favori créé avec toutes les informations du film.

### 3. Suppression d'un favori
```typescript
await removeFavorite(token, favoriteId);
```

Retire un film des favoris. Notez qu'on utilise l'ID du favori, pas l'ID du film.

### 4. Vérification d'un favori
```typescript
const isFavorite = await checkFavorite(token, movieId);
```

Vérifie si un film spécifique est dans les favoris. Retourne `true` ou `false`.

## Types

### Favorite
```typescript
interface Favorite {
  id: number;                    // ID du favori (pas du film)
  movie_id: number;              // ID du film
  movie: FavoriteMovie;          // Détails complets du film
  added_at: string;              // Date d'ajout (ISO 8601)
}
```

### FavoriteMovie
```typescript
interface FavoriteMovie {
  id: number;
  title: string;
  slug: string;
  synopsis: string;
  duration: number;
  release_date: string;
  status: 'now_showing' | 'coming_soon' | 'archived';
  imdb_rating: number;
  language: string;
  genre: string;
  director: string;
  cast: string;
  trailer_url: string | null;
  poster_url: string;
  created_at: string;
  updated_at: string;
  images: MovieImage[];
  sessions?: MovieSession[];     // Séances disponibles (si applicable)
}
```

### FavoriteStatus
```typescript
type FavoriteStatus = 'all' | 'upcoming' | 'past';
```

## Gestion des erreurs

Toutes les méthodes peuvent lever des exceptions. Utilisez try-catch :

```typescript
try {
  const favorites = await getFavorites(token, 'upcoming');
  console.log(`${favorites.length} films à venir`);
} catch (error) {
  Alert.alert('Erreur', error.message);
}
```

## Utilisation dans les composants

### Exemple complet
```typescript
import { getFavorites, addFavorite, removeFavorite } from '@/services/favoritesService';
import { authService } from '@/services/auth';

// Charger les favoris
const loadFavorites = async () => {
  const token = await authService.getToken();
  if (!token) return;
  
  const favorites = await getFavorites(token, 'all');
  setFavorites(favorites);
};

// Ajouter aux favoris
const handleAddFavorite = async (movieId: number) => {
  try {
    const token = await authService.getToken();
    if (!token) return;
    
    const favorite = await addFavorite(token, movieId);
    Alert.alert('Succès', 'Film ajouté aux favoris');
    // Recharger la liste
    await loadFavorites();
  } catch (error) {
    Alert.alert('Erreur', error.message);
  }
};

// Retirer des favoris
const handleRemoveFavorite = async (favoriteId: number) => {
  try {
    const token = await authService.getToken();
    if (!token) return;
    
    await removeFavorite(token, favoriteId);
    Alert.alert('Succès', 'Film retiré des favoris');
    // Mettre à jour la liste localement
    setFavorites(prev => prev.filter(f => f.id !== favoriteId));
  } catch (error) {
    Alert.alert('Erreur', error.message);
  }
};
```

## Filtrage par statut

### Films à venir (`upcoming`)
Retourne uniquement les films qui ont au moins une séance avec une date >= aujourd'hui.
Utile pour afficher les films que l'utilisateur pourra voir prochainement.

### Films passés (`past`)
Retourne les films qui n'ont aucune séance future.
Permet de voir l'historique des films favoris.

### Tous (`all`)
Retourne tous les films favoris sans filtre.
Triés par date d'ajout décroissante (plus récents en premier).

## Intégration avec la page de détail du film

```typescript
// Dans la page movie/[id].tsx
const [isFavorite, setIsFavorite] = useState(false);

// Vérifier si le film est favori
useEffect(() => {
  const checkIfFavorite = async () => {
    const token = await authService.getToken();
    if (!token) return;
    
    const result = await checkFavorite(token, movieId);
    setIsFavorite(result);
  };
  
  checkIfFavorite();
}, [movieId]);

// Toggle favori
const toggleFavorite = async () => {
  const token = await authService.getToken();
  if (!token) return;
  
  if (isFavorite) {
    // Trouver l'ID du favori et le supprimer
    await removeFavorite(token, favoriteId);
    setIsFavorite(false);
  } else {
    await addFavorite(token, movieId);
    setIsFavorite(true);
  }
};
```

## Notes importantes

1. **Unicité** : Un film ne peut être ajouté qu'une seule fois aux favoris
2. **ID du favori vs ID du film** : 
   - Pour ajouter : utilisez l'ID du film
   - Pour supprimer : utilisez l'ID du favori (retourné dans la liste)
3. **Authentification** : Toutes les opérations nécessitent un token valide
4. **Relations** : Les favoris incluent automatiquement les images et séances du film
5. **Tri** : Les favoris sont triés par date d'ajout décroissante

## Gestion des erreurs courantes

### Film déjà dans les favoris
```typescript
try {
  await addFavorite(token, movieId);
} catch (error) {
  if (error.message.includes('déjà dans vos favoris')) {
    Alert.alert('Information', 'Ce film est déjà dans vos favoris');
  }
}
```

### Favori non trouvé
```typescript
try {
  await removeFavorite(token, favoriteId);
} catch (error) {
  if (error.message.includes('non trouvé')) {
    Alert.alert('Erreur', 'Ce favori n\'existe plus');
  }
}
```

### Session expirée
```typescript
try {
  await getFavorites(token);
} catch (error) {
  if (error.message.includes('Unauthenticated')) {
    // Rediriger vers la page de connexion
    router.replace('/auth/login');
  }
}
```
