const storage: Record<string, string> = {};

const AsyncStorage = {
  setItem: async (key: string, value: string | null) => {
    if (value === null) {
      delete storage[key];
    } else {
      storage[key] = value;
    }
    return Promise.resolve();
  },
  getItem: async (key: string) => {
    return Promise.resolve(storage[key] ?? null);
  },
  removeItem: async (key: string) => {
    delete storage[key];
    return Promise.resolve();
  },
  clear: async () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
    return Promise.resolve();
  },
  getAllKeys: async () => {
    return Promise.resolve(Object.keys(storage));
  },
  multiGet: async (keys: string[]) => {
    return Promise.resolve(keys.map((k) => [k, storage[k] ?? null]));
  },
  multiSet: async (entries: [string, string][]) => {
    entries.forEach(([k, v]) => (storage[k] = v));
    return Promise.resolve();
  },
  multiRemove: async (keys: string[]) => {
    keys.forEach((k) => delete storage[k]);
    return Promise.resolve();
  },
};

export default AsyncStorage;
