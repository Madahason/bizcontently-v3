import { SerpData } from "../types/generation";

export interface CacheConfig {
  storage: "localStorage" | "sessionStorage" | "memory";
  expiry: number; // milliseconds
  maxEntries?: number; // Maximum number of entries to store
  namespace?: string; // Custom namespace for cache keys
  compression?: boolean;
  encryptionKey?: string;
  partitionBy?: "day" | "week" | "month";
  persistOnReload?: boolean;
}

const DEFAULT_CONFIG: CacheConfig = {
  storage: "localStorage",
  expiry: 24 * 60 * 60 * 1000, // 24 hours
  maxEntries: 100,
  namespace: "search_cache",
  compression: false,
  persistOnReload: true,
  partitionBy: "day",
};

interface CacheEntry {
  data: SerpData;
  timestamp: number;
  query: string;
}

// In-memory cache for "memory" storage option
const memoryCache = new Map<string, CacheEntry>();

// Add compression utilities
const compressData = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.warn("Compression failed:", error);
    return data;
  }
};

const decompressData = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch (error) {
    console.warn("Decompression failed:", error);
    return data;
  }
};

// Add encryption utilities
const encryptData = (data: string, key: string): string => {
  try {
    const textEncoder = new TextEncoder();
    const encodedKey = textEncoder.encode(key);
    const encodedData = textEncoder.encode(data);

    // Simple XOR encryption (for demonstration - in production use a proper encryption library)
    const encrypted = new Uint8Array(encodedData.length);
    for (let i = 0; i < encodedData.length; i++) {
      encrypted[i] = encodedData[i] ^ encodedKey[i % encodedKey.length];
    }

    return btoa(
      Array.from(encrypted, (byte) => String.fromCharCode(byte)).join("")
    );
  } catch (error) {
    console.warn("Encryption failed:", error);
    return data;
  }
};

const decryptData = (data: string, key: string): string => {
  try {
    const encrypted = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    const textEncoder = new TextEncoder();
    const encodedKey = textEncoder.encode(key);

    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ encodedKey[i % encodedKey.length];
    }

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.warn("Decryption failed:", error);
    return data;
  }
};

export class SearchCache {
  private config: CacheConfig;
  private prefix: string;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.prefix = `${this.config.namespace}_${this.getPartitionKey()}_`;

    if (this.config.persistOnReload) {
      this.initializeFromPersistentStorage();
    }
  }

  private getPartitionKey(): string {
    const date = new Date();
    switch (this.config.partitionBy) {
      case "week":
        const weekNumber = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
        return `${date.getFullYear()}_w${weekNumber}`;
      case "month":
        return `${date.getFullYear()}_m${date.getMonth() + 1}`;
      default: // day
        return `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
    }
  }

  private initializeFromPersistentStorage(): void {
    if (this.config.storage === "memory" && window.localStorage) {
      try {
        const keys = Object.keys(window.localStorage);
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            const data = window.localStorage.getItem(key);
            if (data) {
              const entry = this.deserializeEntry(data);
              if (entry) {
                memoryCache.set(key, entry);
              }
            }
          }
        });
      } catch (error) {
        console.warn("Error initializing from persistent storage:", error);
      }
    }
  }

  private serializeEntry(entry: CacheEntry): string {
    let serialized = JSON.stringify(entry);

    if (this.config.compression) {
      serialized = compressData(serialized);
    }

    if (this.config.encryptionKey) {
      serialized = encryptData(serialized, this.config.encryptionKey);
    }

    return serialized;
  }

  private deserializeEntry(data: string): CacheEntry | null {
    try {
      let deserialized = data;

      if (this.config.encryptionKey) {
        deserialized = decryptData(deserialized, this.config.encryptionKey);
      }

      if (this.config.compression) {
        deserialized = decompressData(deserialized);
      }

      return JSON.parse(deserialized);
    } catch (error) {
      console.warn("Error deserializing cache entry:", error);
      return null;
    }
  }

  private getStorage(): Storage | Map<string, CacheEntry> {
    switch (this.config.storage) {
      case "localStorage":
        return window.localStorage;
      case "sessionStorage":
        return window.sessionStorage;
      case "memory":
        return memoryCache;
      default:
        return window.localStorage;
    }
  }

  private createCacheKey(query: string): string {
    return `${this.prefix}${query}`;
  }

  get(query: string): SerpData | null {
    try {
      const storage = this.getStorage();
      const cacheKey = this.createCacheKey(query);

      let entry: CacheEntry | null = null;

      if (storage instanceof Map) {
        entry = storage.get(cacheKey) || null;
      } else {
        const data = storage.getItem(cacheKey);
        entry = data ? this.deserializeEntry(data) : null;
      }

      if (!entry) {
        return null;
      }

      // Check expiry
      if (Date.now() - entry.timestamp > this.config.expiry) {
        this.remove(query);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn("Error reading from cache:", error);
      return null;
    }
  }

  set(query: string, data: SerpData): void {
    try {
      const storage = this.getStorage();
      const cacheKey = this.createCacheKey(query);
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        query,
      };

      // Check max entries limit
      if (this.config.maxEntries) {
        this.enforceMaxEntries();
      }

      const serialized = this.serializeEntry(entry);

      if (storage instanceof Map) {
        storage.set(cacheKey, entry);
        if (this.config.persistOnReload && this.config.storage === "memory") {
          window.localStorage.setItem(cacheKey, serialized);
        }
      } else {
        storage.setItem(cacheKey, serialized);
      }
    } catch (error) {
      console.warn("Error writing to cache:", error);
    }
  }

  remove(query: string): void {
    try {
      const storage = this.getStorage();
      const cacheKey = this.createCacheKey(query);

      if (storage instanceof Map) {
        storage.delete(cacheKey);
      } else {
        storage.removeItem(cacheKey);
      }
    } catch (error) {
      console.warn("Error removing from cache:", error);
    }
  }

  clear(): void {
    try {
      const storage = this.getStorage();

      if (storage instanceof Map) {
        storage.clear();
      } else {
        const keys = Object.keys(storage);
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            storage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.warn("Error clearing cache:", error);
    }
  }

  private enforceMaxEntries(): void {
    try {
      const storage = this.getStorage();
      const entries: CacheEntry[] = [];

      if (storage instanceof Map) {
        entries.push(...Array.from(storage.values()));
      } else {
        const keys = Object.keys(storage);
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            const data = storage.getItem(key);
            if (data) {
              entries.push(JSON.parse(data));
            }
          }
        });
      }

      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest entries if we exceed maxEntries
      while (entries.length >= (this.config.maxEntries || 0)) {
        const oldest = entries.shift();
        if (oldest) {
          this.remove(oldest.query);
        }
      }
    } catch (error) {
      console.warn("Error enforcing max entries:", error);
    }
  }

  clearExpired(): void {
    try {
      const storage = this.getStorage();
      const now = Date.now();

      if (storage instanceof Map) {
        Array.from(storage.entries()).forEach(([key, entry]) => {
          if (now - entry.timestamp > this.config.expiry) {
            storage.delete(key);
          }
        });
      } else {
        const keys = Object.keys(storage);
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            const data = storage.getItem(key);
            if (data) {
              const entry: CacheEntry = JSON.parse(data);
              if (now - entry.timestamp > this.config.expiry) {
                storage.removeItem(key);
              }
            }
          }
        });
      }
    } catch (error) {
      console.warn("Error clearing expired cache:", error);
    }
  }

  getStats(): {
    totalEntries: number;
    oldestEntry: number | null;
    newestEntry: number | null;
    storageType: string;
  } {
    try {
      const storage = this.getStorage();
      const entries: CacheEntry[] = [];

      if (storage instanceof Map) {
        entries.push(...Array.from(storage.values()));
      } else {
        const keys = Object.keys(storage);
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            const data = storage.getItem(key);
            if (data) {
              entries.push(JSON.parse(data));
            }
          }
        });
      }

      const timestamps = entries.map((entry) => entry.timestamp);

      return {
        totalEntries: entries.length,
        oldestEntry: timestamps.length ? Math.min(...timestamps) : null,
        newestEntry: timestamps.length ? Math.max(...timestamps) : null,
        storageType: this.config.storage,
      };
    } catch (error) {
      console.warn("Error getting cache stats:", error);
      return {
        totalEntries: 0,
        oldestEntry: null,
        newestEntry: null,
        storageType: this.config.storage,
      };
    }
  }
}

// Create default cache instance
const defaultCache = new SearchCache();

// Export convenience methods using default cache
export const getCachedSearch = (query: string): SerpData | null =>
  defaultCache.get(query);

export const setCachedSearch = (query: string, data: SerpData): void =>
  defaultCache.set(query, data);

export const clearExpiredCache = (): void => defaultCache.clearExpired();
