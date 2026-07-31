import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import useRefresh from '../use-refresh';

/** Drives the hook the way a screen does, rather than poking at it through renderHook. */
const Probe = ({ refresh }: { refresh?: () => void | Promise<void> }) => {
    const [isRefreshing, onRefresh] = useRefresh(refresh);

    return (
        <TouchableOpacity testID="refresh" onPress={onRefresh}>
            <Text>{isRefreshing ? 'refreshing' : 'idle'}</Text>
        </TouchableOpacity>
    );
};

describe('useRefresh', () => {
    it('stays refreshing until the callback settles', async () => {
        // The regression: the callback was invoked without `await` inside a try/finally, so
        // isRefreshing went back to false on the same tick and the spinner never appeared.
        let resolve: () => void = () => {};
        const pending = new Promise<void>((r) => {
            resolve = r;
        });

        await render(<Probe refresh={() => pending} />);

        fireEvent.press(screen.getByTestId('refresh'));

        await waitFor(() => expect(screen.getByText('refreshing')).toBeTruthy());

        resolve();

        await waitFor(() => expect(screen.getByText('idle')).toBeTruthy());
    });

    it('goes back to idle when the callback rejects', async () => {
        await render(<Probe refresh={() => Promise.reject(new Error('boom'))} />);

        fireEvent.press(screen.getByTestId('refresh'));

        await waitFor(() => expect(screen.getByText('idle')).toBeTruthy());
    });

    it('tolerates no callback at all', async () => {
        await render(<Probe />);

        fireEvent.press(screen.getByTestId('refresh'));

        await waitFor(() => expect(screen.getByText('idle')).toBeTruthy());
    });
});
