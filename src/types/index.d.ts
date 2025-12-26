export declare global {
    declare type ThenArg<T> = T extends Promise<infer U> ? U : T;
}

declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}
