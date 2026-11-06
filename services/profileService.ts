/**
 * Service de gestion du profil client
 */

import { apiClient } from './apiClient';

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
  current_password?: string;
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
  requires_email_confirmation?: boolean;
}

/**
 * Récupère le profil du client authentifié
 */
export async function getProfile(token: string): Promise<ProfileData> {
  const data = await apiClient.get<{ data: ProfileData }>('/profile', { token });
  return data.data;
}

/**
 * Met à jour le profil du client (S-08: un changement d'email déclenche un OTP).
 */
export async function updateProfile(
  token: string,
  data: UpdateProfileRequest
): Promise<ApiResponse<ProfileData>> {
  return apiClient.put<ApiResponse<ProfileData>>('/profile', data, { token });
}

/**
 * S-08: confirme le changement d'adresse email avec le code OTP reçu.
 */
export async function confirmEmailChange(
  token: string,
  otpCode: string
): Promise<ApiResponse<ProfileData>> {
  return apiClient.post<ApiResponse<ProfileData>>('/profile/confirm-email', { otp_code: otpCode }, { token });
}

/**
 * Change le mot de passe du client
 */
export async function changePassword(
  token: string,
  data: ChangePasswordRequest
): Promise<ApiResponse> {
  return apiClient.post<ApiResponse>('/profile/change-password', data, { token });
}

/**
 * Supprime le compte du client
 */
export async function deleteAccount(token: string): Promise<ApiResponse> {
  return apiClient.delete<ApiResponse>('/profile', undefined, { token });
}
