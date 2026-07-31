import type { RootStackParamList } from './types';

export interface INavigationService {
    navigate<TRoute extends keyof RootStackParamList, Param extends RootStackParamList[TRoute]>(
        route: TRoute,
        params?: Param
    ): Promise<void>;

    goBack(): void;

    replaceName<TRoute extends keyof RootStackParamList, Param extends RootStackParamList[TRoute]>(
        route: TRoute,
        params?: Param
    ): Promise<void>;
}
