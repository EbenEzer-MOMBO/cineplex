/**
 * Service de gestion des favoris
 */

import { apiClient } from './apiClient';

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
  const path = status === 'all' ? '/favorites' : `/favorites?status=${status}`;
  const data = await apiClient.get<FavoritesResponse>(path, { token });
  return data.data;
}

/**
 * Ajoute un film aux favoris
 */
export async function addFavorite(
  token: string,
  movieId: number
): Promise<Favorite> {
  const result = await apiClient.post<AddFavoriteResponse>('/favorites', { movie_id: movieId }, { token });
  return result.data;
}

/**
 * Supprime un film des favoris
 */
export async function removeFavorite(
  token: string,
  favoriteId: number
): Promise<MessageResponse> {
  return apiClient.delete<MessageResponse>(`/favorites/${favoriteId}`, undefined, { token });
}

/**
 * Vérifie si un film est dans les favoris
 */
export async function checkFavorite(
  token: string,
  movieId: number
): Promise<boolean> {
  const data = await apiClient.get<CheckFavoriteResponse>(`/favorites/check/${movieId}`, { token });
  return data.is_favorite;
}
