import * as z from 'zod';

/**
 * Not optional. It used to be `z.number().optional()`, so `Count` included `undefined` while
 * `CountSagas` declared the selected value as `number`; a reset mid-flight put `NaN` in the store.
 */
export const CountSchema = z.number();

declare global {
    type Count = z.infer<typeof CountSchema>;
    export type CountReducers = {
        count: Count;
    };
}
