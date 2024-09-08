import { createAction } from "@reduxjs/toolkit";

import { ActionTypes } from "@/constants";

import { ResponseModel } from "@/model";

export const getResponse = createAction(ActionTypes.GET_RESPONSE);

export const setResponse = createAction<ResponseModel.ResponseData[]>(ActionTypes.SET_RESPONSE);
