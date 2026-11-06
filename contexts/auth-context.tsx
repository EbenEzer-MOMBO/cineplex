import { setUnauthorizedHandler } from '@/services/apiClient';
import { authService } from '@/services/auth';
import { logger } from '@/services/logger';
import { Customer } from '@/types/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, customer: Customer) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setCustomer: (customer: Customer) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données d'authentification au démarrage
  useEffect(() => {
    loadAuthData();

    // M-02: any HTTP 401 from any service clears the session globally,
    // instead of relying on fragile message-string comparisons.
    setUnauthorizedHandler(() => {
      authService.clearAuth().catch((error) => logger.error('clearAuth error', error));
      setCustomer(null);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const loadAuthData = async () => {
    try {
      // getToken() also primes the apiClient with the stored token.
      const token = await authService.getToken();
      const storedCustomer = await authService.getCustomer();

      if (token && storedCustomer) {
        setCustomer(storedCustomer);
      }
    } catch (error) {
      logger.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, customerData: Customer) => {
    await authService.setToken(token);
    await authService.setCustomer(customerData);
    setCustomer(customerData);
  };

  const logout = async () => {
    await authService.logout();
    setCustomer(null);
  };

  const refreshProfile = async () => {
    try {
      const result = await authService.getProfile();
      setCustomer(result.customer);
    } catch (error) {
      // A 401 is already handled globally by the apiClient unauthorized hook.
      logger.error('Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: customer !== null,
        isLoading,
        login,
        logout,
        refreshProfile,
        setCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
