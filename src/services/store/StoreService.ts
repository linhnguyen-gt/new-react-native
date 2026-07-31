import { EnhancedStore } from '@reduxjs/toolkit';

import Logger from '@/helper/logger';
import { ResetActions } from '@/redux/actions';

export class StoreService {
    private static instance: StoreService;

    private store!: EnhancedStore<AppState>;

    private constructor() {}

    public static getInstance(): StoreService {
        if (!StoreService.instance) {
            StoreService.instance = new StoreService();
        }
        return StoreService.instance;
    }

    public initialize(store: EnhancedStore<AppState>) {
        this.store = store;
    }

    /**
     * Silence here used to be indistinguishable from success: an uninitialised service made
     * every logout a no-op, so a session that failed to clear looked exactly like one that did.
     */
    public logout() {
        if (!this.store) {
            Logger.error('StoreService', 'logout() called before initialize(); the session was not cleared');
            return;
        }

        this.store.dispatch(ResetActions.resetState());
    }
}
