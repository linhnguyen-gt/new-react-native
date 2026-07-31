import { createAction } from '@reduxjs/toolkit';

import ActionTypes from '@/shared/store/action-types';

export const increment = createAction(ActionTypes.INCREMENT);

/**
 * Payload-free on purpose. The saga used to select the current count, add one and dispatch the
 * result, so two taps within the saga's delay both read the same value and the second write lost
 * the first. The reducer is the only place that derives count from count.
 */
export const setIncrement = createAction(ActionTypes.SET_INCREMENT);

export const decrement = createAction(ActionTypes.DECREMENT);

export const setDecrement = createAction(ActionTypes.SET_DECREMENT);
