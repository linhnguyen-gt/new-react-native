import { createAction } from "@reduxjs/toolkit";

import { ActionTypes } from "@/constants";

import { CountModel } from "@/model";

export const increment = createAction(ActionTypes.INCREMENT);

export const setIncrement = createAction<CountModel.Count>(ActionTypes.SET_INCREMENT);

export const decrement = createAction(ActionTypes.DECREMENT);

export const setDecrement = createAction<CountModel.Count>(ActionTypes.SET_DECREMENT);
