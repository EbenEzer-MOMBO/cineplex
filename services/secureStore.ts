/**
 * M-01 / S-09: Secure storage wrapper.
 *
 * The authentication token is the most sensitive value the app holds. It is
 * stored in the OS keychain/keystore via expo-secure-store (encrypted at rest,
 * not included in device backups thanks to WHEN_UNLOCKED_THIS_DEVICE_ONLY)
 * instead of AsyncStorage (a plaintext SQLite/preferences file readable on a
 * rooted device or via an Android backup).
 *
 * SecureStore is not available on web, where we transparently fall back to
 * AsyncStorage. SecureStore keys must be alphanumeric with ".", "-" or "_".
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { logger } from './logger';

const isWeb = Platform.OS === 'web';

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureStore = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value, secureOptions);
    } catch (error) {
      logger.error('secureStore.setItem error', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key, secureOptions);
    } catch (error) {
      logger.error('secureStore.getItem error', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key, secureOptions);
    } catch (error) {
      logger.error('secureStore.removeItem error', error);
    }
  },
};

export default secureStore;
