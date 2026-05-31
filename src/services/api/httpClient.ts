/**
 * Minimal HTTP client wrapper.
 * Attaches the API key header to every request automatically.
 *
 * H-15: every request gets a 30-second AbortController timeout by default.
 * Pass a custom `timeoutMs` (or `signal`) to override.
 */

import { API_KEY } from './endpoints';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  /** Request timeout in ms; default 30000. Set 0 to disable. */
  timeoutMs?: number;
  /** Skip attaching the Authorization bearer token for this request. */
  skipAuth?: boolean;
}

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Auth token provider. Registered once at app startup (see App.tsx) so the
 * HTTP client can attach a `Bearer` token to every request without importing
 * the auth service directly (avoids a circular dependency).
 */
type TokenProvider = () => Promise<string | null> | string | null;
let tokenProvider: TokenProvider | null = null;

export function setAuthTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider;
}

async function resolveAuthToken(): Promise<string | null> {
  if (!tokenProvider) return null;
  try {
    return await tokenProvider();
  } catch (err) {
    console.warn('[HTTP] Failed to resolve auth token:', err);
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Compose signals: caller's signal + our timeout
  const ac = new AbortController();
  const timer = timeoutMs > 0 ? setTimeout(() => ac.abort(), timeoutMs) : null;
  if (options.signal) {
    if (options.signal.aborted) {
      ac.abort();
    } else {
      options.signal.addEventListener('abort', () => ac.abort(), { once: true });
    }
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    };

    if (!options.skipAuth) {
      const token = await resolveAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: ac.signal,
    });

    if (!response.ok) {
      console.error(`[HTTP] ❌ Request failed: ${response.status} ${response.statusText}`);
      throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (err) {
    if ((err as { name?: string })?.name === 'AbortError') {
      throw new ApiError(0, `Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function httpGet<T>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>(url, { ...options, method: options?.method ?? 'GET' });
}

export async function httpPost<T>(
  url: string,
  body: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>,
): Promise<T> {
  return request<T>(url, { ...options, method: 'POST', body });
}
