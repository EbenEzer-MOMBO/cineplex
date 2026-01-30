/**
 * Service de gestion des favoris
 */

import { buildApiUrl } from './config';

// Types pour les favoris
export interface MovieSession {
  id: number;
  session_date: string;
  session_time: string;
  price: number;
  hall: string;
  total_seats: number;
  available_seats: number;
  occupied_seats: number;
}

export interface MovieImage {
  id: number;
  url: string;
  type: string;
}

export interface FavoriteMovie {
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
  sessions?: MovieSession[];
}

export interface Favorite {
  id: number;
  movie_id: number;
  movie: FavoriteMovie;
  added_at: string;
}

export interface FavoritesResponse {
  data: Favorite[];
}

export interface AddFavoriteResponse {
  data: Favorite;
}

export interface CheckFavoriteResponse {
  is_favorite: boolean;
}

export interface MessageResponse {
  message: string;
}

export type FavoriteStatus = 'all' | 'upcoming' | 'past';

/**
 * Récupère la liste des favoris
 */
export async function getFavorites(
  token: string,
  status: FavoriteStatus = 'all'
): Promise<Favorite[]> {
  try {
    const url = status === 'all' 
      ? buildApiUrl('/favorites')
      : buildApiUrl(`/favorites?status=${status}`);
      
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des favoris');
    }

    const data: FavoritesResponse = await response.json();
    return data.data;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Impossible de se connecter au serveur');
  }
}

/**
 * Ajoute un film aux favoris
 */
export async function addFavorite(
  token: string,
  movieId: number
): Promise<Favorite> {
  try {
    const response = await fetch(buildApiUrl('/favorites'), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movie_id: movieId }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Si c'est une erreur de validation
      if (result.errors) {
        const errorMessages = Object.values(result.errors).flat().join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(result.message || 'Erreur lors de l\'ajout aux favoris');
    }

    return result.data;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Impossible de se connecter au serveur');
  }
}

/**
 * Supprime un film des favoris
 */
export async function removeFavorite(
  token: string,
  favoriteId: number
): Promise<MessageResponse> {
  try {
    const response = await fetch(buildApiUrl(`/favorites/${favoriteId}`), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erreur lors de la suppression du favori');
    }

    return result;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Impossible de se connecter au serveur');
  }
}

/**
 * Vérifie si un film est dans les favoris
 */
export async function checkFavorite(
  token: string,
  movieId: number
): Promise<boolean> {
  try {
    const response = await fetch(buildApiUrl(`/favorites/check/${movieId}`), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la vérification');
    }

    const data: CheckFavoriteResponse = await response.json();
    return data.is_favorite;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Impossible de se connecter au serveur');
  }
}
