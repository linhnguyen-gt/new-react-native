import { CommonActions, createNavigationContainerRef } from "@react-navigation/native";

import { RouteName } from "@/constants";

import { INavigationService } from "./INavigationService";
import { NavigationLogger } from "./NavigationLogger";

export interface NavigatorParamsType {}

class RootNavigator implements INavigationService {
    public readonly navigationRef = createNavigationContainerRef();

    async navigate<RouteName extends keyof RootStackParamList, Param extends RootStackParamList[RouteName]>(
        route: RouteName,
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

    async replaceName<RouteName extends keyof RootStackParamList, Param extends RootStackParamList[RouteName]>(
        route: RouteName,
        params?: Param
    ): Promise<void> {
        if (!this.navigationRef.isReady()) return;

        NavigationLogger.logReplace(route as string);

        return this.navigationRef.current?.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: route, params: params }]
            })
        );
    }
}

export default new RootNavigator();

declare global {
    type DefaultStackParamList = Record<keyof typeof RouteName, NavigatorParamsType>;

    export type RootStackParamList = DefaultStackParamList;
}
