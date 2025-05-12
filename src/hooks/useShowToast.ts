import { createToastHook } from "@gluestack-ui/toast";
import { AnimatePresence, Motion } from "@legendapp/motion";
import React from "react";

import { IconComponent } from "@/components/ui";
import Box from "@/components/ui/box";
import HStack from "@/components/ui/hStack";
import { Toast, ToastTitle } from "@/components/ui/toast";
import { IconName } from "@/types/icon";

const MotionView = Motion.View;

export const useToast = createToastHook(MotionView, AnimatePresence);

const getToastIconName = (type: string): IconName => {
    switch (type) {
        case "success":
            return "check-circle";
        case "error":
            return "error";
        case "warning":
            return "warning";
        default:
            return "info";
    }
};

const getToastIconColor = (type: string): string => {
    switch (type) {
        case "success":
            return "success-500";
        case "error":
            return "error-500";
        case "warning":
            return "warning-500";
        default:
            return "info-500";
    }
};

const useShowToast = () => {
    const toast = useToast();

    return (message: string, type: "success" | "error" | "warning" | "info" = "info", duration: number = 3000) => {
        toast.show({
            placement: "bottom",
            duration,
            render: ({ id }) => {
                const iconName = getToastIconName(type);
                const color = getToastIconColor(type);

                return React.createElement(
                    Toast,
                    {
                        action: type,
                        nativeID: `toast-${id}`,
                        className: "p-4 gap-3 w-[300px] mx-auto bg-background-0 shadow-hard-2 rounded-lg"
                    },
                    React.createElement(
                        HStack,
                        { space: "md", className: "items-center justify-center" },
                        React.createElement(
                            Box,
                            { className: `p-2 rounded-full bg-${color}/10` },
                            React.createElement(IconComponent, {
                                name: iconName,
                                size: 24,
                                color: getToastIconColor(type),
                                font: "material-icons"
                            })
                        ),
                        React.createElement(
                            Box,
                            { className: "flex-1" },
                            React.createElement(
                                ToastTitle,
                                {
                                    className: "text-typography-900 font-semibold text-center",
                                    numberOfLines: 2
                                },
                                message
                            )
                        )
                    )
                );
            }
        });
    };
};

export default useShowToast;
