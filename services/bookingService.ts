/**
 * Service de gestion des réservations
 */

import { buildApiUrl } from './config';

// Types pour les réservations
export interface BuffetItemRequest {
  buffet_item_id: number;
  quantity: number;
}

export interface CreateBookingRequest {
  movie_session_id: number;
  seat_ids: number[];
  buffet_items?: BuffetItemRequest[];
  payment_method: 'airtel_money' | 'moov_money';
  payment_phone: string;
}

export interface BookingSeat {
  id: number;
  row: string;
  number: number;
  section: string;
  status: string;
}

export interface BookingBuffetItem {
  id: number;
  name: string;
  type: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface BookingMovie {
  id: number;
  title: string;
  poster_url: string;
  status: string;
}

export interface BookingSession {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  price_per_ticket: number;
  hall: string;
}

export interface Booking {
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
  bill_id?: string; // ID de la facture pour le suivi du paiement
  status: 'pending' | 'confirmed' | 'cancelled';
  status_label: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingResponse {
  message: string;
  data: Booking;
  payment?: {
    bill_id: string;
    reference: string;
    status: string;
    message: string;
  };
}

export interface BookingsListResponse {
  data: Booking[];
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

export interface CancelBookingResponse {
  message: string;
}

/**
 * Crée une nouvelle réservation et initie le paiement
 * Retourne les données de réservation ET les infos de paiement (bill_id)
 */
export async function createBooking(
  token: string,
  data: CreateBookingRequest
): Promise<CreateBookingResponse> {
  try {
    const response = await fetch(buildApiUrl('/bookings'), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Gestion des erreurs de validation
      if (result.errors) {
        const errorMessages = Object.values(result.errors).flat().join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(result.message || 'Erreur lors de la création de la réservation');
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
 * Récupère la liste des réservations du client
 */
export async function getBookings(
  token: string,
  page: number = 1
): Promise<BookingsListResponse> {
  try {
    const response = await fetch(buildApiUrl(`/bookings?page=${page}`), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des réservations');
    }

    return await response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Impossible de se connecter au serveur');
  }
}

/**
 * Récupère les détails d'une réservation spécifique
 */
export async function getBookingById(
  token: string,
  bookingId: number
): Promise<Booking> {
  try {
    const response = await fetch(buildApiUrl(`/bookings/${bookingId}`), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération de la réservation');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Impossible de se connecter au serveur');
  }
}

/**
 * Annule une réservation
 */
export async function cancelBooking(
  token: string,
  bookingId: number
): Promise<CancelBookingResponse> {
  try {
    const response = await fetch(buildApiUrl(`/bookings/${bookingId}/cancel`), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de l\'annulation de la réservation');
    }

    return await response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Impossible de se connecter au serveur');
  }
}
