import React from "react";
import { View } from "react-native";

import Box, { IBoxProps } from "../box";

import { Loading } from "@/components/loading";

type ContainerProps = IBoxProps & {
    isLoading?: boolean;
    safeAreaTop?: boolean;
    safeAreaBottom?: boolean;
    safeArea?: boolean;
};

const Container = React.forwardRef<React.ElementRef<typeof View>, ContainerProps>(
    ({ backgroundColor = "white", isLoading = false, safeAreaTop, safeAreaBottom, safeArea, ...props }, ref) => {
        return (
            <Box
                className={`${safeAreaTop ? "mt-safe" : ""} ${safeAreaBottom ? "mb-safe" : ""} ${safeArea ? "mt-safe mb-safe" : ""}`}
                flex={1}>
                <Box flex={1} backgroundColor={backgroundColor} {...props} ref={ref}>
                    {props.children}
                </Box>
                <Loading isLoading={isLoading} />
            </Box>
        );
    }
);

export default Container;
