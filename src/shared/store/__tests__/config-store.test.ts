import type { EnhancedStore } from '@reduxjs/toolkit';

type ConfigStoreModule = typeof import('../config-store');

/** Keeps the dev socket shut: `setup()` calls `Tron.connect()` under `__DEV__`. */
const stubReactotronSetup = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Reactotron = require('@/shared/config/reactotron/reactotron').default;
    jest.spyOn(Reactotron.prototype, 'setup').mockImplementation(() => {});
};

describe('createAppStore', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.resetModules();
    });

    it('builds a store carrying every app slice', () => {
        stubReactotronSetup();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createAppStore } = require('../config-store') as ConfigStoreModule;

        const store: EnhancedStore = createAppStore();

        // `responseApi` is RTK Query's cache slice; `response` was its saga-era predecessor.
        expect(Object.keys(store.getState() as object)).toEqual(
            expect.arrayContaining(['count', 'loading', 'responseApi'])
        );
    });

    it('registers itself with StoreService so logout can reach the store', () => {
        stubReactotronSetup();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { StoreService } = require('@/shared/store/store-service');
        const initialize = jest.spyOn(StoreService.getInstance(), 'initialize');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createAppStore } = require('../config-store') as ConfigStoreModule;

        const store = createAppStore();

        expect(initialize).toHaveBeenCalledWith(store);
    });

    it('fails loudly when the root saga cannot start', () => {
        jest.resetModules();
        stubReactotronSetup();
        // `run` rejects anything that is not a saga; this stands in for a broken watcher.
        jest.doMock('../root-saga', () => ({ __esModule: true, default: { saga: null } }));
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createAppStore } = require('../config-store') as ConfigStoreModule;

        // The regression: the failure was caught and logged, and the app then rendered with a
        // store but no saga watchers — every button dead, nothing reported.
        expect(() => createAppStore()).toThrow();
    });
});

describe('the store bootstrap', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.resetModules();
    });

    it('has no import-time side effects', () => {
        jest.resetModules();
        /* eslint-disable @typescript-eslint/no-require-imports */
        const axios = require('axios').default;
        const Reactotron = require('@/shared/config/reactotron/reactotron').default;
        const create = jest.spyOn(axios, 'create');
        const setup = jest.spyOn(Reactotron.prototype, 'setup').mockImplementation(() => {});

        require('@/shared/api/http-client');
        require('@/shared/config/reactotron');
        /* eslint-enable @typescript-eslint/no-require-imports */

        // Importing used to construct axios (reading the environment, which can throw) and open
        // the Reactotron socket, so a bad `.env` killed the app before React mounted.
        expect(create).not.toHaveBeenCalled();
        expect(setup).not.toHaveBeenCalled();
    });
});
