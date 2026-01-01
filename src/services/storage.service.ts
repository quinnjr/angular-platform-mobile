import { Injectable } from '@angular/core';
import { BridgeService } from '../core/bridge/bridge.service';

/**
 * Storage Service
 *
 * Provides persistent key-value storage for Android.
 * Uses Android's SharedPreferences under the hood.
 */
@Injectable()
export class StorageService {
  private cache = new Map<string, any>();
  private isInitialized = false;

  constructor(private readonly bridgeService: BridgeService) {}

  /**
   * Initialize the storage service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const allItems = await this.bridgeService.request<Record<string, string>>('getAllStorageItems', {});

      for (const [key, value] of Object.entries(allItems)) {
        try {
          this.cache.set(key, JSON.parse(value));
        } catch {
          this.cache.set(key, value);
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.warn('[StorageService] Failed to initialize:', error);
    }
  }

  /**
   * Get a value from storage
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const result = await this.bridgeService.request<string | null>('getStorageItem', { key });

      if (result === null) {
        return null;
      }

      const parsed = JSON.parse(result);
      this.cache.set(key, parsed);
      return parsed;
    } catch (error) {
      console.warn(`[StorageService] Failed to get item: ${key}`, error);
      return null;
    }
  }

  /**
   * Set a value in storage
   */
  async setItem<T = any>(key: string, value: T): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);

      await this.bridgeService.send('setStorageItem', {
        key,
        value: stringValue,
      });

      this.cache.set(key, value);
    } catch (error) {
      console.error(`[StorageService] Failed to set item: ${key}`, error);
      throw error;
    }
  }

  /**
   * Remove a value from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await this.bridgeService.send('removeStorageItem', { key });
      this.cache.delete(key);
    } catch (error) {
      console.error(`[StorageService] Failed to remove item: ${key}`, error);
      throw error;
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await this.bridgeService.send('clearStorage', {});
      this.cache.clear();
    } catch (error) {
      console.error('[StorageService] Failed to clear storage', error);
      throw error;
    }
  }

  /**
   * Get all keys in storage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await this.bridgeService.request<string[]>('getAllStorageKeys', {});
    } catch (error) {
      console.error('[StorageService] Failed to get all keys', error);
      return [];
    }
  }

  /**
   * Get multiple items at once
   */
  async multiGet<T = any>(keys: string[]): Promise<Array<[string, T | null]>> {
    try {
      const results = await this.bridgeService.request<Record<string, string | null>>(
        'multiGetStorageItems',
        { keys }
      );

      return keys.map((key) => {
        const value = results[key];
        if (value === null) {
          return [key, null];
        }
        const parsed = JSON.parse(value);
        this.cache.set(key, parsed);
        return [key, parsed];
      });
    } catch (error) {
      console.error('[StorageService] Failed to multi get', error);
      return keys.map((key) => [key, null]);
    }
  }

  /**
   * Set multiple items at once
   */
  async multiSet(keyValuePairs: Array<[string, any]>): Promise<void> {
    try {
      const serialized: Record<string, string> = {};

      for (const [key, value] of keyValuePairs) {
        serialized[key] = JSON.stringify(value);
        this.cache.set(key, value);
      }

      await this.bridgeService.send('multiSetStorageItems', { items: serialized });
    } catch (error) {
      console.error('[StorageService] Failed to multi set', error);
      throw error;
    }
  }

  /**
   * Remove multiple items at once
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await this.bridgeService.send('multiRemoveStorageItems', { keys });

      for (const key of keys) {
        this.cache.delete(key);
      }
    } catch (error) {
      console.error('[StorageService] Failed to multi remove', error);
      throw error;
    }
  }

  /**
   * Merge a value with an existing stored value
   */
  async mergeItem<T extends Record<string, any>>(key: string, value: Partial<T>): Promise<void> {
    const existing = await this.getItem<T>(key);
    const merged = { ...(existing || {}), ...value } as T;
    await this.setItem(key, merged);
  }

  /**
   * Check if a key exists in storage
   */
  async hasKey(key: string): Promise<boolean> {
    const value = await this.getItem(key);
    return value !== null;
  }

  /**
   * Get storage size estimate
   */
  async getStorageSize(): Promise<number> {
    try {
      return await this.bridgeService.request<number>('getStorageSize', {});
    } catch {
      return 0;
    }
  }
}
