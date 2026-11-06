module.exports = function (api) {
  api.cache(true);

  const plugins = [];

  // M-03: strip every console.* call from production (release) bundles so that
  // API responses — profiles, bookings, payment bill_ids — are never written
  // to logcat / the iOS console where other apps or remote-support sessions
  // could read them. Development builds keep their logs.
  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
