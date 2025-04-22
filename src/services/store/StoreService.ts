import { EnhancedStore } from "@reduxjs/toolkit";

import { ResetActions } from "@/redux/actions";

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

    public logout() {
        // TODO: Implement logout
        //logic logout here!!!

        if (this.store) {
            this.store.dispatch(ResetActions.resetState());
        }
    }
}
