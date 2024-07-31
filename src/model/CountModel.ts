export type Count = number;

declare global {
    export type CountReducers = {
        count: Count;
    };
}
