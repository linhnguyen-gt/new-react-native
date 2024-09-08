export type ResponseData = {
    "ID State": string;
    State: string;
    "ID Year": number;
    Year: string;
    Population: number;
    "Slug State": string;
};

declare global {
    export type ResponseReducers = {
        response: ResponseData[];
    };
}
