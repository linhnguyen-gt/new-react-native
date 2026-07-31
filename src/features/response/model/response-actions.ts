import { createAction } from '@reduxjs/toolkit';

import ActionTypes from '@/shared/store/action-types';

export const getResponse = createAction(ActionTypes.GET_RESPONSE);

export const setResponse = createAction<ResponseData[] | undefined>(ActionTypes.SET_RESPONSE);

/** Carries a message already made safe to render — see ErrorHandler.toApiError. */
export const setResponseError = createAction<string>(ActionTypes.SET_RESPONSE_ERROR);
