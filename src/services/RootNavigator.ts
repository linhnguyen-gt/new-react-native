// import { CommonActions, createNavigationContainerRef } from "@react-navigation/native";
//
// import { RouteName } from "@/enums";
//
// import { NavigatorParamsType } from "@/model";
//
// export default class RootNavigator {
//     static navigationRef = createNavigationContainerRef();
//
//     static async navigate<RouteName extends keyof RootStackParamList, Param extends RootStackParamList[RouteName]>(
//         route: RouteName,
//         params?: Param
//     ) {
//         if (!RootNavigator.navigationRef.isReady()) return;
//         // eslint-disable-next-line no-console
//         console.log(`navigationRef ready, navigating to ${route}`);
//
//         // Some business logic, but basically just this
//         return RootNavigator.navigationRef.current?.dispatch(
//             CommonActions.navigate({
//                 name: route,
//                 params: params
//             })
//         );
//     }
//
//     static goBack() {
//         if (RootNavigator.navigationRef.isReady()) {
//             return RootNavigator.navigationRef.current?.dispatch(CommonActions.goBack());
//         }
//     }
//
//     static currentNameRoute() {
//         return RootNavigator.navigationRef.current?.getCurrentRoute()?.name;
//     }
//
//     static async replaceName<RouteName extends keyof RootStackParamList, Param extends RootStackParamList[RouteName]>(
//         route: RouteName,
//         params?: Param
//     ) {
//         if (!RootNavigator.navigationRef.isReady()) return;
//         // eslint-disable-next-line no-console
//         console.log(`navigationRef ready, replaceName to ${route}`);
//
//         return RootNavigator.navigationRef.current?.dispatch(
//             CommonActions.reset({
//                 index: 0,
//                 routes: [{ name: route, params: params }]
//             })
//         );
//     }
// }
//
// declare global {
//     type DefaultStackParamList = Record<keyof typeof RouteName, NavigatorParamsType>;
//
//     export type RootStackParamList = DefaultStackParamList;
// }
