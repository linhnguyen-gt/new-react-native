/**
 * react-native-config resolves its values from a TurboModule at import time —
 * `require('./codegen/NativeConfigModule').default.getConfig().config` in its index.js. Under
 * Jest that module is null, so importing the real package throws
 * "Cannot read properties of null (reading 'getConfig')" before a single test runs.
 *
 * Empty by default on purpose: an absent native config means "no opinion", which is what the
 * cross-source guard in src/services/environment.ts expects so that it stays quiet in tests
 * instead of failing them. A test that needs native values should `jest.doMock` this module
 * with the values it wants.
 */
const Config = {};

module.exports = { __esModule: true, Config, default: Config };
