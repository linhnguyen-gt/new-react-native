import React from 'react';

import type { IconName } from '@/types/icon';

import { IconComponent } from '@/components/ui';
import Box from '@/components/ui/box';
import HStack from '@/components/ui/hStack';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';

export { useToast };

type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Class names must be written out in full: Tailwind scans source statically, so
 * an interpolated `bg-${color}/10` would never be generated.
 */
const TOAST_APPEARANCE: Record<ToastType, { icon: IconName; color: string; iconWrapper: string }> = {
    success: { icon: 'check-circle', color: 'success-500', iconWrapper: 'bg-success-500/10' },
    error: { icon: 'error', color: 'error-500', iconWrapper: 'bg-error-500/10' },
    warning: { icon: 'warning', color: 'warning-500', iconWrapper: 'bg-warning-500/10' },
    info: { icon: 'info', color: 'info-500', iconWrapper: 'bg-info-500/10' },
};

const useShowToast = () => {
    const toast = useToast();

    return (message: string, type: ToastType = 'info', duration: number = 3000) => {
        const appearance = TOAST_APPEARANCE[type];

        toast.show({
            placement: 'bottom',
            duration,
            render: ({ id }) => (
                <Toast
                    action={type}
                    nativeID={id}
                    className="mx-auto w-[300px] gap-3 rounded-lg bg-background-0 p-4 shadow-hard-2">
                    <HStack space="md" className="items-center justify-center">
                        <Box className={`rounded-full p-2 ${appearance.iconWrapper}`}>
                            <IconComponent
                                name={appearance.icon}
                                size={24}
                                color={appearance.color}
                                font="material-icons"
                            />
                        </Box>
                        <Box className="flex-1">
                            <ToastTitle className="text-center font-semibold text-typography-900" numberOfLines={2}>
                                {message}
                            </ToastTitle>
                        </Box>
                    </HStack>
                </Toast>
            ),
        });
    };
};

export default useShowToast;
