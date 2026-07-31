import type RouteName from '@/constants/route-name';

/**
 * The route map, keyed by the `RouteName` values so the strings have one source.
 *
 * It replaces `Record<keyof typeof RouteName, Record<string, never>>`, which said every route
 * accepts an empty object and nothing else — a claim that stops being true the moment any route
 * takes a parameter, and which the compiler could not have flagged.
 */
export type RootStackParamList = {
    [RouteName.Login]: undefined;
    [RouteName.Main]: undefined;
};

declare global {
    /**
     * Registers the map with React Navigation, so `useNavigation()` is typed in every screen
     * without passing a generic at the call site.
     *
     * The namespace and the member-less interface are React Navigation's own documented shape for
     * this augmentation — there is no module-syntax equivalent, and the interface must be empty
     * because it only exists to inherit.
     */
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ReactNavigation {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface RootParamList extends RootStackParamList {}
    }
}
