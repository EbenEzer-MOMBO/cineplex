/**
 * Service de gestion du profil client
 */

import { buildApiUrl } from './config';

// Types pour le profil
export interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  bookings_count: number;
  favorites_count: number;
  total_spent: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Récupère le profil du client authentifié
 */
export async function getProfile(token: string): Promise<ProfileData> {
  const response = await fetch(buildApiUrl('/profile'), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération du profil');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Met à jour le profil du client
 */
export async function updateProfile(
  token: string,
  data: UpdateProfileRequest
): Promise<ApiResponse<ProfileData>> {
  try {
    const response = await fetch(buildApiUrl('/profile'), {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Si c'est une erreur de validation, on affiche les détails
      if (result.errors) {
        const errorMessages = Object.values(result.errors).flat().join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(result.message || 'Erreur lors de la mise à jour du profil');
    }

    return result;
  } catch (error: any) {
    // Si c'est une erreur réseau ou autre
    if (error.message) {
      throw error;
    }
    throw new Error('Impossible de se connecter au serveur');
  }
}

/**
 * Change le mot de passe du client
 */
export async function changePassword(
  token: string,
  data: ChangePasswordRequest
): Promise<ApiResponse> {
  const response = await fetch(buildApiUrl('/profile/change-password'), {
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
    throw new Error(result.message || 'Erreur lors du changement de mot de passe');
  }

  return result;
}

/**
 * Supprime le compte du client
 */
export async function deleteAccount(token: string): Promise<ApiResponse> {
  const response = await fetch(buildApiUrl('/profile'), {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Erreur lors de la suppression du compte');
  }

  return result;
}
