import { useSelector } from 'react-redux';

import * as LoadingSelectors from '@/shared/store/loading/loading-selectors';

const useLoading = (action: string[]) => useSelector(LoadingSelectors.isLoading(action));

export default useLoading;
