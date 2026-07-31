// This file has no imports or exports, so it is a global script and the declaration below is
// already global. It used to be wrapped in `export declare global`, which is not valid TypeScript
// — a global augmentation cannot be exported — and Babel rejected the file while collecting
// coverage.
type ThenArg<T> = T extends Promise<infer U> ? U : T;

declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}
