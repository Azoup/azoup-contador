const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Supabase v2.49+ imports @opentelemetry/api optionally; ensure Metro can resolve it.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
