/**
 * Employee Profile Store — caches the employee profile returned by the
 * backend login (`/auth/emp/login`).
 *
 * Kept in AsyncStorage (non-sensitive identity info, not a secret) so the
 * home screen / profile screen can show the employee code immediately on
 * app restart without waiting for a re-login.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@autoinspectai:employee_profile_v1';

export interface EmployeeProfile {
  actorType?: string;
  uid?: string;
  email?: string;
  name?: string;
  employeeId?: number;
  employeeCode?: string;
  role?: string;
}

/** Pull the employee profile fields out of a login response object. */
export function extractEmployeeProfile(res: Record<string, unknown>): EmployeeProfile | null {
  if (!res) return null;
  
  // Handle nested response structure: check data.user, employee, user, data, or root level
  const src = (
    (res.data as Record<string, unknown>)?.user ?? 
    res.employee ?? 
    res.user ?? 
    res.data ?? 
    res
  ) as Record<string, unknown>;
  
  console.log('[employeeProfileStore] Extracting profile from:', src);
  
  const profile: EmployeeProfile = {
    actorType: typeof src.actorType === 'string' ? src.actorType : undefined,
    uid: typeof src.uid === 'string' ? src.uid : undefined,
    email: typeof src.email === 'string' ? src.email : undefined,
    name: typeof src.name === 'string' ? src.name : undefined,
    employeeId: typeof src.employeeId === 'number' ? src.employeeId : undefined,
    employeeCode: typeof src.employeeCode === 'string' ? src.employeeCode : undefined,
    role: typeof src.role === 'string' ? src.role : undefined,
  };
  
  console.log('[employeeProfileStore] Extracted profile:', profile);
  
  // Only return a profile if at least one identifying field is present.
  const hasData = profile.employeeCode || profile.name || profile.uid || profile.employeeId;
  return hasData ? profile : null;
}

export const employeeProfileStore = {
  async set(profile: EmployeeProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.warn('[employeeProfileStore] Failed to persist profile:', err);
    }
  },

  async get(): Promise<EmployeeProfile | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as EmployeeProfile) : null;
    } catch (err) {
      console.warn('[employeeProfileStore] Failed to read profile:', err);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[employeeProfileStore] Failed to clear profile:', err);
    }
  },
};
