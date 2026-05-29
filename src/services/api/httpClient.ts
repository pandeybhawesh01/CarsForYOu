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
}

const DEFAULT_TIMEOUT_MS = 30_000;

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
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
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
