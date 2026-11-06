/**
 * M-02: Single HTTP client for the whole app.
 *
 * Responsibilities centralised here (previously duplicated and inconsistent
 * across every service):
 *   - inject the Bearer token automatically,
 *   - apply a request timeout via AbortController (API_CONFIG.TIMEOUT, which
 *     was defined but never used before),
 *   - detect HTTP 401 and trigger a single global logout (no more fragile
 *     comparisons against the string "Unauthenticated."),
 *   - normalise error handling into a typed ApiError.
 */
import { API_CONFIG, buildApiUrl } from './config';
import { logger } from './logger';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Module-level auth state, kept in sync by the auth context.
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export interface RequestOptions {
  /** Explicit token overriding the module-level one. */
  token?: string | null;
  /** Skip attaching any Authorization header (public endpoints). */
  auth?: boolean;
  headers?: Record<string, string>;
  /** Milliseconds; defaults to API_CONFIG.TIMEOUT. */
  timeout?: number;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeout ?? API_CONFIG.TIMEOUT;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const token = options.auth === false ? null : options.token ?? authToken;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(buildApiUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    // M-02: any 401 logs the user out globally, regardless of which service.
    if (response.status === 401) {
      onUnauthorized?.();
      throw new ApiError(messageFrom(data, 'Session expirée. Veuillez vous reconnecter.'), 401, data);
    }

    if (!response.ok) {
      throw new ApiError(messageFrom(data, 'Une erreur est survenue.'), response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if ((error as Error)?.name === 'AbortError') {
      throw new ApiError('Délai d\'attente dépassé. Vérifiez votre connexion.', 0, null);
    }
    logger.error(`apiClient ${method} ${path} failed`, error);
    throw new ApiError('Impossible de se connecter au serveur.', 0, null);
  } finally {
    clearTimeout(timer);
  }
}

function messageFrom(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (record.errors && typeof record.errors === 'object') {
      const messages = Object.values(record.errors as Record<string, unknown>)
        .flat()
        .filter((m): m is string => typeof m === 'string');
      if (messages.length > 0) {
        return messages.join('\n');
      }
    }
    if (typeof record.message === 'string') {
      return record.message;
    }
  }
  return fallback;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('DELETE', path, body, options),
};

export default apiClient;
