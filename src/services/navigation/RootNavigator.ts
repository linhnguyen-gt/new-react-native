import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

import type { RouteName } from '@/constants';

import { NavigationLogger } from './NavigationLogger';

import type { INavigationService } from './INavigationService';

export type NavigatorParamsType = Record<string, never>;

class RootNavigator implements INavigationService {
    public readonly navigationRef = createNavigationContainerRef();

    // `TRoute`, not `RouteName`: the imported RouteName enum is used below for
    // DefaultStackParamList, and a generic of the same name shadowed it.
    async navigate<TRoute extends keyof RootStackParamList, Param extends RootStackParamList[TRoute]>(
        route: TRoute,
        params?: Param
    ): Promise<void> {
        if (!this.navigationRef.isReady()) return;

        NavigationLogger.logNavigation(route as string);

        return this.navigationRef.current?.dispatch(CommonActions.navigate(route, params));
    }

    goBack(): void {
        if (this.navigationRef.isReady()) {
            this.navigationRef.current?.dispatch(CommonActions.goBack());
        }
    }

    async replaceName<TRoute extends keyof RootStackParamList, Param extends RootStackParamList[TRoute]>(
        route: TRoute,
        params?: Param
    ): Promise<void> {
        if (!this.navigationRef.isReady()) return;

        NavigationLogger.logReplace(route as string);

        return this.navigationRef.current?.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: route, params: params }],
            })
        );
    }
}

export default new RootNavigator();

declare global {
    type DefaultStackParamList = Record<keyof typeof RouteName, NavigatorParamsType>;

    export type RootStackParamList = DefaultStackParamList;
}
