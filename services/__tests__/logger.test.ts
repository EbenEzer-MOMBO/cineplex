describe('logger (M-03)', () => {
  const originalDev = (global as any).__DEV__;

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('logs in development builds', () => {
    (global as any).__DEV__ = true;
    jest.resetModules();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const { logger } = require('@/services/logger');
    logger.log('hello');

    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('is silent in production builds', () => {
    (global as any).__DEV__ = false;
    jest.resetModules();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { logger } = require('@/services/logger');
    logger.log('sensitive bill_id');
    logger.error('sensitive response');

    expect(logSpy).not.toHaveBeenCalled();
    expect(errSpy).not.toHaveBeenCalled();
  });
});
