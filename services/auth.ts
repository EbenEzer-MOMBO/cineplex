import {
    AuthResponse,
    Customer,
    LoginRequest,
    RegisterRequest,
    ResendOTPRequest,
    VerifyOTPRequest,
} from '@/types/auth';

import { apiClient, setAuthToken } from './apiClient';
import { logger } from './logger';
import { secureStore } from './secureStore';

// M-01/S-09: SecureStore keys must be alphanumeric with "._-" (no "@").
const TOKEN_KEY = 'cineplex_token';
const CUSTOMER_KEY = 'cineplex_customer';

export const authService = {
  /**
   * Inscription d'un nouveau client
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data, { auth: false });
  },

  /**
   * Connexion d'un client
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const result = await apiClient.post<AuthResponse>('/auth/login', data, { auth: false });

    if (result.token) {
      await this.setToken(result.token);
      await this.setCustomer(result.customer);
    }

    return result;
  },

  /**
   * Vérification du code OTP
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<AuthResponse> {
    const result = await apiClient.post<AuthResponse>('/auth/verify-otp', data, { auth: false });

    if (result.token) {
      await this.setToken(result.token);
      await this.setCustomer(result.customer);
    }

    return result;
  },

  /**
   * Renvoyer un code OTP
   */
  async resendOTP(data: ResendOTPRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/resend-otp', data, { auth: false });
  },

  /**
   * Demander la réinitialisation du mot de passe (OTP envoyé par email).
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email }, { auth: false });
  },

  /**
   * Réinitialiser le mot de passe avec le code OTP.
   */
  async resetPassword(data: {
    email: string;
    otp_code: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', data, { auth: false });
  },

  /**
   * Récupérer le profil du client authentifié
   */
  async getProfile(): Promise<{ customer: Customer }> {
    const result = await apiClient.get<{ customer: Customer }>('/auth/profile');
    await this.setCustomer(result.customer);
    return result;
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        await apiClient.post('/auth/logout', undefined, { token });
      }
    } catch (error) {
      logger.error('Error logging out:', error);
    } finally {
      // Toujours effacer les données locales, même en cas d'erreur réseau.
      await this.clearAuth();
    }
  },

  /**
   * Stocker le token (keychain/keystore) et le fournir au client HTTP.
   */
  async setToken(token: string): Promise<void> {
    await secureStore.setItem(TOKEN_KEY, token);
    setAuthToken(token);
  },

  /**
   * Récupérer le token
   */
  async getToken(): Promise<string | null> {
    const token = await secureStore.getItem(TOKEN_KEY);
    setAuthToken(token);
    return token;
  },

  /**
   * Stocker les infos client (keychain/keystore — contient des données PII).
   */
  async setCustomer(customer: Customer): Promise<void> {
    await secureStore.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  },

  /**
   * Récupérer les infos client
   */
  async getCustomer(): Promise<Customer | null> {
    try {
      const customer = await secureStore.getItem(CUSTOMER_KEY);
      return customer ? (JSON.parse(customer) as Customer) : null;
    } catch (error) {
      logger.error('Error getting customer:', error);
      return null;
    }
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },

  /**
   * Effacer toutes les données d'authentification
   */
  async clearAuth(): Promise<void> {
    await secureStore.removeItem(TOKEN_KEY);
    await secureStore.removeItem(CUSTOMER_KEY);
    setAuthToken(null);
  },
};
