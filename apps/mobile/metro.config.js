// Metro config for a hoisted monorepo (npm workspaces + Turborepo).
// Without this, Metro doesn't watch the repo root or resolve dependencies that
// npm hoisted to the root node_modules (expo, expo-router, react-native-purchases,
// @propertycheck/*), and Expo's entry resolution falls back to expo/AppEntry.js.
// https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole monorepo so changes in packages/* are picked up.
config.watchFolders = [monorepoRoot];

// 2. Resolve modules from the app first, then the hoisted root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
