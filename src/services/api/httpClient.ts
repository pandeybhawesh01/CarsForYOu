/**
 * Minimal HTTP client wrapper.
 * Attaches the API key + bearer token header to every request automatically.
 *
 * H-15: every request gets a 30-second AbortController timeout by default.
 * Pass a custom `timeoutMs` (or `signal`) to override.
 *
 * Auth: on a 401, the client runs a SINGLE-FLIGHT token refresh (only one
 * refresh call even if many requests 401 at once), then retries the original
 * request once with the new token. If the refresh fails, it fires the
 * "unauthorized" callback (used to bounce the user to the login screen).
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
  /** Internal: marks a request that has already been retried after refresh. */
  _isRetry?: boolean;
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

/**
 * Refresh handler. Returns a fresh access token, or null if refresh failed.
 * Registered at startup so httpClient doesn't import the auth service.
 */
type RefreshHandler = () => Promise<string | null>;
let refreshHandler: RefreshHandler | null = null;

export function setRefreshHandler(handler: RefreshHandler | null): void {
  refreshHandler = handler;
}

/**
 * Called when authentication is unrecoverable (refresh failed / no token).
 * The app registers this to clear state and redirect to login.
 */
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
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

// ─── Single-flight refresh ─────────────────────────────────────────────────
// If several requests 401 simultaneously, only the FIRST triggers a refresh;
// the rest await the same in-flight promise and then retry with the new token.

let refreshInFlight: Promise<string | null> | null = null;

function refreshTokenOnce(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  if (!refreshHandler) return Promise.resolve(null);

  refreshInFlight = (async () => {
    try {
      return await refreshHandler!();
    } catch (err) {
      console.warn('[HTTP] Refresh handler threw:', err);
      return null;
    } finally {
      // Clear so the next 401 (after this batch) can refresh again.
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
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

/** Performs a single fetch attempt (no refresh logic). */
async function doFetch<T>(url: string, options: RequestOptions): Promise<T> {
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

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await doFetch<T>(url, options);
  } catch (err) {
    const is401 = err instanceof ApiError && err.status === 401;

    // Only attempt refresh for authenticated requests that haven't already retried.
    if (is401 && !options.skipAuth && !options._isRetry && refreshHandler) {
      const newToken = await refreshTokenOnce();

      if (newToken) {
        // Retry the original request once with the refreshed token.
        return doFetch<T>(url, { ...options, _isRetry: true });
      }

      // Refresh failed → session is unrecoverable. Notify the app (→ login).
      if (unauthorizedHandler) {
        try {
          unauthorizedHandler();
        } catch (cbErr) {
          console.warn('[HTTP] unauthorizedHandler threw:', cbErr);
        }
      }
    }

    throw err;
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
