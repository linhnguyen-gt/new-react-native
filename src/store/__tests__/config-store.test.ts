import type { EnhancedStore } from '@reduxjs/toolkit';

type ConfigStoreModule = typeof import('../ConfigStore');

/** Keeps the dev socket shut: `setup()` calls `Tron.connect()` under `__DEV__`. */
const stubReactotronSetup = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Reactotron = require('@/services/reactotron/Reactotron').default;
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
        const { createAppStore } = require('../ConfigStore') as ConfigStoreModule;

        const store: EnhancedStore = createAppStore();

        expect(Object.keys(store.getState() as object)).toEqual(
            expect.arrayContaining(['count', 'response', 'loading'])
        );
    });

    it('registers itself with StoreService so logout can reach the store', () => {
        stubReactotronSetup();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { StoreService } = require('@/services/store');
        const initialize = jest.spyOn(StoreService.getInstance(), 'initialize');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createAppStore } = require('../ConfigStore') as ConfigStoreModule;

        const store = createAppStore();

        expect(initialize).toHaveBeenCalledWith(store);
    });

    it('fails loudly when the root saga cannot start', () => {
        jest.resetModules();
        stubReactotronSetup();
        // `run` rejects anything that is not a saga; this stands in for a broken watcher.
        jest.doMock('../RootSaga', () => ({ __esModule: true, default: { saga: null } }));
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createAppStore } = require('../ConfigStore') as ConfigStoreModule;

        // The regression: the failure was caught and logged, and the app then rendered with a
        // store but no saga watchers — every button dead, nothing reported.
        expect(() => createAppStore()).toThrow();
    });
});

describe('the services barrel', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.resetModules();
    });

    it('has no import-time side effects', () => {
        jest.resetModules();
        /* eslint-disable @typescript-eslint/no-require-imports */
        const axios = require('axios').default;
        const Reactotron = require('@/services/reactotron/Reactotron').default;
        const create = jest.spyOn(axios, 'create');
        const setup = jest.spyOn(Reactotron.prototype, 'setup').mockImplementation(() => {});

        require('@/services');
        /* eslint-enable @typescript-eslint/no-require-imports */

        // Importing used to construct axios (reading the environment, which can throw) and open
        // the Reactotron socket, so a bad `.env` killed the app before React mounted.
        expect(create).not.toHaveBeenCalled();
        expect(setup).not.toHaveBeenCalled();
    });
});
