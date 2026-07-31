import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Errors, RouteName } from '@/constants';

import { RootNavigator } from '@/services';

import { LoginPage } from '@/screens';

jest.mock('@/services', () => ({
    environment: {
        appFlavor: 'test',
        isDevelopment: () => true,
        isStaging: () => false,
        isProduction: () => false,
    },
    RootNavigator: {
        replaceName: jest.fn(),
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

    it('navigates to Main screen on valid form submission', async () => {
        await render(<LoginPage />);

        fireEvent.press(screen.getByTestId('login-button'));

        await waitFor(() => {
            expect(RootNavigator.replaceName).toHaveBeenCalledWith(RouteName.Main);
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
