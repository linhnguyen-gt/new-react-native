import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

import { NavigationLogger } from './NavigationLogger';

import type { INavigationService } from './INavigationService';
import type { RootStackParamList } from './types';

/**
 * Imperative navigation for callers **outside** the React tree — `TokenService.logout()` is the
 * real case. Inside a screen, use `useNavigation()`: it is typed by the `ReactNavigation`
 * augmentation in `./types` and it does not need a module singleton.
 */
class RootNavigator implements INavigationService {
    public readonly navigationRef = createNavigationContainerRef<RootStackParamList>();

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
