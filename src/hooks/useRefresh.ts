import React from 'react';

type IsRefreshing = boolean;
type OnRefresh = () => Promise<void>;

/**
 * The spinner used to flash and vanish: the callback was invoked without `await` inside a
 * `try/finally`, so `setIsRefreshing(false)` ran on the same tick and the refresh was still
 * in flight when the indicator went away.
 */
const useRefresh = (refresh: (() => void | Promise<void>) | undefined): [IsRefreshing, OnRefresh] => {
    const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

    const onRefresh = React.useCallback(async () => {
        setIsRefreshing(true);

        try {
            await refresh?.();
        } finally {
            setIsRefreshing(false);
        }
    }, [refresh]);

    return [isRefreshing, onRefresh];
};

export default useRefresh;
