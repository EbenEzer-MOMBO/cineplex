/**
 * Configuration centralisée de l'API
 */

export const API_CONFIG = {
  BASE_URL: 'https://cineplex-main-fkwtm3.laravel.cloud/api/v1',
  TIMEOUT: 10000, // 10 secondes
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
    'Accept': 'application/json',
  },
};
