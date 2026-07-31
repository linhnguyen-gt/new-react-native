import { createSelector } from '@reduxjs/toolkit';

const ResponseSelectors = (state: AppState) => state.response;

export const response = createSelector(ResponseSelectors, (state) => state.response);

export const responseError = createSelector(ResponseSelectors, (state) => state.error);
