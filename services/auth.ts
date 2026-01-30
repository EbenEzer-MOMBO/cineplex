import {
    AuthResponse,
    Customer,
    LoginRequest,
    RegisterRequest,
    ResendOTPRequest,
    VerifyOTPRequest,
} from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL;

const TOKEN_KEY = '@cineplex_token';
const CUSTOMER_KEY = '@cineplex_customer';

export const authService = {
  /**
   * Inscription d'un nouveau client
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      return result;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  /**
   * Connexion d'un client
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      // Si un token est fourni, le stocker
      if (result.token) {
        await this.setToken(result.token);
        await this.setCustomer(result.customer);
      }

      return result;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  /**
   * Vérification du code OTP
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      // Stocker le token et les infos client
      if (result.token) {
        await this.setToken(result.token);
        await this.setCustomer(result.customer);
      }

      return result;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  /**
   * Renvoyer un code OTP
   */
  async resendOTP(data: ResendOTPRequest): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      return result;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  },

  /**
   * Récupérer le profil du client authentifié
   */
  async getProfile(): Promise<{ customer: Customer }> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      // Mettre à jour les infos client stockées
      await this.setCustomer(result.customer);

      return result;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      const token = await this.getToken();

      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      }

      // Supprimer les données locales
      await this.clearAuth();
    } catch (error) {
      console.error('Error logging out:', error);
      // Même en cas d'erreur, on supprime les données locales
      await this.clearAuth();
    }
  },

  /**
   * Stocker le token
   */
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  /**
   * Récupérer le token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Stocker les infos client
   */
  async setCustomer(customer: Customer): Promise<void> {
    try {
      await AsyncStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    } catch (error) {
      console.error('Error storing customer:', error);
    }
  },

  /**
   * Récupérer les infos client
   */
  async getCustomer(): Promise<Customer | null> {
    try {
      const customer = await AsyncStorage.getItem(CUSTOMER_KEY);
      return customer ? JSON.parse(customer) : null;
    } catch (error) {
      console.error('Error getting customer:', error);
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
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, CUSTOMER_KEY]);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  },
};

