import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import RouteName from '@/app/navigation/route-name';
import LoginPage from '@/features/auth/ui/login-screen';
import Errors from '@/shared/constants/errors';

const mockReset = jest.fn();

// The screen navigates with useNavigation() now, not with the RootNavigator singleton — that
// one exists for callers outside the React tree.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ reset: mockReset }),
}));

// One leaf module. This used to mock the whole `@/services` barrel — the only way to stub
// `environment` when it was re-exported alongside the http client, the store service and
// Reactotron.
jest.mock('@/shared/config/environment', () => ({
    environment: {
        appFlavor: 'test',
        isDevelopment: () => true,
        isStaging: () => false,
        isProduction: () => false,
    },
}));

// Define test schema that matches the one in the component
const mockLoginSchema = z.object({
    email: z.string().min(1, Errors.REQUIRED_EMAIL_INPUT).pipe(z.email(Errors.EMAIL_INVALID)),
    password: z.string().min(1, Errors.REQUIRED_PASSWORD_INPUT),
});

describe('<LoginPage />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form elements', async () => {
        await render(<LoginPage />);
        expect(screen.getByTestId('email-input')).toBeTruthy();
        expect(screen.getByTestId('password-input')).toBeTruthy();
        expect(screen.getByTestId('login-button')).toBeTruthy();
        expect(screen.getByText(/Welcome Back/)).toBeTruthy();
    });

    it('resets to the Main screen on valid form submission', async () => {
        await render(<LoginPage />);

        fireEvent.press(screen.getByTestId('login-button'));

        // reset rather than navigate: the login screen must not remain on the back stack.
        await waitFor(() => {
            expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: RouteName.Main }] });
        });
    });

    it('shows validation error for invalid email', async () => {
        let formState: any;

        const TestComponent = () => {
            const methods = useForm({
                defaultValues: { email: 'invalid-email', password: '123456' },
                resolver: zodResolver(mockLoginSchema),
                mode: 'onChange',
            });
            // react-hook-form's formState is a Proxy that only tracks the fields
            // read during render, so `errors` must be read here for this component
            // to re-render once validation populates it.
            formState = { errors: methods.formState.errors };

            React.useEffect(() => {
                methods.trigger();
            }, [methods]);

            return (
                <FormProvider {...methods}>
                    <LoginPage />
                </FormProvider>
            );
        };

        await render(<TestComponent />);

        await waitFor(() => {
            expect(formState.errors).toBeDefined();
            expect(formState.errors.email).toBeDefined();
        });

        expect(formState.errors.email.message).toBe(Errors.EMAIL_INVALID);
    });

    it('accepts an address whose TLD is not .com', async () => {
        // The schema used to refine on `.endsWith('.com')`, so every .org, .vn and .co.uk
        // address was rejected as invalid.
        let formState: any;

        const TestComponent = () => {
            const methods = useForm({
                defaultValues: { email: 'test@test.org', password: '123456' },
                resolver: zodResolver(mockLoginSchema),
                mode: 'onChange',
            });
            formState = { errors: methods.formState.errors };

            React.useEffect(() => {
                methods.trigger();
            }, [methods]);

            return (
                <FormProvider {...methods}>
                    <LoginPage />
                </FormProvider>
            );
        };

        await render(<TestComponent />);

        await waitFor(() => {
            expect(formState.errors).toBeDefined();
        });

        expect(formState.errors.email).toBeUndefined();
    });

    it('shows validation error for missing password', async () => {
        let formState: any;

        const TestComponent = () => {
            const methods = useForm({
                defaultValues: { email: 'test@test.com', password: '' },
                resolver: zodResolver(mockLoginSchema),
                mode: 'onChange',
            });
            // react-hook-form's formState is a Proxy that only tracks the fields
            // read during render, so `errors` must be read here for this component
            // to re-render once validation populates it.
            formState = { errors: methods.formState.errors };

            React.useEffect(() => {
                methods.trigger();
            }, [methods]);

            return (
                <FormProvider {...methods}>
                    <LoginPage />
                </FormProvider>
            );
        };

        await render(<TestComponent />);

        await waitFor(() => {
            expect(formState.errors).toBeDefined();
            expect(formState.errors.password).toBeDefined();
        });

        expect(formState.errors.password.message).toBe(Errors.REQUIRED_PASSWORD_INPUT);
    });
});
