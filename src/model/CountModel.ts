export type Count = number | undefined;

declare global {
    export type CountReducers = {
        count: Count;
    };
}
