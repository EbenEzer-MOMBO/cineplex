/**
 * Service API pour la gestion des sièges
 */

import { buildApiUrl } from './config';

export interface Seat {
  id: number;
  row: string;
  number: number;
  section: 'left' | 'center' | 'right';
  section_label: string;
  status: 'available' | 'occupied' | 'selected' | 'vip';
  status_label: string;
  seat_code: string;
  is_available: boolean;
}

export interface SeatsResponse {
  data: Seat[];
}

/**
 * Récupère la liste des sièges pour une séance
 */
export async function getSessionSeats(sessionId: number): Promise<SeatsResponse> {
  const response = await fetch(buildApiUrl(`sessions/${sessionId}/seats`));
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Séance introuvable');
    }
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Organise les sièges par rangée et section
 */
export function organizeSeatsByRowAndSection(seats: Seat[]): Record<string, Record<string, Seat[]>> {
  const organized: Record<string, Record<string, Seat[]>> = {};
  
  seats.forEach(seat => {
    if (!organized[seat.row]) {
      organized[seat.row] = {
        left: [],
        center: [],
        right: []
      };
    }
    organized[seat.row][seat.section].push(seat);
  });
  
  return organized;
}

/**
 * Compte les sièges disponibles par section
 */
export function countAvailableSeats(seats: Seat[]): {
  left: number;
  center: number;
  right: number;
  total: number;
} {
  const counts = {
    left: 0,
    center: 0,
    right: 0,
    total: 0
  };
  
  seats.forEach(seat => {
    if (seat.is_available) {
      counts[seat.section]++;
      counts.total++;
    }
  });
  
  return counts;
}

/**
 * Filtre les sièges par statut
 */
export function filterSeatsByStatus(
  seats: Seat[], 
  status: 'available' | 'occupied' | 'selected' | 'vip'
): Seat[] {
  return seats.filter(seat => seat.status === status);
}

/**
 * Trouve un siège par son code
 */
export function findSeatByCode(seats: Seat[], seatCode: string): Seat | undefined {
  return seats.find(seat => seat.seat_code === seatCode);
}
