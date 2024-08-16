import { createSelector } from "@reduxjs/toolkit";

import { ActionTypes } from "@/constants";

const LoadingSelectors = (state: AppState) => state;

export const isLoading = (action: ActionTypes[]) =>
    createSelector(LoadingSelectors, (state) => action.some((type) => state.loading[type]) ?? false);
