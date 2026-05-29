/**
 * Offline write queue (H-22).
 *
 * Persists failed draft-save and final-submit POSTs to AsyncStorage and
 * drains them when the app foregrounds. Without this, users on flaky
 * networks lose their progress because the auto-save just returns `false`
 * and never retries.
 *
 * Notes:
 *  - Designed to be dependency-light. No NetInfo required; we drain on
 *    AppState 'active' transitions and on a manual `flush()` call.
 *  - Each task has a unique id and a `kind` discriminator.
 *  - Drains are serialised — at most one drain runs at a time.
 *  - Tasks are removed only after the network call returns 2xx success,
 *    so a partially-flushed queue is safe to re-flush.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import { ENDPOINTS } from '../api/endpoints';
import { httpPost } from '../api/httpClient';

const STORAGE_KEY = '@cars24:offline_write_queue_v1';

interface BaseTask {
  id: string;
  createdAt: number;
  attempts: number;
}

export interface DraftSaveTask extends BaseTask {
  kind: 'draftSave';
  payload: { appointmentId: string; formData: Record<string, unknown>; additionalImages?: unknown[] };
}

export interface FinalSubmitTask extends BaseTask {
  kind: 'finalSubmit';
  payload: Record<string, unknown>;
}

export type OfflineTask = DraftSaveTask | FinalSubmitTask;

const MAX_ATTEMPTS = 5;

let isDraining = false;
let appStateSubscription: { remove: () => void } | null = null;

async function readQueue(): Promise<OfflineTask[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OfflineTask[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(tasks: OfflineTask[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('[offlineQueue] write failed:', e);
  }
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function executeTask(task: OfflineTask): Promise<boolean> {
  try {
    if (task.kind === 'draftSave') {
      const res = await httpPost<{ success: boolean }>(ENDPOINTS.DRAFT_SAVE, task.payload);
      return Boolean(res?.success);
    }
    if (task.kind === 'finalSubmit') {
      const res = await httpPost<{ success: boolean }>(ENDPOINTS.INSPECTION_SUBMIT, task.payload);
      return Boolean(res?.success);
    }
    return false;
  } catch (err) {
    console.warn('[offlineQueue] task failed:', task.id, err);
    return false;
  }
}

export const offlineQueue = {
  /** Add a task. Returns the assigned id. */
  async enqueue(input: Omit<DraftSaveTask, 'id' | 'createdAt' | 'attempts'> | Omit<FinalSubmitTask, 'id' | 'createdAt' | 'attempts'>): Promise<string> {
    const queue = await readQueue();

    // De-dupe draft saves for the same appointment — only the latest matters.
    let filtered = queue;
    if (input.kind === 'draftSave') {
      filtered = queue.filter((t) => !(t.kind === 'draftSave' && t.payload.appointmentId === input.payload.appointmentId));
    }

    const task: OfflineTask = {
      ...input,
      id: newId(),
      createdAt: Date.now(),
      attempts: 0,
    } as OfflineTask;

    filtered.push(task);
    await writeQueue(filtered);
    console.log('[offlineQueue] enqueued', task.kind, task.id, '— size now', filtered.length);
    return task.id;
  },

  /** Get the current queue size (for UI badges, debug). */
  async size(): Promise<number> {
    const q = await readQueue();
    return q.length;
  },

  /** Wipe the entire queue (e.g. on logout). */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Drain the queue, oldest task first. Runs at most one drain at a time.
   * Returns the number of tasks successfully completed.
   */
  async flush(): Promise<number> {
    if (isDraining) return 0;
    isDraining = true;
    let drained = 0;
    try {
      const queue = await readQueue();
      if (queue.length === 0) return 0;
      console.log('[offlineQueue] 🔁 Flushing', queue.length, 'task(s)');

      const remaining: OfflineTask[] = [];
      for (const task of queue) {
        if (task.attempts >= MAX_ATTEMPTS) {
          console.warn('[offlineQueue] dropping task after max attempts:', task.id, task.kind);
          continue;
        }
        const ok = await executeTask(task);
        if (ok) {
          drained++;
        } else {
          remaining.push({ ...task, attempts: task.attempts + 1 });
        }
      }

      await writeQueue(remaining);
      console.log('[offlineQueue] ✅ Flushed', drained, '— remaining:', remaining.length);
      return drained;
    } finally {
      isDraining = false;
    }
  },

  /**
   * Subscribe to app foreground events so the queue drains automatically.
   * Idempotent — calling twice is fine.
   */
  start(): void {
    if (appStateSubscription) return;
    const onChange = (s: AppStateStatus) => {
      if (s === 'active') {
        // Best-effort flush; ignore promise.
        void offlineQueue.flush();
      }
    };
    appStateSubscription = AppState.addEventListener('change', onChange);
    // Kick once on start in case there are leftover tasks.
    void offlineQueue.flush();
  },

  /** Stop the AppState listener (e.g. on test teardown). */
  stop(): void {
    appStateSubscription?.remove();
    appStateSubscription = null;
  },
};
