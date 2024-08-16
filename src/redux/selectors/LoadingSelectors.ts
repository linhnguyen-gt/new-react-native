import { createSelector } from "@reduxjs/toolkit";

const LoadingSelectors = (state: AppState) => state;

export const isLoading = createSelector(LoadingSelectors, (state) => state.loading);
