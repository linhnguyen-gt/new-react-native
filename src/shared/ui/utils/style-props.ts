/**
 * These primitives accept raw style keys (`flex`, `backgroundColor`, ...) as
 * top-level props alongside `className`. This collects the ones that were
 * actually supplied into a single style object.
 */
export const createStyleFromProps = <TStyle extends object>(props: TStyle): TStyle =>
    Object.fromEntries(
        Object.keys(props)
            .filter((key) => props[key as keyof TStyle] !== undefined)
            .map((key) => [key, props[key as keyof TStyle]])
    ) as TStyle;
