// M-01/S-09: the token is stored via expo-secure-store (keychain/keystore),
// not AsyncStorage. On native platforms the wrapper must delegate to SecureStore.

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly',
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue('stored-value'),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import * as SecureStore from 'expo-secure-store';
import { secureStore } from '@/services/secureStore';

describe('secureStore (M-01)', () => {
  afterEach(() => jest.clearAllMocks());

  it('writes the token to the device keychain/keystore (not AsyncStorage)', async () => {
    await secureStore.setItem('cineplex_token', 'abc');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'cineplex_token',
      'abc',
      expect.objectContaining({ keychainAccessible: 'whenUnlockedThisDeviceOnly' }),
    );
  });

  it('reads from secure storage', async () => {
    const value = await secureStore.getItem('cineplex_token');
    expect(value).toBe('stored-value');
    expect(SecureStore.getItemAsync).toHaveBeenCalled();
  });

  it('removes from secure storage', async () => {
    await secureStore.removeItem('cineplex_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('cineplex_token', expect.any(Object));
  });
});
