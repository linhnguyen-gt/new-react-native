/**
 * A plain function, not a `createSelector`.
 *
 * The memoised version took the *entire* state as its input selector, so its cache key changed on
 * every action and it never returned a memoised value — while `useLoading` rebuilt the selector on
 * every render anyway. The result here is a boolean, which `useSelector` compares by value.
 */
export const isLoading =
    (types: string[]) =>
    (state: AppState): boolean =>
        types.some((type) => (state.loading[type] ?? 0) > 0);
