import { authService } from '@/services/auth';
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
  }, []);

  const loadAuthData = async () => {
    try {
      const token = await authService.getToken();
      const storedCustomer = await authService.getCustomer();

      if (token && storedCustomer) {
        setCustomer(storedCustomer);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
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
      console.error('Error refreshing profile:', error);
      // Si l'erreur est 401, déconnecter l'utilisateur
      if ((error as any)?.message === 'Unauthenticated.') {
        await logout();
      }
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

