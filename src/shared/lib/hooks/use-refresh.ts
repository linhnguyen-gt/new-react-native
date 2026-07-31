import React from 'react';

import Logger from '@/shared/lib/logger';

type IsRefreshing = boolean;
type OnRefresh = () => Promise<void>;

/**
 * The spinner used to flash and vanish: the callback was invoked without `await` inside a
 * `try/finally`, so `setIsRefreshing(false)` ran on the same tick and the refresh was still
 * in flight when the indicator went away.
 */
const useRefresh = (refresh: (() => void | Promise<void>) | undefined): [IsRefreshing, OnRefresh] => {
    const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

    const onRefresh = async () => {
        setIsRefreshing(true);

        try {
            await refresh?.();
        } catch (error) {
            // Reported, not rethrown: this runs from a pull-to-refresh gesture, so a rejection
            // has nowhere to go but an unhandled-promise warning the user cannot act on.
            Logger.error('useRefresh', error instanceof Error ? error.message : String(error));
        } finally {
            setIsRefreshing(false);
        }
    };

    return [isRefreshing, onRefresh];
};

export default useRefresh;
