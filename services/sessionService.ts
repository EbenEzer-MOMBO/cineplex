/**
 * Service API pour la gestion des séances
 */

import { buildApiUrl } from './config';

export interface Session {
  id: number;
  movie_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  price_per_ticket: number;
  available_seats: number;
  status: 'available' | 'full' | 'cancelled';
  status_label: string;
  created_at: string;
  updated_at: string;
  movie?: {
    id: number;
    title: string;
    studio?: string;
    synopsis?: string;
    poster_url?: string;
    backdrop_url?: string;
    imdb_rating?: number;
    rating?: number;
    status: string;
    status_label: string;
    created_at: string;
    updated_at: string;
  };
  is_past: boolean;
  is_today: boolean;
  formatted_date: string;
  formatted_time: string;
}

export interface SessionsResponse {
  data: Session[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface SingleSessionResponse {
  data: Session;
}

/**
 * Récupère la liste de toutes les séances disponibles avec filtres optionnels
 */
export async function getSessions(params?: {
  date_from?: string;
  date_to?: string;
  movie_id?: number;
  date?: string;
  per_page?: number;
  page?: number;
}): Promise<SessionsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${buildApiUrl('sessions')}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Récupère les informations détaillées d'une séance spécifique
 */
export async function getSessionById(id: number): Promise<SingleSessionResponse> {
  const response = await fetch(buildApiUrl(`sessions/${id}`));
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Séance introuvable');
    }
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Récupère toutes les séances disponibles pour aujourd'hui
 */
export async function getTodaySessions(): Promise<SessionsResponse> {
  const response = await fetch(buildApiUrl('sessions/today'));
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Récupère toutes les séances disponibles à partir d'aujourd'hui
 */
export async function getUpcomingSessions(params?: {
  per_page?: number;
  page?: number;
}): Promise<SessionsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${buildApiUrl('sessions/upcoming')}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Récupère les séances disponibles pour un film spécifique
 */
export async function getMovieSessions(movieId: number, params?: {
  date?: string;
}): Promise<SessionsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.date) {
    queryParams.append('date', params.date);
  }

  const url = `${buildApiUrl(`movies/${movieId}/sessions`)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Vérifie si une séance est disponible pour réservation
 */
export async function checkSessionAvailability(sessionId: number): Promise<boolean> {
  try {
    const response = await getSessionById(sessionId);
    const session = response.data;
    
    return session.status === 'available' && !session.is_past && session.available_seats > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification de disponibilité:', error);
    return false;
  }
}

/**
 * Formate une heure au format HH:mm
 */
export function formatTime(time: string): string {
  return time.substring(0, 5);
}

/**
 * Formate une date au format court
 */
export function formatShortDate(date: string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
}
