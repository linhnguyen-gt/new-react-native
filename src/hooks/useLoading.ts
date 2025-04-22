import { useSelector } from "react-redux";

import { LoadingSelectors } from "@/redux/selectors";

const useLoading = (action: string[]) => useSelector(LoadingSelectors.isLoading(action));

export default useLoading;
