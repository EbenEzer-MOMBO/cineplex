/**
 * Configuration centralisée de l'API
 */

// Pour tester sur émulateur/appareil physique, utilisez l'IP de votre machine
// Android Emulator : utilisez 10.0.2.2 pour localhost
// Appareil physique : utilisez l'IP locale de votre machine (ex: 192.168.1.138)
// Production : utilisez l'URL de production

export const API_CONFIG = {
  // Option 1 : API locale avec IP de VOTRE PC (pas de l'iPhone !)
  // L'iPhone (192.168.1.102) doit se connecter au PC (192.168.1.138)
  // BASE_URL: 'http://192.168.1.138/api/v1',
  
  // Option 2 : API de production (Recommandé pour les tests)
  BASE_URL: 'https://cineplex-main-fkwtm3.laravel.cloud/api/v1',
  
  // Option 3 : Android Emulator uniquement (10.0.2.2 = localhost de l'hôte)
  // BASE_URL: 'http://10.0.2.2/api/v1',
  
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
