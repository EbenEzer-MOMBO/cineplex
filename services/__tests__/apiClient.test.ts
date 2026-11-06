import {
  ApiError,
  apiClient,
  setAuthToken,
  setUnauthorizedHandler,
} from '@/services/apiClient';

describe('apiClient (M-02)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    setAuthToken(null);
    setUnauthorizedHandler(null);
    jest.clearAllMocks();
  });

  function mockFetch(status: number, body: unknown) {
    global.fetch = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: async () => (body === undefined ? '' : JSON.stringify(body)),
    }) as unknown as typeof fetch;
  }

  it('injects the bearer token set via setAuthToken', async () => {
    setAuthToken('secret-token');
    mockFetch(200, { ok: true });

    await apiClient.get('/profile');

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer secret-token');
  });

  it('does not attach Authorization when auth:false', async () => {
    setAuthToken('secret-token');
    mockFetch(200, { ok: true });

    await apiClient.post('/auth/login', { email: 'a@b.c' }, { auth: false });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('triggers the global unauthorized handler on HTTP 401', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    mockFetch(401, { message: 'Unauthenticated.' });

    await expect(apiClient.get('/bookings')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('flattens validation errors into the ApiError message', async () => {
    mockFetch(422, { errors: { email: ['Email invalide'], otp_code: ['Code requis'] } });

    try {
      await apiClient.post('/auth/verify-otp', {});
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(422);
      expect((e as ApiError).message).toContain('Email invalide');
      expect((e as ApiError).message).toContain('Code requis');
    }
  });

  it('aborts and raises a timeout ApiError when the request exceeds the timeout', async () => {
    global.fetch = jest.fn().mockImplementation((_url, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          const err = new Error('Aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    }) as unknown as typeof fetch;

    await expect(apiClient.get('/movies', { timeout: 10 })).rejects.toMatchObject({
      status: 0,
    });
  });
});
