import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import ErrorBoundary from '../error-boundary';

import Logger from '@/shared/lib/logger';

const Boom = () => {
    throw new Error('render exploded');
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        jest.spyOn(Logger, 'error').mockImplementation(() => {});
        // React logs the caught error itself; the boundary is what is under test.
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders its children when nothing throws', async () => {
        await render(
            <ErrorBoundary>
                <Text>content</Text>
            </ErrorBoundary>
        );

        expect(screen.getByText('content')).toBeTruthy();
    });

    it('shows the failure and reports it instead of unmounting the tree', async () => {
        // Without a boundary anywhere in the app, a render-time throw left a white screen.
        await render(
            <ErrorBoundary>
                <Boom />
            </ErrorBoundary>
        );

        expect(screen.getByText('The app could not start')).toBeTruthy();
        expect(screen.getByText('render exploded')).toBeTruthy();
        expect(Logger.error).toHaveBeenCalledWith('ErrorBoundary', 'render exploded', expect.anything());
    });
});
