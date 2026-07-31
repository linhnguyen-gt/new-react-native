import { createAction } from '@reduxjs/toolkit';

import ActionTypes from '@/shared/store/action-types';

export const resetState = createAction<void>(ActionTypes.RESET_STATE);
