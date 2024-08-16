import { useSelector } from "react-redux";

import { selectors } from "@/redux";

import { ActionTypes } from "@/constants";

const useLoading = (action: ActionTypes[]) => useSelector(selectors.LoadingSelectors.isLoading(action));

export default useLoading;
