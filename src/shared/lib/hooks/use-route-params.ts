import { useRoute } from '@react-navigation/native';

import type { RootStackParamList } from '@/app/navigation/types';
import type { RouteProp } from '@react-navigation/native';

const useRouteParams = <T extends keyof RootStackParamList>() => {
    const params = useRoute<RouteProp<RootStackParamList, T>>().params;
    return params as RootStackParamList[T] | undefined;
};

export default useRouteParams;
