/**
 * Configuration centralisée de l'API.
 *
 * M-04: the base URL is driven by the EXPO_PUBLIC_API_URL environment variable
 * (set per EAS build profile in eas.json) instead of commenting code in/out.
 * This prevents a production build from accidentally pointing at a local IP,
 * and keeps staging strictly separate from production.
 *
 * Expo inlines EXPO_PUBLIC_* variables at build time.
 */

// Fallback used only when EXPO_PUBLIC_API_URL is not provided (e.g. bare dev).
const FALLBACK_API_URL = 'https://cineplex-main-fkwtm3.laravel.cloud/api/v1';

const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const envTimeout = process.env.EXPO_PUBLIC_API_TIMEOUT;

export const API_CONFIG = {
  BASE_URL: envApiUrl && envApiUrl.trim().length > 0 ? envApiUrl.trim() : FALLBACK_API_URL,
  TIMEOUT: envTimeout ? Number(envTimeout) : 10000, // 10 secondes
  RETRY_ATTEMPTS: 3,
} as const;

/**
 * Construit une URL complète à partir d'un chemin
 */
export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_CONFIG.BASE_URL}/${cleanPath}`;
}

/**
 * Options par défaut pour les requêtes fetch
 */
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};
