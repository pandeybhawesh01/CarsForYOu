/**
 * Minimal HTTP client wrapper.
 * Attaches the API key header to every request automatically.
 */

import { API_KEY } from './endpoints';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
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

export async function httpGet<T>(url: string, options?: RequestOptions): Promise<T> {
  const method = options?.method ?? 'GET';
  console.log(`[HTTP] 🌐 ${method} ${url}`);
  
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    signal: options?.signal,
  });

  console.log(`[HTTP] 📡 Response: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    console.error(`[HTTP] ❌ Request failed: ${response.status} ${response.statusText}`);
    throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json() as T;
  console.log(`[HTTP] ✅ Response received successfully`);
  
  return data;
}

export async function httpPost<T>(url: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  console.log(`[HTTP] 📤 POST ${url}`);
  console.log(`[HTTP] 📦 Payload:`, JSON.stringify(body, null, 2));
  return httpGet<T>(url, { method: 'POST', body, signal: options?.signal });
}
