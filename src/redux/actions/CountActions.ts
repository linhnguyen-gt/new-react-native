import { createAction } from "@reduxjs/toolkit";

import { ActionTypes } from "@/constants";

import { CountModel } from "@/model";

export const increment = createAction<CountModel.Count>(ActionTypes.INCREMENT);

export const decrement = createAction<CountModel.Count>(ActionTypes.DECREMENT);
