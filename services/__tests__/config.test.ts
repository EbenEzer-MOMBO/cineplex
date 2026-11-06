describe('API config (M-04)', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
    jest.resetModules();
  });

  it('uses EXPO_PUBLIC_API_URL when provided', () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://staging.example/api/v1';
    jest.resetModules();

    const { API_CONFIG, buildApiUrl } = require('@/services/config');

    expect(API_CONFIG.BASE_URL).toBe('https://staging.example/api/v1');
    expect(buildApiUrl('/movies')).toBe('https://staging.example/api/v1/movies');
  });

  it('falls back to the default URL when the env var is empty', () => {
    process.env.EXPO_PUBLIC_API_URL = '';
    jest.resetModules();

    const { API_CONFIG } = require('@/services/config');

    expect(API_CONFIG.BASE_URL).toContain('laravel.cloud');
  });

  it('builds URLs regardless of a leading slash', () => {
    jest.resetModules();
    const { buildApiUrl } = require('@/services/config');

    expect(buildApiUrl('movies')).toBe(buildApiUrl('/movies'));
  });
});
