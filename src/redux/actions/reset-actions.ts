import { createAction } from '@reduxjs/toolkit';

import { ActionTypes } from '@/constants';

export const resetState = createAction<void>(ActionTypes.RESET_STATE);
